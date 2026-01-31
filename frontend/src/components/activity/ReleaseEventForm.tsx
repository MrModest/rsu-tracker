import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useGrants } from '@/hooks/use-grants';
import { api } from '@/lib/api';
import type { ReleaseEvent, GrantAllocation } from '@/types';

interface Props {
  initial?: ReleaseEvent;
  onSubmit: (data: Omit<ReleaseEvent, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

export function ReleaseEventForm({ initial, onSubmit, onCancel }: Props) {
  const { data: grants = [] } = useGrants();

  const [vestDate, setVestDate] = useState(initial?.vestDate ?? '');
  const [settlementDate, setSettlementDate] = useState(initial?.settlementDate ?? '');
  const [totalShares, setTotalShares] = useState(initial?.totalShares?.toString() ?? '');
  const [releasePrice, setReleasePrice] = useState(initial?.releasePrice?.toString() ?? '');
  const [sharesSoldForTax, setSharesSoldForTax] = useState(initial?.sharesSoldForTax?.toString() ?? '');
  const [taxSalePrice, setTaxSalePrice] = useState(initial?.taxSalePrice?.toString() ?? '');
  const [taxWithheld, setTaxWithheld] = useState(initial?.taxWithheld?.toString() ?? '');
  const [brokerFee, setBrokerFee] = useState(initial?.brokerFee?.toString() ?? '0');
  const [cashReturned, setCashReturned] = useState(initial?.cashReturned?.toString() ?? '0');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [grantAllocations, setGrantAllocations] = useState<GrantAllocation[]>(
    initial?.grantAllocations ?? []
  );

  const [netSharesReceived, setNetSharesReceived] = useState(0);
  const [sellToCoverGain, setSellToCoverGain] = useState(0);
  const [autoCalcError, setAutoCalcError] = useState('');

  useEffect(() => {
    const total = parseFloat(totalShares) || 0;
    const soldForTax = parseFloat(sharesSoldForTax) || 0;
    const net = total - soldForTax;
    setNetSharesReceived(net);
  }, [totalShares, sharesSoldForTax]);

  useEffect(() => {
    const sold = parseFloat(sharesSoldForTax) || 0;
    const relPrice = parseFloat(releasePrice) || 0;
    const taxPrice = parseFloat(taxSalePrice) || 0;
    const fee = parseFloat(brokerFee) || 0;

    // Auto-calculate tax withheld: proceeds from sell-to-cover minus broker fee
    const calculatedTaxWithheld = (sold * taxPrice) - fee;
    setTaxWithheld(calculatedTaxWithheld.toFixed(2));

    const gain = (taxPrice - relPrice) * sold - fee;
    setSellToCoverGain(gain);
  }, [sharesSoldForTax, taxSalePrice, brokerFee]);

  const handleAutoCalculate = async () => {
    const total = parseFloat(totalShares);
    if (!total || total <= 0) {
      setAutoCalcError('Please enter total shares first');
      return;
    }

    try {
      const result = await api.suggestGrantAllocations(total);
      setGrantAllocations(result.allocations);
      setAutoCalcError('');
    } catch (err: any) {
      setAutoCalcError(err.message || 'Failed to calculate allocations');
    }
  };

  const handleUpdateAllocation = (index: number, shares: string) => {
    const newAllocations = [...grantAllocations];
    const currentAlloc = newAllocations[index];
    if (currentAlloc) {
      newAllocations[index] = { grantId: currentAlloc.grantId, shares: parseFloat(shares) || 0 };
      setGrantAllocations(newAllocations);
    }
  };

  const handleRemoveAllocation = (index: number) => {
    setGrantAllocations(grantAllocations.filter((_, i) => i !== index));
  };

  const handleAddAllocation = () => {
    setGrantAllocations([...grantAllocations, { grantId: '', shares: 0 }]);
  };

  const allocatedTotal = grantAllocations.reduce((sum, a) => sum + a.shares, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const total = parseFloat(totalShares);
    const soldForTax = parseFloat(sharesSoldForTax);
    const net = total - soldForTax;

    if (Math.abs(net - netSharesReceived) > 0.01) {
      alert('Share balance mismatch');
      return;
    }

    if (soldForTax <= 0) {
      alert('Shares sold for tax must be greater than 0');
      return;
    }

    if (grantAllocations.length === 0) {
      alert('Please add at least one grant allocation');
      return;
    }

    if (Math.abs(allocatedTotal - total) > 0.01) {
      alert(`Grant allocations sum to ${allocatedTotal} but total shares is ${total}`);
      return;
    }

    onSubmit({
      grantAllocations,
      vestDate,
      settlementDate,
      totalShares: total,
      releasePrice: parseFloat(releasePrice),
      sharesSoldForTax: soldForTax,
      taxSalePrice: parseFloat(taxSalePrice),
      taxWithheld: parseFloat(taxWithheld),
      brokerFee: parseFloat(brokerFee),
      cashReturned: parseFloat(cashReturned),
      sellToCoverGain,
      netSharesReceived,
      notes,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-3 rounded-lg border p-3">
        <h3 className="text-sm font-semibold">Dates</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="vestDate">Vest Date *</Label>
            <Input
              id="vestDate"
              type="date"
              value={vestDate}
              onChange={(e) => setVestDate(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="settlementDate">Settlement Date *</Label>
            <Input
              id="settlementDate"
              type="date"
              value={settlementDate}
              onChange={(e) => setSettlementDate(e.target.value)}
              required
            />
          </div>
        </div>
      </div>

      <div className="space-y-3 rounded-lg border p-3">
        <h3 className="text-sm font-semibold">Release Details</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="totalShares">Total Shares Vested *</Label>
            <Input
              id="totalShares"
              type="number"
              step="any"
              value={totalShares}
              onChange={(e) => setTotalShares(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="releasePrice">Release Price (FMV) *</Label>
            <Input
              id="releasePrice"
              type="number"
              step="any"
              value={releasePrice}
              onChange={(e) => setReleasePrice(e.target.value)}
              required
            />
          </div>
        </div>
      </div>

      <div className="space-y-3 rounded-lg border p-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Grant Allocations *</h3>
          <Button type="button" size="sm" variant="outline" onClick={handleAutoCalculate}>
            Auto-Calculate (FIFO)
          </Button>
        </div>
        {autoCalcError && <p className="text-sm text-red-600">{autoCalcError}</p>}
        <div className="space-y-2">
          {grantAllocations.map((alloc, index) => {
            return (
              <div key={index} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <select
                  className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={alloc.grantId}
                  onChange={(e) => {
                    const newAllocations = [...grantAllocations];
                    newAllocations[index] = { ...alloc, grantId: e.target.value };
                    setGrantAllocations(newAllocations);
                  }}
                  required
                >
                  <option value="">Select grant...</option>
                  {grants.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.date})
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    step="any"
                    placeholder="Shares"
                    className="flex-1 sm:w-32"
                    value={alloc.shares || ''}
                    onChange={(e) => handleUpdateAllocation(index, e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveAllocation(index)}
                  >
                    ✕
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
        <Button type="button" size="sm" variant="outline" onClick={handleAddAllocation}>
          + Add Grant
        </Button>
        <p className="text-xs text-muted-foreground">
          Allocated: {allocatedTotal.toFixed(2)} / {parseFloat(totalShares) || 0} shares
        </p>
      </div>

      <div className="space-y-3 rounded-lg border p-3">
        <h3 className="text-sm font-semibold">Sell-to-Cover *</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="sharesSoldForTax">Shares Sold for Tax *</Label>
            <Input
              id="sharesSoldForTax"
              type="number"
              step="any"
              value={sharesSoldForTax}
              onChange={(e) => setSharesSoldForTax(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="taxSalePrice">Sale Price *</Label>
            <Input
              id="taxSalePrice"
              type="number"
              step="any"
              value={taxSalePrice}
              onChange={(e) => setTaxSalePrice(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="brokerFee">Broker Fee</Label>
            <Input
              id="brokerFee"
              type="number"
              step="any"
              value={brokerFee}
              onChange={(e) => setBrokerFee(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="taxWithheld">Tax Withheld (auto-calculated)</Label>
            <Input
              id="taxWithheld"
              type="number"
              step="any"
              value={taxWithheld}
              onChange={(e) => setTaxWithheld(e.target.value)}
              readOnly
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              = shares × price - fee
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="cashReturned">Cash Returned</Label>
          <Input
            id="cashReturned"
            type="number"
            step="any"
            value={cashReturned}
            onChange={(e) => setCashReturned(e.target.value)}
          />
        </div>

        {sellToCoverGain !== 0 && (
          <div className="rounded-lg bg-muted p-3 text-sm">
            Capital Gain/Loss: {sellToCoverGain.toFixed(2)} €
          </div>
        )}
      </div>

      <div className="space-y-3 rounded-lg border p-3">
        <h3 className="text-sm font-semibold">Net Result</h3>
        <p className="text-sm">Net Shares: {netSharesReceived.toFixed(2)}</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{initial ? 'Update' : 'Create'}</Button>
      </div>
    </form>
  );
}
