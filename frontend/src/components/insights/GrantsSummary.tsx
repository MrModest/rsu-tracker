import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency, formatNumber } from '@/lib/utils';
import type { Grant } from '@/types';

interface Props {
  grants: Grant[];
  currency: string;
}

export function GrantsSummary({ grants, currency }: Props) {
  if (grants.length === 0) return null;

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">Grants</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Shares</TableHead>
            <TableHead className="text-right">Unit Price</TableHead>
            <TableHead className="text-right">Total Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {grants.map((g) => (
            <TableRow key={g.id}>
              <TableCell className="font-medium">{g.name}</TableCell>
              <TableCell>{g.date}</TableCell>
              <TableCell className="text-right">{formatNumber(g.shareAmount, 0)}</TableCell>
              <TableCell className="text-right">{formatCurrency(g.unitPrice, currency)}</TableCell>
              <TableCell className="text-right">{formatCurrency(g.shareAmount * g.unitPrice, currency)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
