import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Vest } from '@/types';

export function useVests() {
  return useQuery({ queryKey: ['vests'], queryFn: api.getVests });
}

export function useCreateVest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Vest, 'id' | 'createdAt' | 'sellForTax' | 'taxCashReturn' | 'release'>) =>
      api.createVest(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vests'] }),
  });
}

export function useUpdateVest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Omit<Vest, 'id' | 'createdAt' | 'sellForTax' | 'taxCashReturn' | 'release'> }) =>
      api.updateVest(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vests'] }),
  });
}

export function useDeleteVest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteVest(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vests'] }),
  });
}
