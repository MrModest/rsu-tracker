import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Received On</TableHead>
            <TableHead className="text-right">Shares Received</TableHead>
            <TableHead className="text-right">You Still Hold</TableHead>
            <TableHead className="text-right">Price When Received</TableHead>
            {latestPrice && <TableHead className="text-right">Current Value</TableHead>}
            {latestPrice && <TableHead className="text-right">If You Sold Now</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {activeLots.map((lot) => {
            const currentValue = latestPrice ? latestPrice * lot.remainingShares : null;
            const gainIfSold = latestPrice ? (latestPrice - lot.costBasis) * lot.remainingShares : null;
            return (
              <TableRow key={lot.releaseId}>
                <TableCell>{lot.releaseDate}</TableCell>
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
      {latestPrice && (
        <p className="text-xs text-muted-foreground italic">
          "If You Sold Now" = (Current Price &minus; Price When Received) &times; Shares You Still Hold
        </p>
      )}
    </div>
  );
}
