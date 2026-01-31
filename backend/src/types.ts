// Entity types — duplicated in frontend

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

  // Grant allocations: which grants this release consumed from
  grantAllocations: GrantAllocation[];

  // Dates
  vestDate: string;
  settlementDate: string;

  // Release details
  totalShares: number;
  releasePrice: number;

  // Sell-to-cover details (REQUIRED)
  sharesSoldForTax: number;
  taxSalePrice: number;
  taxWithheld: number;
  brokerFee: number;
  cashReturned: number;

  // Capital gain/loss on sell-to-cover (computed)
  sellToCoverGain: number;

  // Net result
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

// API request types (omit id and createdAt)
export type CreateGrant = Omit<Grant, 'id' | 'createdAt'>;
export type CreateReleaseEvent = Omit<ReleaseEvent, 'id' | 'createdAt'>;
export type CreateSell = Omit<Sell, 'id' | 'createdAt'>;

// FIFO allocation types
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

// Insight types
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
