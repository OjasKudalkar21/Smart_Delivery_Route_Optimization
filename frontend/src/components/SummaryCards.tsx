import React from 'react';
import { Navigation, MapPin, TrendingUp, Cpu, CheckCircle } from 'lucide-react';
import type { RouteResult, RouteComparisonResult } from '../types';

interface SummaryCardsProps {
  routeResult: RouteResult | null;
  comparisonResult: RouteComparisonResult | null;
  totalVertices: number;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  routeResult,
  comparisonResult,
  totalVertices,
}) => {
  const totalDistance = routeResult ? routeResult.totalDistance.toFixed(1) : '--';
  const stopsCount = routeResult ? routeResult.route.length : 0;
  const savings = comparisonResult && comparisonResult.percentageSavings > 0
    ? `${comparisonResult.percentageSavings.toFixed(1)}%`
    : 'Optimal / Equal';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Distance Card */}
      <div className="glass-panel p-5 rounded-2xl relative overflow-hidden transition-all duration-300 hover:border-indigo-500/40 hover:-translate-y-0.5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Route Distance</p>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-3xl font-extrabold text-white tracking-tight">{totalDistance}</span>
              <span className="text-sm font-semibold text-indigo-400">km</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Navigation className="w-6 h-6" />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
          <span>Sum of {routeResult?.legs.length ?? 0} shortest-path legs</span>
        </div>
      </div>

      {/* Delivery Stops Card */}
      <div className="glass-panel p-5 rounded-2xl relative overflow-hidden transition-all duration-300 hover:border-emerald-500/40 hover:-translate-y-0.5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Delivery Stops</p>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-3xl font-extrabold text-white tracking-tight">{stopsCount}</span>
              <span className="text-sm font-medium text-slate-400">/ {totalVertices} in Graph</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <MapPin className="w-6 h-6" />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
          <span>Starts from Warehouse Depot</span>
        </div>
      </div>

      {/* Heuristic Efficiency Card */}
      <div className="glass-panel p-5 rounded-2xl relative overflow-hidden transition-all duration-300 hover:border-purple-500/40 hover:-translate-y-0.5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Greedy Savings</p>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-3xl font-extrabold text-white tracking-tight">{savings}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
        <div className="mt-3 text-xs text-slate-400 truncate">
          <span>vs Input-order baseline ({comparisonResult?.distanceDifference.toFixed(1) ?? '0.0'} km saved)</span>
        </div>
      </div>

      {/* Algorithm Engine Card */}
      <div className="glass-panel p-5 rounded-2xl relative overflow-hidden transition-all duration-300 hover:border-cyan-500/40 hover:-translate-y-0.5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">DSA Engine</p>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-2xl font-bold text-white tracking-tight">C++17 STL</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Cpu className="w-6 h-6" />
          </div>
        </div>
        <div className="mt-3 text-xs text-slate-400 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
          <span>Dijkstra + Priority Queue (Min-Heap)</span>
        </div>
      </div>
    </div>
  );
};
