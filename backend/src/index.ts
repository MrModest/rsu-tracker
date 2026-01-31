import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

// Initialize DB (auto-creates tables)
import './db/index.js';

// Route modules
import grantsRoutes from './routes/grants.js';
import releaseEventsRoutes from './routes/release-events.js';
import sellsRoutes from './routes/sells.js';
import settingsRoutes from './routes/settings.js';
import insightsRoutes from './routes/insights.js';
import dataRoutes from './routes/data.js';

const app = new Hono();

app.use('*', logger());
app.use('/api/*', cors());

app.get('/api/health', (c) => c.json({ status: 'ok' }));

app.route('/api/grants', grantsRoutes);
app.route('/api/release-events', releaseEventsRoutes);
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
