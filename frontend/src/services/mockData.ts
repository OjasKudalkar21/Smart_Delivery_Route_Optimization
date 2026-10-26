import type { Vertex, Edge, RouteResult, RouteComparisonResult, GraphAnalysisResult } from '../types';

/**
 * MOCK DATA REPOSITORY (Phase 5 Frontend Shell)
 *
 * NOTE: These fixtures are structured machine-readable responses directly mirroring
 * the native C++17 DSA Engine JSON protocol (`cpp-engine/bin/route_engine.exe`).
 * In Phase 6, these mocks are replaced by live API calls to Express endpoints.
 */

export const MOCK_SAMPLE_VERTICES: Vertex[] = [
  { id: 'Warehouse', name: 'Central Warehouse Depot', lat: 37.7749, lon: -122.4194 },
  { id: 'Downtown', name: 'Downtown Plaza', lat: 37.7833, lon: -122.4167 },
  { id: 'Harbor', name: 'Maritime Cargo Harbor', lat: 37.8050, lon: -122.4100 },
  { id: 'North_Station', name: 'North Train Station', lat: 37.7950, lon: -122.4050 },
  { id: 'Tech_Park', name: 'Silicon Tech Park', lat: 37.7500, lon: -122.3900 },
  { id: 'Airport', name: 'International Airport', lat: 37.7120, lon: -122.3850 },
  { id: 'Suburbs', name: 'Greenfield Suburbs', lat: 37.7300, lon: -122.4300 },
  { id: 'West_Mall', name: 'West Shopping Mall', lat: 37.7650, lon: -122.4400 },
];

export const MOCK_SAMPLE_EDGES: Edge[] = [
  { from: 'Warehouse', to: 'Downtown', distance: 3.2, road: 'Main Avenue' },
  { from: 'Downtown', to: 'North_Station', distance: 2.4, road: 'North Transit Way' },
  { from: 'Downtown', to: 'Harbor', distance: 3.8, road: 'Pier Corridor' },
  { from: 'North_Station', to: 'Harbor', distance: 1.9, road: 'Bayside Parkway' },
  { from: 'Warehouse', to: 'West_Mall', distance: 4.5, road: 'West Expressway' },
  { from: 'West_Mall', to: 'Suburbs', distance: 4.0, road: 'Valley Arterial' },
  { from: 'Warehouse', to: 'Tech_Park', distance: 5.1, road: 'Southern Boulevard' },
  { from: 'Downtown', to: 'Tech_Park', distance: 4.8, road: 'Central Connector' },
  { from: 'Tech_Park', to: 'Airport', distance: 6.2, road: 'Airport Freeway' },
  { from: 'Tech_Park', to: 'Suburbs', distance: 3.5, road: 'Industrial Link' },
  { from: 'Suburbs', to: 'Airport', distance: 5.8, road: 'Outer Ring Road' },
];

export const MOCK_OPTIMIZE_RESULT: RouteResult = {
  strategy: 'greedy',
  startLocation: 'Warehouse',
  totalDistance: 21.8,
  isComplete: true,
  route: ['Downtown', 'Harbor', 'Airport'],
  fullPath: ['Warehouse', 'Downtown', 'Harbor', 'Downtown', 'Tech_Park', 'Airport'],
  unreachableStops: [],
  legs: [
    {
      legIndex: 1,
      from: 'Warehouse',
      to: 'Downtown',
      distance: 3.2,
      path: ['Warehouse', 'Downtown'],
    },
    {
      legIndex: 2,
      from: 'Downtown',
      to: 'Harbor',
      distance: 3.8,
      path: ['Downtown', 'Harbor'],
    },
    {
      legIndex: 3,
      from: 'Harbor',
      to: 'Airport',
      distance: 14.8,
      path: ['Harbor', 'Downtown', 'Tech_Park', 'Airport'],
    },
  ],
  algorithmTrace: [
    {
      stepNumber: 1,
      currentLocation: 'Warehouse',
      selectedStop: 'Downtown',
      selectedDistance: 3.2,
      explanation: "From 'Warehouse', evaluated 3 candidate stops. Selected nearest unvisited stop 'Downtown' at 3.20 km.",
      candidates: [
        { stop: 'Downtown', distance: 3.2 },
        { stop: 'Harbor', distance: 7.0 },
        { stop: 'Airport', distance: 11.3 },
      ],
    },
    {
      stepNumber: 2,
      currentLocation: 'Downtown',
      selectedStop: 'Harbor',
      selectedDistance: 3.8,
      explanation: "From 'Downtown', evaluated 2 candidate stops. Selected nearest unvisited stop 'Harbor' at 3.80 km.",
      candidates: [
        { stop: 'Harbor', distance: 3.8 },
        { stop: 'Airport', distance: 11.0 },
      ],
    },
    {
      stepNumber: 3,
      currentLocation: 'Harbor',
      selectedStop: 'Airport',
      selectedDistance: 14.8,
      explanation: "From 'Harbor', evaluated 1 candidate stops. Selected nearest unvisited stop 'Airport' at 14.80 km.",
      candidates: [
        { stop: 'Airport', distance: 14.8 },
      ],
    },
  ],
};

export const MOCK_COMPARISON_RESULT: RouteComparisonResult = {
  start: 'Warehouse',
  distanceDifference: 9.3,
  percentageSavings: 29.9,
  greedyIsBetter: true,
  analysisSummary: "Greedy Route: 21.80 km | Baseline Route: 31.10 km. Greedy nearest-neighbor saved 9.30 km (29.90% savings). Note: The greedy heuristic makes locally optimal choices at each stop; it does not guarantee a globally optimal minimum tour for TSP.",
  greedy: MOCK_OPTIMIZE_RESULT,
  baseline: {
    strategy: 'baseline',
    startLocation: 'Warehouse',
    totalDistance: 31.1,
    isComplete: true,
    route: ['Airport', 'Downtown', 'Harbor'],
    fullPath: ['Warehouse', 'Tech_Park', 'Airport', 'Tech_Park', 'Downtown', 'Harbor'],
    unreachableStops: [],
    algorithmTrace: [],
    legs: [
      {
        legIndex: 1,
        from: 'Warehouse',
        to: 'Airport',
        distance: 11.3,
        path: ['Warehouse', 'Tech_Park', 'Airport'],
      },
      {
        legIndex: 2,
        from: 'Airport',
        to: 'Downtown',
        distance: 11.0,
        path: ['Airport', 'Tech_Park', 'Downtown'],
      },
      {
        legIndex: 3,
        from: 'Downtown',
        to: 'Harbor',
        distance: 8.8,
        path: ['Downtown', 'Harbor'],
      },
    ],
  },
};

export const MOCK_GRAPH_ANALYSIS: GraphAnalysisResult = {
  start: 'Warehouse',
  bfs: {
    startVertex: 'Warehouse',
    visitedOrder: ['Warehouse', 'Downtown', 'Tech_Park', 'West_Mall', 'Harbor', 'North_Station', 'Airport', 'Suburbs'],
    hopLevels: {
      Warehouse: 0,
      Downtown: 1,
      Tech_Park: 1,
      West_Mall: 1,
      Harbor: 2,
      North_Station: 2,
      Airport: 2,
      Suburbs: 2,
    },
    predecessors: {
      Downtown: 'Warehouse',
      Tech_Park: 'Warehouse',
      West_Mall: 'Warehouse',
      Harbor: 'Downtown',
      North_Station: 'Downtown',
      Airport: 'Tech_Park',
      Suburbs: 'West_Mall',
    },
    unreachable: [],
    steps: [
      { stepNumber: 1, currentVertex: 'Warehouse', queueState: ['Warehouse'], action: "Enqueued start vertex 'Warehouse'" },
      { stepNumber: 2, currentVertex: 'Warehouse', queueState: ['Downtown', 'Tech_Park', 'West_Mall'], action: "Popped 'Warehouse', enqueued 1-hop neighbors" },
      { stepNumber: 3, currentVertex: 'Downtown', queueState: ['Tech_Park', 'West_Mall', 'Harbor', 'North_Station'], action: "Popped 'Downtown', enqueued unvisited neighbors 'Harbor' and 'North_Station'" },
      { stepNumber: 4, currentVertex: 'Tech_Park', queueState: ['West_Mall', 'Harbor', 'North_Station', 'Airport'], action: "Popped 'Tech_Park', enqueued 'Airport'" },
      { stepNumber: 5, currentVertex: 'West_Mall', queueState: ['Harbor', 'North_Station', 'Airport', 'Suburbs'], action: "Popped 'West_Mall', enqueued 'Suburbs'" },
      { stepNumber: 6, currentVertex: 'Harbor', queueState: ['North_Station', 'Airport', 'Suburbs'], action: "Popped 'Harbor', all neighbors already visited" },
      { stepNumber: 7, currentVertex: 'North_Station', queueState: ['Airport', 'Suburbs'], action: "Popped 'North_Station', all neighbors already visited" },
      { stepNumber: 8, currentVertex: 'Airport', queueState: ['Suburbs'], action: "Popped 'Airport', all neighbors already visited" },
      { stepNumber: 9, currentVertex: 'Suburbs', queueState: [], action: "Popped 'Suburbs', queue empty. Traversal finished." },
    ],
  },
  dfs: {
    startVertex: 'Warehouse',
    visitedOrder: ['Warehouse', 'Downtown', 'Harbor', 'North_Station', 'Tech_Park', 'Airport', 'Suburbs', 'West_Mall'],
    discoveryTimes: {
      Warehouse: 1,
      Downtown: 3,
      Harbor: 5,
      North_Station: 7,
      Tech_Park: 9,
      Airport: 11,
      Suburbs: 13,
      West_Mall: 15,
    },
    finishTimes: {
      Warehouse: 2,
      Downtown: 4,
      Harbor: 6,
      North_Station: 8,
      Tech_Park: 10,
      Airport: 12,
      Suburbs: 14,
      West_Mall: 16,
    },
    hasCycle: true,
    unreachable: [],
    steps: [
      { stepNumber: 1, currentVertex: 'Warehouse', stackState: ['Warehouse'], action: "Pushed start vertex 'Warehouse' onto DFS stack" },
      { stepNumber: 2, currentVertex: 'Warehouse', stackState: ['West_Mall', 'Tech_Park', 'Downtown'], action: "Popped 'Warehouse', pushed adjacent neighbors" },
      { stepNumber: 3, currentVertex: 'Downtown', stackState: ['West_Mall', 'Tech_Park', 'Harbor'], action: "Popped 'Downtown', pushed 'Harbor'" },
      { stepNumber: 4, currentVertex: 'Harbor', stackState: ['West_Mall', 'Tech_Park', 'North_Station'], action: "Popped 'Harbor', pushed 'North_Station'" },
      { stepNumber: 5, currentVertex: 'North_Station', stackState: ['West_Mall', 'Tech_Park'], action: "Popped 'North_Station', cycle detected to 'Downtown'" },
      { stepNumber: 6, currentVertex: 'Tech_Park', stackState: ['West_Mall', 'Airport'], action: "Popped 'Tech_Park', pushed 'Airport'" },
      { stepNumber: 7, currentVertex: 'Airport', stackState: ['West_Mall', 'Suburbs'], action: "Popped 'Airport', pushed 'Suburbs'" },
      { stepNumber: 8, currentVertex: 'Suburbs', stackState: ['West_Mall'], action: "Popped 'Suburbs', edge to 'West_Mall'" },
      { stepNumber: 9, currentVertex: 'West_Mall', stackState: [], action: "Popped 'West_Mall', stack empty. Traversal complete." },
    ],
  },
};
