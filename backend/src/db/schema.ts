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

export const vests = sqliteTable('vests', {
  id: text('id').primaryKey(),
  date: text('date').notNull(),
  shareAmount: real('share_amount').notNull(),
  unitPrice: real('unit_price').notNull(),
  isCliff: integer('is_cliff').notNull().default(0),
  notes: text('notes').notNull().default(''),
  createdAt: text('created_at').notNull(),
});

export const sellForTax = sqliteTable('sell_for_tax', {
  id: text('id').primaryKey(),
  vestId: text('vest_id').notNull().references(() => vests.id, { onDelete: 'cascade' }),
  date: text('date').notNull(),
  shareAmount: real('share_amount').notNull(),
  unitPrice: real('unit_price').notNull(),
  fee: real('fee').notNull().default(0),
  notes: text('notes').notNull().default(''),
  createdAt: text('created_at').notNull(),
});

export const taxCashReturns = sqliteTable('tax_cash_returns', {
  id: text('id').primaryKey(),
  vestId: text('vest_id').notNull().references(() => vests.id, { onDelete: 'cascade' }),
  date: text('date').notNull(),
  amount: real('amount').notNull(),
  notes: text('notes').notNull().default(''),
  createdAt: text('created_at').notNull(),
});

export const releases = sqliteTable('releases', {
  id: text('id').primaryKey(),
  vestId: text('vest_id').notNull().references(() => vests.id, { onDelete: 'cascade' }),
  date: text('date').notNull(),
  shareAmount: real('share_amount').notNull(),
  unitPrice: real('unit_price').notNull(),
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
