import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency, formatNumber } from '@/lib/utils';
import type { PromisedVsFactual } from '@/types';

interface Props {
  data: PromisedVsFactual[];
  currency: string;
}

export function StocksVsCash({ data, currency }: Props) {
  if (data.length === 0) return null;

  const totalPromised = data.reduce((s, d) => s + d.promisedValue, 0);
  const totalFactual = data.reduce((s, d) => s + d.factualValue, 0);
  const totalDifference = totalFactual - totalPromised;

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold">Stocks vs Cash</h2>
        <p className="text-sm text-muted-foreground">
          Compare what your grants were worth when promised vs. what they were actually worth when shares vested. Shows whether receiving stocks instead of cash worked in your favor.
        </p>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Grant</TableHead>
            <TableHead className="text-right">Shares Vested</TableHead>
            <TableHead className="text-right">Promised Value</TableHead>
            <TableHead className="text-right">Actual Value</TableHead>
            <TableHead className="text-right">Difference</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((d) => (
            <TableRow key={d.grantName}>
              <TableCell className="font-medium">{d.grantName}</TableCell>
              <TableCell className="text-right">{formatNumber(d.sharesVested, 0)}</TableCell>
              <TableCell className="text-right">
                <span className="text-muted-foreground text-xs mr-1.5">
                  {formatNumber(d.sharesVested, 0)} × {formatCurrency(d.grantPrice, currency)} =
                </span>
                {formatCurrency(d.promisedValue, currency)}
              </TableCell>
              <TableCell className="text-right">{formatCurrency(d.factualValue, currency)}</TableCell>
              <TableCell className={`text-right font-medium ${d.difference >= 0 ? 'text-primary' : 'text-destructive'}`}>
                {d.difference >= 0 ? '+' : ''}{formatCurrency(d.difference, currency)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell className="font-bold">Total</TableCell>
            <TableCell />
            <TableCell className="text-right font-bold">{formatCurrency(totalPromised, currency)}</TableCell>
            <TableCell className="text-right font-bold">{formatCurrency(totalFactual, currency)}</TableCell>
            <TableCell className={`text-right font-bold ${totalDifference >= 0 ? 'text-primary' : 'text-destructive'}`}>
              {totalDifference >= 0 ? '+' : ''}{formatCurrency(totalDifference, currency)}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
      <div className="text-xs text-muted-foreground italic space-y-0.5">
        <p>"Promised Value" = Shares Vested × Grant Price (what you would have gotten as a cash bonus)</p>
        <p>"Actual Value" = Shares Vested × Price at Vesting (what the shares were actually worth)</p>
      </div>
    </div>
  );
}
