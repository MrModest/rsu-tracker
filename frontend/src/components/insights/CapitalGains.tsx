import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency, formatNumber } from '@/lib/utils';
import type { SellAllocation } from '@/types';

interface Props {
  sellAllocations: SellAllocation[];
  currency: string;
}

export function CapitalGains({ sellAllocations, currency }: Props) {
  if (sellAllocations.length === 0) return null;

  const totalGains = sellAllocations.reduce((s, a) => s + a.totalGain, 0);

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">Capital Gains</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Sell Date</TableHead>
            <TableHead>Lot (Release)</TableHead>
            <TableHead className="text-right">Shares</TableHead>
            <TableHead className="text-right">Cost Basis</TableHead>
            <TableHead className="text-right">Sell Price</TableHead>
            <TableHead className="text-right">Fee</TableHead>
            <TableHead className="text-right">Gain</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sellAllocations.flatMap((sa) =>
            sa.lotAllocations.map((la, i) => (
              <TableRow key={`${sa.sellId}-${la.releaseId}-${i}`}>
                <TableCell>{i === 0 ? sa.sellDate : ''}</TableCell>
                <TableCell>{la.releaseDate}</TableCell>
                <TableCell className="text-right">{formatNumber(la.shares, 0)}</TableCell>
                <TableCell className="text-right">{formatCurrency(la.costBasis, currency)}</TableCell>
                <TableCell className="text-right">{formatCurrency(sa.unitPrice, currency)}</TableCell>
                <TableCell className="text-right">{formatCurrency(la.proratedFee, currency)}</TableCell>
                <TableCell className={`text-right ${la.gain >= 0 ? 'text-primary' : 'text-destructive'}`}>
                  {formatCurrency(la.gain, currency)}
                </TableCell>
              </TableRow>
            ))
          )}
          <TableRow className="font-bold">
            <TableCell colSpan={6} className="text-right">Total</TableCell>
            <TableCell className={`text-right ${totalGains >= 0 ? 'text-primary' : 'text-destructive'}`}>
              {formatCurrency(totalGains, currency)}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
