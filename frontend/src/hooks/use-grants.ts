import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Grant } from '@/types';

export function useGrants() {
  return useQuery({ queryKey: ['grants'], queryFn: api.getGrants });
}

export function useCreateGrant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Grant, 'id' | 'createdAt'>) => api.createGrant(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['grants'] }),
  });
}

export function useUpdateGrant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Omit<Grant, 'id' | 'createdAt'> }) =>
      api.updateGrant(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['grants'] }),
  });
}

export function useDeleteGrant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteGrant(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['grants'] }),
  });
}
