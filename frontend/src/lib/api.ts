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

  // Vests
  getVests: () => request<import('../types').Vest[]>('/vests'),
  getVest: (id: string) => request<import('../types').Vest>(`/vests/${id}`),
  createVest: (data: Omit<import('../types').Vest, 'id' | 'createdAt' | 'sellForTax' | 'taxCashReturn' | 'release'>) =>
    request<import('../types').Vest>('/vests', { method: 'POST', body: JSON.stringify(data) }),
  updateVest: (id: string, data: Omit<import('../types').Vest, 'id' | 'createdAt' | 'sellForTax' | 'taxCashReturn' | 'release'>) =>
    request<import('../types').Vest>(`/vests/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteVest: (id: string) => request(`/vests/${id}`, { method: 'DELETE' }),

  // Sell-for-tax
  getSellForTax: () => request<import('../types').SellForTax[]>('/sell-for-tax'),
  createSellForTax: (data: Omit<import('../types').SellForTax, 'id' | 'createdAt'>) =>
    request<import('../types').SellForTax>('/sell-for-tax', { method: 'POST', body: JSON.stringify(data) }),
  updateSellForTax: (id: string, data: Omit<import('../types').SellForTax, 'id' | 'createdAt'>) =>
    request<import('../types').SellForTax>(`/sell-for-tax/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteSellForTax: (id: string) => request(`/sell-for-tax/${id}`, { method: 'DELETE' }),

  // Tax cash returns
  getTaxCashReturns: () => request<import('../types').TaxCashReturn[]>('/tax-cash-returns'),
  createTaxCashReturn: (data: Omit<import('../types').TaxCashReturn, 'id' | 'createdAt'>) =>
    request<import('../types').TaxCashReturn>('/tax-cash-returns', { method: 'POST', body: JSON.stringify(data) }),
  updateTaxCashReturn: (id: string, data: Omit<import('../types').TaxCashReturn, 'id' | 'createdAt'>) =>
    request<import('../types').TaxCashReturn>(`/tax-cash-returns/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTaxCashReturn: (id: string) => request(`/tax-cash-returns/${id}`, { method: 'DELETE' }),

  // Releases
  getReleases: () => request<import('../types').Release[]>('/releases'),
  createRelease: (data: Omit<import('../types').Release, 'id' | 'createdAt'>) =>
    request<import('../types').Release>('/releases', { method: 'POST', body: JSON.stringify(data) }),
  updateRelease: (id: string, data: Omit<import('../types').Release, 'id' | 'createdAt'>) =>
    request<import('../types').Release>(`/releases/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteRelease: (id: string) => request(`/releases/${id}`, { method: 'DELETE' }),

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
  getPromisedVsFactual: () => request<import('../types').PromisedVsFactual[]>('/insights/promised-vs-factual'),

  // Settings
  getSettings: () => request<Record<string, string>>('/settings'),
  updateSettings: (data: Record<string, string>) =>
    request<Record<string, string>>('/settings', { method: 'PUT', body: JSON.stringify(data) }),
};
