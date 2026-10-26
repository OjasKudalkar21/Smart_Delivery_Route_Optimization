const express = require('express');
const router = express.Router();
const { invokeEngine } = require('../engineRunner');

/**
 * GET /api/health
 * Checks health of both the Express.js API and the native C++ Route Engine.
 */
router.get('/', async (req, res) => {
  try {
    const engineResp = await invokeEngine({ action: 'health' });
    res.json({
      status: 'ok',
      server: 'RoutePilot Express API v1.0.0',
      timestamp: new Date().toISOString(),
      engine: engineResp,
    });
  } catch (err) {
    res.status(503).json({
      status: 'degraded',
      server: 'RoutePilot Express API v1.0.0',
      timestamp: new Date().toISOString(),
      engine: {
        status: 'unavailable',
        error: err.message,
      },
    });
  }
});

module.exports = router;
