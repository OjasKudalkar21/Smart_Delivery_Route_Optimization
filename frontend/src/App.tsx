import React, { useState } from 'react';
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
import type { RouteResult, RouteComparisonResult, RouteLeg, AlgorithmTraceStep } from './types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'planner' | 'visualizer' | 'about'>('dashboard');
  const [startLocation, setStartLocation] = useState<string>('Warehouse');
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>([
    'Downtown',
    'Harbor',
    'Airport',
  ]);
  const [routeResult, setRouteResult] = useState<RouteResult | null>(MOCK_OPTIMIZE_RESULT);
  const [comparisonResult, setComparisonResult] = useState<RouteComparisonResult | null>(MOCK_COMPARISON_RESULT);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Reset to default sample state
  const handleReset = () => {
    setStartLocation('Warehouse');
    setSelectedDestinations(['Downtown', 'Harbor', 'Airport']);
    setRouteResult(MOCK_OPTIMIZE_RESULT);
    setComparisonResult(MOCK_COMPARISON_RESULT);
    setError(null);
  };

  // Mock Optimizer action in Phase 5 (simulates calculation with realistic distances)
  const handleOptimize = () => {
    setIsLoading(true);
    setError(null);

    setTimeout(() => {
      if (selectedDestinations.length === 0) {
        setError('Please select at least one delivery destination.');
        setIsLoading(false);
        return;
      }

      // Generate simulated greedy sequence from selected stops
      const orderedStops = [...selectedDestinations];
      const legs: RouteLeg[] = [];
      let totalDist = 0;
      let curr = startLocation;
      const fullPathNodes: string[] = [curr];
      const traceSteps: AlgorithmTraceStep[] = [];

      orderedStops.forEach((stop, idx) => {
        // Approximate distance based on sample graph or synthetic distance
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
          explanation: `From '${curr}', evaluated remaining candidate stops. Selected nearest unvisited stop '${stop}' at ${legDist.toFixed(1)} km.`,
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
    }, 400);
  };

  // Mock Comparison action in Phase 5
  const handleCompare = () => {
    setIsLoading(true);
    setError(null);

    setTimeout(() => {
      if (!routeResult) {
        handleOptimize();
      }

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
        analysisSummary: `Greedy heuristic achieved ${diff.toFixed(1)} km (${pct.toFixed(1)}%) distance savings compared to the user's unoptimized order.`,
      };

      setComparisonResult(comp);
      setIsLoading(false);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 flex flex-col">
      {/* Top Navigation */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} isMockMode={true} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* KPI Summary Cards */}
        <SummaryCards
          routeResult={routeResult}
          comparisonResult={comparisonResult}
          totalVertices={MOCK_SAMPLE_VERTICES.length}
        />

        {/* Dynamic Tab Views */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Route Configuration & Summary */}
              <div className="lg:col-span-5 space-y-6">
                <RoutePlanner
                  availableVertices={MOCK_SAMPLE_VERTICES}
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
                  vertices={MOCK_SAMPLE_VERTICES}
                  edges={MOCK_SAMPLE_EDGES}
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
                availableVertices={MOCK_SAMPLE_VERTICES}
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
                vertices={MOCK_SAMPLE_VERTICES}
                edges={MOCK_SAMPLE_EDGES}
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
              graphAnalysis={MOCK_GRAPH_ANALYSIS}
            />
            <MapView
              vertices={MOCK_SAMPLE_VERTICES}
              edges={MOCK_SAMPLE_EDGES}
              routeResult={routeResult}
              startLocation={startLocation}
            />
          </div>
        )}

        {activeTab === 'about' && <AboutProject />}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white/80 py-6 mt-12 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">RoutePilot</span>
            <span>&bull;</span>
            <span>College Data Structures & Algorithms Project</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>C++17 Engine</span>
            <span>•</span>
            <span>Dijkstra Shortest Path</span>
            <span>•</span>
            <span>Greedy TSP Heuristic</span>
            <span>•</span>
            <span>Vite + React</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
