import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { settings } from '../db/schema.js';

const app = new Hono();

// GET /api/settings
app.get('/', async (c) => {
  const rows = await db.select().from(settings);
  const result: Record<string, string> = {};
  for (const row of rows) {
    result[row.key] = row.value;
  }
  return c.json(result);
});

// PUT /api/settings — upsert
app.put('/', async (c) => {
  const body = await c.req.json() as Record<string, string>;
  for (const [key, value] of Object.entries(body)) {
    await db
      .insert(settings)
      .values({ key, value })
      .onConflictDoUpdate({ target: settings.key, set: { value } });
  }
  const rows = await db.select().from(settings);
  const result: Record<string, string> = {};
  for (const row of rows) {
    result[row.key] = row.value;
  }
  return c.json(result);
});

export default app;
