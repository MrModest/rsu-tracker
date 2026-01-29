import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { Pencil, Trash2 } from 'lucide-react';
import type { Grant, Vest, SellForTax, TaxCashReturn, Release, Sell } from '@/types';

export type TimelineItem =
  | { type: 'grant'; data: Grant }
  | { type: 'vest'; data: Vest }
  | { type: 'sell_for_tax'; data: SellForTax }
  | { type: 'tax_cash_return'; data: TaxCashReturn }
  | { type: 'release'; data: Release }
  | { type: 'sell'; data: Sell };

const typeBadgeVariant: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  grant: 'default',
  vest: 'secondary',
  sell_for_tax: 'outline',
  tax_cash_return: 'outline',
  release: 'secondary',
  sell: 'destructive',
};

const typeLabels: Record<string, string> = {
  grant: 'Grant',
  vest: 'Vest',
  sell_for_tax: 'Sell for Tax',
  tax_cash_return: 'Tax Cash Return',
  release: 'Release',
  sell: 'Sell',
};

function getDetails(item: TimelineItem, currency: string): string {
  switch (item.type) {
    case 'grant':
      return `${formatNumber(item.data.shareAmount, 0)} shares @ ${formatCurrency(item.data.unitPrice, currency)} — "${item.data.name}"`;
    case 'vest':
      return `${formatNumber(item.data.shareAmount, 0)} shares${item.data.unitPrice != null ? ` @ ${formatCurrency(item.data.unitPrice, currency)}` : ''}${item.data.isCliff ? ' (cliff)' : ''}`;
    case 'sell_for_tax':
      return `${formatNumber(item.data.shareAmount, 0)} shares @ ${formatCurrency(item.data.unitPrice, currency)}${item.data.fee ? ` (fee: ${formatCurrency(item.data.fee, currency)})` : ''}`;
    case 'tax_cash_return':
      return `${formatCurrency(item.data.amount, currency)} returned`;
    case 'release':
      return `${formatNumber(item.data.shareAmount, 0)} shares @ ${formatCurrency(item.data.unitPrice, currency)} cost basis`;
    case 'sell':
      return `${formatNumber(item.data.shareAmount, 0)} shares @ ${formatCurrency(item.data.unitPrice, currency)}${item.data.fee ? ` (fee: ${formatCurrency(item.data.fee, currency)})` : ''}`;
  }
}

function getDate(item: TimelineItem): string {
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
        <div key={`${item.type}-${getId(item)}`} className="flex items-center gap-3 rounded-md border p-3">
          <span className="text-sm text-muted-foreground w-24 shrink-0">{getDate(item)}</span>
          <Badge variant={typeBadgeVariant[item.type]}>{typeLabels[item.type]}</Badge>
          <span className="text-sm flex-1">{getDetails(item, currency)}</span>
          <Button variant="ghost" size="icon" onClick={() => onEdit(item)}><Pencil className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(item)}><Trash2 className="h-4 w-4" /></Button>
        </div>
      ))}
    </div>
  );
}
