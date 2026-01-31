import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, formatNumber } from '@/lib/utils';
import type { TaxLot } from '@/types';

interface Props {
  lots: TaxLot[];
  currency: string;
  latestPrice: number | null;
}

export function LotTracker({ lots, currency, latestPrice }: Props) {
  const activeLots = lots.filter((l) => l.remainingShares > 0);

  if (activeLots.length === 0) return null;

  const totalRemaining = activeLots.reduce((s, l) => s + l.remainingShares, 0);
  const totalCurrentValue = latestPrice ? activeLots.reduce((s, l) => s + latestPrice * l.remainingShares, 0) : null;
  const totalGainIfSold = latestPrice
    ? activeLots.reduce((s, l) => s + (latestPrice - l.costBasis) * l.remainingShares, 0)
    : null;

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold">Your Shares</h2>
        <p className="text-sm text-muted-foreground">
          Shares that were released to your brokerage account and you haven't sold yet.
        </p>
      </div>

      {/* Mobile: Cards */}
      <div className="md:hidden space-y-3">
        {activeLots.map((lot) => {
          const currentValue = latestPrice ? latestPrice * lot.remainingShares : null;
          const gainIfSold = latestPrice ? (latestPrice - lot.costBasis) * lot.remainingShares : null;
          return (
            <Card key={lot.releaseEventId}>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <div className="text-muted-foreground">Settlement Date</div>
                    <div className="font-medium">{lot.settlementDate}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Vest Date</div>
                    <div>{lot.vestDate}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Shares Received</div>
                    <div>{formatNumber(lot.totalShares, 0)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">You Still Hold</div>
                    <div className="font-medium">{formatNumber(lot.remainingShares, 0)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Cost Basis (FMV)</div>
                    <div>{formatCurrency(lot.costBasis, currency)}</div>
                  </div>
                  {currentValue !== null && (
                    <div>
                      <div className="text-muted-foreground">Current Value</div>
                      <div>{formatCurrency(currentValue, currency)}</div>
                    </div>
                  )}
                  {gainIfSold !== null && (
                    <div className="col-span-2">
                      <div className="text-muted-foreground">If You Sold Now</div>
                      <div className={`font-medium ${gainIfSold >= 0 ? 'text-primary' : 'text-destructive'}`}>
                        {gainIfSold >= 0 ? '+' : ''}{formatCurrency(gainIfSold, currency)}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
        {latestPrice && (
          <Card>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 text-sm font-medium">
                <div>
                  <div className="text-muted-foreground font-normal">Total Shares</div>
                  <div>{formatNumber(totalRemaining, 0)}</div>
                </div>
                {totalCurrentValue !== null && (
                  <div>
                    <div className="text-muted-foreground font-normal">Total Value</div>
                    <div>{formatCurrency(totalCurrentValue, currency)}</div>
                  </div>
                )}
                {totalGainIfSold !== null && (
                  <div className="col-span-2">
                    <div className="text-muted-foreground font-normal">Total Gain If Sold</div>
                    <div className={totalGainIfSold >= 0 ? 'text-primary' : 'text-destructive'}>
                      {totalGainIfSold >= 0 ? '+' : ''}{formatCurrency(totalGainIfSold, currency)}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Desktop: Table */}
      <div className="hidden md:block">
        <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Settlement Date</TableHead>
            <TableHead>Vest Date</TableHead>
            <TableHead className="text-right">Shares Received</TableHead>
            <TableHead className="text-right">You Still Hold</TableHead>
            <TableHead className="text-right">Cost Basis (FMV)</TableHead>
            {latestPrice && <TableHead className="text-right">Current Value</TableHead>}
            {latestPrice && <TableHead className="text-right">If You Sold Now</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {activeLots.map((lot) => {
            const currentValue = latestPrice ? latestPrice * lot.remainingShares : null;
            const gainIfSold = latestPrice ? (latestPrice - lot.costBasis) * lot.remainingShares : null;
            return (
              <TableRow key={lot.releaseEventId}>
                <TableCell>{lot.settlementDate}</TableCell>
                <TableCell>{lot.vestDate}</TableCell>
                <TableCell className="text-right">{formatNumber(lot.totalShares, 0)}</TableCell>
                <TableCell className="text-right">{formatNumber(lot.remainingShares, 0)}</TableCell>
                <TableCell className="text-right">{formatCurrency(lot.costBasis, currency)}</TableCell>
                {currentValue !== null && (
                  <TableCell className="text-right">{formatCurrency(currentValue, currency)}</TableCell>
                )}
                {gainIfSold !== null && (
                  <TableCell className={`text-right ${gainIfSold >= 0 ? 'text-primary' : 'text-destructive'}`}>
                    {gainIfSold >= 0 ? '+' : ''}{formatCurrency(gainIfSold, currency)}
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
        {latestPrice && (
          <TableFooter>
            <TableRow>
              <TableCell />
              <TableCell />
              <TableCell />
              <TableCell className="text-right font-bold">{formatNumber(totalRemaining, 0)}</TableCell>
              <TableCell />
              {totalCurrentValue !== null && (
                <TableCell className="text-right font-bold">{formatCurrency(totalCurrentValue, currency)}</TableCell>
              )}
              {totalGainIfSold !== null && (
                <TableCell className={`text-right font-bold ${totalGainIfSold >= 0 ? 'text-primary' : 'text-destructive'}`}>
                  {totalGainIfSold >= 0 ? '+' : ''}{formatCurrency(totalGainIfSold, currency)}
                </TableCell>
              )}
            </TableRow>
          </TableFooter>
        )}
      </Table>
      </div>

      {latestPrice && (
        <p className="text-xs text-muted-foreground italic">
          "If You Sold Now" = (Current Price &minus; Cost Basis) &times; Shares You Still Hold. Cost basis is FMV at settlement date (30-day avg).
        </p>
      )}
    </div>
  );
}
