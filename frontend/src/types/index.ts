export interface Vertex {
  id: string;
  name: string;
  lat: number;
  lon: number;
}

export interface Edge {
  from: string;
  to: string;
  distance: number;
  road?: string;
  directed?: boolean;
}

export interface RouteLeg {
  legIndex: number;
  from: string;
  to: string;
  distance: number;
  path: string[];
}

export interface CandidateDistance {
  stop: string;
  distance: number;
}

export interface AlgorithmTraceStep {
  stepNumber: number;
  currentLocation: string;
  selectedStop: string;
  selectedDistance: number;
  explanation: string;
  candidates: CandidateDistance[];
}

export interface RouteResult {
  strategy: 'greedy' | 'baseline';
  startLocation: string;
  totalDistance: number;
  isComplete: boolean;
  route: string[];
  fullPath: string[];
  legs: RouteLeg[];
  unreachableStops: string[];
  algorithmTrace: AlgorithmTraceStep[];
}

export interface RouteComparisonResult {
  start: string;
  greedy: RouteResult;
  baseline: RouteResult;
  distanceDifference: number;
  percentageSavings: number;
  greedyIsBetter: boolean;
  analysisSummary: string;
}

export interface BFSStep {
  stepNumber: number;
  currentVertex: string;
  queueState: string[];
  action: string;
}

export interface DFSStep {
  stepNumber: number;
  currentVertex: string;
  stackState: string[];
  action: string;
}

export interface GraphAnalysisResult {
  start: string;
  bfs: {
    startVertex: string;
    visitedOrder: string[];
    hopLevels: Record<string, number>;
    predecessors: Record<string, string>;
    unreachable: string[];
    steps: BFSStep[];
  };
  dfs: {
    startVertex: string;
    visitedOrder: string[];
    discoveryTimes: Record<string, number>;
    finishTimes: Record<string, number>;
    hasCycle: boolean;
    unreachable: string[];
    steps: DFSStep[];
  };
}
