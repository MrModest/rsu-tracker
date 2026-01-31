import { db } from '../db/index.js';
import { grants, releaseEvents, sells } from '../db/schema.js';
import { computeFifo } from './fifo.js';
import type { PortfolioOverview, TaxWithholdingSummary, PromisedVsFactual, SellToCoverGainSummary } from '../types.js';
import { desc } from 'drizzle-orm';

export async function getPortfolioOverview(): Promise<PortfolioOverview> {
  const allGrants = await db.select().from(grants);
  const allReleaseEvents = await db.select().from(releaseEvents);
  const allSells = await db.select().from(sells);

  const totalGranted = allGrants.reduce((s, g) => s + g.shareAmount, 0);
  const totalVested = allReleaseEvents.reduce((s, re) => s + re.totalShares, 0);
  const totalSoldForTax = allReleaseEvents.reduce((s, re) => s + re.sharesSoldForTax, 0);
  const totalReleased = allReleaseEvents.reduce((s, re) => s + re.netSharesReceived, 0);
  const totalSold = allSells.reduce((s, sl) => s + sl.shareAmount, 0);
  const currentlyHeld = totalReleased - totalSold;

  const totalFeesPaid =
    allReleaseEvents.reduce((s, re) => s + re.brokerFee, 0) +
    allSells.reduce((s, sl) => s + sl.fee, 0);

  // Latest price: most recent sell price, or most recent release price, or null
  const latestSell = allSells.sort((a, b) => b.date.localeCompare(a.date))[0];
  const latestRelease = allReleaseEvents.sort((a, b) => b.settlementDate.localeCompare(a.settlementDate))[0];
  const latestPrice = latestSell?.unitPrice ?? latestRelease?.releasePrice ?? null;

  const unrealizedValue = latestPrice ? currentlyHeld * latestPrice : 0;

  return {
    totalGranted,
    totalVested,
    totalSoldForTax,
    totalReleased,
    totalSold,
    currentlyHeld,
    totalFeesPaid,
    unrealizedValue,
    latestPrice,
  };
}

export async function getTaxWithholdingSummaries(): Promise<TaxWithholdingSummary[]> {
  const allReleaseEvents = await db
    .select()
    .from(releaseEvents)
    .orderBy(desc(releaseEvents.settlementDate));

  return allReleaseEvents.map((re) => {
    const vestValue = re.totalShares * re.releasePrice;
    const effectiveTaxRate = vestValue > 0 ? re.taxWithheld / vestValue : 0;

    return {
      releaseEventId: re.id,
      settlementDate: re.settlementDate,
      vestDate: re.vestDate,
      totalShares: re.totalShares,
      releasePrice: re.releasePrice,
      sharesSoldForTax: re.sharesSoldForTax,
      taxSalePrice: re.taxSalePrice,
      taxWithheld: re.taxWithheld,
      brokerFee: re.brokerFee,
      cashReturned: re.cashReturned,
      sellToCoverGain: re.sellToCoverGain,
      effectiveTaxRate,
    };
  });
}

export async function getSellToCoverGains(): Promise<SellToCoverGainSummary[]> {
  const allReleaseEvents = await db
    .select()
    .from(releaseEvents)
    .orderBy(desc(releaseEvents.settlementDate));

  return allReleaseEvents.map((re) => ({
    releaseEventId: re.id,
    settlementDate: re.settlementDate,
    sharesSold: re.sharesSoldForTax,
    costBasis: re.releasePrice,
    salePrice: re.taxSalePrice,
    gain: re.sellToCoverGain,
  }));
}

export async function getPromisedVsFactual(): Promise<PromisedVsFactual[]> {
  const allGrants = await db.select().from(grants);
  const allReleaseEvents = await db.select().from(releaseEvents);

  // Group by grant
  const byGrant = new Map<string, { grantName: string; grantPrice: number; sharesVested: number; factualValue: number }>();

  const grantMap = new Map(allGrants.map((g) => [g.id, g]));

  for (const re of allReleaseEvents) {
    const allocations = JSON.parse(re.grantAllocations);

    for (const alloc of allocations) {
      const grant = grantMap.get(alloc.grantId);
      if (!grant) continue;

      const existing = byGrant.get(grant.name);
      if (existing) {
        existing.sharesVested += alloc.shares;
        existing.factualValue += alloc.shares * re.releasePrice;
      } else {
        byGrant.set(grant.name, {
          grantName: grant.name,
          grantPrice: grant.unitPrice,
          sharesVested: alloc.shares,
          factualValue: alloc.shares * re.releasePrice,
        });
      }
    }
  }

  return Array.from(byGrant.values()).map((g) => ({
    grantName: g.grantName,
    grantPrice: g.grantPrice,
    sharesVested: g.sharesVested,
    promisedValue: g.grantPrice * g.sharesVested,
    factualValue: g.factualValue,
    difference: g.factualValue - g.grantPrice * g.sharesVested,
  }));
}
