// Entity types — duplicated from backend

export interface Grant {
  id: string;
  name: string;
  date: string;
  shareAmount: number;
  unitPrice: number;
  notes: string;
  createdAt: string;
}

export interface Vest {
  id: string;
  date: string;
  shareAmount: number;
  unitPrice: number | null;
  isCliff: boolean;
  notes: string;
  createdAt: string;
  sellForTax?: SellForTax | null;
  taxCashReturn?: TaxCashReturn | null;
  release?: Release | null;
}

export interface SellForTax {
  id: string;
  vestId: string;
  date: string;
  shareAmount: number;
  unitPrice: number;
  fee: number;
  notes: string;
  createdAt: string;
}

export interface TaxCashReturn {
  id: string;
  vestId: string;
  date: string;
  amount: number;
  notes: string;
  createdAt: string;
}

export interface Release {
  id: string;
  vestId: string;
  date: string;
  shareAmount: number;
  unitPrice: number;
  notes: string;
  createdAt: string;
}

export interface Sell {
  id: string;
  date: string;
  shareAmount: number;
  unitPrice: number;
  fee: number;
  notes: string;
  createdAt: string;
}

export interface Setting {
  key: string;
  value: string;
}

// FIFO types
export interface GrantPool {
  grantId: string;
  grantName: string;
  grantDate: string;
  totalShares: number;
  remainingShares: number;
}

export interface VestAllocation {
  vestId: string;
  vestDate: string;
  allocations: { grantId: string; grantName: string; shares: number }[];
}

export interface TaxLot {
  releaseId: string;
  releaseDate: string;
  vestId: string;
  totalShares: number;
  remainingShares: number;
  costBasis: number;
}

export interface SellAllocation {
  sellId: string;
  sellDate: string;
  totalShares: number;
  unitPrice: number;
  fee: number;
  lotAllocations: {
    releaseId: string;
    releaseDate: string;
    shares: number;
    costBasis: number;
    gain: number;
    proratedFee: number;
  }[];
  totalGain: number;
}

export interface FifoResult {
  grantPools: GrantPool[];
  vestAllocations: VestAllocation[];
  taxLots: TaxLot[];
  sellAllocations: SellAllocation[];
}

export interface PortfolioOverview {
  totalGranted: number;
  totalVested: number;
  totalSoldForTax: number;
  totalReleased: number;
  totalSold: number;
  currentlyHeld: number;
  totalFeesPaid: number;
  unrealizedValue: number;
  latestPrice: number | null;
}

export interface TaxWithholdingSummary {
  vestId: string;
  vestDate: string;
  sharesVested: number;
  vestUnitPrice: number | null;
  sharesSoldForTax: number;
  taxProceeds: number;
  sellForTaxFee: number;
  cashReturned: number;
  netTaxPaid: number;
  effectiveTaxRate: number;
}

export interface PromisedVsFactual {
  grantName: string;
  grantPrice: number;
  sharesVested: number;
  promisedValue: number;
  factualValue: number;
  difference: number;
}
