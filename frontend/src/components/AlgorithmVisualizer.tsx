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
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
      {/* Header and Algorithm Mode Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">Algorithm Execution Visualizer</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Step-by-step playback of real C++ engine traversal traces & decision trees
          </p>
        </div>

        {/* Algorithm Tabs */}
        <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => handleModeChange('greedy')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeMode === 'greedy'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Greedy Route Selection
          </button>
          <button
            onClick={() => handleModeChange('bfs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeMode === 'bfs'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            BFS Traversal
          </button>
          <button
            onClick={() => handleModeChange('dfs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeMode === 'dfs'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            DFS Traversal
          </button>
        </div>
      </div>

      {/* Playback Controls Strip */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        {/* Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Reset to Start"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 hover:text-white transition-colors"
            title="Previous Step"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            disabled={currentTotalSteps === 0}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all text-xs"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4" /> Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4" /> Play Trace
              </>
            )}
          </button>
          <button
            onClick={handleNext}
            disabled={currentStepIndex >= currentTotalSteps - 1}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 hover:text-white transition-colors"
            title="Next Step"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Step Indicator and Speed */}
        <div className="flex items-center gap-4 text-xs">
          <div className="font-mono text-slate-300">
            Step <span className="font-bold text-indigo-400">{currentTotalSteps > 0 ? currentStepIndex + 1 : 0}</span> / {currentTotalSteps}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px]">Speed:</span>
            <select
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
              className="bg-slate-800 border border-slate-700 text-slate-200 rounded px-2 py-1 text-[11px] focus:outline-none"
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
            <div className="text-center py-10 text-slate-400 text-xs">
              Run route optimization in the Route Planner tab to populate the greedy decision trace.
            </div>
          ) : (
            <div className="space-y-4">
              {/* Current Step Explanation Card */}
              {greedySteps[currentStepIndex] && (
                <div className="p-4 rounded-xl bg-slate-900 border border-indigo-500/30 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-indigo-400 flex items-center gap-1.5">
                      <Activity className="w-4 h-4" />
                      Greedy Decision Step {greedySteps[currentStepIndex].stepNumber}
                    </span>
                    <span className="font-mono text-slate-400">
                      Origin: <strong className="text-white">{greedySteps[currentStepIndex].currentLocation}</strong>
                    </span>
                  </div>

                  <p className="text-sm font-medium text-slate-100">
                    {greedySteps[currentStepIndex].explanation}
                  </p>

                  {/* Candidates Comparison Grid */}
                  <div className="space-y-1.5 pt-1">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Evaluated Unvisited Candidates (via Dijkstra):
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {greedySteps[currentStepIndex].candidates.map((cand) => {
                        const isChosen = cand.stop === greedySteps[currentStepIndex].selectedStop;
                        return (
                          <div
                            key={cand.stop}
                            className={`p-2.5 rounded-lg border text-xs transition-all ${
                              isChosen
                                ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 ring-1 ring-indigo-500/50'
                                : 'bg-slate-950/60 border-slate-800 text-slate-400'
                            }`}
                          >
                            <div className="flex items-center justify-between font-semibold">
                              <span>{cand.stop}</span>
                              {isChosen && (
                                <span className="text-[10px] uppercase font-bold text-emerald-400 flex items-center gap-0.5">
                                  <CheckCircle2 className="w-3 h-3" /> Selected
                                </span>
                              )}
                            </div>
                            <div className="mt-1 font-mono text-sm">
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
            <div className="p-4 rounded-xl bg-slate-900 border border-indigo-500/30 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-indigo-400 flex items-center gap-1.5">
                  <ListTree className="w-4 h-4" />
                  BFS Queue Step {bfsSteps[currentStepIndex].stepNumber}
                </span>
                <span className="font-mono text-slate-400">
                  Current: <strong className="text-white">{bfsSteps[currentStepIndex].currentVertex}</strong>
                </span>
              </div>

              <p className="text-sm font-medium text-slate-100">
                {bfsSteps[currentStepIndex].action}
              </p>

              {/* FIFO Queue Snapshot */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Queue State (FIFO):
                </span>
                <div className="flex items-center gap-1.5 overflow-x-auto p-2 bg-slate-950/80 rounded-lg border border-slate-800 min-h-[44px]">
                  {bfsSteps[currentStepIndex].queueState.length === 0 ? (
                    <span className="text-xs text-slate-500 italic">[Queue Empty]</span>
                  ) : (
                    bfsSteps[currentStepIndex].queueState.map((vertex, i) => (
                      <span
                        key={`${vertex}-${i}`}
                        className="px-2.5 py-1 rounded bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-mono font-medium shrink-0"
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
            <div className="p-4 rounded-xl bg-slate-900 border border-indigo-500/30 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-indigo-400 flex items-center gap-1.5">
                  <ListTree className="w-4 h-4" />
                  DFS Stack Step {dfsSteps[currentStepIndex].stepNumber}
                </span>
                <span className="font-mono text-slate-400">
                  Current: <strong className="text-white">{dfsSteps[currentStepIndex].currentVertex}</strong>
                </span>
              </div>

              <p className="text-sm font-medium text-slate-100">
                {dfsSteps[currentStepIndex].action}
              </p>

              {/* LIFO Stack Snapshot */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Stack State (LIFO — Top on right):
                </span>
                <div className="flex items-center gap-1.5 overflow-x-auto p-2 bg-slate-950/80 rounded-lg border border-slate-800 min-h-[44px]">
                  {dfsSteps[currentStepIndex].stackState.length === 0 ? (
                    <span className="text-xs text-slate-500 italic">[Stack Empty]</span>
                  ) : (
                    dfsSteps[currentStepIndex].stackState.map((vertex, i) => (
                      <span
                        key={`${vertex}-${i}`}
                        className="px-2.5 py-1 rounded bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-mono font-medium shrink-0"
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
