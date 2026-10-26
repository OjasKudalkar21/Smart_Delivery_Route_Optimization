#ifndef TRAVERSAL_RESULTS_HPP
#define TRAVERSAL_RESULTS_HPP

#include <string>
#include <vector>
#include <map>

/**
 * @brief Captures a single discrete step during a graph traversal algorithm.
 * Useful for the frontend visualizer playback and viva explanation.
 */
struct TraversalStep {
    int stepNumber;                          // 1-based step sequence number
    std::string currentVertex;               // Vertex being processed at this step
    std::vector<std::string> containerState; // Snapshot of Queue (BFS) or Stack (DFS)
    std::string action;                      // Explanation (e.g., "De-queued Downtown, exploring neighbors")
};

/**
 * @brief Results returned by Breadth-First Search (BFS).
 * BFS operates on the unweighted topology to find fewest-edge paths.
 */
struct BFSTraversalResult {
    std::string startVertex;
    std::vector<std::string> visitedOrder;              // Sequence of vertices as visited
    std::map<std::string, int> hopLevels;               // Shortest distance in number of edges from start
    std::map<std::string, std::string> predecessors;    // Parent node in the BFS tree
    std::vector<std::string> unreachableVertices;       // Nodes in graph not reachable from start
    std::vector<TraversalStep> steps;                   // Step-by-step trace for visualization
};

/**
 * @brief Results returned by Depth-First Search (DFS).
 * DFS explores deeply along branches, detecting cycles and connectivity.
 */
struct DFSTraversalResult {
    std::string startVertex;
    std::vector<std::string> visitedOrder;              // Sequence of vertices as visited
    std::map<std::string, int> discoveryTimes;          // Timestamp when vertex was first encountered
    std::map<std::string, int> finishTimes;             // Timestamp when vertex exploration finished
    std::map<std::string, std::string> predecessors;    // Parent node in the DFS tree
    std::vector<std::string> unreachableVertices;       // Nodes in graph not reachable from start
    std::vector<TraversalStep> steps;                   // Step-by-step trace for visualization
    bool hasCycle = false;                              // True if a back-edge / cycle was detected
};

#endif // TRAVERSAL_RESULTS_HPP
