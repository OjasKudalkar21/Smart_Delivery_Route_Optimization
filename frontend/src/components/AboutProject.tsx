import React from 'react';
import { Cpu, ShieldAlert, Award, Network, Layers } from 'lucide-react';

export const AboutProject: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-3 relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold">
          <Award className="w-3.5 h-3.5" />
          <span>College DSA Viva & Project Reference</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Smart Delivery Route Optimization System
        </h1>
        <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
          A hybrid algorithmic system combining a native <strong>C++17 Data Structures & Algorithms Engine</strong> with a modern web dashboard. Delivery destinations are modeled as graph vertices, and roads as weighted edges. The system evaluates shortest paths via <strong>Dijkstra's Algorithm</strong>, analyzes graph reachability using <strong>BFS & DFS</strong>, and applies a <strong>Greedy Nearest-Neighbor heuristic</strong> to schedule delivery tours.
        </p>
      </div>

      {/* Grid of Key Concepts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Core DSA Data Structures */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Network className="w-5 h-5 text-indigo-400" />
            Core Data Structures (C++ STL)
          </h3>
          <ul className="space-y-3 text-xs text-slate-300 leading-relaxed">
            <li className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <strong className="text-indigo-300">Graph Adjacency List:</strong>{' '}
              Implemented with <code>std::unordered_map&lt;std::string, std::vector&lt;Edge&gt;&gt;</code> for $O(1)$ average vertex lookup and efficient sparse edge iterations.
            </li>
            <li className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <strong className="text-indigo-300">Min-Priority Queue:</strong>{' '}
              Used in Dijkstra's shortest path via <code>std::priority_queue&lt;Pair, std::vector, std::greater&gt;</code> to achieve $O((V+E)\log V)$ optimal vertex settling.
            </li>
            <li className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <strong className="text-indigo-300">BFS FIFO Queue & DFS Stack:</strong>{' '}
              <code>std::queue</code> for level-by-level hop exploration and <code>std::stack</code> for cycle detection and reachability checks.
            </li>
          </ul>
        </div>

        {/* Viva Proof: Why Greedy is NOT Globally Optimal */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            Viva Critical Concept: Heuristic Limitation
          </h3>
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-slate-200 space-y-2">
            <p className="font-semibold text-amber-300">
              Why doesn't the Greedy heuristic always yield the optimal route?
            </p>
            <p className="leading-relaxed text-slate-300">
              The multi-stop delivery problem is a variation of the <strong>Travelling Salesperson Problem (TSP)</strong>, which is <em>NP-hard</em>. The greedy algorithm selects the locally nearest unvisited destination at each step.
            </p>
            <p className="leading-relaxed text-slate-300">
              <strong>Counterexample Verified in C++ Engine Test:</strong><br/>
              Depot to Stop A = 1 km, Depot to Stop B = 2 km, Stop A to Stop C = 3 km, Stop B to Stop A = 2 km, Stop A to Stop C = 3 km.<br/>
              Greedy chooses Depot &rarr; A (1 km) &rarr; C (3 km) &rarr; B (4 km) = <strong>8 km total</strong>.<br/>
              Global optimum is Depot &rarr; B (2 km) &rarr; A (2 km) &rarr; C (3 km) = <strong>7 km total</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Algorithmic Complexity Table */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Cpu className="w-5 h-5 text-cyan-400" />
          Time & Space Complexity Reference
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Algorithm</th>
                <th className="py-3 px-4">Underlying Data Structure</th>
                <th className="py-3 px-4">Time Complexity</th>
                <th className="py-3 px-4">Space Complexity</th>
                <th className="py-3 px-4">Role in RoutePilot</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              <tr>
                <td className="py-3 px-4 font-bold text-white font-sans">Breadth-First Search (BFS)</td>
                <td className="py-3 px-4">Queue (std::queue)</td>
                <td className="py-3 px-4 text-emerald-400">O(V + E)</td>
                <td className="py-3 px-4">O(V)</td>
                <td className="py-3 px-4 font-sans text-slate-400">Unweighted hop analysis</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-white font-sans">Depth-First Search (DFS)</td>
                <td className="py-3 px-4">Stack / Recursion</td>
                <td className="py-3 px-4 text-emerald-400">O(V + E)</td>
                <td className="py-3 px-4">O(V)</td>
                <td className="py-3 px-4 font-sans text-slate-400">Cycle & component exploration</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-white font-sans">Dijkstra's Algorithm</td>
                <td className="py-3 px-4">Min-Heap (std::priority_queue)</td>
                <td className="py-3 px-4 text-indigo-400">O((V + E) log V)</td>
                <td className="py-3 px-4">O(V)</td>
                <td className="py-3 px-4 font-sans text-slate-400">Single-source shortest road paths</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-white font-sans">Greedy Route Optimizer</td>
                <td className="py-3 px-4">k successive Dijkstra runs</td>
                <td className="py-3 px-4 text-purple-400">O(k · (V + E) log V)</td>
                <td className="py-3 px-4">O(V)</td>
                <td className="py-3 px-4 font-sans text-slate-400">Nearest-next delivery scheduling</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-white font-sans">Input Baseline Comparator</td>
                <td className="py-3 px-4">Consecutive Dijkstra runs</td>
                <td className="py-3 px-4 text-purple-400">O(k · (V + E) log V)</td>
                <td className="py-3 px-4">O(V)</td>
                <td className="py-3 px-4 font-sans text-slate-400">Benchmarking tour efficiency</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* System Architecture */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-400" />
          System Architecture & Viva Flow
        </h3>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto whitespace-pre">
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
