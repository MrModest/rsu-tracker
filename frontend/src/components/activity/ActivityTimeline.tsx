import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { Pencil, Trash2 } from 'lucide-react';
import type { Grant, ReleaseEvent, Sell } from '@/types';

export type TimelineItem =
  | { type: 'grant'; data: Grant }
  | { type: 'release_event'; data: ReleaseEvent }
  | { type: 'sell'; data: Sell };

const typeBadgeVariant: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  grant: 'default',
  release_event: 'secondary',
  sell: 'destructive',
};

const typeLabels: Record<string, string> = {
  grant: 'Grant',
  release_event: 'Release',
  sell: 'Sell',
};

function getDetails(item: TimelineItem, currency: string): string {
  switch (item.type) {
    case 'grant':
      return `${formatNumber(item.data.shareAmount, 0)} shares @ ${formatCurrency(item.data.unitPrice, currency)} — "${item.data.name}"`;
    case 'release_event':
      return `${formatNumber(item.data.totalShares, 0)} shares vested @ ${formatCurrency(item.data.releasePrice, currency)} cost basis (${formatNumber(item.data.sharesSoldForTax, 0)} sold for tax @ ${formatCurrency(item.data.taxSalePrice, currency)}) → ${formatNumber(item.data.netSharesReceived, 0)} net`;
    case 'sell':
      return `${formatNumber(item.data.shareAmount, 0)} shares @ ${formatCurrency(item.data.unitPrice, currency)}${item.data.fee ? ` (fee: ${formatCurrency(item.data.fee, currency)})` : ''}`;
  }
}

function getDate(item: TimelineItem): string {
  if (item.type === 'release_event') {
    return item.data.settlementDate;
  }
  return item.data.date;
}

function getId(item: TimelineItem): string {
  return item.data.id;
}

interface Props {
  items: TimelineItem[];
  currency: string;
  onEdit: (item: TimelineItem) => void;
  onDelete: (item: TimelineItem) => void;
}

export function ActivityTimeline({ items, currency, onEdit, onDelete }: Props) {
  const sorted = [...items].sort((a, b) => getDate(b).localeCompare(getDate(a)));

  if (sorted.length === 0) {
    return <p className="text-muted-foreground text-sm">No events yet. Add your first grant to get started.</p>;
  }

  return (
    <div className="space-y-2">
      {sorted.map((item) => (
        <div key={`${item.type}-${getId(item)}`} className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-md border p-3">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground w-fit shrink-0">{getDate(item)}</span>
            <div className="w-20 shrink-0 flex justify-center">
              <Badge variant={typeBadgeVariant[item.type]}>{typeLabels[item.type]}</Badge>
            </div>
          </div>
          <span className="text-sm flex-1 break-words">{getDetails(item, currency)}</span>
          <div className="flex gap-1 shrink-0 self-end sm:self-auto">
            <Button variant="ghost" size="icon" onClick={() => onEdit(item)}><Pencil className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(item)}><Trash2 className="h-4 w-4" /></Button>
          </div>
        </div>
      ))}
    </div>
  );
}
