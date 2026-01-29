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
          When your shares vest, your employer sells some of them to pay income tax on your behalf. This shows what happened at each vesting event.
        </p>
      </div>

      {summaries.map((s) => (
        <VestTaxCard key={s.vestId} summary={s} currency={currency} />
      ))}
    </div>
  );
}

function VestTaxCard({ summary: s, currency }: { summary: TaxWithholdingSummary; currency: string }) {
  const vestValue = s.vestUnitPrice ? s.sharesVested * s.vestUnitPrice : null;
  const taxRate = vestValue && vestValue > 0 ? s.netTaxPaid / vestValue : null;

  return (
    <Card>
      <CardContent className="pt-5 space-y-3">
        <div className="space-y-1">
          <p className="font-medium">
            {formatNumber(s.sharesVested, 0)} shares vested on {s.vestDate}
          </p>
          {s.vestUnitPrice !== null && (
            <>
              <p className="text-sm text-muted-foreground">
                Share price at vesting: {formatCurrency(s.vestUnitPrice, currency)}
              </p>
              {vestValue !== null && (
                <p className="text-sm text-muted-foreground">
                  Vest value: {formatNumber(s.sharesVested, 0)} × {formatCurrency(s.vestUnitPrice, currency)} = {formatCurrency(vestValue, currency)}
                </p>
              )}
            </>
          )}
        </div>

        <Separator />

        <div className="space-y-1">
          <p className="text-sm font-medium">Tax payment:</p>
          <div className="pl-2 space-y-0.5 text-sm">
            <p>
              Shares sold for tax: {formatNumber(s.sharesSoldForTax, 0)}
              {s.vestUnitPrice !== null && (
                <span> × {formatCurrency(s.vestUnitPrice, currency)} = {formatCurrency(s.taxProceeds, currency)}</span>
              )}
            </p>
            <p>Broker fee: {formatCurrency(s.sellForTaxFee, currency)}</p>
            <p>Cash returned by employer: {formatCurrency(s.cashReturned, currency)}</p>
            <p className="font-medium">
              Net tax paid: {formatCurrency(s.taxProceeds, currency)}
              {s.cashReturned > 0 && <span> − {formatCurrency(s.cashReturned, currency)}</span>}
              {' '}= {formatCurrency(s.netTaxPaid, currency)}
            </p>
          </div>
        </div>

        {taxRate !== null && vestValue !== null && (
          <>
            <Separator />
            <p className="text-sm">
              Tax rate: {formatCurrency(s.netTaxPaid, currency)} ÷ {formatCurrency(vestValue, currency)} = <span className="font-medium">{(taxRate * 100).toFixed(1)}%</span>
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
