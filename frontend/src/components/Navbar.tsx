import React from 'react';
import { Route, Cpu, BookOpen, Layers, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  activeTab: 'dashboard' | 'planner' | 'visualizer' | 'about';
  setActiveTab: (tab: 'dashboard' | 'planner' | 'visualizer' | 'about') => void;
  isMockMode: boolean;
  truckImgSrc?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  activeTab, 
  setActiveTab, 
  isMockMode,
  truckImgSrc = "src/assets/dhl-truck.png " // Replace with your image file path or import
}) => {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/90 backdrop-blur-md shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Project Title */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-10 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center p-1 shadow-xs overflow-hidden">
              <img 
                src={truckImgSrc} 
                alt="DHL Truck" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-gray-900">
                  RoutePilot
                </span>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-orange-50 text-[#f26522] border border-orange-200">
                  C++17 DSA
                </span>
              </div>
              <p className="text-xs text-gray-500 hidden sm:block">Smart Delivery Route Optimization</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span className="hidden md:inline">Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('planner')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'planner'
                  ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80'
              }`}
            >
              <Route className="w-4 h-4" />
              <span>Plan Route</span>
            </button>

            <button
              onClick={() => setActiveTab('visualizer')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'visualizer'
                  ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80'
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>DSA Visualizer</span>
            </button>

            {/* <button
              onClick={() => setActiveTab('about')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'about'
                  ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden md:inline">About & Viva</span>
            </button> */}
          </nav>

          {/* Engine Status Badge */}
          {/* <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100/80 border border-gray-200/80 text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-gray-600 font-medium">Engine:</span>
            <span className="text-emerald-700 font-mono font-semibold">
              {isMockMode ? 'Phase 5 Mock Shell' : 'C++17 Engine Active'}
            </span>
            <ShieldCheck className="w-3.5 h-3.5 text-[#f26522] ml-1" />
          </div> */}
        </div>
      </div>
    </header>
  );
};