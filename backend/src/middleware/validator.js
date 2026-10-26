const { MAX_DESTINATIONS_LIMIT, MAX_VERTICES_LIMIT, MAX_EDGES_LIMIT } = require('../config');

/**
 * Validates graph analysis request parameters.
 */
function validateAnalyzeRequest(req, res, next) {
  const { start, graph } = req.body;

  if (start !== undefined && (typeof start !== 'string' || start.trim() === '')) {
    return res.status(400).json({
      status: 'error',
      action: 'analyze_graph',
      error: "The 'start' field must be a non-empty string.",
    });
  }

  if (graph) {
    const graphErr = validateGraphStructure(graph);
    if (graphErr) {
      return res.status(400).json({
        status: 'error',
        action: 'analyze_graph',
        error: graphErr,
      });
    }
  }

  next();
}

/**
 * Validates route optimization and comparison request parameters.
 */
function validateRouteRequest(action) {
  return (req, res, next) => {
    const { start, destinations, graph } = req.body;

    if (!start || typeof start !== 'string' || start.trim() === '') {
      return res.status(400).json({
        status: 'error',
        action,
        error: "The 'start' warehouse location is required and must be a non-empty string.",
      });
    }

    if (!Array.isArray(destinations)) {
      return res.status(400).json({
        status: 'error',
        action,
        error: "The 'destinations' field must be an array of location names.",
      });
    }

    if (destinations.length > MAX_DESTINATIONS_LIMIT) {
      return res.status(400).json({
        status: 'error',
        action,
        error: `Exceeded maximum allowable destinations limit of ${MAX_DESTINATIONS_LIMIT} stops.`,
      });
    }

    for (let i = 0; i < destinations.length; i++) {
      if (typeof destinations[i] !== 'string' || destinations[i].trim() === '') {
        return res.status(400).json({
          status: 'error',
          action,
          error: `Destination at index ${i} must be a valid non-empty string.`,
        });
      }
    }

    if (graph) {
      const graphErr = validateGraphStructure(graph);
      if (graphErr) {
        return res.status(400).json({
          status: 'error',
          action,
          error: graphErr,
        });
      }
    }

    next();
  };
}

/**
 * Validates custom graph vertex and edge structure and size limits.
 */
function validateGraphStructure(graph) {
  if (typeof graph !== 'object' || graph === null) {
    return 'Invalid graph payload: must be an object.';
  }

  if (graph.useSample === true) {
    return null;
  }

  if (graph.vertices !== undefined) {
    if (!Array.isArray(graph.vertices)) {
      return "Graph 'vertices' must be an array.";
    }
    if (graph.vertices.length > MAX_VERTICES_LIMIT) {
      return `Graph exceeds maximum limit of ${MAX_VERTICES_LIMIT} vertices.`;
    }
    for (let i = 0; i < graph.vertices.length; i++) {
      const v = graph.vertices[i];
      if (!v || typeof v.id !== 'string' || v.id.trim() === '') {
        return `Vertex at index ${i} missing a valid 'id' string.`;
      }
    }
  }

  if (graph.edges !== undefined) {
    if (!Array.isArray(graph.edges)) {
      return "Graph 'edges' must be an array.";
    }
    if (graph.edges.length > MAX_EDGES_LIMIT) {
      return `Graph exceeds maximum limit of ${MAX_EDGES_LIMIT} edges.`;
    }
    for (let i = 0; i < graph.edges.length; i++) {
      const e = graph.edges[i];
      if (!e || typeof e.from !== 'string' || typeof e.to !== 'string') {
        return `Edge at index ${i} must specify both 'from' and 'to' endpoint IDs.`;
      }
      if (typeof e.distance === 'number' && e.distance < 0) {
        return `Edge at index ${i} ('${e.from}' -> '${e.to}') has negative weight ${e.distance}. Negative road distances are rejected.`;
      }
    }
  }

  return null;
}

module.exports = {
  validateAnalyzeRequest,
  validateRouteRequest,
};
