const express = require('express');
const cors = require('cors');
const { PORT, ENGINE_PATH } = require('./config');
const { errorHandler } = require('./middleware/errorHandler');

const healthRoutes = require('./routes/health');
const graphRoutes = require('./routes/graph');
const routeRoutes = require('./routes/route');

const app = express();

// Security and utility middleware
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[HTTP] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// API Routes
app.use('/api/health', healthRoutes);
app.use('/api/graph', graphRoutes);
app.use('/api/route', routeRoutes);

// Root route for quick verification
app.get('/', (req, res) => {
  res.json({
    service: 'RoutePilot Delivery Optimization API',
    version: '1.0.0',
    documentation: '/api/health',
    endpoints: [
      'GET  /api/health',
      'GET  /api/graph/sample',
      'POST /api/graph/analyze',
      'POST /api/route/optimize',
      'POST /api/route/compare',
    ],
  });
});

// Catch-all 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    error: `Endpoint '${req.method} ${req.originalUrl}' not found on this server.`,
  });
});

// Global error handler
app.use(errorHandler);

// Start server if not running in test mode
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log('========================================================');
    console.log(`  RoutePilot Express API Server running on port ${PORT}`);
    console.log(`  C++ Engine Executable: ${ENGINE_PATH}`);
    console.log(`  Ready to receive routing requests!`);
    console.log('========================================================');
  });
}

module.exports = app;
