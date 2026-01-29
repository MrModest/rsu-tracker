import { Hono } from 'hono';
import { computeFifo } from '../services/fifo.js';
import { getPortfolioOverview, getTaxWithholdingSummaries, getPromisedVsFactual } from '../services/insights.js';

const app = new Hono();

// GET /api/insights/portfolio
app.get('/portfolio', async (c) => {
  const overview = await getPortfolioOverview();
  return c.json(overview);
});

// GET /api/insights/lots
app.get('/lots', async (c) => {
  const fifo = await computeFifo();
  return c.json(fifo.taxLots);
});

// GET /api/insights/capital-gains
app.get('/capital-gains', async (c) => {
  const fifo = await computeFifo();
  return c.json(fifo.sellAllocations);
});

// GET /api/insights/tax-withholding
app.get('/tax-withholding', async (c) => {
  const summaries = await getTaxWithholdingSummaries();
  return c.json(summaries);
});

// GET /api/insights/promised-vs-factual
app.get('/promised-vs-factual', async (c) => {
  const result = await getPromisedVsFactual();
  return c.json(result);
});

export default app;
