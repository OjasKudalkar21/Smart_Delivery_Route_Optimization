# RoutePilot: Viva Defense & Demonstration Guide
> **Smart Delivery Route Optimization System Using Graphs and Greedy Algorithms**  
> *College Data Structures & Algorithms (DSA) Capstone Project*

---

## 1. Project Overview for the Viva Examiner

### Problem Statement
Delivery logistics require vehicles to start from an origin warehouse, visit a collection of required delivery locations, and navigate road intersections while minimizing total travel distance. Calculating the exact globally optimal route across multiple stops is an instance of the **Travelling Salesperson Problem (TSP)**, an NP-hard combinatorial optimization problem.

### Solution Architecture
RoutePilot solves this challenge through a clean 3-tier architecture:
1. **DSA Algorithm Engine (C++17):** Implements graph data structures from scratch (Adjacency List), Breadth-First Search (BFS), Depth-First Search (DFS), Dijkstra's Shortest Path Algorithm, and a Greedy Nearest-Unvisited-Neighbor heuristic.
2. **API Middleware (Node.js & Express):** Enforces input validation, limits input size, and safely streams structured JSON requests into the compiled C++ executable via standard I/O (no shell execution).
3. **Interactive Dashboard (React 19, TypeScript & Leaflet):** Provides interactive route planning, side-by-side strategy comparisons, step-by-step algorithm playback, and OpenStreetMap visual overlays with numbered stop badges.

---

## 2. 5-Minute Live Demonstration Walkthrough

Follow these steps when presenting to the project evaluators:

### Step 1: Launch the System
```powershell
.\start_all.bat
```
- Point out the **`C++17 Engine (Live)`** indicator badge in the top navigation bar.
- Explain that the UI is communicating with a compiled native C++ binary running in background IPC.

### Step 2: Graph Representation & Sample Delivery Network
- Navigate to the **Dashboard** tab.
- Point to the **Interactive Route Map**:
  - Show the **Depot (Warehouse)** marked with the green emblem.
  - Show the fainter dashed lines representing road edges with distances in kilometers (hover to show road names like *Main Ave* or *Harbor Blvd*).

### Step 3: Run Greedy Route Optimization
- In the **Route Planner** panel, select 3 delivery stops: `Downtown`, `Harbor`, and `Airport`.
- Click **Optimize Route**.
- Show the results:
  - Sequence: `Warehouse -> Downtown (3.2 km) -> Harbor (3.8 km) -> Airport (6.2 km)`.
  - Total Distance: `21.8 km`.
  - Notice the numbered pins `#1`, `#2`, `#3` and the highlighted polyline on the Leaflet map.

### Step 4: Baseline Comparison & Viva Proof
- Click **Compare with Baseline**.
- Point out the comparison metrics:
  - **Greedy Route:** Visits nearest available neighbor at each step.
  - **Baseline Route:** Visited in raw user-input sequence.
  - **Distance Saved:** Real-time distance savings and percentage calculation.
- **Viva Examiner Note:** Highlight that greedy is a *heuristic approximation*. Refer to the academic counterexample where greedy selects a local trap (`8.0 km` vs globally optimal `7.0 km`).

### Step 5: DSA Visualizer (BFS, DFS & Candidate Selection)
- Click the **DSA Visualizer** tab:
  - **BFS Tab:** Shows level-by-level queue exploration, hop distances from warehouse, and predecessor tree.
  - **DFS Tab:** Shows recursive/stack exploration, discovery and finish timestamps, and cycle detection (`hasCycle: true`).
  - **Greedy Decisions Tab:** Displays exact candidate distances evaluated by C++ at every delivery hop.

---

## 3. Anticipated Viva Questions & Technical Answers

### Q1: Why did you choose an Adjacency List over an Adjacency Matrix?
**Answer:**  
Road delivery networks are **sparse graphs** where each intersection typically connects to only 2 to 4 adjacent roads ($E \ll V^2$).
- **Adjacency List Space:** $O(V + E)$ vs Matrix $O(V^2)$. For 10,000 intersections, an adjacency list uses only a few hundred kilobytes, while a matrix would require $10,000^2 \times 8 \text{ bytes} \approx 800\text{ MB}$.
- **Neighbor Iteration:** Iterating through neighbors in an adjacency list takes $O(\text{deg}(u))$ rather than checking all $V$ entries in a row $O(V)$.

### Q2: How does your Dijkstra implementation achieve $O((V + E) \log V)$ time complexity?
**Answer:**  
We implemented Dijkstra's algorithm using a min-priority queue (`std::priority_queue<std::pair<double, std::string>, ..., std::greater<...>>`).
1. Distances to all vertices are initialized to $\infty$, with `dist[start] = 0`.
2. At each step, the vertex $u$ with the minimum tentative distance is popped from the heap in $O(\log V)$.
3. For each adjacent edge $(u, v)$ with weight $w$, we perform edge relaxation:
   $$\text{if } \text{dist}[u] + w < \text{dist}[v] \implies \text{dist}[v] = \text{dist}[u] + w$$
4. Stale heap entries are pruned using an `if (currentDist > dist[u]) continue;` check.
5. Predecessors are tracked in `predecessors[v] = u` so the exact sequence of road segments can be reconstructed via backward traversal.

### Q3: Why does Dijkstra's algorithm fail with negative edge weights?
**Answer:**  
Dijkstra's algorithm relies on the **greedy assumption** that once a vertex has been extracted from the min-heap, its calculated shortest distance is final and optimal. If negative edge weights were permitted, visiting a later node could theoretically reduce an already finalized distance, violating the correctness invariant. Our implementation validates all inputs and explicitly rejects negative weights ($w < 0$).

### Q4: Is the Greedy Route Optimizer guaranteed to find the absolute shortest delivery route?
**Answer:**  
**No, and this is an essential theoretical distinction for a college DSA project.**  
Multi-stop route planning is an instance of the Metric Travelling Salesperson Problem (TSP), which is **NP-hard**. The nearest-unvisited-neighbor strategy is a **greedy heuristic**:
- It selects the local minimum at each step without global foresight.
- In `tests/test_route_optimizer.cpp`, we implemented an explicit test case proving this:
  - A graph with vertices `Warehouse`, `Stop_A`, `Stop_B`, `Stop_C`.
  - Greedy choice: `Warehouse -> Stop_A -> Stop_C -> Stop_B` = **8.0 km**.
  - Globally optimal tour: `Warehouse -> Stop_B -> Stop_A -> Stop_C` = **7.0 km**.
  - The greedy route is 14.3% longer than the true optimum because the nearest local step forced a long return leg at the end.

### Q5: How is communication handled between Node.js and C++? Why not run algorithms in JavaScript?
**Answer:**  
For a Computer Science DSA assessment, implementing algorithms in JavaScript would defeat the rigor of memory and data structure management.
1. The algorithms are implemented in native **C++17** using STL containers.
2. The Node.js Express server acts as an API gateway. It invokes `route_engine.exe` using `child_process.spawn` (without shell interpretation to eliminate shell injection vulnerabilities).
3. Payloads are passed via standard input (`stdin`) as compact JSON, and responses are streamed back over standard output (`stdout`).
4. Diagnostic logs are piped strictly to standard error (`stderr`), keeping standard output pure and reliably parseable.
5. An execution watchdog timer ensures the process is terminated if it exceeds 8,000 ms.

---

## 4. Algorithmic Complexity Reference Table

| Algorithm | Primary Data Structures | Time Complexity | Space Complexity | Purpose in RoutePilot |
| :--- | :--- | :---: | :---: | :--- |
| **Graph Construction** | `std::unordered_map`, `std::vector` | $O(V + E)$ | $O(V + E)$ | Builds road network from JSON or sample fixtures. |
| **BFS Traversal** | `std::queue<std::string>`, visited set | $O(V + E)$ | $O(V)$ | Evaluates minimum road hops and reachability. |
| **DFS Traversal** | `std::stack` / Recursion, timestamps | $O(V + E)$ | $O(V)$ | Connectivity analysis and road network cycle detection. |
| **Dijkstra Shortest Path** | Binary Min-Heap (`std::priority_queue`) | $O((V + E) \log V)$ | $O(V)$ | Computes minimum road distance between two locations. |
| **Greedy TSP Ordering** | Successive Dijkstra runs ($k$ stops) | $O(k \cdot (V + E) \log V)$ | $O(V)$ | Selects nearest unvisited delivery location sequentially. |
| **Baseline Route** | Consecutive Dijkstra runs ($k$ stops) | $O(k \cdot (V + E) \log V)$ | $O(V)$ | Calculates travel distance of raw user input sequence. |

---

## 5. Automated Test Suite Summary

To run all automated verification suites for the viva panel:
```powershell
.\tests\run_all_project_tests.bat
```

| Component | Test File | Assertions | Status |
| :--- | :--- | :---: | :---: |
| **Graph Core (BFS/DFS)** | `tests/test_graph_core.cpp` | 58/58 | **100% Passed** |
| **Dijkstra & Pathfinding** | `tests/test_dijkstra.cpp` | 48/48 | **100% Passed** |
| **Greedy Optimizer & Viva Proof** | `tests/test_route_optimizer.cpp` | 37/37 | **100% Passed** |
| **Engine JSON Stdin/Stdout** | `tests/test_engine_interface.cpp` | 65/65 | **100% Passed** |
| **Express Backend API** | `backend/tests/api.test.js` | 35/35 | **100% Passed** |
| **Frontend TypeScript Build** | `frontend/src/` | 0 errors | **100% Passed** |
| **TOTAL** | — | **243/243** | **100% PASS** |
