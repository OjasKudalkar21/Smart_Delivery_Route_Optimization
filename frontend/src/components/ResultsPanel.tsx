import React from 'react';
import type { RouteResult, RouteComparisonResult } from '../types';
import { AlertTriangle, ArrowRight, TrendingUp, Info, Flag } from 'lucide-react';

interface ResultsPanelProps {
  routeResult: RouteResult | null;
  comparisonResult: RouteComparisonResult | null;
}

export const ResultsPanel: React.FC<ResultsPanelProps> = ({
  routeResult,
  comparisonResult,
}) => {
  if (!routeResult) {
    return (
      <div className="glass-panel p-8 rounded-2xl border border-slate-800 text-center flex flex-col items-center justify-center min-h-[320px]">
        <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-500 mb-3">
          <Info className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-200">No Route Generated Yet</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm">
          Select warehouse origin and destination stops, then click "Optimize Route" to compute shortest-path greedy sequences.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
      {/* Header and Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white">Route Optimization Results</h2>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
              routeResult.isComplete
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}>
              {routeResult.isComplete ? 'Complete Route' : 'Partial Route'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Strategy: <span className="text-indigo-400 font-semibold capitalize">{routeResult.strategy} Nearest-Neighbor</span>
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs text-slate-400 font-medium">Total Distance</p>
          <p className="text-2xl font-black text-white">
            {routeResult.totalDistance.toFixed(2)} <span className="text-xs font-semibold text-indigo-400">km</span>
          </p>
        </div>
      </div>

      {/* Unreachable Stops Warning */}
      {routeResult.unreachableStops.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 space-y-1">
          <div className="flex items-center gap-2 font-semibold text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Unreachable Stops Detected ({routeResult.unreachableStops.length})</span>
          </div>
          <p className="text-xs text-amber-200/80">
            The following stops could not be reached via any connected edge: {routeResult.unreachableStops.join(', ')}.
          </p>
        </div>
      )}

      {/* Ordered Delivery Stops Sequence Pill Strip */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Flag className="w-4 h-4 text-indigo-400" />
          Recommended Stop Order
        </p>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-thin">
          <div className="shrink-0 px-3 py-1.5 rounded-xl bg-indigo-600/30 border border-indigo-500/50 text-indigo-300 text-xs font-bold flex items-center gap-1.5">
            <span>Depot</span>
            <span className="font-mono text-[10px] text-indigo-200">({routeResult.startLocation})</span>
          </div>
          {routeResult.route.map((stop, idx) => (
            <React.Fragment key={`${stop}-${idx}`}>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <div className="shrink-0 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 shadow-sm">
                <span className="w-4 h-4 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] font-mono font-bold flex items-center justify-center">
                  {idx + 1}
                </span>
                <span>{stop}</span>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Detailed Delivery Legs Table */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Leg-by-Leg Shortest Path Breakdown
        </p>
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {routeResult.legs.map((leg) => (
            <div
              key={leg.legIndex}
              className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-mono text-[10px] font-bold">
                    Leg {leg.legIndex}
                  </span>
                  <span className="font-semibold text-slate-200">{leg.from}</span>
                  <ArrowRight className="w-3 h-3 text-slate-500" />
                  <span className="font-semibold text-slate-200">{leg.to}</span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono">
                  Path: {leg.path.join(' -> ')}
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="font-mono font-bold text-sm text-indigo-300">{leg.distance.toFixed(1)}</span>
                <span className="text-[11px] text-slate-400 ml-1">km</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comparison Panel if comparison was requested */}
      {comparisonResult && (
        <div className="p-4 rounded-xl bg-slate-900/90 border border-indigo-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              Greedy vs Baseline Order Comparison
            </h4>
            <span className="text-xs font-mono font-bold text-emerald-400">
              {comparisonResult.percentageSavings > 0 ? `Saved ${comparisonResult.percentageSavings.toFixed(1)}%` : 'Equal'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
              <span className="text-slate-400 text-[10px] uppercase font-semibold">Greedy Heuristic</span>
              <p className="text-base font-extrabold text-white mt-1">
                {comparisonResult.greedy.totalDistance.toFixed(1)} km
              </p>
              <p className="text-[10px] text-indigo-300 mt-0.5">Visits nearest neighbor</p>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
              <span className="text-slate-400 text-[10px] uppercase font-semibold">Baseline Order</span>
              <p className="text-base font-extrabold text-slate-300 mt-1">
                {comparisonResult.baseline.totalDistance.toFixed(1)} km
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Visits input order</p>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed italic">
            "{comparisonResult.analysisSummary}"
          </p>
        </div>
      )}

      {/* Viva / Heuristic Limitation Notice */}
      <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2">
        <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <p>
          <strong>Viva Note:</strong> The Greedy Nearest-Neighbor heuristic runs Dijkstra at each stop to find the closest unvisited location. While efficient for large graphs ($O(k \cdot (V+E)\log V)$), it is a polynomial approximation and does not guarantee the globally optimal solution to the NP-hard Travelling Salesperson Problem (TSP).
        </p>
      </div>
    </div>
  );
};
