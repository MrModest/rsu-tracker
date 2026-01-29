import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

// Initialize DB (auto-creates tables)
import './db/index.js';

// Route modules
import grantsRoutes from './routes/grants.js';
import vestsRoutes from './routes/vests.js';
import sellForTaxRoutes from './routes/sell-for-tax.js';
import taxCashReturnsRoutes from './routes/tax-cash-returns.js';
import releasesRoutes from './routes/releases.js';
import sellsRoutes from './routes/sells.js';
import settingsRoutes from './routes/settings.js';
import insightsRoutes from './routes/insights.js';
import dataRoutes from './routes/data.js';

const app = new Hono();

app.use('*', logger());
app.use('/api/*', cors());

app.get('/api/health', (c) => c.json({ status: 'ok' }));

app.route('/api/grants', grantsRoutes);
app.route('/api/vests', vestsRoutes);
app.route('/api/sell-for-tax', sellForTaxRoutes);
app.route('/api/tax-cash-returns', taxCashReturnsRoutes);
app.route('/api/releases', releasesRoutes);
app.route('/api/sells', sellsRoutes);
app.route('/api/settings', settingsRoutes);
app.route('/api/insights', insightsRoutes);
app.route('/api/data', dataRoutes);

const port = parseInt(process.env.PORT || '3001', 10);

console.log(`Backend listening on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});

export default app;
