import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function usePortfolio() {
  return useQuery({ queryKey: ['insights', 'portfolio'], queryFn: api.getPortfolio });
}

export function useLots() {
  return useQuery({ queryKey: ['insights', 'lots'], queryFn: api.getLots });
}

export function useCapitalGains() {
  return useQuery({ queryKey: ['insights', 'capital-gains'], queryFn: api.getCapitalGains });
}

export function useTaxWithholding() {
  return useQuery({ queryKey: ['insights', 'tax-withholding'], queryFn: api.getTaxWithholding });
}

export function usePromisedVsFactual() {
  return useQuery({ queryKey: ['insights', 'promised-vs-factual'], queryFn: api.getPromisedVsFactual });
}
