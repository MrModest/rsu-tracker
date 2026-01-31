import { Hono } from 'hono';
import { db } from '../db/index.js';
import { grants, releaseEvents, sells, settings } from '../db/schema.js';

const app = new Hono();

// GET /api/data/export
app.get('/export', async (c) => {
  const data = {
    version: 2,
    exportedAt: new Date().toISOString(),
    grants: await db.select().from(grants),
    releaseEvents: await db.select().from(releaseEvents),
    sells: await db.select().from(sells),
    settings: await db.select().from(settings),
  };
  return c.json(data);
});

// POST /api/data/import
app.post('/import', async (c) => {
  const body = await c.req.json();

  if (!body || body.version !== 2) {
    return c.json({ error: 'Invalid export format: missing or unsupported version (expected version 2)' }, 400);
  }

  const requiredKeys = ['grants', 'releaseEvents', 'sells', 'settings'];
  for (const key of requiredKeys) {
    if (!Array.isArray(body[key])) {
      return c.json({ error: `Invalid export format: "${key}" must be an array` }, 400);
    }
  }

  try {
    db.transaction((tx) => {
      // Delete in FK-safe order (children first)
      tx.delete(sells).run();
      tx.delete(releaseEvents).run();
      tx.delete(grants).run();
      tx.delete(settings).run();

      // Insert in FK-safe order (parents first)
      if (body.grants.length) tx.insert(grants).values(body.grants).run();
      if (body.releaseEvents.length) tx.insert(releaseEvents).values(body.releaseEvents).run();
      if (body.sells.length) tx.insert(sells).values(body.sells).run();
      if (body.settings.length) tx.insert(settings).values(body.settings).run();
    });

    return c.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ error: `Import failed: ${message}` }, 500);
  }
});

export default app;
