#ifndef SAMPLE_DATA_HPP
#define SAMPLE_DATA_HPP

#include "Graph.hpp"

/**
 * @brief Provides built-in sample graph fixtures for demonstration and testing.
 */
namespace SampleData {

/**
 * @brief Creates the standard delivery network graph:
 * - 1 Central Warehouse
 * - 7 Delivery stops (Downtown, North_Station, West_Mall, Tech_Park, Harbor, Suburbs, Airport)
 * - 11 Interconnected weighted roads with realistic distances and coordinates
 */
Graph createSampleDeliveryGraph();

/**
 * @brief Creates a disconnected graph fixture for testing reachability and unreachable detection:
 * Component 1: Warehouse <-> Downtown <-> North_Station
 * Component 2 (Isolated Island): Harbor <-> Airport
 * Isolated Node: Suburbs
 */
Graph createDisconnectedGraph();

/**
 * @brief Creates an acyclic tree graph fixture for comparing BFS levels vs DFS depths.
 */
Graph createTreeGraph();

} // namespace SampleData

#endif // SAMPLE_DATA_HPP
