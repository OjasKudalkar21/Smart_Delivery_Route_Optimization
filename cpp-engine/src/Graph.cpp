#include "Graph.hpp"

#include <queue>
#include <stack>
#include <algorithm>
#include <sstream>

bool Graph::addVertex(const Vertex& vertex) {
    if (vertex.id.empty()) {
        throw std::invalid_argument("Vertex ID cannot be empty.");
    }
    if (vertices_.find(vertex.id) != vertices_.end()) {
        return false; // Vertex already exists
    }
    vertices_[vertex.id] = vertex;
    adjList_[vertex.id] = std::vector<Edge>();
    return true;
}

bool Graph::addVertex(const std::string& id, const std::string& name, double lat, double lon) {
    return addVertex(Vertex(id, name, lat, lon));
}

bool Graph::hasVertex(const std::string& id) const {
    return vertices_.find(id) != vertices_.end();
}

const Vertex& Graph::getVertex(const std::string& id) const {
    auto it = vertices_.find(id);
    if (it == vertices_.end()) {
        throw std::out_of_range("Vertex with ID '" + id + "' not found in graph.");
    }
    return it->second;
}

bool Graph::addEdge(const std::string& from,
                    const std::string& to,
                    double weight,
                    bool directed,
                    const std::string& roadName) {
    if (!hasVertex(from)) {
        throw std::invalid_argument("Cannot add edge: source vertex '" + from + "' does not exist.");
    }
    if (!hasVertex(to)) {
        throw std::invalid_argument("Cannot add edge: destination vertex '" + to + "' does not exist.");
    }
    if (weight < 0.0) {
        throw std::invalid_argument("Cannot add edge: distance/weight cannot be negative (" + std::to_string(weight) + ").");
    }

    // Insert forward edge
    adjList_[from].emplace_back(to, weight, roadName);
    std::sort(adjList_[from].begin(), adjList_[from].end());

    // Insert reverse edge for undirected graphs
    if (!directed && from != to) {
        adjList_[to].emplace_back(from, weight, roadName);
        std::sort(adjList_[to].begin(), adjList_[to].end());
    }

    return true;
}

const std::vector<Edge>& Graph::getNeighbors(const std::string& id) const {
    auto it = adjList_.find(id);
    if (it == adjList_.end()) {
        throw std::invalid_argument("Vertex with ID '" + id + "' not found in graph.");
    }
    return it->second;
}

std::vector<std::string> Graph::getAllVertexIds() const {
    std::vector<std::string> ids;
    ids.reserve(vertices_.size());
    for (const auto& pair : vertices_) {
        ids.push_back(pair.first);
    }
    return ids;
}

size_t Graph::getVertexCount() const {
    return vertices_.size();
}

size_t Graph::getEdgeCount() const {
    size_t count = 0;
    for (const auto& pair : adjList_) {
        count += pair.second.size();
    }
    return count;
}

BFSTraversalResult Graph::bfs(const std::string& startId) const {
    if (!hasVertex(startId)) {
        throw std::invalid_argument("Cannot start BFS: starting vertex '" + startId + "' does not exist.");
    }

    BFSTraversalResult result;
    result.startVertex = startId;

    std::map<std::string, bool> visited;
    for (const auto& pair : vertices_) {
        visited[pair.first] = false;
    }

    std::queue<std::string> q;
    q.push(startId);
    visited[startId] = true;
    result.hopLevels[startId] = 0;

    int stepNum = 1;
    result.steps.push_back({
        stepNum++,
        startId,
        {startId},
        "Initialized BFS queue with starting vertex: " + startId
    });

    while (!q.empty()) {
        std::string current = q.front();
        q.pop();
        result.visitedOrder.push_back(current);

        // Snapshot current queue state for step recording
        std::vector<std::string> qState;
        std::queue<std::string> tempQ = q;
        while (!tempQ.empty()) {
            qState.push_back(tempQ.front());
            tempQ.pop();
        }

        result.steps.push_back({
            stepNum++,
            current,
            qState,
            "De-queued vertex '" + current + "' at level " + std::to_string(result.hopLevels[current])
        });

        const auto& neighbors = adjList_.at(current);
        for (const auto& edge : neighbors) {
            const std::string& neighbor = edge.to;
            if (!visited[neighbor]) {
                visited[neighbor] = true;
                result.hopLevels[neighbor] = result.hopLevels[current] + 1;
                result.predecessors[neighbor] = current;
                q.push(neighbor);

                // Update queue snapshot
                qState.push_back(neighbor);
                result.steps.push_back({
                    stepNum++,
                    neighbor,
                    qState,
                    "Discovered neighbor '" + neighbor + "' via edge (" + current + " -> " + neighbor +
                        ", weight: " + std::to_string(edge.weight) + "), set level to " +
                        std::to_string(result.hopLevels[neighbor]) + " and enqueued"
                });
            }
        }
    }

    // Record any unreachable vertices
    for (const auto& pair : vertices_) {
        if (!visited[pair.first]) {
            result.unreachableVertices.push_back(pair.first);
        }
    }

    return result;
}

DFSTraversalResult Graph::dfs(const std::string& startId) const {
    if (!hasVertex(startId)) {
        throw std::invalid_argument("Cannot start DFS: starting vertex '" + startId + "' does not exist.");
    }

    DFSTraversalResult result;
    result.startVertex = startId;
    result.hasCycle = false;

    std::map<std::string, bool> visited;
    for (const auto& pair : vertices_) {
        visited[pair.first] = false;
    }

    // Explicit stack storing: {vertexId, parentId}
    std::stack<std::pair<std::string, std::string>> st;
    st.push({startId, ""});

    int stepNum = 1;
    int timer = 1;

    result.steps.push_back({
        stepNum++,
        startId,
        {startId},
        "Pushed starting vertex '" + startId + "' to DFS stack"
    });

    while (!st.empty()) {
        auto topPair = st.top();
        std::string current = topPair.first;
        std::string parent = topPair.second;
        st.pop();

        if (visited[current]) {
            continue;
        }

        visited[current] = true;
        result.visitedOrder.push_back(current);
        result.discoveryTimes[current] = timer++;
        if (!parent.empty()) {
            result.predecessors[current] = parent;
        }

        // Snapshot stack state
        std::vector<std::string> stackState;
        std::stack<std::pair<std::string, std::string>> tempSt = st;
        while (!tempSt.empty()) {
            stackState.push_back(tempSt.top().first);
            tempSt.pop();
        }

        result.steps.push_back({
            stepNum++,
            current,
            stackState,
            "Popped and visited vertex '" + current + "' (discovery time: " + std::to_string(result.discoveryTimes[current]) + ")"
        });

        // Traverse neighbors in reverse order so smaller IDs are popped and processed first
        const auto& neighbors = adjList_.at(current);
        for (auto it = neighbors.rbegin(); it != neighbors.rend(); ++it) {
            const std::string& neighbor = it->to;
            if (!visited[neighbor]) {
                st.push({neighbor, current});
                stackState.push_back(neighbor);
                result.steps.push_back({
                    stepNum++,
                    neighbor,
                    stackState,
                    "Discovered unvisited neighbor '" + neighbor + "', pushed to stack"
                });
            } else if (neighbor != parent) {
                // Back-edge encountered in undirected graph -> cycle detected
                result.hasCycle = true;
            }
        }

        result.finishTimes[current] = timer++;
    }

    // Check for unreachable vertices
    for (const auto& pair : vertices_) {
        if (!visited[pair.first]) {
            result.unreachableVertices.push_back(pair.first);
        }
    }

    return result;
}

void Graph::dfsRecursiveHelper(const std::string& current,
                              const std::string& parent,
                              std::map<std::string, bool>& visited,
                              std::map<std::string, bool>& inStack,
                              int& timer,
                              DFSTraversalResult& result) const {
    visited[current] = true;
    inStack[current] = true;
    result.visitedOrder.push_back(current);
    result.discoveryTimes[current] = ++timer;
    if (!parent.empty()) {
        result.predecessors[current] = parent;
    }

    const auto& neighbors = adjList_.at(current);
    for (const auto& edge : neighbors) {
        const std::string& neighbor = edge.to;
        if (!visited[neighbor]) {
            dfsRecursiveHelper(neighbor, current, visited, inStack, timer, result);
        } else if (neighbor != parent) {
            result.hasCycle = true;
        }
    }

    inStack[current] = false;
    result.finishTimes[current] = ++timer;
}

DFSTraversalResult Graph::dfsRecursive(const std::string& startId) const {
    if (!hasVertex(startId)) {
        throw std::invalid_argument("Cannot start DFS: starting vertex '" + startId + "' does not exist.");
    }

    DFSTraversalResult result;
    result.startVertex = startId;
    result.hasCycle = false;

    std::map<std::string, bool> visited;
    std::map<std::string, bool> inStack;
    for (const auto& pair : vertices_) {
        visited[pair.first] = false;
        inStack[pair.first] = false;
    }

    int timer = 0;
    dfsRecursiveHelper(startId, "", visited, inStack, timer, result);

    for (const auto& pair : vertices_) {
        if (!visited[pair.first]) {
            result.unreachableVertices.push_back(pair.first);
        }
    }

    return result;
}

bool Graph::isConnected() const {
    if (vertices_.empty()) {
        return true;
    }
    // Start from the first vertex in alphabetical order
    std::string start = vertices_.begin()->first;
    BFSTraversalResult res = bfs(start);
    return res.unreachableVertices.empty();
}

DijkstraResult Graph::dijkstra(const std::string& startId) const {
    if (!hasVertex(startId)) {
        throw std::invalid_argument("Cannot start Dijkstra: starting vertex '" + startId + "' does not exist.");
    }

    DijkstraResult result;
    result.source = startId;

    // Initialize all distances to infinity and settled state to false
    std::map<std::string, double> dist;
    std::map<std::string, bool> settled;
    for (const auto& pair : vertices_) {
        dist[pair.first] = DijkstraResult::INF;
        settled[pair.first] = false;
    }

    // Min-priority queue: stores {distance, vertexId}
    // std::greater sorts smallest distance first; ties broken alphabetically by vertex ID
    using PQElement = std::pair<double, std::string>;
    std::priority_queue<PQElement, std::vector<PQElement>, std::greater<PQElement>> pq;

    dist[startId] = 0.0;
    pq.push({0.0, startId});

    int stepNum = 1;
    result.steps.push_back({
        stepNum++,
        startId,
        0.0,
        {{0.0, startId}},
        "Initialized Dijkstra min-priority queue with source vertex '" + startId + "' at distance 0.0"
    });

    while (!pq.empty()) {
        auto topPair = pq.top();
        double d = topPair.first;
        std::string u = topPair.second;
        pq.pop();

        // Skip stale entries where a shorter path has already been processed
        if (d > dist[u]) {
            continue;
        }

        if (settled[u]) {
            continue;
        }
        settled[u] = true;
        result.settledOrder.push_back(u);

        // Snapshot current priority queue for step logging
        std::vector<PQElement> pqSnapshot;
        auto tempPQ = pq;
        while (!tempPQ.empty()) {
            pqSnapshot.push_back(tempPQ.top());
            tempPQ.pop();
        }

        result.steps.push_back({
            stepNum++,
            u,
            dist[u],
            pqSnapshot,
            "Settled vertex '" + u + "' with optimal shortest distance " + std::to_string(dist[u])
        });

        // Relax all outgoing edges from vertex u
        const auto& neighbors = adjList_.at(u);
        for (const auto& edge : neighbors) {
            if (edge.weight < 0.0) {
                throw std::invalid_argument("Negative edge weight encountered: Dijkstra does not support negative weights.");
            }

            const std::string& v = edge.to;
            double weight = edge.weight;
            double newDist = dist[u] + weight;

            // Relaxation condition
            if (newDist < dist[v]) {
                dist[v] = newDist;
                result.predecessors[v] = u;
                pq.push({newDist, v});

                pqSnapshot.push_back({newDist, v});
                result.steps.push_back({
                    stepNum++,
                    v,
                    newDist,
                    pqSnapshot,
                    "Relaxed edge (" + u + " -> " + v + ", weight: " + std::to_string(weight) +
                        "): updated distance to " + std::to_string(newDist) + " and pushed to min-heap"
                });
            }
        }
    }

    result.distances = dist;

    // Detect and record unreachable vertices
    for (const auto& pair : vertices_) {
        if (dist[pair.first] == DijkstraResult::INF) {
            result.unreachableVertices.push_back(pair.first);
        }
    }

    return result;
}

ShortestPathResult Graph::getShortestPath(const std::string& source, const std::string& destination) const {
    if (!hasVertex(source)) {
        throw std::invalid_argument("Cannot find shortest path: source vertex '" + source + "' does not exist.");
    }
    if (!hasVertex(destination)) {
        throw std::invalid_argument("Cannot find shortest path: destination vertex '" + destination + "' does not exist.");
    }

    DijkstraResult dijkstraRes = dijkstra(source);
    return dijkstraRes.getPathTo(destination);
}

void Graph::clear() {
    vertices_.clear();
    adjList_.clear();
}
