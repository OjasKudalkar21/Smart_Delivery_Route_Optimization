import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { SummaryCards } from './components/SummaryCards';
import { RoutePlanner } from './components/RoutePlanner';
import { ResultsPanel } from './components/ResultsPanel';
import { AlgorithmVisualizer } from './components/AlgorithmVisualizer';
import { MapView } from './components/MapView';
import { AboutProject } from './components/AboutProject';
import {
  MOCK_SAMPLE_VERTICES,
  MOCK_SAMPLE_EDGES,
  MOCK_OPTIMIZE_RESULT,
  MOCK_COMPARISON_RESULT,
  MOCK_GRAPH_ANALYSIS,
} from './services/mockData';
import {
  checkBackendHealth,
  fetchSampleGraph,
  analyzeGraph,
  optimizeRoute,
  compareRoutes,
} from './services/api';
import type {
  Vertex,
  Edge,
  RouteResult,
  RouteComparisonResult,
  GraphAnalysisResult,
  RouteLeg,
  AlgorithmTraceStep,
} from './types';
import { Zap, AlertCircle } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'planner' | 'visualizer' | 'about'>('dashboard');
  const [startLocation, setStartLocation] = useState<string>('Warehouse');
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>([
    'Downtown',
    'Harbor',
    'Airport',
  ]);

  const [vertices, setVertices] = useState<Vertex[]>(MOCK_SAMPLE_VERTICES);
  const [edges, setEdges] = useState<Edge[]>(MOCK_SAMPLE_EDGES);
  const [routeResult, setRouteResult] = useState<RouteResult | null>(MOCK_OPTIMIZE_RESULT);
  const [comparisonResult, setComparisonResult] = useState<RouteComparisonResult | null>(MOCK_COMPARISON_RESULT);
  const [graphAnalysis, setGraphAnalysis] = useState<GraphAnalysisResult>(MOCK_GRAPH_ANALYSIS);

  const [isLiveMode, setIsLiveMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [systemNotice, setSystemNotice] = useState<string | null>(null);

  // Initialize and probe backend connection
  const initEngine = useCallback(async () => {
    try {
      const health = await checkBackendHealth();
      if (health.isOnline) {
        setIsLiveMode(true);
        setSystemNotice('Connected to live C++17 DSA Route Engine.');

        // Load canonical sample graph from C++ engine
        const sampleData = await fetchSampleGraph();
        if (sampleData.vertices && sampleData.vertices.length > 0) {
          setVertices(sampleData.vertices);
          setEdges(sampleData.edges);
          setStartLocation(sampleData.warehouse || 'Warehouse');
        }

        // Run C++ Graph Analysis (BFS & DFS)
        const analysis = await analyzeGraph(sampleData.warehouse || 'Warehouse');
        setGraphAnalysis(analysis);

        // Run initial C++ route optimization
        const initialOpt = await optimizeRoute(
          sampleData.warehouse || 'Warehouse',
          ['Downtown', 'Harbor', 'Airport']
        );
        setRouteResult(initialOpt);

        // Run initial C++ comparison
        const initialComp = await compareRoutes(
          sampleData.warehouse || 'Warehouse',
          ['Downtown', 'Harbor', 'Airport']
        );
        setComparisonResult(initialComp);
      } else {
        setIsLiveMode(false);
        setSystemNotice('Express server offline. Running in Phase 5 standalone demo mode.');
      }
    } catch (err: unknown) {
      console.warn('Backend initialization notice:', err);
      setIsLiveMode(false);
      setSystemNotice('Using offline demo graph. Launch backend to enable native C++ execution.');
    }
  }, []);

  useEffect(() => {
    initEngine();
  }, [initEngine]);

  // Reset to default sample configuration
  const handleReset = () => {
    setStartLocation('Warehouse');
    setSelectedDestinations(['Downtown', 'Harbor', 'Airport']);
    setError(null);
    if (isLiveMode) {
      optimizeRoute('Warehouse', ['Downtown', 'Harbor', 'Airport'])
        .then((res) => {
          setRouteResult(res);
          return compareRoutes('Warehouse', ['Downtown', 'Harbor', 'Airport']);
        })
        .then((comp) => setComparisonResult(comp))
        .catch((e: Error) => setError(e.message));
    } else {
      setRouteResult(MOCK_OPTIMIZE_RESULT);
      setComparisonResult(MOCK_COMPARISON_RESULT);
    }
  };

  // Run Route Optimizer (Live C++ or Mock simulation)
  const handleOptimize = async () => {
    if (selectedDestinations.length === 0) {
      setError('Please select at least one delivery destination.');
      return;
    }

    setIsLoading(true);
    setError(null);

    if (isLiveMode) {
      try {
        const result = await optimizeRoute(startLocation, selectedDestinations);
        setRouteResult(result);
        setComparisonResult(null);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Route optimization failed';
        setError(`C++ Engine Error: ${msg}`);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Standalone simulation fallback
      setTimeout(() => {
        const orderedStops = [...selectedDestinations];
        const legs: RouteLeg[] = [];
        let totalDist = 0;
        let curr = startLocation;
        const fullPathNodes: string[] = [curr];
        const traceSteps: AlgorithmTraceStep[] = [];

        orderedStops.forEach((stop, idx) => {
          const legDist = Math.round((2.5 + (idx + 1) * 2.2) * 10) / 10;
          totalDist += legDist;
          legs.push({
            legIndex: idx + 1,
            from: curr,
            to: stop,
            distance: legDist,
            path: [curr, stop],
          });
          fullPathNodes.push(stop);

          traceSteps.push({
            stepNumber: idx + 1,
            currentLocation: curr,
            selectedStop: stop,
            selectedDistance: legDist,
            explanation: `From '${curr}', evaluated remaining candidates. Selected '${stop}' at ${legDist.toFixed(1)} km.`,
            candidates: [{ stop, distance: legDist }],
          });

          curr = stop;
        });

        const newResult: RouteResult = {
          strategy: 'greedy',
          startLocation,
          totalDistance: Math.round(totalDist * 10) / 10,
          isComplete: true,
          route: orderedStops,
          fullPath: fullPathNodes,
          legs,
          unreachableStops: [],
          algorithmTrace: traceSteps,
        };

        setRouteResult(newResult);
        setComparisonResult(null);
        setIsLoading(false);
      }, 300);
    }
  };

  // Run Route Comparison (Live C++ or Mock simulation)
  const handleCompare = async () => {
    if (selectedDestinations.length === 0) {
      setError('Please select at least one delivery destination to compare.');
      return;
    }

    setIsLoading(true);
    setError(null);

    if (isLiveMode) {
      try {
        const comp = await compareRoutes(startLocation, selectedDestinations);
        setRouteResult(comp.greedy);
        setComparisonResult(comp);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Route comparison failed';
        setError(`C++ Engine Error: ${msg}`);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Standalone simulation fallback
      setTimeout(() => {
        const baselineDist = Math.round((routeResult ? routeResult.totalDistance * 1.35 : 29.5) * 10) / 10;
        const greedyDist = routeResult ? routeResult.totalDistance : 21.8;
        const diff = Math.round((baselineDist - greedyDist) * 10) / 10;
        const pct = Math.round((diff / baselineDist) * 1000) / 10;

        const comp: RouteComparisonResult = {
          start: startLocation,
          greedy: routeResult ?? MOCK_OPTIMIZE_RESULT,
          baseline: {
            strategy: 'baseline',
            startLocation,
            totalDistance: baselineDist,
            isComplete: true,
            route: [...selectedDestinations].reverse(),
            fullPath: [startLocation, ...selectedDestinations],
            legs: [],
            unreachableStops: [],
            algorithmTrace: [],
          },
          distanceDifference: diff,
          percentageSavings: pct,
          greedyIsBetter: diff > 0,
          analysisSummary: `Greedy heuristic achieved ${diff.toFixed(1)} km (${pct.toFixed(1)}%) distance savings compared to user's unoptimized order.`,
        };

        setComparisonResult(comp);
        setIsLoading(false);
      }, 300);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navigation */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} isMockMode={!isLiveMode} />

      {/* Backend Status Notice Banner */}
      {systemNotice && (
        <div
          className={`border-b text-xs py-2 px-4 flex items-center justify-between ${
            isLiveMode
              ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-300'
              : 'bg-amber-950/40 border-amber-800/50 text-amber-300'
          }`}
        >
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isLiveMode ? (
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span>{systemNotice}</span>
            </div>
            <button
              onClick={() => initEngine()}
              className="text-[11px] underline opacity-80 hover:opacity-100 cursor-pointer"
            >
              Probe Connection
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* KPI Summary Cards */}
        <SummaryCards
          routeResult={routeResult}
          comparisonResult={comparisonResult}
          totalVertices={vertices.length}
        />

        {/* Dynamic Tab Views */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Route Configuration & Summary */}
              <div className="lg:col-span-5 space-y-6">
                <RoutePlanner
                  availableVertices={vertices}
                  startLocation={startLocation}
                  setStartLocation={setStartLocation}
                  selectedDestinations={selectedDestinations}
                  setSelectedDestinations={setSelectedDestinations}
                  onOptimize={handleOptimize}
                  onCompare={handleCompare}
                  onReset={handleReset}
                  isLoading={isLoading}
                  error={error}
                />
              </div>

              {/* Right Column: Interactive Map & Results */}
              <div className="lg:col-span-7 space-y-6">
                <MapView
                  vertices={vertices}
                  edges={edges}
                  routeResult={routeResult}
                  startLocation={startLocation}
                />
                <ResultsPanel
                  routeResult={routeResult}
                  comparisonResult={comparisonResult}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'planner' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 space-y-6">
              <RoutePlanner
                availableVertices={vertices}
                startLocation={startLocation}
                setStartLocation={setStartLocation}
                selectedDestinations={selectedDestinations}
                setSelectedDestinations={setSelectedDestinations}
                onOptimize={handleOptimize}
                onCompare={handleCompare}
                onReset={handleReset}
                isLoading={isLoading}
                error={error}
              />
            </div>
            <div className="lg:col-span-7 space-y-6">
              <ResultsPanel
                routeResult={routeResult}
                comparisonResult={comparisonResult}
              />
              <MapView
                vertices={vertices}
                edges={edges}
                routeResult={routeResult}
                startLocation={startLocation}
              />
            </div>
          </div>
        )}

        {activeTab === 'visualizer' && (
          <div className="space-y-6">
            <AlgorithmVisualizer
              routeResult={routeResult}
              graphAnalysis={graphAnalysis}
            />
            <MapView
              vertices={vertices}
              edges={edges}
              routeResult={routeResult}
              startLocation={startLocation}
            />
          </div>
        )}

        {activeTab === 'about' && <AboutProject />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">RoutePilot</span>
            <span>&bull;</span>
            <span>College Data Structures & Algorithms Project</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>C++17 Engine</span>
            <span>•</span>
            <span>Express.js API</span>
            <span>•</span>
            <span>Dijkstra Shortest Path</span>
            <span>•</span>
            <span>Greedy TSP Heuristic</span>
            <span>•</span>
            <span>React + Vite</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
