import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { db } from '../db/index.js';
import { releases } from '../db/schema.js';

const app = new Hono();

// GET /api/releases
app.get('/', async (c) => {
  const rows = await db.select().from(releases).orderBy(releases.date);
  return c.json(rows);
});

// POST /api/releases
app.post('/', async (c) => {
  const body = await c.req.json();
  const record = {
    id: nanoid(),
    vestId: body.vestId,
    date: body.date,
    shareAmount: body.shareAmount,
    unitPrice: body.unitPrice,
    notes: body.notes || '',
    createdAt: new Date().toISOString(),
  };
  await db.insert(releases).values(record);
  return c.json(record, 201);
});

// PUT /api/releases/:id
app.put('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const result = await db
    .update(releases)
    .set({
      vestId: body.vestId,
      date: body.date,
      shareAmount: body.shareAmount,
      unitPrice: body.unitPrice,
      notes: body.notes ?? '',
    })
    .where(eq(releases.id, id));
  if (result.changes === 0) return c.json({ error: 'Not found' }, 404);
  const [row] = await db.select().from(releases).where(eq(releases.id, id));
  return c.json(row);
});

// DELETE /api/releases/:id
app.delete('/:id', async (c) => {
  const id = c.req.param('id');
  const result = await db.delete(releases).where(eq(releases.id, id));
  if (result.changes === 0) return c.json({ error: 'Not found' }, 404);
  return c.json({ success: true });
});

export default app;
