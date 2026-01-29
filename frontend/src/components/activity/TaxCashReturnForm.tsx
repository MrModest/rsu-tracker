import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { TaxCashReturn, Vest } from '@/types';

interface Props {
  initial?: TaxCashReturn;
  vests: Vest[];
  onSubmit: (data: Omit<TaxCashReturn, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

export function TaxCashReturnForm({ initial, vests, onSubmit, onCancel }: Props) {
  const [vestId, setVestId] = useState(initial?.vestId ?? '');
  const [date, setDate] = useState(initial?.date ?? '');
  const [amount, setAmount] = useState(initial?.amount?.toString() ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      vestId,
      date,
      amount: parseFloat(amount),
      notes,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="vestId">Linked Vest</Label>
        <select id="vestId" value={vestId} onChange={(e) => setVestId(e.target.value)} required className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm">
          <option value="">Select vest...</option>
          {vests.map((v) => (
            <option key={v.id} value={v.id}>{v.date} — {v.shareAmount} shares @ {v.unitPrice}</option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="date">Return Date</Label>
        <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="amount">Amount Returned</Label>
        <Input id="amount" type="number" step="any" value={amount} onChange={(e) => setAmount(e.target.value)} required />
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
