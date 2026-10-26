const express = require('express');
const router = express.Router();
const { invokeEngine } = require('../engineRunner');
const { validateAnalyzeRequest } = require('../middleware/validator');

/**
 * GET /api/graph/sample
 * Retrieves the built-in sample delivery network graph with coordinates and road distances.
 */
router.get('/sample', async (req, res, next) => {
  try {
    const result = await invokeEngine({ action: 'get_sample_graph' });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/graph/analyze
 * Executes BFS and DFS traversals starting from the warehouse or specified vertex.
 * Request body: { start?: string, graph?: { vertices: [...], edges: [...] } }
 */
router.post('/analyze', validateAnalyzeRequest, async (req, res, next) => {
  try {
    const payload = {
      action: 'analyze_graph',
      start: req.body.start || 'Warehouse',
      graph: req.body.graph || { useSample: true },
    };

    const result = await invokeEngine(payload);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
