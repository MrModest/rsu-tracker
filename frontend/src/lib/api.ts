const BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  return res.json();
}

export const api = {
  // Grants
  getGrants: () => request<import('../types').Grant[]>('/grants'),
  getGrant: (id: string) => request<import('../types').Grant>(`/grants/${id}`),
  createGrant: (data: Omit<import('../types').Grant, 'id' | 'createdAt'>) =>
    request<import('../types').Grant>('/grants', { method: 'POST', body: JSON.stringify(data) }),
  updateGrant: (id: string, data: Omit<import('../types').Grant, 'id' | 'createdAt'>) =>
    request<import('../types').Grant>(`/grants/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteGrant: (id: string) => request(`/grants/${id}`, { method: 'DELETE' }),

  // Release Events
  getReleaseEvents: () => request<import('../types').ReleaseEvent[]>('/release-events'),
  getReleaseEvent: (id: string) => request<import('../types').ReleaseEvent>(`/release-events/${id}`),
  createReleaseEvent: (data: Omit<import('../types').ReleaseEvent, 'id' | 'createdAt'>) =>
    request<import('../types').ReleaseEvent>('/release-events', { method: 'POST', body: JSON.stringify(data) }),
  updateReleaseEvent: (id: string, data: Partial<Omit<import('../types').ReleaseEvent, 'id' | 'createdAt'>>) =>
    request<import('../types').ReleaseEvent>(`/release-events/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteReleaseEvent: (id: string) => request(`/release-events/${id}`, { method: 'DELETE' }),
  suggestGrantAllocations: (totalShares: number) =>
    request<{ allocations: import('../types').GrantAllocation[]; grantAvailability: any[] }>(`/release-events/suggest-allocations?totalShares=${totalShares}`),

  // Sells
  getSells: () => request<import('../types').Sell[]>('/sells'),
  createSell: (data: Omit<import('../types').Sell, 'id' | 'createdAt'>) =>
    request<import('../types').Sell>('/sells', { method: 'POST', body: JSON.stringify(data) }),
  updateSell: (id: string, data: Omit<import('../types').Sell, 'id' | 'createdAt'>) =>
    request<import('../types').Sell>(`/sells/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteSell: (id: string) => request(`/sells/${id}`, { method: 'DELETE' }),

  // Insights
  getPortfolio: () => request<import('../types').PortfolioOverview>('/insights/portfolio'),
  getLots: () => request<import('../types').TaxLot[]>('/insights/lots'),
  getCapitalGains: () => request<import('../types').SellAllocation[]>('/insights/capital-gains'),
  getTaxWithholding: () => request<import('../types').TaxWithholdingSummary[]>('/insights/tax-withholding'),
  getSellToCoverGains: () => request<import('../types').SellToCoverGainSummary[]>('/insights/sell-to-cover-gains'),
  getPromisedVsFactual: () => request<import('../types').PromisedVsFactual[]>('/insights/promised-vs-factual'),

  // Settings
  getSettings: () => request<Record<string, string>>('/settings'),
  updateSettings: (data: Record<string, string>) =>
    request<Record<string, string>>('/settings', { method: 'PUT', body: JSON.stringify(data) }),

  // Data export/import
  exportData: async () => {
    const data = await request<Record<string, unknown>>('/data/export');
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rsu-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },
  importData: (file: File): Promise<{ success: boolean }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const data = JSON.parse(reader.result as string);
          const result = await request<{ success: boolean }>('/data/import', {
            method: 'POST',
            body: JSON.stringify(data),
          });
          resolve(result);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  },
};
