import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
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

      {/* Mobile: Cards */}
      <div className="md:hidden space-y-3">
        {data.map((d) => (
          <Card key={d.grantName}>
            <CardContent className="pt-4 space-y-2">
              <div className="font-medium text-base">{d.grantName}</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <div className="text-muted-foreground">Shares Vested</div>
                  <div>{formatNumber(d.sharesVested, 0)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Grant Price</div>
                  <div>{formatCurrency(d.grantPrice, currency)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Promised Value</div>
                  <div>{formatCurrency(d.promisedValue, currency)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Actual Value</div>
                  <div>{formatCurrency(d.factualValue, currency)}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-muted-foreground">Difference</div>
                  <div className={`font-medium ${d.difference >= 0 ? 'text-primary' : 'text-destructive'}`}>
                    {d.difference >= 0 ? '+' : ''}{formatCurrency(d.difference, currency)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        <Card>
          <CardContent className="pt-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between font-medium">
                <span>Total Promised:</span>
                <span>{formatCurrency(totalPromised, currency)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Total Actual:</span>
                <span>{formatCurrency(totalFactual, currency)}</span>
              </div>
              <div className="flex justify-between font-bold text-base">
                <span>Difference:</span>
                <span className={totalDifference >= 0 ? 'text-primary' : 'text-destructive'}>
                  {totalDifference >= 0 ? '+' : ''}{formatCurrency(totalDifference, currency)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Desktop: Table */}
      <div className="hidden md:block">
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
      </div>

      <div className="text-xs text-muted-foreground italic space-y-0.5">
        <p>"Promised Value" = Shares Vested × Grant Price (what you would have gotten as a cash bonus)</p>
        <p>"Actual Value" = Shares Vested × Price at Vesting (what the shares were actually worth)</p>
      </div>
    </div>
  );
}
