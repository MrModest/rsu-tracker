import { sqliteTable, text, real, integer } from 'drizzle-orm/sqlite-core';

export const grants = sqliteTable('grants', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  date: text('date').notNull(),
  shareAmount: real('share_amount').notNull(),
  unitPrice: real('unit_price').notNull(),
  notes: text('notes').notNull().default(''),
  createdAt: text('created_at').notNull(),
});

export const releaseEvents = sqliteTable('release_events', {
  id: text('id').primaryKey(),

  // Grant allocations: JSON array of { grantId: string, shares: number }
  grantAllocations: text('grant_allocations').notNull(),

  // Dates
  vestDate: text('vest_date').notNull(),
  settlementDate: text('settlement_date').notNull(),

  // Release details
  totalShares: real('total_shares').notNull(),
  releasePrice: real('release_price').notNull(),

  // Sell-to-cover details (REQUIRED)
  sharesSoldForTax: real('shares_sold_for_tax').notNull(),
  taxSalePrice: real('tax_sale_price').notNull(),
  taxWithheld: real('tax_withheld').notNull(),
  brokerFee: real('broker_fee').notNull().default(0),
  cashReturned: real('cash_returned').notNull().default(0),

  // Capital gain/loss on sell-to-cover (computed)
  sellToCoverGain: real('sell_to_cover_gain').notNull(),

  // Net result
  netSharesReceived: real('net_shares_received').notNull(),

  notes: text('notes').notNull().default(''),
  createdAt: text('created_at').notNull(),
});

export const sells = sqliteTable('sells', {
  id: text('id').primaryKey(),
  date: text('date').notNull(),
  shareAmount: real('share_amount').notNull(),
  unitPrice: real('unit_price').notNull(),
  fee: real('fee').notNull().default(0),
  notes: text('notes').notNull().default(''),
  createdAt: text('created_at').notNull(),
});

export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});
