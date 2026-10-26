# Smart Delivery Route Optimization System
## Phased Project Plan for Antigravity

> **Project type:** College DSA project with a web frontend and C++ algorithm engine  
> **Working title:** Smart Delivery Route Optimization System Using Graphs and Greedy Algorithms  
> **Development approach:** Build and verify the project phase by phase. Do not attempt to implement every feature at once.

---

## 1. Project Goal

Build a modern web-based delivery route planner that uses **C++17 for the actual DSA algorithms** and a web frontend for user interaction and visualization.

The system represents delivery locations as vertices and roads as weighted edges in a graph. A user can choose a warehouse and multiple delivery stops, run route optimization, and view the suggested stop order, route distance, algorithm steps, and a visual representation of the route.

The project should be suitable for a college DSA demonstration. Code should be readable, modular, documented, and easy to explain during a viva.

### Problem Statement

Delivery companies need to visit multiple destinations while controlling travel distance and improving delivery efficiency. Planning routes manually can be inefficient when locations are connected by different roads. This project models locations and roads as a weighted graph, uses graph traversal and shortest-path algorithms implemented in C++, and applies a greedy strategy to recommend a delivery order. A website presents the inputs, route results, and algorithm execution in an understandable visual interface.

### Objectives

- Represent locations and roads using a graph.
- Implement BFS, DFS, Dijkstra's shortest-path algorithm, and a greedy route-ordering strategy in C++.
- Display locations, routes, and results in a responsive web interface.
- Compare the greedy route against a simple baseline route.
- Visualize algorithm execution and explain time complexity.
- Optionally support real road maps and routing data after the core DSA implementation works.

---

## 2. Technology Stack

Use the following stack unless a genuine technical issue requires a documented change.

### Frontend
- **React**
- **TypeScript**
- **Vite** for the frontend development server and build
- **Tailwind CSS** for styling
- **Lucide icons** for interface icons
- **Leaflet** for interactive maps
- **OpenStreetMap** tiles for map display, with visible attribution

### Backend
- **Node.js**
- **Express.js** for REST API endpoints
- JSON for communication between the frontend, backend, and C++ engine

### DSA Engine
- **C++17**
- Standard Template Library (STL)
- `vector`, `queue`, `stack`, `priority_queue`, `unordered_map`/`map`, and other appropriate STL structures
- CMake or a documented compiler command for building the engine

### Optional Additions (only after the core project works)
- **OSRM** or another suitable routing provider for real road-route geometry and distance/duration data
- **SQLite** for saving delivery plans and route history
- A Binary Search Tree (BST) module if the course assessment explicitly requires a tree data structure

### Development Environment
- Visual Studio Code
- Git, if available
- A C++ compiler compatible with C++17
- Node.js and npm

Do not add a database, authentication, cloud hosting, or other unnecessary infrastructure in the initial version.

---

## 3. Architecture

```text
React + TypeScript Frontend
        |
        | HTTP requests / JSON responses
        v
Node.js + Express API
        |
        | Validated input passed safely to the executable
        v
C++17 DSA Engine
        |
        | JSON output
        v
Express API -> Frontend results and visualizations
```

Responsibilities:

- **Frontend:** collect inputs, validate basic form values, call the API, show loading/error states, render results and map overlays.
- **Express backend:** validate incoming data, invoke the compiled C++ program safely, parse its output, and return consistent JSON.
- **C++ engine:** implement and run the graph and route algorithms. Do not reimplement the DSA algorithms in JavaScript.
- **Map layer:** render map tiles, markers, and route geometry. A map provider may supply road data, but the project's own C++ engine must remain responsible for the algorithms claimed as project implementations.

Use structured JSON input/output between the backend and C++ executable. Do not interpolate user input into a shell command. Prefer safe process execution with argument arrays or a carefully designed stdin/stdout protocol, plus input validation and timeouts.

---

## 4. DSA Requirements

### 4.1 Graph Representation
- Represent each location as a vertex.
- Represent each road as an edge.
- Store road distance as a non-negative weight.
- Use an adjacency list for the main graph representation.
- Decide and document whether the graph is directed or undirected. For the initial road network, use an undirected graph unless a one-way road is specifically modeled.
- Validate duplicate IDs, missing endpoints, invalid weights, and disconnected locations.

### 4.2 Breadth-First Search (BFS)
- Implement BFS using a queue.
- Use it to explore reachable locations and find a path with the fewest edges in an unweighted interpretation of the graph.
- Return traversal order and reachability information for visualization.
- Do not describe BFS as a shortest-distance algorithm for weighted roads.

### 4.3 Depth-First Search (DFS)
- Implement DFS recursively or with an explicit stack.
- Use it to traverse the graph and help identify reachable/disconnected areas.
- Return traversal order and relevant connectivity information.

### 4.4 Dijkstra's Algorithm
- Implement Dijkstra using an adjacency list and a min-priority queue.
- Support non-negative edge weights only.
- Return shortest distances and predecessor information so the full shortest path can be reconstructed.
- Handle unreachable vertices clearly.

### 4.5 Greedy Route Ordering
- Begin at the warehouse.
- At each step, select the nearest unvisited delivery destination using shortest-path distances from the current location.
- Reconstruct and append the road path for each selected leg.
- Repeat until all reachable requested stops have been processed.
- Report unreachable stops instead of silently omitting them.
- Return the selected stop order, each leg's path/distance, and total distance.

**Important limitation:** this greedy nearest-next-stop strategy is a heuristic. It does not guarantee the globally optimal solution to the travelling-salesperson problem. State this clearly in the UI and documentation.

### 4.6 Baseline Comparison
- Implement a simple baseline that visits destinations in the order supplied by the user.
- Calculate its route distance using shortest paths between consecutive stops.
- Compare total distances only when both routes are valid and cover the same required destinations.
- Do not claim that the greedy result is always better than the baseline.

### 4.7 Optional Tree Requirement
A tree is not essential to route optimization itself. If the course requires a tree as well as graph algorithms, add a small, separately tested BST for indexing delivery records by unique ID. Include insertion, search, traversal, and deletion only if time allows. Do not add the BST merely to make the project look more complex.

---

## 5. Planned Website Interface

Create a polished logistics dashboard with a clear visual hierarchy. Use the reference screenshot supplied by the user if it is available in the project workspace; inspect it before finalizing colors, layout, and spacing. If no reference image is available, use the design guidance below.

### Main Dashboard
- Project name/logo, e.g. **RoutePilot**
- Navigation for Dashboard, Plan Route, Algorithm Visualizer, and About
- Summary cards for total distance, number of stops, and route status
- Clean responsive layout suitable for laptop and smaller screens

### Route Planner
- Warehouse/start-location selector
- Add, edit, and remove delivery stops
- For DSA demo mode, allow selecting locations from a sample graph
- Display validation messages for missing or duplicate locations
- Primary **Optimize Route** button
- Loading and error states

### Map View
- Leaflet map with warehouse and delivery markers
- Numbered markers for delivery order
- Highlighted route line
- Fit map bounds to the route
- Legend for warehouse, delivery stops, and route
- Visible OpenStreetMap attribution

### Results Panel
- Ordered delivery sequence
- Total route distance
- Distance for each leg
- Unreachable-stop warnings
- Greedy route versus baseline comparison
- Clear explanation that results are estimates based on the supplied graph/data

### Algorithm Visualizer
- BFS traversal order
- DFS traversal order
- Dijkstra distance/predecessor results
- Greedy selection steps, including current location and candidate distances
- Play/next/reset controls if feasible
- Keep the visualizer understandable; it must display real steps from the C++ engine rather than fabricated animation.

### About Project
- Problem statement
- DSA concepts used
- Algorithm descriptions and complexities
- Technology stack
- Limitations and future enhancements

---

## 6. Phased Implementation Plan

**Rule for Antigravity:** Complete only the current phase, test it, summarize files changed and tests run, and stop for review before proceeding to the next phase. Do not skip ahead or build all phases in one pass.

### Phase 0 — Inspect Workspace and Create Project Skeleton
Tasks:
1. Inspect the current workspace before changing or deleting anything.
2. If the repository already contains work, preserve it and adapt the plan to the existing structure.
3. Create the top-level folders for `frontend`, `backend`, `cpp-engine`, `data`, and `tests`.
4. Add a root README containing setup and project goals.
5. Add a `.gitignore` for Node dependencies, build output, binaries, and local environment files.
6. Document the expected C++ compiler and Node.js requirements.

Acceptance criteria:
- Project folders and README exist.
- No existing user files have been deleted or overwritten without permission.
- Setup requirements are documented.

### Phase 1 — Implement and Test the C++ Graph Core
Tasks:
1. Define the location/vertex and weighted-edge representation.
2. Implement adjacency-list graph construction.
3. Add sample graph data with a warehouse and 5–8 delivery locations.
4. Validate edge endpoints and non-negative distances.
5. Implement BFS and DFS.
6. Add tests for normal traversal, cycles, isolated vertices, and disconnected graphs.
7. Keep algorithm code modular and include comments explaining key steps.

Acceptance criteria:
- The C++ program compiles with C++17.
- BFS and DFS return correct, deterministic traversal results for test fixtures.
- Invalid graph data produces a clear error.
- No frontend or real-map integration is needed yet.

### Phase 2 — Implement Dijkstra and Path Reconstruction
Tasks:
1. Implement Dijkstra using `priority_queue` with a min-heap comparator.
2. Store predecessor information.
3. Reconstruct a path between a source and destination.
4. Handle equal-length alternatives deterministically where practical.
5. Report unreachable destinations.
6. Add tests for known shortest distances, alternate routes, zero-weight edges if supported, and disconnected vertices.

Acceptance criteria:
- Shortest distances and reconstructed paths match manually verified test cases.
- Negative weights are rejected.
- Complexity and design are documented.

### Phase 3 — Implement Greedy Route Optimization and Baseline
Tasks:
1. Accept a start location and a list of required delivery stops.
2. Repeatedly run Dijkstra from the current location, or use a documented caching strategy, to obtain shortest-path distances.
3. Select the nearest reachable unvisited stop.
4. Reconstruct each selected leg and combine the legs into a complete route.
5. Detect and report stops that cannot be reached.
6. Implement the input-order baseline using shortest paths for each leg.
7. Return total distance, leg details, stop order, and an execution trace.
8. Add test cases where greedy is valid, where stops are unreachable, and where greedy is not globally optimal.

Acceptance criteria:
- The C++ engine can produce machine-readable results for both strategies.
- Route totals equal the sum of leg distances.
- No unreachable stop is silently treated as completed.
- Documentation states that greedy is not guaranteed to be globally optimal.

### Phase 4 — Define the C++/Backend Interface
Tasks:
1. Choose a robust interface: JSON input on stdin and JSON output on stdout, or a well-defined input/output-file protocol.
2. Keep diagnostic messages on stderr so stdout remains parseable.
3. Add a CMake configuration or documented build script.
4. Compile the engine into a known local build path.
5. Test the executable independently using sample input and output.
6. Document compiler-specific setup for Windows, if relevant.

Acceptance criteria:
- Backend-independent C++ tests still pass.
- The executable accepts valid input and returns valid structured output.
- Errors and malformed input are handled without crashing.

### Phase 5 — Build the Frontend Shell
Tasks:
1. Set up React, TypeScript, Vite, Tailwind CSS, and Lucide icons.
2. Create the navigation and responsive dashboard layout.
3. Create route input, results, comparison, and algorithm-visualizer components.
4. Use clearly labelled sample/mock results temporarily.
5. Match the supplied reference image if available; otherwise use the design in Section 5.
6. Add accessible labels, keyboard-friendly controls, and loading/error/empty states.

Acceptance criteria:
- Frontend starts locally using documented commands.
- All planned sections render and respond to user interaction.
- Mock data is clearly separated from real API data.

### Phase 6 — Build the Express API and Connect C++
Tasks:
1. Set up Node.js and Express.
2. Implement `GET /api/health`.
3. Implement `POST /api/graph/analyze`.
4. Implement `POST /api/route/optimize`.
5. Implement `POST /api/route/compare`.
6. Validate all request bodies and enforce reasonable input-size limits.
7. Invoke the C++ executable safely, with timeouts and error handling.
8. Return consistent JSON responses.
9. Connect frontend forms to the API and remove mock data from the main working flow.

Acceptance criteria:
- A user can submit route inputs in the UI and receive actual C++ results.
- Invalid inputs show understandable errors.
- No user-supplied value is interpolated into a shell command.
- API errors do not crash the server or leave the UI stuck.

### Phase 7 — Add Map Visualization
Tasks:
1. Add Leaflet and a suitable React integration if needed.
2. Render the map and markers for the selected locations.
3. Draw the route returned by the backend.
4. Number markers in the actual delivery order.
5. Fit the map to include all route points.
6. Keep map attribution visible and follow the tile provider's usage policy.
7. Start with a small, known sample graph and known coordinates.

Acceptance criteria:
- The map clearly displays warehouse, stops, and the computed route.
- The route shown corresponds to the returned ordered path.
- The application still works in DSA demo mode without an external routing service.

### Phase 8 — Optional Real Road Routing
Do this only after the DSA demo works reliably.

Tasks:
1. Add location search/geocoding through a suitable provider if required.
2. Obtain road distances and route geometry from OSRM or another permitted routing provider.
3. Convert returned data into a validated graph or distance matrix for the C++ optimizer.
4. If using a distance matrix, clearly explain that the C++ optimizer uses the matrix to select stops; it does not run Dijkstra over the provider's hidden road graph.
5. For a full custom Dijkstra over real roads, acquire an actual road-network graph and appropriate edge weights.
6. Add handling for API limits, unavailable routes, and network failures.

Acceptance criteria:
- Real-map mode is clearly distinguished from sample-graph DSA mode.
- External services are optional and their limitations are documented.
- The app remains usable in sample mode if a service is unavailable.

### Phase 9 — Final Testing, Documentation, and Demonstration
Tasks:
1. Run all C++ tests.
2. Test API endpoints and frontend-to-backend integration.
3. Test edge cases and malformed input.
4. Verify the route distance and route geometry are consistent.
5. Add screenshots only after the UI is running.
6. Complete README setup instructions, algorithm explanations, complexities, architecture, limitations, and future work.
7. Add a short demo script for project evaluation.

Acceptance criteria:
- A fresh setup can follow the README to run the project.
- Core algorithms are implemented in C++ and can be demonstrated separately.
- The website successfully invokes the C++ engine.
- Known limitations and test coverage are documented.

---

## 7. Suggested API Contract

### `GET /api/health`
Example response:
```json
{
  "status": "ok"
}
```

### `POST /api/graph/analyze`
Purpose: run BFS/DFS on a supplied or selected graph.

### `POST /api/route/optimize`
Example request:
```json
{
  "start": "Warehouse",
  "destinations": ["A", "B", "C"],
  "graph": {
    "Warehouse": [
      { "to": "A", "distance": 4 },
      { "to": "B", "distance": 7 }
    ],
    "A": [
      { "to": "Warehouse", "distance": 4 },
      { "to": "B", "distance": 2 },
      { "to": "C", "distance": 6 }
    ]
  }
}
```

The actual schema must be finalized and validated during Phase 4. Consider representing the graph as an array of vertices and edges if that makes validation and C++ parsing more reliable.

Expected response fields:
- `route`: ordered locations
- `totalDistance`: total route distance
- `legs`: each leg's source, destination, distance, and path
- `unreachableStops`: requested stops that could not be reached
- `algorithmTrace`: real steps recorded by the C++ engine
- `status`: success, partial, or error

Do not fabricate route results or animation steps on the frontend.

---

## 8. Testing Checklist

- [ ] C++ engine builds with C++17.
- [ ] BFS works on connected and disconnected graphs.
- [ ] DFS works on connected graphs, cycles, and isolated vertices.
- [ ] Dijkstra returns correct distances and reconstructs valid paths.
- [ ] Negative edge weights are rejected.
- [ ] Greedy optimizer visits every reachable requested stop once.
- [ ] Unreachable stops are reported explicitly.
- [ ] Total distance equals the sum of selected leg distances.
- [ ] Baseline and greedy comparisons cover the same requested stops.
- [ ] Frontend validates missing and duplicate inputs.
- [ ] API handles malformed JSON and process failures.
- [ ] Map markers and lines correspond to backend results.
- [ ] OpenStreetMap attribution is visible.
- [ ] The project can run in sample-graph mode without external map-routing APIs.
- [ ] README commands work from a clean setup.

---

## 9. Complexity Notes for the Report

Use these as standard expected bounds and confirm them against the final implementation.

- **BFS:** `O(V + E)`
- **DFS:** `O(V + E)`
- **Dijkstra with adjacency list and binary min-heap:** commonly `O((V + E) log V)`
- **Greedy stop selection with precomputed all-pairs distances:** `O(k^2)` for selecting the next stop, excluding the cost of computing the distances
- **Greedy with a fresh Dijkstra run for each leg:** depends on the number of runs; a straightforward implementation may perform up to `k + 1` runs

Here, `V` is the number of vertices, `E` is the number of edges, and `k` is the number of delivery stops. State the assumptions used by the actual implementation.

---

## 10. Rules for Antigravity

1. Read this plan before making code changes.
2. Work on **one phase at a time**, in the order listed.
3. Before editing, inspect the existing workspace and preserve existing work.
4. Do not replace C++ algorithms with JavaScript implementations.
5. Do not claim a phase is complete unless its acceptance criteria have been checked.
6. Run relevant tests after each phase and report the commands and results.
7. Keep code modular, readable, and appropriate for a student project.
8. Do not invent successful test results, API responses, map data, or screenshots.
9. Do not add paid services or API keys without asking first. Keep the sample-graph mode working without them.
10. At the end of each phase, provide:
    - Summary of files created/changed
    - Commands to run the project or tests
    - Tests performed and their actual results
    - Known issues or decisions needed
    - Confirmation that you have stopped before the next phase
11. Wait for the user to approve the next phase before proceeding.
12. If a requirement conflicts with the current workspace or cannot be implemented as written, explain the issue and propose a minimal adjustment instead of silently changing the plan.

---

## 11. First Instruction to Antigravity

**Start with Phase 0 only.** Inspect the workspace, preserve existing files, create the project skeleton and initial README, and report the results. Do not implement algorithms or frontend features until Phase 0 is reviewed and approved.
