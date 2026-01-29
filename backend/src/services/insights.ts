import { db } from '../db/index.js';
import { grants, vests, sellForTax, taxCashReturns, releases, sells } from '../db/schema.js';
import { computeFifo } from './fifo.js';
import type { PortfolioOverview, TaxWithholdingSummary, PromisedVsFactual } from '../types.js';
import { eq, desc } from 'drizzle-orm';

export async function getPortfolioOverview(): Promise<PortfolioOverview> {
  const allGrants = await db.select().from(grants);
  const allVests = await db.select().from(vests);
  const allSellForTax = await db.select().from(sellForTax);
  const allReleases = await db.select().from(releases);
  const allSells = await db.select().from(sells);

  const totalGranted = allGrants.reduce((s, g) => s + g.shareAmount, 0);
  const totalVested = allVests.reduce((s, v) => s + v.shareAmount, 0);
  const totalSoldForTax = allSellForTax.reduce((s, st) => s + st.shareAmount, 0);
  const totalReleased = allReleases.reduce((s, r) => s + r.shareAmount, 0);
  const totalSold = allSells.reduce((s, sl) => s + sl.shareAmount, 0);
  const currentlyHeld = totalReleased - totalSold;

  const totalFeesPaid =
    allSellForTax.reduce((s, st) => s + st.fee, 0) +
    allSells.reduce((s, sl) => s + sl.fee, 0);

  // Latest price: most recent sell price, or most recent release price, or null
  const latestSell = allSells.sort((a, b) => b.date.localeCompare(a.date))[0];
  const latestRelease = allReleases.sort((a, b) => b.date.localeCompare(a.date))[0];
  const latestPrice = latestSell?.unitPrice ?? latestRelease?.unitPrice ?? null;

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
  const allVests = await db.select().from(vests).orderBy(desc(vests.date));
  const allSellForTax = await db.select().from(sellForTax);
  const allTaxCashReturns = await db.select().from(taxCashReturns);

  return allVests.map((vest) => {
    const sft = allSellForTax.find((s) => s.vestId === vest.id);
    const tcr = allTaxCashReturns.find((t) => t.vestId === vest.id);

    const taxProceeds = sft ? sft.shareAmount * sft.unitPrice : 0;
    const sellForTaxFee = sft?.fee ?? 0;
    const cashReturned = tcr?.amount ?? 0;
    const netTaxPaid = taxProceeds - cashReturned;
    const vestUnitPrice = vest.unitPrice ?? sft?.unitPrice ?? null;
    const vestValue = vestUnitPrice ? vest.shareAmount * vestUnitPrice : 0;
    const effectiveTaxRate = vestValue > 0 ? netTaxPaid / vestValue : 0;

    return {
      vestId: vest.id,
      vestDate: vest.date,
      sharesVested: vest.shareAmount,
      vestUnitPrice,
      sharesSoldForTax: sft?.shareAmount ?? 0,
      taxProceeds,
      sellForTaxFee,
      cashReturned,
      netTaxPaid,
      effectiveTaxRate,
    };
  });
}

export async function getPromisedVsFactual(): Promise<PromisedVsFactual[]> {
  const fifo = await computeFifo();

  // Group vest allocations by grant, using release price as the factual value
  const byGrant = new Map<string, { grantName: string; grantPrice: number; sharesVested: number; factualValue: number }>();

  const allGrants = await db.select().from(grants);
  const allReleases = await db.select().from(releases);
  const grantMap = new Map(allGrants.map((g) => [g.id, g]));
  // Map vestId → release for price lookup
  const releaseByVestId = new Map(allReleases.map((r) => [r.vestId, r]));

  for (const va of fifo.vestAllocations) {
    const release = releaseByVestId.get(va.vestId);
    if (!release) continue;

    for (const alloc of va.allocations) {
      const grant = grantMap.get(alloc.grantId);
      if (!grant) continue;

      const existing = byGrant.get(grant.name);
      if (existing) {
        existing.sharesVested += alloc.shares;
        existing.factualValue += alloc.shares * release.unitPrice;
      } else {
        byGrant.set(grant.name, {
          grantName: grant.name,
          grantPrice: grant.unitPrice,
          sharesVested: alloc.shares,
          factualValue: alloc.shares * release.unitPrice,
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
