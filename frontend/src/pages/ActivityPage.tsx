import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ActivityTimeline, type TimelineItem } from '@/components/activity/ActivityTimeline';
import { GrantForm } from '@/components/activity/GrantForm';
import { ReleaseEventForm } from '@/components/activity/ReleaseEventForm';
import { SellForm } from '@/components/activity/SellForm';
import { useGrants, useCreateGrant, useUpdateGrant, useDeleteGrant } from '@/hooks/use-grants';
import { useReleaseEvents, useCreateReleaseEvent, useUpdateReleaseEvent, useDeleteReleaseEvent } from '@/hooks/use-release-events';
import { useSells, useCreateSell, useUpdateSell, useDeleteSell } from '@/hooks/use-sells';
import { useSettings } from '@/hooks/use-settings';
import { Plus } from 'lucide-react';

type EventType = 'grant' | 'release_event' | 'sell';

export function ActivityPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<EventType>('grant');
  const [editingItem, setEditingItem] = useState<TimelineItem | null>(null);
  const [typePickerOpen, setTypePickerOpen] = useState(false);

  const { data: grants = [] } = useGrants();
  const { data: releaseEvents = [] } = useReleaseEvents();
  const { data: sellsList = [] } = useSells();
  const { data: settings } = useSettings();

  const currency = settings?.currency ?? 'EUR';

  const createGrant = useCreateGrant();
  const updateGrant = useUpdateGrant();
  const deleteGrant = useDeleteGrant();
  const createReleaseEvent = useCreateReleaseEvent();
  const updateReleaseEvent = useUpdateReleaseEvent();
  const deleteReleaseEvent = useDeleteReleaseEvent();
  const createSell = useCreateSell();
  const updateSell = useUpdateSell();
  const deleteSell = useDeleteSell();

  const timelineItems: TimelineItem[] = [
    ...grants.map((g) => ({ type: 'grant' as const, data: g })),
    ...releaseEvents.map((re) => ({ type: 'release_event' as const, data: re })),
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
      case 'release_event': deleteReleaseEvent.mutate(item.data.id); break;
      case 'sell': deleteSell.mutate(item.data.id); break;
    }
  };

  const close = () => { setDialogOpen(false); setEditingItem(null); };

  const typeLabels: Record<EventType, string> = {
    grant: 'Grant',
    release_event: 'Release',
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
            <Plus className="h-4 w-4 mr-2" /> Add
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
        <DialogContent className={`max-h-[90vh] overflow-y-auto ${dialogType !== 'grant' ? 'sm:max-w-2xl' : ''}`}>
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
          {dialogType === 'release_event' && (
            <ReleaseEventForm
              initial={editingItem?.type === 'release_event' ? editingItem.data : undefined}
              onSubmit={(data) => {
                if (editingItem?.type === 'release_event') {
                  updateReleaseEvent.mutate({ id: editingItem.data.id, data }, { onSuccess: close });
                } else {
                  createReleaseEvent.mutate(data, { onSuccess: close });
                }
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
