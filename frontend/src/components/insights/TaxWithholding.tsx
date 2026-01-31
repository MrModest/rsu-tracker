import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatCurrency, formatNumber } from '@/lib/utils';
import type { TaxWithholdingSummary } from '@/types';

interface Props {
  summaries: TaxWithholdingSummary[];
  currency: string;
}

export function TaxWithholding({ summaries, currency }: Props) {
  if (summaries.length === 0) return null;

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold">Tax at Vesting</h2>
        <p className="text-sm text-muted-foreground">
          When your shares vest, your employer sells some of them to pay income tax on your behalf. This shows what happened at each release event.
        </p>
      </div>

      {summaries.map((s) => (
        <ReleaseTaxCard key={s.releaseEventId} summary={s} currency={currency} />
      ))}
    </div>
  );
}

function ReleaseTaxCard({ summary: s, currency }: { summary: TaxWithholdingSummary; currency: string }) {
  const vestValue = s.totalShares * s.releasePrice;
  const taxProceeds = s.sharesSoldForTax * s.taxSalePrice;

  return (
    <Card>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <p className="font-medium">
            {formatNumber(s.totalShares, 0)} shares vested on {s.vestDate}
          </p>
          <p className="text-sm text-muted-foreground">
            Settlement date: {s.settlementDate}
          </p>
          <p className="text-sm text-muted-foreground">
            Release price (FMV, 30-day avg): {formatCurrency(s.releasePrice, currency)}
          </p>
          <p className="text-sm text-muted-foreground">
            Vest value: {formatNumber(s.totalShares, 0)} × {formatCurrency(s.releasePrice, currency)} = {formatCurrency(vestValue, currency)}
          </p>
        </div>

        <Separator />

        <div className="space-y-1">
          <p className="text-sm font-medium">Sell-to-cover transaction:</p>
          <div className="pl-2 space-y-0.5 text-xs md:text-sm">
            <p>
              Shares sold for tax: {formatNumber(s.sharesSoldForTax, 0)} × {formatCurrency(s.taxSalePrice, currency)} = {formatCurrency(taxProceeds, currency)}
            </p>
            <p>Tax withheld: {formatCurrency(s.taxWithheld, currency)}</p>
            <p>Broker fee: {formatCurrency(s.brokerFee, currency)}</p>
            {s.cashReturned > 0 && (
              <p>Cash returned by employer: {formatCurrency(s.cashReturned, currency)}</p>
            )}
            <p className={`font-medium ${s.sellToCoverGain < 0 ? 'text-red-600' : 'text-green-600'}`}>
              Sell-to-cover capital {s.sellToCoverGain >= 0 ? 'gain' : 'loss'}: {formatCurrency(s.sellToCoverGain, currency)}
            </p>
            <p className="text-xs text-muted-foreground">
              ({formatCurrency(s.taxSalePrice, currency)} − {formatCurrency(s.releasePrice, currency)}) × {formatNumber(s.sharesSoldForTax, 0)} − {formatCurrency(s.brokerFee, currency)}
            </p>
          </div>
        </div>

        <Separator />
        <p className="text-sm">
          Effective tax rate: {formatCurrency(s.taxWithheld, currency)} ÷ {formatCurrency(vestValue, currency)} = <span className="font-medium">{(s.effectiveTaxRate * 100).toFixed(1)}%</span>
        </p>
      </CardContent>
    </Card>
  );
}
