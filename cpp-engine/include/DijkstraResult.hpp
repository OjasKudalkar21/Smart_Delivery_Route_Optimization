#ifndef DIJKSTRA_RESULT_HPP
#define DIJKSTRA_RESULT_HPP

#include <string>
#include <vector>
#include <map>
#include <limits>
#include <algorithm>

/**
 * @brief Represents a snapshot of a single relaxation or settlement step in Dijkstra's algorithm.
 * Recorded for step-by-step visualizer playback and student viva explanation.
 */
struct DijkstraStep {
    int stepNumber;                                        // Step index (1-based)
    std::string settledVertex;                             // Vertex pulled from priority queue
    double settledDistance;                                // Settled minimum distance to this vertex
    std::vector<std::pair<double, std::string>> pqState;   // Snapshot of active (distance, vertex) entries in min-heap
    std::string action;                                    // Explanation of action taken in this step
};

/**
 * @brief Reconstructed shortest path result between a specific source and destination.
 */
struct ShortestPathResult {
    std::string source;
    std::string destination;
    double totalDistance;                                  // Shortest path distance (infinity if unreachable)
    std::vector<std::string> path;                         // Ordered vertex sequence from source to destination
    bool reachable;                                        // True if a path exists
};

/**
 * @brief Complete single-source shortest path result returned by Dijkstra's algorithm.
 */
struct DijkstraResult {
    static constexpr double INF = std::numeric_limits<double>::infinity();

    std::string source;
    std::map<std::string, double> distances;               // Minimum distance to each vertex
    std::map<std::string, std::string> predecessors;       // Predecessor vertex on shortest path
    std::vector<std::string> settledOrder;                 // Order in which vertices were settled
    std::vector<std::string> unreachableVertices;          // Vertices that cannot be reached from source
    std::vector<DijkstraStep> steps;                       // Step-by-step execution trace

    /**
     * @brief Checks if a specific target vertex is reachable from the source.
     */
    bool isReachable(const std::string& destination) const {
        auto it = distances.find(destination);
        if (it == distances.end()) {
            return false;
        }
        return it->second < INF;
    }

    /**
     * @brief Returns the shortest distance to the destination.
     * Returns INF if unreachable.
     */
    double getDistance(const std::string& destination) const {
        auto it = distances.find(destination);
        if (it == distances.end()) {
            return INF;
        }
        return it->second;
    }

    /**
     * @brief Reconstructs the complete vertex-by-vertex path to a destination.
     * @param destination Target vertex ID.
     * @return ShortestPathResult containing totalDistance, ordered path vector, and reachability flag.
     */
    ShortestPathResult getPathTo(const std::string& destination) const {
        ShortestPathResult result;
        result.source = source;
        result.destination = destination;

        if (!isReachable(destination)) {
            result.totalDistance = INF;
            result.reachable = false;
            return result;
        }

        result.totalDistance = distances.at(destination);
        result.reachable = true;

        if (source == destination) {
            result.path.push_back(source);
            return result;
        }

        // Trace backward from destination to source using predecessors
        std::string current = destination;
        while (!current.empty() && current != source) {
            result.path.push_back(current);
            auto it = predecessors.find(current);
            if (it == predecessors.end()) {
                break; // Broken predecessor chain (should not occur if reachable)
            }
            current = it->second;
        }
        result.path.push_back(source);
        std::reverse(result.path.begin(), result.path.end());

        return result;
    }
};

#endif // DIJKSTRA_RESULT_HPP
