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
      <div className="bg-white/95 backdrop-blur-md p-5 rounded-3xl border border-gray-200/80 shadow-xl shadow-gray-200/40 relative overflow-hidden transition-all duration-300 hover:border-gray-300 hover:-translate-y-0.5 text-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Route Distance</p>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-3xl font-extrabold text-gray-900 tracking-tight">{totalDistance}</span>
              <span className="text-sm font-semibold text-[#f26522]">km</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200/80 flex items-center justify-center text-[#f26522]">
            <Navigation className="w-6 h-6" />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-500">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
          <span>Sum of {routeResult?.legs.length ?? 0} shortest-path legs</span>
        </div>
      </div>

      {/* Delivery Stops Card */}
      <div className="bg-white/95 backdrop-blur-md p-5 rounded-3xl border border-gray-200/80 shadow-xl shadow-gray-200/40 relative overflow-hidden transition-all duration-300 hover:border-gray-300 hover:-translate-y-0.5 text-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Delivery Stops</p>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-3xl font-extrabold text-gray-900 tracking-tight">{stopsCount}</span>
              <span className="text-sm font-medium text-gray-400">/ {totalVertices} in Graph</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600">
            <MapPin className="w-6 h-6" />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-500">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
          <span>Starts from Warehouse Depot</span>
        </div>
      </div>

      {/* Heuristic Efficiency Card */}
      <div className="bg-white/95 backdrop-blur-md p-5 rounded-3xl border border-gray-200/80 shadow-xl shadow-gray-200/40 relative overflow-hidden transition-all duration-300 hover:border-gray-300 hover:-translate-y-0.5 text-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Greedy Savings</p>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-3xl font-extrabold text-gray-900 tracking-tight">{savings}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200/80 flex items-center justify-center text-[#f26522]">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
        <div className="mt-3 text-xs text-gray-500 truncate">
          <span>vs Input-order baseline ({comparisonResult?.distanceDifference.toFixed(1) ?? '0.0'} km saved)</span>
        </div>
      </div>

      {/* Algorithm Engine Card */}
      <div className="bg-white/95 backdrop-blur-md p-5 rounded-3xl border border-gray-200/80 shadow-xl shadow-gray-200/40 relative overflow-hidden transition-all duration-300 hover:border-gray-300 hover:-translate-y-0.5 text-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">DSA Engine</p>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-2xl font-bold text-gray-900 tracking-tight">C++17 STL</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-700">
            <Cpu className="w-6 h-6" />
          </div>
        </div>
        <div className="mt-3 text-xs text-gray-500 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#f26522]"></span>
          <span>Dijkstra + Priority Queue (Min-Heap)</span>
        </div>
      </div>
    </div>
  );
};