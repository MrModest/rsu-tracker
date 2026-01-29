import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { db } from '../db/index.js';
import { taxCashReturns } from '../db/schema.js';

const app = new Hono();

// GET /api/tax-cash-returns
app.get('/', async (c) => {
  const rows = await db.select().from(taxCashReturns).orderBy(taxCashReturns.date);
  return c.json(rows);
});

// POST /api/tax-cash-returns
app.post('/', async (c) => {
  const body = await c.req.json();
  const record = {
    id: nanoid(),
    vestId: body.vestId,
    date: body.date,
    amount: body.amount,
    notes: body.notes || '',
    createdAt: new Date().toISOString(),
  };
  await db.insert(taxCashReturns).values(record);
  return c.json(record, 201);
});

// PUT /api/tax-cash-returns/:id
app.put('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const result = await db
    .update(taxCashReturns)
    .set({
      vestId: body.vestId,
      date: body.date,
      amount: body.amount,
      notes: body.notes ?? '',
    })
    .where(eq(taxCashReturns.id, id));
  if (result.changes === 0) return c.json({ error: 'Not found' }, 404);
  const [row] = await db.select().from(taxCashReturns).where(eq(taxCashReturns.id, id));
  return c.json(row);
});

// DELETE /api/tax-cash-returns/:id
app.delete('/:id', async (c) => {
  const id = c.req.param('id');
  const result = await db.delete(taxCashReturns).where(eq(taxCashReturns.id, id));
  if (result.changes === 0) return c.json({ error: 'Not found' }, 404);
  return c.json({ success: true });
});

export default app;
