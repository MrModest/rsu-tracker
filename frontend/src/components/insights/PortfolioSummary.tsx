import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatNumber } from '@/lib/utils';
import type { PortfolioOverview } from '@/types';

interface Props {
  data: PortfolioOverview;
  currency: string;
}

export function PortfolioSummary({ data, currency }: Props) {
  const cards = [
    { label: 'Granted', value: formatNumber(data.totalGranted, 0), sub: 'shares' },
    { label: 'Vested', value: formatNumber(data.totalVested, 0), sub: 'shares' },
    { label: 'Shares You Own', value: formatNumber(data.currentlyHeld, 0), sub: 'shares' },
    { label: 'Current Value', value: formatCurrency(data.unrealizedValue, currency), sub: data.latestPrice ? `@ ${formatCurrency(data.latestPrice, currency)}` : '' },
    { label: 'Sold for Tax', value: formatNumber(data.totalSoldForTax, 0), sub: 'by employer' },
    { label: 'Broker Fees', value: formatCurrency(data.totalFeesPaid, currency), sub: '' },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((c) => (
        <Card key={c.label}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{c.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{c.value}</div>
            {c.sub && <p className="text-xs text-muted-foreground">{c.sub}</p>}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
