import React from 'react';
import { Cpu, ShieldAlert, Award, Network, Layers } from 'lucide-react';

export const AboutProject: React.FC = () => {
  return (
    <div className="space-y-6 text-gray-800">
      {/* Overview Banner */}
      <div className="bg-white/95 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-xl shadow-gray-200/40 space-y-3 relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200/80 text-[#f26522] text-xs font-semibold">
          <Award className="w-3.5 h-3.5" />
          <span>College DSA Viva & Project Reference</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
          Smart Delivery Route Optimization System
        </h1>
        <p className="text-sm text-gray-600 leading-relaxed max-w-3xl">
          A hybrid algorithmic system combining a native <strong>C++17 Data Structures & Algorithms Engine</strong> with a modern web dashboard. Delivery destinations are modeled as graph vertices, and roads as weighted edges. The system evaluates shortest paths via <strong>Dijkstra's Algorithm</strong>, analyzes graph reachability using <strong>BFS & DFS</strong>, and applies a <strong>Greedy Nearest-Neighbor heuristic</strong> to schedule delivery tours.
        </p>
      </div>

      {/* Grid of Key Concepts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Core DSA Data Structures */}
        <div className="bg-white/95 backdrop-blur-md p-6 rounded-3xl border border-gray-200/80 shadow-xl shadow-gray-200/40 space-y-4">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Network className="w-5 h-5 text-[#f26522]" />
            Core Data Structures (C++ STL)
          </h3>
          <ul className="space-y-3 text-xs text-gray-700 leading-relaxed">
            <li className="p-3 rounded-2xl bg-gray-50/80 border border-gray-200/80">
              <strong className="text-gray-900">Graph Adjacency List:</strong>{' '}
              Implemented with <code>std::unordered_map&lt;std::string, std::vector&lt;Edge&gt;&gt;</code> for $O(1)$ average vertex lookup and efficient sparse edge iterations.
            </li>
            <li className="p-3 rounded-2xl bg-gray-50/80 border border-gray-200/80">
              <strong className="text-gray-900">Min-Priority Queue:</strong>{' '}
              Used in Dijkstra's shortest path via <code>std::priority_queue&lt;Pair, std::vector, std::greater&gt;</code> to achieve $O((V+E)\log V)$ optimal vertex settling.
            </li>
            <li className="p-3 rounded-2xl bg-gray-50/80 border border-gray-200/80">
              <strong className="text-gray-900">BFS FIFO Queue & DFS Stack:</strong>{' '}
              <code>std::queue</code> for level-by-level hop exploration and <code>std::stack</code> for cycle detection and reachability checks.
            </li>
          </ul>
        </div>

        {/* Viva Proof: Why Greedy is NOT Globally Optimal */}
        <div className="bg-white/95 backdrop-blur-md p-6 rounded-3xl border border-gray-200/80 shadow-xl shadow-gray-200/40 space-y-4">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[#f26522]" />
            Viva Critical Concept: Heuristic Limitation
          </h3>
          <div className="p-4 rounded-2xl bg-orange-50/80 border border-orange-200/80 text-xs text-orange-950 space-y-2">
            <p className="font-semibold text-[#f26522]">
              Why doesn't the Greedy heuristic always yield the optimal route?
            </p>
            <p className="leading-relaxed text-gray-700">
              The multi-stop delivery problem is a variation of the <strong>Travelling Salesperson Problem (TSP)</strong>, which is <em>NP-hard</em>. The greedy algorithm selects the locally nearest unvisited destination at each step.
            </p>
            <p className="leading-relaxed text-gray-700">
              <strong>Counterexample Verified in C++ Engine Test:</strong><br/>
              Depot to Stop A = 1 km, Depot to Stop B = 2 km, Stop A to Stop C = 3 km, Stop B to Stop A = 2 km, Stop A to Stop C = 3 km.<br/>
              Greedy chooses Depot &rarr; A (1 km) &rarr; C (3 km) &rarr; B (4 km) = <strong>8 km total</strong>.<br/>
              Global optimum is Depot &rarr; B (2 km) &rarr; A (2 km) &rarr; C (3 km) = <strong>7 km total</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Algorithmic Complexity Table */}
      <div className="bg-white/95 backdrop-blur-md p-6 rounded-3xl border border-gray-200/80 shadow-xl shadow-gray-200/40 space-y-4">
        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-[#f26522]" />
          Time & Space Complexity Reference
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="bg-gray-100/80 text-gray-600 uppercase text-[10px] tracking-wider border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Algorithm</th>
                <th className="py-3 px-4">Underlying Data Structure</th>
                <th className="py-3 px-4">Time Complexity</th>
                <th className="py-3 px-4">Space Complexity</th>
                <th className="py-3 px-4">Role in RoutePilot</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/80 font-mono">
              <tr>
                <td className="py-3 px-4 font-bold text-gray-900 font-sans">Breadth-First Search (BFS)</td>
                <td className="py-3 px-4">Queue (std::queue)</td>
                <td className="py-3 px-4 text-emerald-600 font-semibold">O(V + E)</td>
                <td className="py-3 px-4">O(V)</td>
                <td className="py-3 px-4 font-sans text-gray-500">Unweighted hop analysis</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-gray-900 font-sans">Depth-First Search (DFS)</td>
                <td className="py-3 px-4">Stack / Recursion</td>
                <td className="py-3 px-4 text-emerald-600 font-semibold">O(V + E)</td>
                <td className="py-3 px-4">O(V)</td>
                <td className="py-3 px-4 font-sans text-gray-500">Cycle & component exploration</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-gray-900 font-sans">Dijkstra's Algorithm</td>
                <td className="py-3 px-4">Min-Heap (std::priority_queue)</td>
                <td className="py-3 px-4 text-[#f26522] font-semibold">O((V + E) log V)</td>
                <td className="py-3 px-4">O(V)</td>
                <td className="py-3 px-4 font-sans text-gray-500">Single-source shortest road paths</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-gray-900 font-sans">Greedy Route Optimizer</td>
                <td className="py-3 px-4">k successive Dijkstra runs</td>
                <td className="py-3 px-4 text-orange-600 font-semibold">O(k · (V + E) log V)</td>
                <td className="py-3 px-4">O(V)</td>
                <td className="py-3 px-4 font-sans text-gray-500">Nearest-next delivery scheduling</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-gray-900 font-sans">Input Baseline Comparator</td>
                <td className="py-3 px-4">Consecutive Dijkstra runs</td>
                <td className="py-3 px-4 text-orange-600 font-semibold">O(k · (V + E) log V)</td>
                <td className="py-3 px-4">O(V)</td>
                <td className="py-3 px-4 font-sans text-gray-500">Benchmarking tour efficiency</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* System Architecture */}
      <div className="bg-white/95 backdrop-blur-md p-6 rounded-3xl border border-gray-200/80 shadow-xl shadow-gray-200/40 space-y-4">
        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <Layers className="w-5 h-5 text-[#f26522]" />
          System Architecture & Viva Flow
        </h3>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto whitespace-pre">
{`React + TypeScript Web UI (Vite + Tailwind CSS + Leaflet)
            │
            │ HTTP REST / JSON payload (POST /api/route/optimize)
            ▼
Node.js + Express.js API Server (Safe Process Runner)
            │
            │ Standard I/O (stdin: JSON request, stdout: JSON response)
            ▼
C++17 Standalone DSA Engine (route_engine.exe)
  ├── Graph Core: Adjacency list with non-negative weights
  ├── Dijkstra: std::priority_queue min-heap path reconstruction
  ├── Greedy Optimizer: Successive candidate evaluations
  └── Trace Generator: Machine-readable step-by-step logs`}
        </div>
      </div>
    </div>
  );
};