import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency, formatNumber } from '@/lib/utils';
import type { SellToCoverGainSummary } from '@/types';

interface Props {
  gains: SellToCoverGainSummary[];
  currency: string;
}

export function SellToCoverGains({ gains, currency }: Props) {
  if (gains.length === 0) return null;

  const totalGain = gains.reduce((sum, g) => sum + g.gain, 0);
  const totalLosses = gains.filter((g) => g.gain < 0).reduce((sum, g) => sum + g.gain, 0);
  const totalProfits = gains.filter((g) => g.gain > 0).reduce((sum, g) => sum + g.gain, 0);

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold">Sell-to-Cover Capital Gains/Losses</h2>
        <p className="text-sm text-muted-foreground">
          Capital gains or losses from mandatory sell-to-cover transactions (when shares are sold to pay income tax at vesting). These are separate from your voluntary sells and should be reported separately on your tax return.
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Settlement Date</TableHead>
            <TableHead className="text-right">Shares Sold</TableHead>
            <TableHead className="text-right">Cost Basis (FMV)</TableHead>
            <TableHead className="text-right">Sale Price</TableHead>
            <TableHead className="text-right">Capital Gain/Loss</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {gains.map((g) => (
            <TableRow key={g.releaseEventId}>
              <TableCell>{g.settlementDate}</TableCell>
              <TableCell className="text-right">{formatNumber(g.sharesSold, 2)}</TableCell>
              <TableCell className="text-right">{formatCurrency(g.costBasis, currency)}</TableCell>
              <TableCell className="text-right">{formatCurrency(g.salePrice, currency)}</TableCell>
              <TableCell className={`text-right font-medium ${g.gain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {g.gain >= 0 ? '+' : ''}{formatCurrency(g.gain, currency)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={4} className="text-right font-bold">Total:</TableCell>
            <TableCell className={`text-right font-bold ${totalGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalGain >= 0 ? '+' : ''}{formatCurrency(totalGain, currency)}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>

      {(totalLosses < 0 || totalProfits > 0) && (
        <div className="text-sm space-y-1">
          {totalProfits > 0 && (
            <p className="text-green-600">
              Total gains: +{formatCurrency(totalProfits, currency)}
            </p>
          )}
          {totalLosses < 0 && (
            <p className="text-red-600">
              Total losses: {formatCurrency(totalLosses, currency)}
            </p>
          )}
        </div>
      )}

      <p className="text-xs text-muted-foreground italic">
        Note: Cost basis is the FMV at settlement date (30-day average XETRA closing price). Gain/Loss = (Sale Price − Cost Basis) × Shares Sold − Broker Fee
      </p>
    </div>
  );
}
