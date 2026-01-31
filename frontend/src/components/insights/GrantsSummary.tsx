import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
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

      {/* Mobile: Cards */}
      <div className="md:hidden space-y-3">
        {grants.map((g) => (
          <Card key={g.id}>
            <CardContent className="space-y-2">
              <div className="font-medium text-base">{g.name}</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <div className="text-muted-foreground">Date</div>
                  <div>{g.date}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Shares</div>
                  <div>{formatNumber(g.shareAmount, 0)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Unit Price</div>
                  <div>{formatCurrency(g.unitPrice, currency)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Total Value</div>
                  <div className="font-medium">{formatCurrency(g.shareAmount * g.unitPrice, currency)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop: Table */}
      <div className="hidden md:block">
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
    </div>
  );
}
