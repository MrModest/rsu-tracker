import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ActivityTimeline, type TimelineItem } from '@/components/activity/ActivityTimeline';
import { GrantForm } from '@/components/activity/GrantForm';
import { VestForm } from '@/components/activity/VestForm';
import { SellForTaxForm } from '@/components/activity/SellForTaxForm';
import { TaxCashReturnForm } from '@/components/activity/TaxCashReturnForm';
import { ReleaseForm } from '@/components/activity/ReleaseForm';
import { SellForm } from '@/components/activity/SellForm';
import { useGrants, useCreateGrant, useUpdateGrant, useDeleteGrant } from '@/hooks/use-grants';
import { useVests, useCreateVest, useUpdateVest, useDeleteVest } from '@/hooks/use-vests';
import {
  useSellForTax, useCreateSellForTax, useUpdateSellForTax, useDeleteSellForTax,
  useTaxCashReturns, useCreateTaxCashReturn, useUpdateTaxCashReturn, useDeleteTaxCashReturn,
  useReleases, useCreateRelease, useUpdateRelease, useDeleteRelease,
  useSells, useCreateSell, useUpdateSell, useDeleteSell,
} from '@/hooks/use-sells';
import { useSettings } from '@/hooks/use-settings';
import { Plus } from 'lucide-react';

type EventType = 'grant' | 'vest' | 'sell_for_tax' | 'tax_cash_return' | 'release' | 'sell';

export function ActivityPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<EventType>('grant');
  const [editingItem, setEditingItem] = useState<TimelineItem | null>(null);
  const [typePickerOpen, setTypePickerOpen] = useState(false);

  const { data: grants = [] } = useGrants();
  const { data: vests = [] } = useVests();
  const { data: sellForTaxList = [] } = useSellForTax();
  const { data: taxCashReturnsList = [] } = useTaxCashReturns();
  const { data: releasesList = [] } = useReleases();
  const { data: sellsList = [] } = useSells();
  const { data: settings } = useSettings();

  const currency = settings?.currency ?? 'EUR';

  const createGrant = useCreateGrant();
  const updateGrant = useUpdateGrant();
  const deleteGrant = useDeleteGrant();
  const createVest = useCreateVest();
  const updateVest = useUpdateVest();
  const deleteVest = useDeleteVest();
  const createSellForTax = useCreateSellForTax();
  const updateSellForTax = useUpdateSellForTax();
  const deleteSellForTax = useDeleteSellForTax();
  const createTaxCashReturn = useCreateTaxCashReturn();
  const updateTaxCashReturn = useUpdateTaxCashReturn();
  const deleteTaxCashReturn = useDeleteTaxCashReturn();
  const createRelease = useCreateRelease();
  const updateRelease = useUpdateRelease();
  const deleteRelease = useDeleteRelease();
  const createSell = useCreateSell();
  const updateSell = useUpdateSell();
  const deleteSell = useDeleteSell();

  const timelineItems: TimelineItem[] = [
    ...grants.map((g) => ({ type: 'grant' as const, data: g })),
    ...vests.map((v) => ({ type: 'vest' as const, data: v })),
    ...sellForTaxList.map((s) => ({ type: 'sell_for_tax' as const, data: s })),
    ...taxCashReturnsList.map((t) => ({ type: 'tax_cash_return' as const, data: t })),
    ...releasesList.map((r) => ({ type: 'release' as const, data: r })),
    ...sellsList.map((s) => ({ type: 'sell' as const, data: s })),
  ];

  const openAdd = (type: EventType) => {
    setDialogType(type);
    setEditingItem(null);
    setTypePickerOpen(false);
    setDialogOpen(true);
  };

  const openEdit = (item: TimelineItem) => {
    setDialogType(item.type);
    setEditingItem(item);
    setDialogOpen(true);
  };

  const handleDelete = (item: TimelineItem) => {
    if (!confirm('Delete this event?')) return;
    switch (item.type) {
      case 'grant': deleteGrant.mutate(item.data.id); break;
      case 'vest': deleteVest.mutate(item.data.id); break;
      case 'sell_for_tax': deleteSellForTax.mutate(item.data.id); break;
      case 'tax_cash_return': deleteTaxCashReturn.mutate(item.data.id); break;
      case 'release': deleteRelease.mutate(item.data.id); break;
      case 'sell': deleteSell.mutate(item.data.id); break;
    }
  };

  const close = () => { setDialogOpen(false); setEditingItem(null); };

  const typeLabels: Record<EventType, string> = {
    grant: 'Grant',
    vest: 'Vest',
    sell_for_tax: 'Sell for Tax',
    tax_cash_return: 'Tax Cash Return',
    release: 'Release',
    sell: 'Sell',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Activity</h1>
          <p className="text-muted-foreground mt-1">All events timeline</p>
        </div>
        <div className="relative">
          <Button onClick={() => setTypePickerOpen(!typePickerOpen)}>
            <Plus className="h-4 w-4 mr-2" /> Add Event
          </Button>
          {typePickerOpen && (
            <div className="absolute right-0 top-full mt-1 z-10 w-48 rounded-md border bg-popover p-1 shadow-md">
              {(Object.keys(typeLabels) as EventType[]).map((type) => (
                <button key={type} onClick={() => openAdd(type)} className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm hover:bg-accent">
                  {typeLabels[type]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <ActivityTimeline items={timelineItems} currency={currency} onEdit={openEdit} onDelete={handleDelete} />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit' : 'Add'} {typeLabels[dialogType]}</DialogTitle>
          </DialogHeader>
          {dialogType === 'grant' && (
            <GrantForm
              initial={editingItem?.type === 'grant' ? editingItem.data : undefined}
              onSubmit={(data) => {
                if (editingItem?.type === 'grant') updateGrant.mutate({ id: editingItem.data.id, data }, { onSuccess: close });
                else createGrant.mutate(data, { onSuccess: close });
              }}
              onCancel={close}
            />
          )}
          {dialogType === 'vest' && (
            <VestForm
              initial={editingItem?.type === 'vest' ? editingItem.data : undefined}
              onSubmit={(data) => {
                if (editingItem?.type === 'vest') updateVest.mutate({ id: editingItem.data.id, data }, { onSuccess: close });
                else createVest.mutate(data, { onSuccess: close });
              }}
              onCancel={close}
            />
          )}
          {dialogType === 'sell_for_tax' && (
            <SellForTaxForm
              initial={editingItem?.type === 'sell_for_tax' ? editingItem.data : undefined}
              vests={vests}
              onSubmit={(data) => {
                if (editingItem?.type === 'sell_for_tax') updateSellForTax.mutate({ id: editingItem.data.id, data }, { onSuccess: close });
                else createSellForTax.mutate(data, { onSuccess: close });
              }}
              onCancel={close}
            />
          )}
          {dialogType === 'tax_cash_return' && (
            <TaxCashReturnForm
              initial={editingItem?.type === 'tax_cash_return' ? editingItem.data : undefined}
              vests={vests}
              onSubmit={(data) => {
                if (editingItem?.type === 'tax_cash_return') updateTaxCashReturn.mutate({ id: editingItem.data.id, data }, { onSuccess: close });
                else createTaxCashReturn.mutate(data, { onSuccess: close });
              }}
              onCancel={close}
            />
          )}
          {dialogType === 'release' && (
            <ReleaseForm
              initial={editingItem?.type === 'release' ? editingItem.data : undefined}
              vests={vests}
              onSubmit={(data) => {
                if (editingItem?.type === 'release') updateRelease.mutate({ id: editingItem.data.id, data }, { onSuccess: close });
                else createRelease.mutate(data, { onSuccess: close });
              }}
              onCancel={close}
            />
          )}
          {dialogType === 'sell' && (
            <SellForm
              initial={editingItem?.type === 'sell' ? editingItem.data : undefined}
              onSubmit={(data) => {
                if (editingItem?.type === 'sell') updateSell.mutate({ id: editingItem.data.id, data }, { onSuccess: close });
                else createSell.mutate(data, { onSuccess: close });
              }}
              onCancel={close}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
