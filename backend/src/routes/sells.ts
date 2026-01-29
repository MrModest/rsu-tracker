import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { db } from '../db/index.js';
import { sells } from '../db/schema.js';

const app = new Hono();

// GET /api/sells
app.get('/', async (c) => {
  const rows = await db.select().from(sells).orderBy(sells.date);
  return c.json(rows);
});

// POST /api/sells
app.post('/', async (c) => {
  const body = await c.req.json();
  const record = {
    id: nanoid(),
    date: body.date,
    shareAmount: body.shareAmount,
    unitPrice: body.unitPrice,
    fee: body.fee ?? 0,
    notes: body.notes || '',
    createdAt: new Date().toISOString(),
  };
  await db.insert(sells).values(record);
  return c.json(record, 201);
});

// PUT /api/sells/:id
app.put('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const result = await db
    .update(sells)
    .set({
      date: body.date,
      shareAmount: body.shareAmount,
      unitPrice: body.unitPrice,
      fee: body.fee ?? 0,
      notes: body.notes ?? '',
    })
    .where(eq(sells.id, id));
  if (result.changes === 0) return c.json({ error: 'Not found' }, 404);
  const [row] = await db.select().from(sells).where(eq(sells.id, id));
  return c.json(row);
});

// DELETE /api/sells/:id
app.delete('/:id', async (c) => {
  const id = c.req.param('id');
  const result = await db.delete(sells).where(eq(sells.id, id));
  if (result.changes === 0) return c.json({ error: 'Not found' }, 404);
  return c.json({ success: true });
});

export default app;
