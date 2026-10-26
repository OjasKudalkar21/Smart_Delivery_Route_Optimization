const express = require('express');
const router = express.Router();
const { invokeEngine } = require('../engineRunner');
const { validateRouteRequest } = require('../middleware/validator');

/**
 * POST /api/route/optimize
 * Runs Dijkstra's shortest-path algorithm and the Greedy nearest-unvisited-stop heuristic.
 * 
 * Request:
 * {
 *   "start": "Warehouse",
 *   "destinations": ["Downtown", "Harbor", "Airport"],
 *   "graph": { ... } // optional
 * }
 */
router.post('/optimize', validateRouteRequest('optimize_route'), async (req, res, next) => {
  try {
    const payload = {
      action: 'optimize_route',
      start: req.body.start,
      destinations: req.body.destinations,
      graph: req.body.graph || { useSample: true },
    };

    const result = await invokeEngine(payload);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/route/compare
 * Evaluates both the Greedy heuristic and the input-order Baseline route side-by-side.
 * 
 * Request:
 * {
 *   "start": "Warehouse",
 *   "destinations": ["Downtown", "Harbor", "Airport"],
 *   "graph": { ... } // optional
 * }
 */
router.post('/compare', validateRouteRequest('compare_routes'), async (req, res, next) => {
  try {
    const payload = {
      action: 'compare_routes',
      start: req.body.start,
      destinations: req.body.destinations,
      graph: req.body.graph || { useSample: true },
    };

    const result = await invokeEngine(payload);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
