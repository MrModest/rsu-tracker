import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Sell } from '@/types';

// Sells
export function useSells() {
  return useQuery({ queryKey: ['sells'], queryFn: api.getSells });
}

export function useCreateSell() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Sell, 'id' | 'createdAt'>) => api.createSell(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sells'] });
      qc.invalidateQueries({ queryKey: ['insights'] });
    },
  });
}

export function useUpdateSell() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Omit<Sell, 'id' | 'createdAt'> }) =>
      api.updateSell(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sells'] });
      qc.invalidateQueries({ queryKey: ['insights'] });
    },
  });
}

export function useDeleteSell() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteSell(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sells'] });
      qc.invalidateQueries({ queryKey: ['insights'] });
    },
  });
}
