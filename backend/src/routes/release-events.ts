import { Hono } from 'hono';
import { eq, asc } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { db } from '../db/index.js';
import { grants, releaseEvents } from '../db/schema.js';
import type { CreateReleaseEvent, GrantAllocation } from '../types.js';

const app = new Hono();

// Helper: Validate grant allocations and check availability
async function validateGrantAllocations(
  allocations: GrantAllocation[],
  totalShares: number,
  excludeReleaseEventId?: string
) {
  // Check that allocations sum to totalShares
  const allocatedTotal = allocations.reduce((sum, a) => sum + a.shares, 0);
  if (Math.abs(allocatedTotal - totalShares) > 0.01) {
    throw new Error(`Grant allocations sum to ${allocatedTotal} but totalShares is ${totalShares}`);
  }

  // Get all grants and existing release events to calculate availability
  const allGrants = await db.select().from(grants).orderBy(asc(grants.date));
  const allReleaseEvents = await db.select().from(releaseEvents);

  // Calculate remaining shares per grant
  const grantAvailability = new Map<string, { name: string; total: number; remaining: number }>();

  for (const grant of allGrants) {
    grantAvailability.set(grant.id, {
      name: grant.name,
      total: grant.shareAmount,
      remaining: grant.shareAmount,
    });
  }

  for (const re of allReleaseEvents) {
    // Skip the release event being updated to avoid double-counting
    if (excludeReleaseEventId && re.id === excludeReleaseEventId) {
      continue;
    }

    const reAllocations = JSON.parse(re.grantAllocations) as GrantAllocation[];
    for (const alloc of reAllocations) {
      const availability = grantAvailability.get(alloc.grantId);
      if (availability) {
        availability.remaining -= alloc.shares;
      }
    }
  }

  // Validate each allocation
  for (const alloc of allocations) {
    const availability = grantAvailability.get(alloc.grantId);
    if (!availability) {
      throw new Error(`Grant ${alloc.grantId} not found`);
    }
    if (alloc.shares > availability.remaining) {
      throw new Error(
        `Insufficient shares in grant "${availability.name}". Requested ${alloc.shares}, available ${availability.remaining}`
      );
    }
    if (alloc.shares <= 0) {
      throw new Error(`Grant allocation shares must be positive, got ${alloc.shares}`);
    }
  }

  return grantAvailability;
}

// GET /api/release-events — list all
app.get('/', async (c) => {
  const rows = await db
    .select()
    .from(releaseEvents)
    .orderBy(asc(releaseEvents.settlementDate));

  // Parse grantAllocations JSON for each row
  const parsed = rows.map((row) => ({
    ...row,
    grantAllocations: JSON.parse(row.grantAllocations),
  }));

  return c.json(parsed);
});

// POST /api/release-events — create
app.post('/', async (c) => {
  const body: CreateReleaseEvent = await c.req.json();

  // Validate
  if (body.sharesSoldForTax <= 0) {
    return c.json({ error: 'sharesSoldForTax must be > 0' }, 400);
  }

  const expectedNet = body.totalShares - body.sharesSoldForTax;
  if (Math.abs(expectedNet - body.netSharesReceived) > 0.01) {
    return c.json({ error: 'Share balance mismatch' }, 400);
  }

  if (!body.grantAllocations || body.grantAllocations.length === 0) {
    return c.json({ error: 'grantAllocations is required and must not be empty' }, 400);
  }

  // Validate grant allocations
  try {
    await validateGrantAllocations(body.grantAllocations, body.totalShares);
  } catch (err: any) {
    return c.json({ error: err.message }, 400);
  }

  // Compute sell-to-cover gain
  const sellToCoverGain =
    (body.taxSalePrice - body.releasePrice) * body.sharesSoldForTax - body.brokerFee;

  const record = {
    id: nanoid(),
    grantAllocations: JSON.stringify(body.grantAllocations),
    vestDate: body.vestDate,
    settlementDate: body.settlementDate,
    totalShares: body.totalShares,
    releasePrice: body.releasePrice,
    sharesSoldForTax: body.sharesSoldForTax,
    taxSalePrice: body.taxSalePrice,
    taxWithheld: body.taxWithheld,
    brokerFee: body.brokerFee,
    cashReturned: body.cashReturned,
    sellToCoverGain,
    netSharesReceived: body.netSharesReceived,
    notes: body.notes || '',
    createdAt: new Date().toISOString(),
  };

  await db.insert(releaseEvents).values(record);

  return c.json({ ...record, grantAllocations: body.grantAllocations }, 201);
});

// GET /api/release-events/suggest-allocations — helper endpoint for auto-calculation
app.get('/suggest-allocations', async (c) => {
  const totalSharesStr = c.req.query('totalShares');
  if (!totalSharesStr) {
    return c.json({ error: 'totalShares query parameter required' }, 400);
  }

  const totalShares = parseFloat(totalSharesStr);

  // Get all grants sorted by date (oldest first - FIFO)
  const allGrants = await db.select().from(grants).orderBy(asc(grants.date));
  const allReleaseEvents = await db.select().from(releaseEvents);

  // Calculate remaining shares per grant
  const grantAvailability = allGrants.map((g) => ({
    grantId: g.id,
    grantName: g.name,
    grantDate: g.date,
    totalShares: g.shareAmount,
    remainingShares: g.shareAmount,
  }));

  for (const re of allReleaseEvents) {
    const reAllocations = JSON.parse(re.grantAllocations) as GrantAllocation[];
    for (const alloc of reAllocations) {
      const grant = grantAvailability.find((g) => g.grantId === alloc.grantId);
      if (grant) {
        grant.remainingShares -= alloc.shares;
      }
    }
  }

  // Allocate via FIFO
  const allocations: GrantAllocation[] = [];
  let remaining = totalShares;

  for (const grant of grantAvailability) {
    if (remaining <= 0) break;
    if (grant.remainingShares <= 0) continue;

    const toAllocate = Math.min(remaining, grant.remainingShares);
    allocations.push({
      grantId: grant.grantId,
      shares: toAllocate,
    });

    remaining -= toAllocate;
  }

  if (remaining > 0) {
    return c.json({
      error: `Insufficient grant shares. Need ${remaining} more shares.`,
      allocations,
      grantAvailability,
    }, 400);
  }

  return c.json({ allocations, grantAvailability });
});

// GET /api/release-events/:id — get one
app.get('/:id', async (c) => {
  const id = c.req.param('id');
  const [row] = await db.select().from(releaseEvents).where(eq(releaseEvents.id, id));
  if (!row) return c.json({ error: 'Not found' }, 404);

  return c.json({ ...row, grantAllocations: JSON.parse(row.grantAllocations) });
});

// PUT /api/release-events/:id — update
app.put('/:id', async (c) => {
  const id = c.req.param('id');
  const body: Partial<CreateReleaseEvent> = await c.req.json();

  // If grantAllocations provided, validate them
  if (body.grantAllocations && body.totalShares) {
    try {
      await validateGrantAllocations(body.grantAllocations, body.totalShares, id);
    } catch (err: any) {
      return c.json({ error: err.message }, 400);
    }
  }

  // Recompute sell-to-cover gain if prices changed
  let sellToCoverGain;
  if (body.taxSalePrice && body.releasePrice && body.sharesSoldForTax) {
    sellToCoverGain =
      (body.taxSalePrice - body.releasePrice) * body.sharesSoldForTax - (body.brokerFee || 0);
  }

  const result = await db
    .update(releaseEvents)
    .set({
      grantAllocations: body.grantAllocations ? JSON.stringify(body.grantAllocations) : undefined,
      vestDate: body.vestDate,
      settlementDate: body.settlementDate,
      totalShares: body.totalShares,
      releasePrice: body.releasePrice,
      sharesSoldForTax: body.sharesSoldForTax,
      taxSalePrice: body.taxSalePrice,
      taxWithheld: body.taxWithheld,
      brokerFee: body.brokerFee,
      cashReturned: body.cashReturned,
      sellToCoverGain,
      netSharesReceived: body.netSharesReceived,
      notes: body.notes,
    })
    .where(eq(releaseEvents.id, id));

  if (result.changes === 0) return c.json({ error: 'Not found' }, 404);

  const [row] = await db.select().from(releaseEvents).where(eq(releaseEvents.id, id));
  return c.json({ ...row, grantAllocations: JSON.parse(row.grantAllocations) });
});

// DELETE /api/release-events/:id
app.delete('/:id', async (c) => {
  const id = c.req.param('id');

  const result = await db.delete(releaseEvents).where(eq(releaseEvents.id, id));
  if (result.changes === 0) return c.json({ error: 'Not found' }, 404);

  return c.json({ success: true });
});

export default app;
