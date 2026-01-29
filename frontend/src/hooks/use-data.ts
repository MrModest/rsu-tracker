import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useExportData() {
  return useMutation({ mutationFn: () => api.exportData() });
}

export function useImportData() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => api.importData(file),
    onSuccess: () => qc.invalidateQueries(),
  });
}
