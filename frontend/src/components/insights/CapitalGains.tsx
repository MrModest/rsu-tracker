import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatCurrency, formatNumber } from '@/lib/utils';
import type { SellAllocation } from '@/types';

interface Props {
  sellAllocations: SellAllocation[];
  currency: string;
}

function groupByYear(allocations: SellAllocation[]): Map<number, SellAllocation[]> {
  const map = new Map<number, SellAllocation[]>();
  for (const sa of allocations) {
    const year = new Date(sa.sellDate).getFullYear();
    if (!map.has(year)) map.set(year, []);
    map.get(year)!.push(sa);
  }
  return new Map([...map.entries()].sort(([a], [b]) => a - b));
}

function FormulaLine({ sellPrice, costBasis, shares, fee, gain, currency }: {
  sellPrice: number;
  costBasis: number;
  shares: number;
  fee: number;
  gain: number;
  currency: string;
}) {
  const feeStr = fee !== 0 ? ` − ${formatCurrency(fee, currency)}` : '';
  return (
    <span className={gain >= 0 ? 'text-primary' : 'text-destructive'}>
      ({formatCurrency(sellPrice, currency)} − {formatCurrency(costBasis, currency)}) × {formatNumber(shares, 0)}{feeStr} = {gain >= 0 ? '' : ''}{formatCurrency(gain, currency)}
    </span>
  );
}

export function CapitalGains({ sellAllocations, currency }: Props) {
  if (sellAllocations.length === 0) return null;

  const yearGroups = groupByYear(sellAllocations);

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold">Sell History</h2>
        <p className="text-sm text-muted-foreground">
          Every time you sold shares, this shows your taxable capital gain — the number you need for your tax declaration.
        </p>
      </div>

      {[...yearGroups.entries()].map(([year, sells]) => {
        const yearTotal = sells.reduce((s, sa) => s + sa.totalGain, 0);
        return (
          <div key={year} className="space-y-3">
            <div className="rounded-lg border bg-muted/50 px-4 py-2.5 flex items-center gap-2">
              <span className="text-sm font-medium">{year}</span>
              <span className="text-sm text-muted-foreground">—</span>
              <span className={`text-sm font-semibold ${yearTotal >= 0 ? 'text-primary' : 'text-destructive'}`}>
                Total taxable gain: {formatCurrency(yearTotal, currency)}
              </span>
            </div>

            {sells.map((sa) => (
              <SellCard key={sa.sellId} sell={sa} currency={currency} />
            ))}
          </div>
        );
      })}

      <p className="text-xs text-muted-foreground italic">
        Gain per batch = (Sell Price − Price When Received) × Shares − Prorated Fee
      </p>
    </div>
  );
}

function SellCard({ sell, currency }: { sell: SellAllocation; currency: string }) {
  const multiLot = sell.lotAllocations.length > 1;

  return (
    <Card>
      <CardContent className="pt-5 space-y-3">
        <div className="space-y-1">
          <p className="font-medium">
            Sold {formatNumber(sell.totalShares, 0)} shares on {sell.sellDate}
          </p>
          <p className="text-sm text-muted-foreground">
            Sell price: {formatCurrency(sell.unitPrice, currency)} per share
          </p>
          <p className="text-sm text-muted-foreground">
            Broker fee: {formatCurrency(sell.fee, currency)}
          </p>
        </div>

        <Separator />

        <div className="space-y-3">
          <p className="text-sm font-medium">
            {multiLot
              ? `These shares came from ${sell.lotAllocations.length} different batches:`
              : 'These shares came from:'}
          </p>

          {sell.lotAllocations.map((la, i) => (
            <div key={`${la.releaseId}-${i}`} className="text-sm space-y-0.5 pl-2">
              <p>
                {multiLot && <span className="text-muted-foreground mr-1">{'\u2460'.charAt(0) && String.fromCodePoint(0x2460 + i)}</span>}
                {formatNumber(la.shares, 0)} shares received on {la.releaseDate} at {formatCurrency(la.costBasis, currency)}
              </p>
              <p className="text-muted-foreground">
                Gain:{' '}
                <FormulaLine
                  sellPrice={sell.unitPrice}
                  costBasis={la.costBasis}
                  shares={la.shares}
                  fee={la.proratedFee}
                  gain={la.gain}
                  currency={currency}
                />
              </p>
            </div>
          ))}
        </div>

        <Separator />

        <p className="font-medium">
          Taxable gain:{' '}
          <span className={sell.totalGain >= 0 ? 'text-primary' : 'text-destructive'}>
            {formatCurrency(sell.totalGain, currency)}
          </span>
        </p>
      </CardContent>
    </Card>
  );
}
