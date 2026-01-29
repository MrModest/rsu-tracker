import { Hono } from 'hono';
import { db } from '../db/index.js';
import { grants, vests, sellForTax, taxCashReturns, releases, sells, settings } from '../db/schema.js';

const app = new Hono();

// GET /api/data/export
app.get('/export', async (c) => {
  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    grants: await db.select().from(grants),
    vests: await db.select().from(vests),
    sellForTax: await db.select().from(sellForTax),
    taxCashReturns: await db.select().from(taxCashReturns),
    releases: await db.select().from(releases),
    sells: await db.select().from(sells),
    settings: await db.select().from(settings),
  };
  return c.json(data);
});

// POST /api/data/import
app.post('/import', async (c) => {
  const body = await c.req.json();

  if (!body || body.version !== 1) {
    return c.json({ error: 'Invalid export format: missing or unsupported version' }, 400);
  }

  const requiredKeys = ['grants', 'vests', 'sellForTax', 'taxCashReturns', 'releases', 'sells', 'settings'];
  for (const key of requiredKeys) {
    if (!Array.isArray(body[key])) {
      return c.json({ error: `Invalid export format: "${key}" must be an array` }, 400);
    }
  }

  try {
    db.transaction((tx) => {
      // Delete in FK-safe order (children first)
      tx.delete(sellForTax).run();
      tx.delete(taxCashReturns).run();
      tx.delete(releases).run();
      tx.delete(sells).run();
      tx.delete(vests).run();
      tx.delete(grants).run();
      tx.delete(settings).run();

      // Insert in FK-safe order (parents first)
      if (body.grants.length) tx.insert(grants).values(body.grants).run();
      if (body.vests.length) tx.insert(vests).values(body.vests).run();
      if (body.sellForTax.length) tx.insert(sellForTax).values(body.sellForTax).run();
      if (body.taxCashReturns.length) tx.insert(taxCashReturns).values(body.taxCashReturns).run();
      if (body.releases.length) tx.insert(releases).values(body.releases).run();
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
