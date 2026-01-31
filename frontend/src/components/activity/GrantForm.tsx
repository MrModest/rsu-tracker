import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Grant } from '@/types';

interface Props {
  initial?: Grant;
  onSubmit: (data: Omit<Grant, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

export function GrantForm({ initial, onSubmit, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [date, setDate] = useState(initial?.date ?? '');
  const [shareAmount, setShareAmount] = useState(initial?.shareAmount?.toString() ?? '');
  const [unitPrice, setUnitPrice] = useState(initial?.unitPrice?.toString() ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      date,
      shareAmount: parseFloat(shareAmount),
      unitPrice: parseFloat(unitPrice),
      notes,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Grant Name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. 2024 Annual" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="date">Grant Date</Label>
        <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="shareAmount">Shares</Label>
          <Input id="shareAmount" type="number" step="any" value={shareAmount} onChange={(e) => setShareAmount(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="unitPrice">Unit Price</Label>
          <Input id="unitPrice" type="number" step="any" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} required />
        </div>
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
