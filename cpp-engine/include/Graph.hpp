#ifndef GRAPH_HPP
#define GRAPH_HPP

#include "Vertex.hpp"
#include "Edge.hpp"
#include "TraversalResults.hpp"
#include "DijkstraResult.hpp"

#include <string>
#include <vector>
#include <map>
#include <stdexcept>

/**
 * @brief Adjacency-list based Graph representation for the delivery network.
 * 
 * Supports:
 * - Deterministic vertex and edge storage using std::map
 * - Non-negative weighted edges
 * - Input validation for missing endpoints and negative weights
 * - Unweighted BFS traversal for minimum-hop path exploration
 * - DFS traversal with cycle detection and connectivity analysis
 */
class Graph {
private:
    // Vertices indexed by unique ID, ordered alphabetically for deterministic behavior
    std::map<std::string, Vertex> vertices_;

    // Adjacency list: maps vertex ID to list of outgoing edges (sorted deterministically)
    std::map<std::string, std::vector<Edge>> adjList_;

    // Helper for recursive DFS
    void dfsRecursiveHelper(const std::string& current,
                            const std::string& parent,
                            std::map<std::string, bool>& visited,
                            std::map<std::string, bool>& inStack,
                            int& timer,
                            DFSTraversalResult& result) const;

public:
    Graph() = default;

    /**
     * @brief Adds a vertex to the graph.
     * @param vertex The Vertex instance to add.
     * @return true if added, false if a vertex with the same ID already exists.
     */
    bool addVertex(const Vertex& vertex);

    /**
     * @brief Convenience overload to add a vertex by properties.
     */
    bool addVertex(const std::string& id, const std::string& name = "", double lat = 0.0, double lon = 0.0);

    /**
     * @brief Checks if a vertex exists in the graph.
     */
    bool hasVertex(const std::string& id) const;

    /**
     * @brief Retrieves a vertex by its ID. Throws std::out_of_range if not found.
     */
    const Vertex& getVertex(const std::string& id) const;

    /**
     * @brief Adds a weighted edge between two existing vertices.
     * @param from Source vertex ID.
     * @param to Target vertex ID.
     * @param weight Edge weight/distance (must be non-negative >= 0.0).
     * @param directed If false (default), adds symmetric edges in both directions.
     * @param roadName Optional road/street name.
     * @throws std::invalid_argument if either vertex does not exist or weight < 0.
     */
    bool addEdge(const std::string& from,
                 const std::string& to,
                 double weight,
                 bool directed = false,
                 const std::string& roadName = "");

    /**
     * @brief Returns outgoing edges from the specified vertex.
     * @throws std::invalid_argument if vertex does not exist.
     */
    const std::vector<Edge>& getNeighbors(const std::string& id) const;

    /**
     * @brief Returns list of all vertex IDs in deterministic order.
     */
    std::vector<std::string> getAllVertexIds() const;

    /**
     * @brief Returns total number of vertices in the graph.
     */
    size_t getVertexCount() const;

    /**
     * @brief Returns total number of directed edges in the adjacency list.
     */
    size_t getEdgeCount() const;

    /**
     * @brief Executes Breadth-First Search (BFS) from a starting vertex.
     * Operates on graph topology (unweighted) using std::queue.
     * @param startId Starting vertex ID.
     * @return BFSTraversalResult containing visited order, hop levels, and step trace.
     * @throws std::invalid_argument if start vertex does not exist.
     */
    BFSTraversalResult bfs(const std::string& startId) const;

    /**
     * @brief Executes Depth-First Search (DFS) iteratively using std::stack.
     * Explores depth-first and detects cycles.
     * @param startId Starting vertex ID.
     * @return DFSTraversalResult containing visited order, discovery/finish times, and cycle flag.
     * @throws std::invalid_argument if start vertex does not exist.
     */
    DFSTraversalResult dfs(const std::string& startId) const;

    /**
     * @brief Executes Depth-First Search (DFS) recursively.
     * Useful for comparing recursive vs explicit stack traversal in viva demos.
     */
    DFSTraversalResult dfsRecursive(const std::string& startId) const;

    /**
     * @brief Executes Dijkstra's Single-Source Shortest Path Algorithm.
     * Uses an adjacency list and std::priority_queue configured as a min-heap.
     * Strictly validates non-negative edge weights.
     * @param startId Starting source vertex ID.
     * @return DijkstraResult containing shortest distances, predecessors, settled order, and steps.
     * @throws std::invalid_argument if start vertex does not exist or graph has negative weights.
     */
    DijkstraResult dijkstra(const std::string& startId) const;

    /**
     * @brief Reconstructs the complete shortest path between source and destination.
     * @param source Starting vertex ID.
     * @param destination Target destination vertex ID.
     * @return ShortestPathResult containing total distance, ordered vertex list, and reachability.
     * @throws std::invalid_argument if source or destination does not exist.
     */
    ShortestPathResult getShortestPath(const std::string& source, const std::string& destination) const;

    /**
     * @brief Checks if the graph is connected (all vertices reachable from any arbitrary vertex).
     * For undirected graphs, this checks if the graph consists of a single connected component.
     */
    bool isConnected() const;

    /**
     * @brief Clears all vertices and edges.
     */
    void clear();
};

#endif // GRAPH_HPP
