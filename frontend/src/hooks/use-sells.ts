import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { SellForTax, TaxCashReturn, Release, Sell } from '@/types';

// Sell-for-tax
export function useSellForTax() {
  return useQuery({ queryKey: ['sell-for-tax'], queryFn: api.getSellForTax });
}

export function useCreateSellForTax() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<SellForTax, 'id' | 'createdAt'>) => api.createSellForTax(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sell-for-tax'] });
      qc.invalidateQueries({ queryKey: ['vests'] });
    },
  });
}

export function useUpdateSellForTax() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Omit<SellForTax, 'id' | 'createdAt'> }) =>
      api.updateSellForTax(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sell-for-tax'] });
      qc.invalidateQueries({ queryKey: ['vests'] });
    },
  });
}

export function useDeleteSellForTax() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteSellForTax(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sell-for-tax'] });
      qc.invalidateQueries({ queryKey: ['vests'] });
    },
  });
}

// Tax cash returns
export function useTaxCashReturns() {
  return useQuery({ queryKey: ['tax-cash-returns'], queryFn: api.getTaxCashReturns });
}

export function useCreateTaxCashReturn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<TaxCashReturn, 'id' | 'createdAt'>) => api.createTaxCashReturn(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tax-cash-returns'] });
      qc.invalidateQueries({ queryKey: ['vests'] });
    },
  });
}

export function useUpdateTaxCashReturn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Omit<TaxCashReturn, 'id' | 'createdAt'> }) =>
      api.updateTaxCashReturn(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tax-cash-returns'] });
      qc.invalidateQueries({ queryKey: ['vests'] });
    },
  });
}

export function useDeleteTaxCashReturn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteTaxCashReturn(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tax-cash-returns'] });
      qc.invalidateQueries({ queryKey: ['vests'] });
    },
  });
}

// Releases
export function useReleases() {
  return useQuery({ queryKey: ['releases'], queryFn: api.getReleases });
}

export function useCreateRelease() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Release, 'id' | 'createdAt'>) => api.createRelease(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['releases'] });
      qc.invalidateQueries({ queryKey: ['vests'] });
      qc.invalidateQueries({ queryKey: ['insights'] });
    },
  });
}

export function useUpdateRelease() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Omit<Release, 'id' | 'createdAt'> }) =>
      api.updateRelease(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['releases'] });
      qc.invalidateQueries({ queryKey: ['vests'] });
      qc.invalidateQueries({ queryKey: ['insights'] });
    },
  });
}

export function useDeleteRelease() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteRelease(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['releases'] });
      qc.invalidateQueries({ queryKey: ['vests'] });
      qc.invalidateQueries({ queryKey: ['insights'] });
    },
  });
}

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
