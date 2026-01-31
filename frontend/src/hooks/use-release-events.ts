import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { ReleaseEvent } from '@/types';

export function useReleaseEvents() {
  return useQuery({
    queryKey: ['release-events'],
    queryFn: api.getReleaseEvents,
  });
}

export function useCreateReleaseEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<ReleaseEvent, 'id' | 'createdAt' | 'grant'>) =>
      api.createReleaseEvent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['release-events'] });
      queryClient.invalidateQueries({ queryKey: ['insights'] });
    },
  });
}

export function useUpdateReleaseEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<ReleaseEvent, 'id' | 'createdAt' | 'grant'>> }) =>
      api.updateReleaseEvent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['release-events'] });
      queryClient.invalidateQueries({ queryKey: ['insights'] });
    },
  });
}

export function useDeleteReleaseEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.deleteReleaseEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['release-events'] });
      queryClient.invalidateQueries({ queryKey: ['insights'] });
    },
  });
}
