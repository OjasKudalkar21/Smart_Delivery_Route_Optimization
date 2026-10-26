#ifndef ROUTE_OPTIMIZER_HPP
#define ROUTE_OPTIMIZER_HPP

#include "Graph.hpp"
#include "RouteModels.hpp"

#include <string>
#include <vector>

/**
 * @brief Delivery Route Optimization Engine.
 * 
 * Implements:
 * 1. Greedy Nearest-Next-Stop Route Ordering:
 *    - Starts at warehouse
 *    - At each stop, computes shortest-path distances via Dijkstra to all remaining unvisited stops
 *    - Selects the nearest reachable stop, reconstructs the road leg, and repeats
 *    - Explicitly reports unreachable stops
 * 
 * 2. Baseline Route (Input Order):
 *    - Traverses delivery stops in the exact order provided by the user
 *    - Computes Dijkstra shortest path for each consecutive leg
 * 
 * 3. Route Comparison:
 *    - Compares greedy route vs baseline route
 *    - Computes distance difference and savings percentage
 * 
 * IMPORTANT LIMITATION NOTE:
 * The greedy nearest-neighbor strategy is an approximation heuristic for the Travelling Salesperson
 * Problem (TSP). It does not guarantee a globally optimal minimum-distance tour.
 */
class RouteOptimizer {
private:
    const Graph& graph_;

    // Helper to filter and deduplicate requested destination stops
    std::vector<std::string> prepareDestinations(const std::string& start,
                                                const std::vector<std::string>& destinations) const;

public:
    /**
     * @brief Constructs a RouteOptimizer operating over a given Graph.
     */
    explicit RouteOptimizer(const Graph& graph);

    /**
     * @brief Computes a delivery tour using the Greedy Nearest-Unvisited-Stop heuristic.
     * @param start Warehouse or starting depot vertex ID.
     * @param destinations List of required delivery stop IDs.
     * @return RouteResult containing ordered stops, leg details, total distance, and execution trace.
     * @throws std::invalid_argument if start vertex does not exist in graph.
     */
    RouteResult optimizeGreedy(const std::string& start,
                               const std::vector<std::string>& destinations) const;

    /**
     * @brief Computes a delivery route following the user's input sequence directly (baseline).
     * @param start Warehouse or starting depot vertex ID.
     * @param destinations List of required delivery stop IDs in user's sequence.
     * @return RouteResult containing legs, total distance, and unreachable stops.
     * @throws std::invalid_argument if start vertex does not exist in graph.
     */
    RouteResult computeBaseline(const std::string& start,
                                const std::vector<std::string>& destinations) const;

    /**
     * @brief Compares the Greedy route against the Baseline route.
     * @param start Warehouse or starting depot vertex ID.
     * @param destinations List of required delivery stop IDs.
     * @return RouteComparisonResult with distance savings and analytical explanation.
     */
    RouteComparisonResult compare(const std::string& start,
                                  const std::vector<std::string>& destinations) const;
};

#endif // ROUTE_OPTIMIZER_HPP
