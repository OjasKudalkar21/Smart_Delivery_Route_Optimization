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
      <div className="bg-white/95 backdrop-blur-md p-8 rounded-3xl border border-gray-200/80 shadow-xl shadow-gray-200/40 text-center flex flex-col items-center justify-center min-h-[320px] text-gray-800">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-3 border border-gray-200/60">
          <Info className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-gray-900">No Route Generated Yet</h3>
        <p className="text-xs text-gray-500 mt-1 max-w-sm leading-relaxed">
          Select warehouse origin and destination stops, then click "Optimize Route" to compute shortest-path greedy sequences.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white/95 backdrop-blur-md p-6 rounded-3xl border border-gray-200/80 shadow-xl shadow-gray-200/40 space-y-6 text-gray-800">
      {/* Header and Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-900">Route Optimization Results</h2>
            <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${
              routeResult.isComplete
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-orange-50 text-[#f26522] border-orange-200'
            }`}>
              {routeResult.isComplete ? 'Complete Route' : 'Partial Route'}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Strategy: <span className="text-[#f26522] font-semibold capitalize">{routeResult.strategy} Nearest-Neighbor</span>
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs text-gray-500 font-medium">Total Distance</p>
          <p className="text-2xl font-black text-gray-900">
            {routeResult.totalDistance.toFixed(2)} <span className="text-xs font-semibold text-[#f26522]">km</span>
          </p>
        </div>
      </div>

      {/* Unreachable Stops Warning */}
      {routeResult.unreachableStops.length > 0 && (
        <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200/80 text-orange-950 space-y-1">
          <div className="flex items-center gap-2 font-semibold text-xs text-[#f26522]">
            <AlertTriangle className="w-4 h-4 text-[#f26522] shrink-0" />
            <span>Unreachable Stops Detected ({routeResult.unreachableStops.length})</span>
          </div>
          <p className="text-xs text-orange-900/90 leading-relaxed">
            The following stops could not be reached via any connected edge: {routeResult.unreachableStops.join(', ')}.
          </p>
        </div>
      )}

      {/* Ordered Delivery Stops Sequence Pill Strip */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-2">
          <Flag className="w-4 h-4 text-[#f26522]" />
          Recommended Stop Order
        </p>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-thin">
          <div className="shrink-0 px-3 py-1.5 rounded-xl bg-orange-50 border border-orange-200/80 text-[#f26522] text-xs font-bold flex items-center gap-1.5 shadow-xs">
            <span>Depot</span>
            <span className="font-mono text-[10px] text-orange-700">({routeResult.startLocation})</span>
          </div>
          {routeResult.route.map((stop, idx) => (
            <React.Fragment key={`${stop}-${idx}`}>
              <ArrowRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
              <div className="shrink-0 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 text-xs font-medium flex items-center gap-1.5 shadow-xs">
                <span className="w-4 h-4 rounded-full bg-gray-200/80 text-gray-700 text-[10px] font-mono font-bold flex items-center justify-center">
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
        <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
          Leg-by-Leg Shortest Path Breakdown
        </p>
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {routeResult.legs.map((leg) => (
            <div
              key={leg.legIndex}
              className="p-3 rounded-2xl bg-gray-50/80 border border-gray-200/80 hover:bg-white hover:border-gray-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-orange-50 text-[#f26522] border border-orange-200/80 font-mono text-[10px] font-bold">
                    Leg {leg.legIndex}
                  </span>
                  <span className="font-semibold text-gray-900">{leg.from}</span>
                  <ArrowRight className="w-3 h-3 text-gray-400" />
                  <span className="font-semibold text-gray-900">{leg.to}</span>
                </div>
                <p className="text-[11px] text-gray-500 font-mono">
                  Path: {leg.path.join(' -> ')}
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="font-mono font-bold text-sm text-gray-900">{leg.distance.toFixed(1)}</span>
                <span className="text-[11px] text-gray-500 ml-1">km</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comparison Panel if comparison was requested */}
      {comparisonResult && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white space-y-3 shadow-md">
          {/* <div className="flex items-center justify-between"> */}
            {/* <h4 className="text-xs font-bold text-[#f26522] uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-[#f26522]" />
              Greedy vs Baseline Order Comparison
            </h4> */}
            {/* <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/30">
              {comparisonResult.percentageSavings > 0 ? `Saved ${comparisonResult.percentageSavings.toFixed(1)}%` : 'Equal'}
            </span> */}
          {/* </div> */}

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-[#f26522]/10 border border-[#f26522]/20">
              <span className="text-slate-400 text-[10px] uppercase font-semibold">Greedy Heuristic</span>
              <p className="text-base font-extrabold text-white mt-1">
                {comparisonResult.greedy.totalDistance.toFixed(1)} km
              </p>
              <p className="text-[10px] text-orange-300 mt-0.5">Visits nearest neighbor</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
              <span className="text-slate-400 text-[10px] uppercase font-semibold">Baseline Order</span>
              <p className="text-base font-extrabold text-slate-300 mt-1">
                {comparisonResult.baseline.totalDistance.toFixed(1)} km
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Visits input order</p>
            </div>
          </div>

          <p className="text-[11px] text-slate-300 leading-relaxed italic border-t border-slate-800 pt-2">
            "{comparisonResult.analysisSummary}"
          </p>
        </div>
      )}

      {/* Viva / Heuristic Limitation Notice */}
      <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200/80 text-[11px] text-gray-600 flex items-start gap-2.5">
        {/* <Info className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" /> */}
        {/* <p className="leading-relaxed">
          <strong className="text-gray-900 font-semibold">Viva Note:</strong> The Greedy Nearest-Neighbor heuristic runs Dijkstra at each stop to find the closest unvisited location. While efficient for large graphs ($O(k \cdot (V+E)\log V)$), it is a polynomial approximation and does not guarantee the globally optimal solution to the NP-hard Travelling Salesperson Problem (TSP).
        </p> */}
      </div>
    </div>
  );
};