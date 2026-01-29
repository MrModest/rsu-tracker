import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Release, Vest } from '@/types';

interface Props {
  initial?: Release;
  vests: Vest[];
  onSubmit: (data: Omit<Release, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

export function ReleaseForm({ initial, vests, onSubmit, onCancel }: Props) {
  const [vestId, setVestId] = useState(initial?.vestId ?? '');
  const [date, setDate] = useState(initial?.date ?? '');
  const [shareAmount, setShareAmount] = useState(initial?.shareAmount?.toString() ?? '');
  const [unitPrice, setUnitPrice] = useState(initial?.unitPrice?.toString() ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');

  const selectedVest = vests.find((v) => v.id === vestId);
  const defaultPrice = selectedVest?.sellForTax?.unitPrice;

  const handleVestChange = (newVestId: string) => {
    setVestId(newVestId);
    const vest = vests.find((v) => v.id === newVestId);
    if (vest?.sellForTax && !unitPrice) {
      setUnitPrice(vest.sellForTax.unitPrice.toString());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      vestId,
      date,
      shareAmount: parseFloat(shareAmount),
      unitPrice: parseFloat(unitPrice),
      notes,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="vestId">Linked Vest</Label>
        <select id="vestId" value={vestId} onChange={(e) => handleVestChange(e.target.value)} required className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm">
          <option value="">Select vest...</option>
          {vests.map((v) => (
            <option key={v.id} value={v.id}>{v.date} — {v.shareAmount} shares @ {v.unitPrice}</option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="date">Release Date</Label>
        <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="shareAmount">Shares Released</Label>
          <Input id="shareAmount" type="number" step="any" value={shareAmount} onChange={(e) => setShareAmount(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="unitPrice">Cost Basis Price{defaultPrice ? ` (default: ${defaultPrice})` : ''}</Label>
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
