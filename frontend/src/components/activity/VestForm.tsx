import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Vest } from '@/types';

interface Props {
  initial?: Vest;
  onSubmit: (data: Omit<Vest, 'id' | 'createdAt' | 'sellForTax' | 'taxCashReturn' | 'release'>) => void;
  onCancel: () => void;
}

export function VestForm({ initial, onSubmit, onCancel }: Props) {
  const [date, setDate] = useState(initial?.date ?? '');
  const [shareAmount, setShareAmount] = useState(initial?.shareAmount?.toString() ?? '');
  const [unitPrice, setUnitPrice] = useState(initial?.unitPrice?.toString() ?? '');
  const [isCliff, setIsCliff] = useState(initial?.isCliff ?? false);
  const [notes, setNotes] = useState(initial?.notes ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      date,
      shareAmount: parseFloat(shareAmount),
      unitPrice: unitPrice ? parseFloat(unitPrice) : null,
      isCliff,
      notes,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="date">Vest Date</Label>
        <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="shareAmount">Shares</Label>
          <Input id="shareAmount" type="number" step="any" value={shareAmount} onChange={(e) => setShareAmount(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="unitPrice">FMV (Unit Price)</Label>
          <Input id="unitPrice" type="number" step="any" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} placeholder="Optional" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input id="isCliff" type="checkbox" checked={isCliff} onChange={(e) => setIsCliff(e.target.checked)} className="h-4 w-4" />
        <Label htmlFor="isCliff">This is the first vest (cliff)</Label>
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{initial ? 'Update' : 'Create'}</Button>
      </div>
    </form>
  );
}
