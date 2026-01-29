import { asc } from 'drizzle-orm';
import { db } from '../db/index.js';
import { grants, vests, releases, sells } from '../db/schema.js';
import type { FifoResult, GrantPool, VestAllocation, TaxLot, SellAllocation } from '../types.js';

export async function computeFifo(): Promise<FifoResult> {
  // 1. Load all grants sorted by date ASC
  const allGrants = await db.select().from(grants).orderBy(asc(grants.date));

  // 2. Build grant pools
  const grantPools: GrantPool[] = allGrants.map((g) => ({
    grantId: g.id,
    grantName: g.name,
    grantDate: g.date,
    totalShares: g.shareAmount,
    remainingShares: g.shareAmount,
  }));

  // 3. Load all vests sorted by date ASC
  const allVests = await db.select().from(vests).orderBy(asc(vests.date));

  // 4. For each vest, consume from grant pools (FIFO by grant date)
  const vestAllocations: VestAllocation[] = [];
  for (const vest of allVests) {
    let remaining = vest.shareAmount;
    const allocations: VestAllocation['allocations'] = [];

    for (const pool of grantPools) {
      if (remaining <= 0) break;
      if (pool.remainingShares <= 0) continue;

      const consumed = Math.min(remaining, pool.remainingShares);
      pool.remainingShares -= consumed;
      remaining -= consumed;
      allocations.push({
        grantId: pool.grantId,
        grantName: pool.grantName,
        shares: consumed,
      });
    }

    vestAllocations.push({
      vestId: vest.id,
      vestDate: vest.date,
      allocations,
    });
  }

  // 5. Load all releases sorted by date ASC → build tax lots
  const allReleases = await db.select().from(releases).orderBy(asc(releases.date));

  const taxLots: TaxLot[] = allReleases.map((r) => ({
    releaseId: r.id,
    releaseDate: r.date,
    vestId: r.vestId,
    totalShares: r.shareAmount,
    remainingShares: r.shareAmount,
    costBasis: r.unitPrice,
  }));

  // 6. Load all sells sorted by date ASC
  const allSells = await db.select().from(sells).orderBy(asc(sells.date));

  // 7. For each sell, consume from lots (FIFO by release date)
  const sellAllocations: SellAllocation[] = [];
  for (const sell of allSells) {
    let remaining = sell.shareAmount;
    const lotAllocations: SellAllocation['lotAllocations'] = [];

    for (const lot of taxLots) {
      if (remaining <= 0) break;
      if (lot.remainingShares <= 0) continue;

      const consumed = Math.min(remaining, lot.remainingShares);
      lot.remainingShares -= consumed;
      remaining -= consumed;

      const proratedFee = sell.fee * (consumed / sell.shareAmount);
      const gain = (sell.unitPrice * consumed) - (lot.costBasis * consumed) - proratedFee;

      lotAllocations.push({
        releaseId: lot.releaseId,
        releaseDate: lot.releaseDate,
        shares: consumed,
        costBasis: lot.costBasis,
        gain,
        proratedFee,
      });
    }

    const totalGain = lotAllocations.reduce((sum, a) => sum + a.gain, 0);

    sellAllocations.push({
      sellId: sell.id,
      sellDate: sell.date,
      totalShares: sell.shareAmount,
      unitPrice: sell.unitPrice,
      fee: sell.fee,
      lotAllocations,
      totalGain,
    });
  }

  return { grantPools, vestAllocations, taxLots, sellAllocations };
}
