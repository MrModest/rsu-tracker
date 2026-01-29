import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { db } from '../db/index.js';
import { grants } from '../db/schema.js';

const app = new Hono();

// GET /api/grants — list all
app.get('/', async (c) => {
  const rows = await db.select().from(grants).orderBy(grants.date);
  return c.json(rows);
});

// POST /api/grants — create
app.post('/', async (c) => {
  const body = await c.req.json();
  const record = {
    id: nanoid(),
    name: body.name,
    date: body.date,
    shareAmount: body.shareAmount,
    unitPrice: body.unitPrice,
    notes: body.notes || '',
    createdAt: new Date().toISOString(),
  };
  await db.insert(grants).values(record);
  return c.json(record, 201);
});

// GET /api/grants/:id — get one
app.get('/:id', async (c) => {
  const id = c.req.param('id');
  const [row] = await db.select().from(grants).where(eq(grants.id, id));
  if (!row) return c.json({ error: 'Not found' }, 404);
  return c.json(row);
});

// PUT /api/grants/:id — update
app.put('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const result = await db
    .update(grants)
    .set({
      name: body.name,
      date: body.date,
      shareAmount: body.shareAmount,
      unitPrice: body.unitPrice,
      notes: body.notes ?? '',
    })
    .where(eq(grants.id, id));
  if (result.changes === 0) return c.json({ error: 'Not found' }, 404);
  const [row] = await db.select().from(grants).where(eq(grants.id, id));
  return c.json(row);
});

// DELETE /api/grants/:id
app.delete('/:id', async (c) => {
  const id = c.req.param('id');
  const result = await db.delete(grants).where(eq(grants.id, id));
  if (result.changes === 0) return c.json({ error: 'Not found' }, 404);
  return c.json({ success: true });
});

export default app;
