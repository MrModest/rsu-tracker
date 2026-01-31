import { asc } from 'drizzle-orm';
import { db } from '../db/index.js';
import { grants, releaseEvents, sells } from '../db/schema.js';
import type { FifoResult, GrantPool, TaxLot, SellAllocation } from '../types.js';

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

  // 3. Consume grants by existing release events
  const allReleaseEvents = await db
    .select()
    .from(releaseEvents)
    .orderBy(asc(releaseEvents.settlementDate));

  for (const re of allReleaseEvents) {
    const allocations = JSON.parse(re.grantAllocations);
    for (const alloc of allocations) {
      const pool = grantPools.find((p) => p.grantId === alloc.grantId);
      if (pool) {
        pool.remainingShares -= alloc.shares;
      }
    }
  }

  // 4. Build tax lots from release_events ordered by settlement date
  const taxLots: TaxLot[] = allReleaseEvents.map((re) => {
    const allocations = JSON.parse(re.grantAllocations);
    return {
      releaseEventId: re.id,
      grantAllocations: allocations,
      settlementDate: re.settlementDate,
      vestDate: re.vestDate,
      totalShares: re.netSharesReceived,
      remainingShares: re.netSharesReceived,
      costBasis: re.releasePrice,
      sellToCoverGain: re.sellToCoverGain,
    };
  });

  // 5. Load all sells sorted by date ASC
  const allSells = await db.select().from(sells).orderBy(asc(sells.date));

  // 6. For each sell, consume from lots (FIFO by settlement date)
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
        releaseEventId: lot.releaseEventId,
        settlementDate: lot.settlementDate,
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

  return { grantPools, taxLots, sellAllocations };
}
