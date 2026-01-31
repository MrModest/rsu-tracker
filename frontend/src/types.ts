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

export interface GrantAllocation {
  grantId: string;
  shares: number;
}

export interface ReleaseEvent {
  id: string;
  grantAllocations: GrantAllocation[];
  vestDate: string;
  settlementDate: string;
  totalShares: number;
  releasePrice: number;
  sharesSoldForTax: number;
  taxSalePrice: number;
  taxWithheld: number;
  brokerFee: number;
  cashReturned: number;
  sellToCoverGain: number;
  netSharesReceived: number;
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

export interface TaxLot {
  releaseEventId: string;
  grantAllocations: GrantAllocation[];
  settlementDate: string;
  vestDate: string;
  totalShares: number;
  remainingShares: number;
  costBasis: number;
  sellToCoverGain: number;
}

export interface SellAllocation {
  sellId: string;
  sellDate: string;
  totalShares: number;
  unitPrice: number;
  fee: number;
  lotAllocations: {
    releaseEventId: string;
    settlementDate: string;
    shares: number;
    costBasis: number;
    gain: number;
    proratedFee: number;
  }[];
  totalGain: number;
}

export interface FifoResult {
  grantPools: GrantPool[];
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
  releaseEventId: string;
  settlementDate: string;
  vestDate: string;
  totalShares: number;
  releasePrice: number;
  sharesSoldForTax: number;
  taxSalePrice: number;
  taxWithheld: number;
  brokerFee: number;
  cashReturned: number;
  sellToCoverGain: number;
  effectiveTaxRate: number;
}

export interface SellToCoverGainSummary {
  releaseEventId: string;
  settlementDate: string;
  sharesSold: number;
  costBasis: number;
  salePrice: number;
  gain: number;
}

export interface PromisedVsFactual {
  grantName: string;
  grantPrice: number;
  sharesVested: number;
  promisedValue: number;
  factualValue: number;
  difference: number;
}
