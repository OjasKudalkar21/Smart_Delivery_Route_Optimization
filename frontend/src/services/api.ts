import type {
  Vertex,
  Edge,
  RouteResult,
  RouteComparisonResult,
  GraphAnalysisResult,
} from '../types';

const API_BASE_URL = '/api';

export interface SampleGraphResponse {
  status: string;
  action: string;
  warehouse: string;
  vertices: Vertex[];
  edges: Edge[];
}

export interface HealthResponse {
  status: string;
  server: string;
  engine?: {
    status: string;
    engine: string;
    version: string;
  };
}

/**
 * Checks connectivity with the Express API and C++ engine.
 */
export async function checkBackendHealth(): Promise<{ isOnline: boolean; details?: HealthResponse }> {
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    if (!res.ok) return { isOnline: false };
    const data: HealthResponse = await res.json();
    return {
      isOnline: data.status === 'ok' && data.engine?.status === 'ok',
      details: data,
    };
  } catch {
    return { isOnline: false };
  }
}

/**
 * Fetches the official sample delivery network graph from the C++ engine.
 */
export async function fetchSampleGraph(): Promise<SampleGraphResponse> {
  const res = await fetch(`${API_BASE_URL}/graph/sample`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to fetch sample graph (HTTP ${res.status})`);
  }
  return res.json();
}

/**
 * Triggers BFS and DFS graph traversals on the C++ engine.
 */
export async function analyzeGraph(start: string = 'Warehouse'): Promise<GraphAnalysisResult> {
  const res = await fetch(`${API_BASE_URL}/graph/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ start }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Graph analysis failed (HTTP ${res.status})`);
  }
  return res.json();
}

/**
 * Executes Dijkstra-based Greedy route optimization on the C++ engine.
 */
export async function optimizeRoute(
  start: string,
  destinations: string[]
): Promise<RouteResult> {
  const res = await fetch(`${API_BASE_URL}/route/optimize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ start, destinations }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Route optimization failed (HTTP ${res.status})`);
  }
  return res.json();
}

/**
 * Executes Greedy vs Baseline comparison on the C++ engine.
 */
export async function compareRoutes(
  start: string,
  destinations: string[]
): Promise<RouteComparisonResult> {
  const res = await fetch(`${API_BASE_URL}/route/compare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ start, destinations }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Route comparison failed (HTTP ${res.status})`);
  }
  return res.json();
}
