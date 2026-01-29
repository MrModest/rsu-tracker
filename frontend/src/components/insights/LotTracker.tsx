import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency, formatNumber } from '@/lib/utils';
import type { TaxLot } from '@/types';

interface Props {
  lots: TaxLot[];
  currency: string;
  latestPrice: number | null;
}

export function LotTracker({ lots, currency, latestPrice }: Props) {
  if (lots.length === 0) return null;

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">Tax Lots</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Release Date</TableHead>
            <TableHead className="text-right">Total Shares</TableHead>
            <TableHead className="text-right">Remaining</TableHead>
            <TableHead className="text-right">Cost Basis</TableHead>
            {latestPrice && <TableHead className="text-right">Current Value</TableHead>}
            {latestPrice && <TableHead className="text-right">Unrealized Gain</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {lots.map((lot) => {
            const unrealizedGain = latestPrice ? (latestPrice - lot.costBasis) * lot.remainingShares : 0;
            return (
              <TableRow key={lot.releaseId}>
                <TableCell>{lot.releaseDate}</TableCell>
                <TableCell className="text-right">{formatNumber(lot.totalShares, 0)}</TableCell>
                <TableCell className="text-right">{formatNumber(lot.remainingShares, 0)}</TableCell>
                <TableCell className="text-right">{formatCurrency(lot.costBasis, currency)}</TableCell>
                {latestPrice && <TableCell className="text-right">{formatCurrency(latestPrice * lot.remainingShares, currency)}</TableCell>}
                {latestPrice && (
                  <TableCell className={`text-right ${unrealizedGain >= 0 ? 'text-primary' : 'text-destructive'}`}>
                    {formatCurrency(unrealizedGain, currency)}
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
