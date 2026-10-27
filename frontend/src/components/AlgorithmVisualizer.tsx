import React, { useState, useEffect } from 'react';
import type { RouteResult, GraphAnalysisResult, AlgorithmTraceStep, BFSStep, DFSStep } from '../types';
import { Play, Pause, SkipForward, SkipBack, RotateCcw, Cpu, ListTree, CheckCircle2, Activity } from 'lucide-react';

interface AlgorithmVisualizerProps {
  routeResult: RouteResult | null;
  graphAnalysis: GraphAnalysisResult;
}

export const AlgorithmVisualizer: React.FC<AlgorithmVisualizerProps> = ({
  routeResult,
  graphAnalysis,
}) => {
  const [activeMode, setActiveMode] = useState<'greedy' | 'bfs' | 'dfs'>('greedy');
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1500); // ms per step

  // Get active steps based on mode
  const greedySteps: AlgorithmTraceStep[] = routeResult?.algorithmTrace ?? [];
  const bfsSteps: BFSStep[] = graphAnalysis.bfs.steps;
  const dfsSteps: DFSStep[] = graphAnalysis.dfs.steps;

  const currentTotalSteps =
    activeMode === 'greedy'
      ? greedySteps.length
      : activeMode === 'bfs'
      ? bfsSteps.length
      : dfsSteps.length;

  // Auto-play timer
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= currentTotalSteps - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, playbackSpeed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, currentTotalSteps, playbackSpeed]);

  // Mode switch resets step index
  const handleModeChange = (mode: 'greedy' | 'bfs' | 'dfs') => {
    setActiveMode(mode);
    setCurrentStepIndex(0);
    setIsPlaying(false);
  };

  const handleNext = () => {
    if (currentStepIndex < currentTotalSteps - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleReset = () => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
  };

  return (
    <div className="bg-white/95 backdrop-blur-md p-6 rounded-3xl border border-gray-200/80 shadow-xl shadow-gray-200/40 space-y-6 text-gray-800">
      {/* Header and Algorithm Mode Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#f26522]" />
            <h2 className="text-lg font-bold text-gray-900">Algorithm Execution Visualizer</h2>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Step-by-step playback of real C++ engine traversal traces & decision trees
          </p>
        </div>

        {/* Algorithm Tabs */}
        <div className="flex items-center p-1 rounded-2xl bg-gray-100/80 border border-gray-200/80 self-start sm:self-auto">
          <button
            onClick={() => handleModeChange('greedy')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeMode === 'greedy'
                ? 'bg-white text-gray-900 shadow-xs border border-gray-200/60 font-bold'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Greedy Route Selection
          </button>
          <button
            onClick={() => handleModeChange('bfs')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeMode === 'bfs'
                ? 'bg-white text-gray-900 shadow-xs border border-gray-200/60 font-bold'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            BFS Traversal
          </button>
          <button
            onClick={() => handleModeChange('dfs')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeMode === 'dfs'
                ? 'bg-white text-gray-900 shadow-xs border border-gray-200/60 font-bold'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            DFS Traversal
          </button>
        </div>
      </div>

      {/* Playback Controls Strip */}
      <div className="p-4 rounded-2xl bg-gray-50/80 border border-gray-200 flex flex-wrap items-center justify-between gap-4">
        {/* Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="p-2 rounded-xl bg-white hover:bg-gray-100 border border-gray-200 text-gray-600 hover:text-gray-900 transition-colors shadow-xs"
            title="Reset to Start"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className="p-2 rounded-xl bg-white hover:bg-gray-100 disabled:bg-gray-100 disabled:text-gray-300 disabled:border-gray-200 disabled:cursor-not-allowed border border-gray-200 text-gray-600 hover:text-gray-900 transition-colors shadow-xs"
            title="Previous Step"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            disabled={currentTotalSteps === 0}
            className="px-4 py-2 rounded-xl bg-[#f26522] hover:bg-[#d95318] disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-semibold flex items-center gap-1.5 shadow-md shadow-orange-500/10 transition-all text-xs"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 text-white" /> Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4 text-white" /> Play Trace
              </>
            )}
          </button>
          <button
            onClick={handleNext}
            disabled={currentStepIndex >= currentTotalSteps - 1}
            className="p-2 rounded-xl bg-white hover:bg-gray-100 disabled:bg-gray-100 disabled:text-gray-300 disabled:border-gray-200 disabled:cursor-not-allowed border border-gray-200 text-gray-600 hover:text-gray-900 transition-colors shadow-xs"
            title="Next Step"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Step Indicator and Speed */}
        <div className="flex items-center gap-4 text-xs">
          <div className="font-mono text-gray-600">
            Step <span className="font-bold text-[#f26522]">{currentTotalSteps > 0 ? currentStepIndex + 1 : 0}</span> / {currentTotalSteps}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-gray-500 text-[11px] font-medium">Speed:</span>
            <select
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
              className="bg-white border border-gray-200 text-gray-700 font-medium rounded-xl px-2 py-1 text-[11px] focus:outline-none shadow-xs"
            >
              <option value={2000}>0.5x</option>
              <option value={1200}>1.0x</option>
              <option value={600}>2.0x</option>
            </select>
          </div>
        </div>
      </div>

      {/* Visualization Canvas / Details Container */}
      {activeMode === 'greedy' && (
        <div className="space-y-4">
          {greedySteps.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-xs">
              Run route optimization in the Route Planner tab to populate the greedy decision trace.
            </div>
          ) : (
            <div className="space-y-4">
              {/* Current Step Explanation Card */}
              {greedySteps[currentStepIndex] && (
                <div className="p-4 rounded-2xl bg-gray-50/80 border border-gray-200 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#f26522] flex items-center gap-1.5">
                      <Activity className="w-4 h-4" />
                      Greedy Decision Step {greedySteps[currentStepIndex].stepNumber}
                    </span>
                    <span className="font-mono text-gray-500">
                      Origin: <strong className="text-gray-900">{greedySteps[currentStepIndex].currentLocation}</strong>
                    </span>
                  </div>

                  <p className="text-sm font-medium text-gray-900">
                    {greedySteps[currentStepIndex].explanation}
                  </p>

                  {/* Candidates Comparison Grid */}
                  <div className="space-y-1.5 pt-1">
                    <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                      Evaluated Unvisited Candidates (via Dijkstra):
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {greedySteps[currentStepIndex].candidates.map((cand) => {
                        const isChosen = cand.stop === greedySteps[currentStepIndex].selectedStop;
                        return (
                          <div
                            key={cand.stop}
                            className={`p-2.5 rounded-xl border text-xs transition-all ${
                              isChosen
                                ? 'bg-orange-50/80 border-[#f26522]/40 text-orange-950 font-semibold shadow-xs'
                                : 'bg-white border-gray-200 text-gray-600'
                            }`}
                          >
                            <div className="flex items-center justify-between font-semibold">
                              <span className={isChosen ? 'text-orange-950' : 'text-gray-800'}>{cand.stop}</span>
                              {isChosen && (
                                <span className="text-[10px] uppercase font-bold text-[#f26522] bg-orange-100/60 px-1.5 py-0.5 rounded-full border border-orange-200 flex items-center gap-0.5">
                                  <CheckCircle2 className="w-3 h-3" /> Selected
                                </span>
                              )}
                            </div>
                            <div className="mt-1 font-mono text-sm text-gray-900 font-bold">
                              {cand.distance.toFixed(2)} km
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* BFS Traversal Visualization */}
      {activeMode === 'bfs' && (
        <div className="space-y-4">
          {bfsSteps[currentStepIndex] && (
            <div className="p-4 rounded-2xl bg-gray-50/80 border border-gray-200 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#f26522] flex items-center gap-1.5">
                  <ListTree className="w-4 h-4" />
                  BFS Queue Step {bfsSteps[currentStepIndex].stepNumber}
                </span>
                <span className="font-mono text-gray-500">
                  Current: <strong className="text-gray-900">{bfsSteps[currentStepIndex].currentVertex}</strong>
                </span>
              </div>

              <p className="text-sm font-medium text-gray-900">
                {bfsSteps[currentStepIndex].action}
              </p>

              {/* FIFO Queue Snapshot */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  Queue State (FIFO):
                </span>
                <div className="flex items-center gap-1.5 overflow-x-auto p-2.5 bg-white rounded-xl border border-gray-200 min-h-[44px]">
                  {bfsSteps[currentStepIndex].queueState.length === 0 ? (
                    <span className="text-xs text-gray-400 italic">[Queue Empty]</span>
                  ) : (
                    bfsSteps[currentStepIndex].queueState.map((vertex, i) => (
                      <span
                        key={`${vertex}-${i}`}
                        className="px-2.5 py-1 rounded-lg bg-orange-50 border border-orange-200 text-[#f26522] text-xs font-mono font-semibold shrink-0"
                      >
                        {vertex}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* DFS Traversal Visualization */}
      {activeMode === 'dfs' && (
        <div className="space-y-4">
          {dfsSteps[currentStepIndex] && (
            <div className="p-4 rounded-2xl bg-gray-50/80 border border-gray-200 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#f26522] flex items-center gap-1.5">
                  <ListTree className="w-4 h-4" />
                  DFS Stack Step {dfsSteps[currentStepIndex].stepNumber}
                </span>
                <span className="font-mono text-gray-500">
                  Current: <strong className="text-gray-900">{dfsSteps[currentStepIndex].currentVertex}</strong>
                </span>
              </div>

              <p className="text-sm font-medium text-gray-900">
                {dfsSteps[currentStepIndex].action}
              </p>

              {/* LIFO Stack Snapshot */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  Stack State (LIFO — Top on right):
                </span>
                <div className="flex items-center gap-1.5 overflow-x-auto p-2.5 bg-white rounded-xl border border-gray-200 min-h-[44px]">
                  {dfsSteps[currentStepIndex].stackState.length === 0 ? (
                    <span className="text-xs text-gray-400 italic">[Stack Empty]</span>
                  ) : (
                    dfsSteps[currentStepIndex].stackState.map((vertex, i) => (
                      <span
                        key={`${vertex}-${i}`}
                        className="px-2.5 py-1 rounded-lg bg-gray-100 border border-gray-300 text-gray-800 text-xs font-mono font-semibold shrink-0"
                      >
                        {vertex}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};