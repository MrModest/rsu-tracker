import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency, formatNumber } from '@/lib/utils';
import type { TaxWithholdingSummary } from '@/types';

interface Props {
  summaries: TaxWithholdingSummary[];
  currency: string;
}

export function TaxWithholding({ summaries, currency }: Props) {
  if (summaries.length === 0) return null;

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">Tax Withholding</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Vest Date</TableHead>
            <TableHead className="text-right">Shares Vested</TableHead>
            <TableHead className="text-right">Sold for Tax</TableHead>
            <TableHead className="text-right">Tax Proceeds</TableHead>
            <TableHead className="text-right">Fee</TableHead>
            <TableHead className="text-right">Cash Returned</TableHead>
            <TableHead className="text-right">Net Tax</TableHead>
            <TableHead className="text-right">Eff. Rate</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {summaries.map((s) => (
            <TableRow key={s.vestId}>
              <TableCell>{s.vestDate}</TableCell>
              <TableCell className="text-right">{formatNumber(s.sharesVested, 0)}</TableCell>
              <TableCell className="text-right">{formatNumber(s.sharesSoldForTax, 0)}</TableCell>
              <TableCell className="text-right">{formatCurrency(s.taxProceeds, currency)}</TableCell>
              <TableCell className="text-right">{formatCurrency(s.sellForTaxFee, currency)}</TableCell>
              <TableCell className="text-right">{formatCurrency(s.cashReturned, currency)}</TableCell>
              <TableCell className="text-right">{formatCurrency(s.netTaxPaid, currency)}</TableCell>
              <TableCell className="text-right">{(s.effectiveTaxRate * 100).toFixed(1)}%</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
