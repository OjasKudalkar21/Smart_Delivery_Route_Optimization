import React from 'react';
import { 
  Truck, 
  Clock, 
  MapPin, 
  Navigation, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Activity, 
  MoreVertical,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import type { RouteResult, RouteComparisonResult } from '../types';

interface HomeDashboardProps {
  routeResult: RouteResult | null;
  comparisonResult: RouteComparisonResult | null;
  onNavigateToPlanner: () => void;
  onNavigateToVisualizer: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  routeResult,
  comparisonResult,
  onNavigateToPlanner,
  onNavigateToVisualizer,
}) => {
  const totalDist = routeResult ? routeResult.totalDistance.toFixed(1) : '620.0';

  return (
    <div className="space-y-6 text-gray-800">
      {/* Top Banner: Active Fleet Status & Quick Actions */}
      <div className="bg-white/95 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-xl shadow-gray-200/40 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200/80 text-[#f26522] text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#f26522] animate-ping" />
            <span>Active Dispatch Monitor</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Logistics Fleet & Route Optimization Overview
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            Real-time tracking of ongoing dispatches, C++ engine decision traces, and automated Dijkstra shortest-path calculations.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onNavigateToPlanner}
            className="px-5 py-2.5 bg-[#f26522] hover:bg-[#d95318] text-white font-semibold rounded-2xl text-xs sm:text-sm shadow-md shadow-orange-500/10 hover:shadow-lg flex items-center gap-2 transition-all active:scale-[0.98]"
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span>Plan New Route</span>
          </button>
          <button
            onClick={onNavigateToVisualizer}
            className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200/80 text-gray-800 font-semibold rounded-2xl text-xs sm:text-sm border border-gray-200 flex items-center gap-2 transition-all active:scale-[0.98]"
          >
            <Activity className="w-4 h-4 text-[#f26522]" />
            <span>DSA Trace</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Active Vehicle Profile (Matching Reference) + Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left 7 Columns: Active Driver & Shipment Card (Direct reference to uploaded UI) */}
        <div className="lg:col-span-7 bg-white/95 backdrop-blur-md p-6 rounded-3xl border border-gray-200/80 shadow-xl shadow-gray-200/40 space-y-6">
          
          {/* Driver Info Header */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-base font-extrabold text-gray-900">James Anderson</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Northstar Logistics &bull; Amey Rail &bull; <span className="font-semibold text-gray-700">HGV Class 1</span>
              </p>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-mono text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full font-medium inline-flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-600" />
                Updated 09:48 AM
              </span>
            </div>
          </div>

          {/* Truck Illustration & Vehicle Specs */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-2xl bg-gray-50/80 border border-gray-200/80 gap-4">
            <div className="flex items-center gap-4">
              {/* Custom Styled DHL Delivery Truck Icon Container */}
              <div className="w-36 h-20 bg-[#ffcc00] rounded-2xl border border-amber-300 flex items-center justify-center p-2 relative shadow-xs overflow-hidden shrink-0">
                <div className="absolute top-2 left-3 font-black text-red-600 text-lg italic tracking-tighter">
                  DHL
                </div>
                <Truck className="w-16 h-16 text-slate-800 absolute bottom-0 right-1" />
              </div>

              <div>
                <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Vehicle</span>
                <p className="text-sm font-bold text-gray-900">Volvo FH-460</p>
                <span className="text-[11px] text-gray-500 font-mono">Reg: JNE8X472915638</span>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Shipping Status</span>
              <p className="text-xs font-bold text-[#f26522]">SHIPPING: 2D 12H 44M</p>
            </div>
          </div>

          {/* Route Tags */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="px-3 py-1 rounded-xl bg-gray-100 border border-gray-200 font-semibold text-gray-700">
              3 Days
            </span>
            <span className="px-3 py-1 rounded-xl bg-gray-100 border border-gray-200 font-semibold text-gray-700">
              {totalDist} Miles
            </span>
            <span className="px-3 py-1 rounded-xl bg-orange-50 border border-orange-200 text-[#f26522] font-semibold">
              In Transit
            </span>
            <span className="px-3 py-1 rounded-xl bg-gray-100 border border-gray-200 font-semibold text-gray-700 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              Thursday, March 20, 2026
            </span>
          </div>

          {/* Origin & Destination Nodes */}
          <div className="p-4 rounded-2xl bg-gray-50/80 border border-gray-200/80 space-y-3">
            <div className="flex items-center gap-3 text-xs">
              <span className="w-6 h-6 rounded-lg bg-gray-200 text-gray-700 font-mono font-bold flex items-center justify-center shrink-0">
                J
              </span>
              <span className="font-bold text-gray-900">JAPAN</span>
              <span className="text-gray-400">&bull;</span>
              <span className="text-gray-600 font-medium">Tokyo</span>
            </div>
            <div className="ml-3 border-l-2 border-dashed border-gray-300 pl-6 py-1 text-[11px] text-[#f26522] font-semibold">
              Show All History &darr;
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="w-6 h-6 rounded-lg bg-[#f26522] text-white font-mono font-bold flex items-center justify-center shrink-0">
                I
              </span>
              <span className="font-bold text-gray-900">INDONESIA</span>
              <span className="text-gray-400">&bull;</span>
              <span className="text-gray-600 font-medium">Surakarta</span>
            </div>
          </div>

          {/* AI Delivery Optimization Suggestion Card */}
          <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-gray-900">
              <span className="flex items-center gap-1.5 text-[#f26522]">
                <Sparkles className="w-4 h-4" />
                Delivery Optimization Available
              </span>
              <MoreVertical className="w-4 h-4 text-gray-400 cursor-pointer" />
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-white border border-gray-200 font-semibold text-gray-800">
                Route: I-75 N
              </span>
              <span className="text-emerald-700 font-medium">Saves 15 min vs. current route</span>
            </div>
            <p className="text-[11px] text-gray-600">
              <strong>Weather: Japan</strong> &bull; Heavy rain expected at 4 PM
            </p>
          </div>
        </div>

        {/* Right 5 Columns: Shipment Insights & Timeline Progress */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Shipment Insights Card */}
          <div className="bg-white/95 backdrop-blur-md p-6 rounded-3xl border border-gray-200/80 shadow-xl shadow-gray-200/40 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900">Shipment Insights</h3>
              <MoreVertical className="w-4 h-4 text-gray-400" />
            </div>

            {/* Segmented Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center gap-4 text-xs font-semibold text-gray-600">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#f26522]" /> Loading
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-orange-300" /> In Transit
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-gray-200" /> Unloading
                </span>
              </div>
              <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden flex p-0.5">
                <div className="w-[35%] bg-[#f26522] rounded-l-full h-full" />
                <div className="w-[45%] bg-orange-300 h-full" />
                <div className="w-[20%] bg-gray-200 rounded-r-full h-full" />
              </div>
            </div>

            {/* Key Metrics Breakdown */}
            <div className="space-y-3 pt-2 text-xs divide-y divide-gray-100">
              <div className="flex items-center justify-between pt-2">
                <span className="text-gray-500 font-medium flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-[#f26522]" /> Total Distance
                </span>
                <span className="font-extrabold text-gray-900 font-mono">{totalDist} mi</span>
              </div>

              <div className="flex items-center justify-between pt-3">
                <span className="text-gray-500 font-medium flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" /> On Schedule
                </span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  12 min ahead
                </span>
              </div>

              <div className="flex items-center justify-between pt-3">
                <span className="text-gray-500 font-medium flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#f26522]" /> Stops
                </span>
                <span className="font-semibold text-gray-900">1 completed &bull; 2 remaining</span>
              </div>

              <div className="flex items-center justify-between pt-3">
                <span className="text-gray-500 font-medium flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-gray-400" /> ETA
                </span>
                <span className="font-black text-gray-900 font-mono">4:30 PM</span>
              </div>
            </div>
          </div>

          {/* Timeline Section */}
          <div className="bg-white/95 backdrop-blur-md p-6 rounded-3xl border border-gray-200/80 shadow-xl shadow-gray-200/40 space-y-4">
            <h3 className="text-base font-bold text-gray-900">Shipment Timeline</h3>
            
            <div className="space-y-4 pl-2">
              <div className="flex items-start gap-3 relative">
                <span className="text-[11px] font-mono text-gray-400 shrink-0 w-16">06:30 AM</span>
                <div className="w-3 h-3 rounded-full bg-gray-300 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-gray-800">Shipment picked up</p>
                  <p className="text-[11px] text-gray-500">Warehouse 12, Koto-ku, Tokyo, Japan</p>
                </div>
              </div>

              <div className="flex items-start gap-3 relative">
                <span className="text-[11px] font-mono text-gray-400 shrink-0 w-16">09:15 AM</span>
                <div className="w-3 h-3 rounded-full bg-gray-300 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-gray-800">Departed origin port</p>
                  <p className="text-[11px] text-gray-500">Port of Yokohama, Kanagawa, Japan</p>
                </div>
              </div>

              <div className="flex items-start gap-3 relative">
                <span className="text-[11px] font-mono text-gray-400 shrink-0 w-16">02:00 PM</span>
                <div className="w-3 h-3 rounded-full bg-gray-300 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-gray-800">Customs clearance completed</p>
                  <p className="text-[11px] text-gray-500">Japan Customs, Yokohama Terminal</p>
                </div>
              </div>

              <div className="flex items-start gap-3 relative">
                <span className="text-[11px] font-mono text-[#f26522] font-bold shrink-0 w-16">04:30 PM</span>
                <div className="w-3 h-3 rounded-full bg-[#f26522] ring-4 ring-orange-100 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-[#f26522]">Currently in transit</p>
                  <p className="text-[11px] text-gray-500">En route to Tanjung Priok Port, Jakarta, Indonesia</p>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};