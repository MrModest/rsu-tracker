import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { db } from '../db/index.js';
import { sellForTax } from '../db/schema.js';

const app = new Hono();

// GET /api/sell-for-tax
app.get('/', async (c) => {
  const rows = await db.select().from(sellForTax).orderBy(sellForTax.date);
  return c.json(rows);
});

// POST /api/sell-for-tax
app.post('/', async (c) => {
  const body = await c.req.json();
  const record = {
    id: nanoid(),
    vestId: body.vestId,
    date: body.date,
    shareAmount: body.shareAmount,
    unitPrice: body.unitPrice,
    fee: body.fee ?? 0,
    notes: body.notes || '',
    createdAt: new Date().toISOString(),
  };
  await db.insert(sellForTax).values(record);
  return c.json(record, 201);
});

// PUT /api/sell-for-tax/:id
app.put('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const result = await db
    .update(sellForTax)
    .set({
      vestId: body.vestId,
      date: body.date,
      shareAmount: body.shareAmount,
      unitPrice: body.unitPrice,
      fee: body.fee ?? 0,
      notes: body.notes ?? '',
    })
    .where(eq(sellForTax.id, id));
  if (result.changes === 0) return c.json({ error: 'Not found' }, 404);
  const [row] = await db.select().from(sellForTax).where(eq(sellForTax.id, id));
  return c.json(row);
});

// DELETE /api/sell-for-tax/:id
app.delete('/:id', async (c) => {
  const id = c.req.param('id');
  const result = await db.delete(sellForTax).where(eq(sellForTax.id, id));
  if (result.changes === 0) return c.json({ error: 'Not found' }, 404);
  return c.json({ success: true });
});

export default app;
