# Smart Delivery Route Optimization System (RoutePilot)
> **A College Data Structures & Algorithms (DSA) Project featuring a C++17 Algorithm Engine and a Modern Web Dashboard**

---

## 1. Project Overview

**RoutePilot** is a delivery route planning and visualization system. Delivery companies need to visit multiple destinations while minimizing travel distance and maximizing delivery efficiency. 

This project models delivery locations as vertices and roads as weighted edges in a graph. Rather than delegating algorithm execution to third-party APIs or high-level scripting languages, **all core DSA algorithms are implemented from scratch in modular C++17 (using STL data structures)**:
- **Graph Representation:** Adjacency list representation with non-negative edge weights (undirected by default).
- **Breadth-First Search (BFS):** Unweighted graph traversal and hop-distance calculation.
- **Depth-First Search (DFS):** Connectivity analysis, cycle exploration, and reachability.
- **Dijkstra's Algorithm:** Single-source shortest path calculation using a binary min-priority queue (`std::priority_queue`).
- **Greedy Route Ordering:** Nearest-unvisited-neighbor heuristic starting from the warehouse, reporting exact leg paths and detecting unreachable stops.
- **Baseline Comparison:** Direct user-input order route comparison against the greedy heuristic.

A web application (React, TypeScript, Vite, Tailwind CSS, Leaflet) connects to a Node.js/Express backend to trigger the C++ executable, inspect step-by-step algorithm execution traces, and visualize routes on an interactive map.

---

## 2. Architecture

```text
+-------------------------------------------------------+
|              React + TypeScript Frontend              |
|        (Vite, Tailwind CSS, Lucide Icons, Leaflet)    |
+-------------------------------------------------------+
                           |
                           | HTTP REST / JSON
                           v
+-------------------------------------------------------+
|                 Node.js + Express API                 |
|             (Input validation, Process runner)        |
+-------------------------------------------------------+
                           |
                           | Standard I/O / JSON
                           v
+-------------------------------------------------------+
|                   C++17 DSA Engine                    |
|      (Adjacency List, BFS, DFS, Dijkstra, Greedy)     |
+-------------------------------------------------------+
```

### Component Responsibilities
- **Frontend (`frontend/`):** Collects warehouse/delivery stop inputs, validates parameters, renders interactive map layers with numbered route stops, and provides visual step-by-step algorithm playback.
- **Backend API (`backend/`):** Validates incoming requests, invokes the native C++ executable safely without shell interpolation, captures execution output and diagnostics, and returns standardized JSON responses.
- **DSA Engine (`cpp-engine/`):** Implements all graph representations and routing algorithms. Provides full execution traces and deterministically handles edge cases (disconnected vertices, isolated nodes, cycles).
- **Sample Data (`data/`):** Predefined test graphs, delivery coordinates, and benchmark fixtures for demonstration without requiring external internet access.
- **Tests (`tests/`):** Unit and integration test suites validating algorithm correctness, edge cases, and JSON interface contracts.

---

## 3. Directory Structure

```text
Smart_Delivery_Route/
├── Smart_Delivery_Route_Optimization_Plan.md  # Master phased project specification
├── README.md                                  # Setup guide, architecture, and documentation
├── .gitignore                                 # Git ignore rules for Node, C++, and build output
├── frontend/                                  # React + TypeScript + Vite web dashboard (Phase 5)
├── backend/                                   # Express.js REST API server (Phase 6)
├── cpp-engine/                                # C++17 graph data structures and algorithms (Phases 1-4)
├── data/                                      # Sample graph fixtures and benchmark files
└── tests/                                     # Automated test scripts and test fixtures
```

---

## 4. Prerequisites & Environment Setup

### 4.1 C++ Compiler Requirements
- **Standard:** C++17 or later
- **Recommended Compilers:**
  - **GCC / MinGW:** `g++` (version 6.3.0 or higher with `-std=c++17` / `-std=c++1z`)
  - **Clang:** `clang++` (version 5.0 or higher with `-std=c++17`)
  - **MSVC:** Visual Studio 2017+ (MSVC 19.14+) with `/std:c++17`
- **Verification Command:**
  ```powershell
  g++ --version
  ```

### 4.2 Node.js Requirements
- **Node.js:** v18.0.0 or higher (v24.x supported)
- **Package Manager:** `npm` v9.0.0 or higher
- **Windows PowerShell Note:** If PowerShell execution policy restricts running `.ps1` scripts, use `npm.cmd` explicitly in the command line:
  ```powershell
  node -v
  npm.cmd -v
  ```

---

## 5. Phased Implementation Roadmap

Development strictly follows the phased approach defined in [`Smart_Delivery_Route_Optimization_Plan.md`](Smart_Delivery_Route_Optimization_Plan.md):

| Phase | Description | Status |
| :---: | :--- | :---: |
| **Phase 0** | Workspace inspection, repository skeleton, and setup documentation | **Completed** |
| **Phase 1** | C++ Graph Core (Adjacency list, validation, BFS & DFS implementations and tests) | **Completed** |
| **Phase 2** | Dijkstra's Shortest Path Algorithm & Path Reconstruction | **Completed** |
| **Phase 3** | Greedy Route Optimization Heuristic & Baseline Order Comparison | **Completed** |
| **Phase 4** | Machine-readable C++ JSON Interface & Build Automation | **Completed** |
| **Phase 5** | Frontend Shell (React, TypeScript, Tailwind CSS, Lucide icons) | *Next Up* |
| **Phase 6** | Express API Server & C++ Process Integration | Pending |
| **Phase 7** | Interactive Leaflet Map Visualization & Stop Sequencing | Pending |
| **Phase 8** | Optional Real Road Routing Integration (OSRM / Distance Matrix) | Optional |
| **Phase 9** | Final End-to-End Testing, Documentation, & Viva Demo Script | Pending |

---

## 6. Building the Standalone C++ Engine Executable

To compile the standalone `route_engine.exe` binary used by the Express backend API:

```powershell
# Using the Windows batch script
.\cpp-engine\build.bat

# Or direct compilation with MinGW g++
g++ -std=c++17 -O2 -Wall -Wextra -Wl,--nxcompat,--dynamicbase -I cpp-engine/include cpp-engine/src/Graph.cpp cpp-engine/src/SampleData.cpp cpp-engine/src/RouteOptimizer.cpp cpp-engine/src/EngineHandler.cpp cpp-engine/src/main.cpp -o cpp-engine/bin/route_engine.exe
```

Test the executable directly via standard I/O:
```powershell
'{"action":"health"}' | .\cpp-engine\bin\route_engine.exe
'{"action":"get_sample_graph"}' | .\cpp-engine\bin\route_engine.exe
'{"action":"optimize_route","start":"Warehouse","destinations":["Downtown","Harbor","Airport"]}' | .\cpp-engine\bin\route_engine.exe
```

---

## 7. Running Tests

### Phase 1 Tests: C++ Graph Core, BFS, DFS, and Validation
To compile and execute the Phase 1 test suite:

```powershell
# Using the Windows batch script
.\tests\run_phase1_tests.bat

# Or using PowerShell
powershell -ExecutionPolicy Bypass -File .\tests\run_phase1_tests.ps1

# Or compiling directly with g++
g++ -std=c++17 -Wall -Wextra -Wl,--nxcompat,--dynamicbase -I cpp-engine/include cpp-engine/src/Graph.cpp cpp-engine/src/SampleData.cpp tests/test_graph_core.cpp -o tests/test_graph_core.exe
.\tests\test_graph_core.exe
```

### Phase 2 Tests: Dijkstra's Algorithm & Path Reconstruction
To compile and execute the Phase 2 Dijkstra test suite:

```powershell
# Using the Windows batch script
.\tests\run_phase2_tests.bat

# Or using PowerShell
powershell -ExecutionPolicy Bypass -File .\tests\run_phase2_tests.ps1

# Or compiling directly with g++
g++ -std=c++17 -Wall -Wextra -Wl,--nxcompat,--dynamicbase -I cpp-engine/include cpp-engine/src/Graph.cpp cpp-engine/src/SampleData.cpp tests/test_dijkstra.cpp -o tests/test_dijkstra.exe
.\tests\test_dijkstra.exe
```

### Phase 3 Tests: Greedy Route Optimization & Baseline Comparison
To compile and execute the Phase 3 Route Optimizer test suite:

```powershell
# Using the Windows batch script
.\tests\run_phase3_tests.bat

# Or using PowerShell
powershell -ExecutionPolicy Bypass -File .\tests\run_phase3_tests.ps1

# Or compiling directly with g++
g++ -std=c++17 -Wall -Wextra -Wl,--nxcompat,--dynamicbase -I cpp-engine/include cpp-engine/src/Graph.cpp cpp-engine/src/SampleData.cpp cpp-engine/src/RouteOptimizer.cpp tests/test_route_optimizer.cpp -o tests/test_route_optimizer.exe
.\tests\test_route_optimizer.exe
```

### Phase 4 Tests: Engine JSON Interface, Custom Graphs & Error Recovery
To compile and execute the Phase 4 Engine Interface test suite:

```powershell
# Using the Windows batch script
.\tests\run_phase4_tests.bat

# Or using PowerShell
powershell -ExecutionPolicy Bypass -File .\tests\run_phase4_tests.ps1

# Or compiling directly with g++
g++ -std=c++17 -Wall -Wextra -Wl,--nxcompat,--dynamicbase -I cpp-engine/include cpp-engine/src/Graph.cpp cpp-engine/src/SampleData.cpp cpp-engine/src/RouteOptimizer.cpp cpp-engine/src/EngineHandler.cpp tests/test_engine_interface.cpp -o tests/test_engine_interface.exe
.\tests\test_engine_interface.exe
```

### Run All Test Suites (Phases 1 - 4)
```powershell
.\tests\run_all_tests.bat
```

---

## 8. Algorithmic Complexity Reference

| Algorithm | Data Structure | Time Complexity | Space Complexity |
| :--- | :--- | :---: | :---: |
| **Breadth-First Search (BFS)** | Adjacency List + Queue (`std::queue`) | $O(V + E)$ | $O(V)$ |
| **Depth-First Search (DFS)** | Adjacency List + Recursion / Stack (`std::stack`) | $O(V + E)$ | $O(V)$ |
| **Dijkstra's Shortest Path** | Adjacency List + Min-Priority Queue (`std::priority_queue`) | $O((V + E) \log V)$ | $O(V)$ |
| **Greedy Route Selection** | Successive Dijkstra runs ($k$ delivery stops) | $O(k \cdot (V + E) \log V)$ | $O(V)$ |
| **Baseline Order Route** | Consecutive Dijkstra runs across ordered stops | $O(k \cdot (V + E) \log V)$ | $O(V)$ |

*Note on Heuristic Limitation:* The greedy nearest-neighbor strategy is an approximation heuristic for the Travelling Salesperson Problem (TSP) and does not guarantee a globally optimal minimum tour.
