import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { db } from '../db/index.js';
import { vests, sellForTax, taxCashReturns, releases } from '../db/schema.js';

const app = new Hono();

async function getVestWithLinked(vestId: string) {
  const [vest] = await db.select().from(vests).where(eq(vests.id, vestId));
  if (!vest) return null;

  const [sft] = await db.select().from(sellForTax).where(eq(sellForTax.vestId, vestId));
  const [tcr] = await db.select().from(taxCashReturns).where(eq(taxCashReturns.vestId, vestId));
  const [rel] = await db.select().from(releases).where(eq(releases.vestId, vestId));

  return {
    ...vest,
    isCliff: Boolean(vest.isCliff),
    sellForTax: sft || null,
    taxCashReturn: tcr || null,
    release: rel || null,
  };
}

// GET /api/vests — list all with linked records
app.get('/', async (c) => {
  const rows = await db.select().from(vests).orderBy(vests.date);
  const result = await Promise.all(rows.map((v) => getVestWithLinked(v.id)));
  return c.json(result);
});

// POST /api/vests — create
app.post('/', async (c) => {
  const body = await c.req.json();
  const record = {
    id: nanoid(),
    date: body.date,
    shareAmount: body.shareAmount,
    unitPrice: body.unitPrice ?? null,
    isCliff: body.isCliff ? 1 : 0,
    notes: body.notes || '',
    createdAt: new Date().toISOString(),
  };
  await db.insert(vests).values(record);
  const result = await getVestWithLinked(record.id);
  return c.json(result, 201);
});

// GET /api/vests/:id — get one with linked records
app.get('/:id', async (c) => {
  const id = c.req.param('id');
  const result = await getVestWithLinked(id);
  if (!result) return c.json({ error: 'Not found' }, 404);
  return c.json(result);
});

// PUT /api/vests/:id — update
app.put('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const updateResult = await db
    .update(vests)
    .set({
      date: body.date,
      shareAmount: body.shareAmount,
      unitPrice: body.unitPrice ?? null,
      isCliff: body.isCliff ? 1 : 0,
      notes: body.notes ?? '',
    })
    .where(eq(vests.id, id));
  if (updateResult.changes === 0) return c.json({ error: 'Not found' }, 404);
  const result = await getVestWithLinked(id);
  return c.json(result);
});

// DELETE /api/vests/:id — cascade deletes linked records via FK
app.delete('/:id', async (c) => {
  const id = c.req.param('id');
  const result = await db.delete(vests).where(eq(vests.id, id));
  if (result.changes === 0) return c.json({ error: 'Not found' }, 404);
  return c.json({ success: true });
});

export default app;
