#include "Graph.hpp"
#include "SampleData.hpp"
#include "DijkstraResult.hpp"

#include <iostream>
#include <iomanip>
#include <cassert>
#include <string>
#include <vector>
#include <cmath>
#include <algorithm>

#define TEST_PASS(msg) std::cout << "  [PASS] " << msg << std::endl
#define TEST_FAIL(msg) do { std::cerr << "  [FAIL] " << msg << std::endl; totalFailed++; } while(0)
#define TEST_SECTION(title) std::cout << "\n=== " << title << " ===" << std::endl

int totalTests = 0;
int totalFailed = 0;

void assertCondition(bool condition, const std::string& testName) {
    totalTests++;
    if (condition) {
        TEST_PASS(testName);
    } else {
        TEST_FAIL(testName);
    }
}

bool approxEqual(double a, double b, double eps = 1e-6) {
    return std::fabs(a - b) < eps;
}

void testKnownShortestDistances() {
    TEST_SECTION("Test 1: Known Shortest Distances on Sample Delivery Graph");

    Graph g = SampleData::createSampleDeliveryGraph();
    DijkstraResult dRes = g.dijkstra("Warehouse");

    assertCondition(dRes.source == "Warehouse", "Dijkstra source is 'Warehouse'");
    assertCondition(dRes.unreachableVertices.empty(), "Zero unreachable vertices in connected sample graph");

    // Warehouse to Downtown (Direct edge: 3.2)
    assertCondition(approxEqual(dRes.getDistance("Downtown"), 3.2), "Shortest distance to Downtown is 3.2 km");

    // Warehouse to North_Station (via Downtown: 3.2 + 2.4 = 5.6)
    assertCondition(approxEqual(dRes.getDistance("North_Station"), 5.6), "Shortest distance to North_Station is 5.6 km");

    // Warehouse to Harbor:
    // Route A (via Downtown): 3.2 + 3.8 = 7.0 km
    // Route B (via North_Station): 3.2 + 2.4 + 1.9 = 7.5 km
    // Dijkstra must choose Route A (7.0 km)
    assertCondition(approxEqual(dRes.getDistance("Harbor"), 7.0), "Shortest distance to Harbor is 7.0 km (via Downtown)");

    // Warehouse to West_Mall (Direct edge: 4.5)
    assertCondition(approxEqual(dRes.getDistance("West_Mall"), 4.5), "Shortest distance to West_Mall is 4.5 km");

    // Warehouse to Tech_Park (Direct edge: 5.1)
    assertCondition(approxEqual(dRes.getDistance("Tech_Park"), 5.1), "Shortest distance to Tech_Park is 5.1 km");

    // Warehouse to Suburbs:
    // Route A (via West_Mall): 4.5 + 4.0 = 8.5 km
    // Route B (via Tech_Park): 5.1 + 3.5 = 8.6 km
    // Route C (via Downtown -> Tech_Park): 3.2 + 4.8 + 3.5 = 11.5 km
    // Dijkstra must choose Route A (8.5 km)
    assertCondition(approxEqual(dRes.getDistance("Suburbs"), 8.5), "Shortest distance to Suburbs is 8.5 km (via West_Mall)");

    // Warehouse to Airport:
    // Route A (via Tech_Park): 5.1 + 6.2 = 11.3 km
    // Route B (via Suburbs): 8.5 + 5.8 = 14.3 km
    // Dijkstra must choose Route A (11.3 km)
    assertCondition(approxEqual(dRes.getDistance("Airport"), 11.3), "Shortest distance to Airport is 11.3 km (via Tech_Park)");

    std::cout << "\n     Settled Distances from Warehouse:\n";
    for (const auto& pair : dRes.distances) {
        std::cout << "       -> " << std::left << std::setw(15) << pair.first << ": " << pair.second << " km\n";
    }
}

void testPathReconstruction() {
    TEST_SECTION("Test 2: Shortest Path Reconstruction & Edge Consistency");

    Graph g = SampleData::createSampleDeliveryGraph();

    // Reconstruct Warehouse -> Harbor
    ShortestPathResult pathHarbor = g.getShortestPath("Warehouse", "Harbor");
    assertCondition(pathHarbor.reachable, "Path to Harbor is reachable");
    assertCondition(approxEqual(pathHarbor.totalDistance, 7.0), "Path totalDistance matches Dijkstra distance (7.0 km)");
    
    std::vector<std::string> expectedHarborPath = {"Warehouse", "Downtown", "Harbor"};
    assertCondition(pathHarbor.path == expectedHarborPath,
                    "Reconstructed path to Harbor is [Warehouse -> Downtown -> Harbor]");

    // Reconstruct Warehouse -> Suburbs
    ShortestPathResult pathSuburbs = g.getShortestPath("Warehouse", "Suburbs");
    std::vector<std::string> expectedSuburbsPath = {"Warehouse", "West_Mall", "Suburbs"};
    assertCondition(pathSuburbs.path == expectedSuburbsPath,
                    "Reconstructed path to Suburbs is [Warehouse -> West_Mall -> Suburbs]");

    // Reconstruct Warehouse -> Airport
    ShortestPathResult pathAirport = g.getShortestPath("Warehouse", "Airport");
    std::vector<std::string> expectedAirportPath = {"Warehouse", "Tech_Park", "Airport"};
    assertCondition(pathAirport.path == expectedAirportPath,
                    "Reconstructed path to Airport is [Warehouse -> Tech_Park -> Airport]");

    // Verify sum of edge weights along path equals totalDistance
    auto verifyPathWeights = [&](const ShortestPathResult& sp) {
        double accumulated = 0.0;
        for (size_t i = 0; i + 1 < sp.path.size(); ++i) {
            std::string u = sp.path[i];
            std::string v = sp.path[i + 1];
            bool foundEdge = false;
            for (const auto& edge : g.getNeighbors(u)) {
                if (edge.to == v) {
                    accumulated += edge.weight;
                    foundEdge = true;
                    break;
                }
            }
            if (!foundEdge) return false;
        }
        return approxEqual(accumulated, sp.totalDistance);
    };

    assertCondition(verifyPathWeights(pathHarbor), "Sum of edge weights for Harbor path equals 7.0 km exactly");
    assertCondition(verifyPathWeights(pathSuburbs), "Sum of edge weights for Suburbs path equals 8.5 km exactly");
    assertCondition(verifyPathWeights(pathAirport), "Sum of edge weights for Airport path equals 11.3 km exactly");

    // Path from source to itself
    ShortestPathResult sameNode = g.getShortestPath("Warehouse", "Warehouse");
    assertCondition(sameNode.reachable && sameNode.totalDistance == 0.0 && sameNode.path.size() == 1,
                    "Shortest path from Warehouse to itself has distance 0.0 and path [Warehouse]");
}

void testWeightedDijkstraVsUnweightedBFS() {
    TEST_SECTION("Test 3: Weighted Dijkstra vs Unweighted BFS (Viva Concept Demonstration)");

    // Graph where direct edge has 1 hop but large weight (10.0),
    // and 3-hop alternate path has smaller total weight (1.0 + 1.0 + 1.0 = 3.0)
    Graph g;
    g.addVertex("Start");
    g.addVertex("Intermediate_1");
    g.addVertex("Intermediate_2");
    g.addVertex("Destination");

    // High-weight direct road (1 hop)
    g.addEdge("Start", "Destination", 10.0, false, "Direct Highway");

    // Low-weight multi-hop detour (3 hops)
    g.addEdge("Start", "Intermediate_1", 1.0, false, "Local Street 1");
    g.addEdge("Intermediate_1", "Intermediate_2", 1.0, false, "Local Street 2");
    g.addEdge("Intermediate_2", "Destination", 1.0, false, "Local Street 3");

    // Unweighted BFS checks hop count
    BFSTraversalResult bfsRes = g.bfs("Start");
    assertCondition(bfsRes.hopLevels["Destination"] == 1, "BFS finds destination at hop level 1 (direct edge)");
    assertCondition(bfsRes.predecessors["Destination"] == "Start", "BFS parent of Destination is Start");

    // Weighted Dijkstra checks cumulative distance
    ShortestPathResult dijkstraRes = g.getShortestPath("Start", "Destination");
    assertCondition(approxEqual(dijkstraRes.totalDistance, 3.0), "Dijkstra selects optimal distance of 3.0 km");
    
    std::vector<std::string> expectedOptimalPath = {"Start", "Intermediate_1", "Intermediate_2", "Destination"};
    assertCondition(dijkstraRes.path == expectedOptimalPath,
                    "Dijkstra chooses 3-hop detour over 1-hop high-weight edge");
}

void testZeroWeightEdges() {
    TEST_SECTION("Test 4: Zero-Weight Edge Handling");

    Graph g;
    g.addVertex("Warehouse_Depot");
    g.addVertex("Loading_Bay_1");
    g.addVertex("Customer_Site");

    // Free transfer (weight 0.0) between Warehouse and Loading Bay
    g.addEdge("Warehouse_Depot", "Loading_Bay_1", 0.0, false, "Depot Internal Transit");
    g.addEdge("Loading_Bay_1", "Customer_Site", 5.2, false, "Delivery Road");

    DijkstraResult res = g.dijkstra("Warehouse_Depot");
    assertCondition(approxEqual(res.getDistance("Loading_Bay_1"), 0.0), "Zero-weight edge settled with distance 0.0");
    assertCondition(approxEqual(res.getDistance("Customer_Site"), 5.2), "Shortest distance through zero-weight edge is 5.2 km");

    ShortestPathResult pathRes = res.getPathTo("Customer_Site");
    std::vector<std::string> expected = {"Warehouse_Depot", "Loading_Bay_1", "Customer_Site"};
    assertCondition(pathRes.path == expected, "Path traverses zero-weight edge correctly");
}

void testDisconnectedGraphAndUnreachableStops() {
    TEST_SECTION("Test 5: Disconnected Graph & Unreachable Destinations");

    Graph g = SampleData::createDisconnectedGraph();

    DijkstraResult res = g.dijkstra("Warehouse");
    assertCondition(approxEqual(res.getDistance("Warehouse"), 0.0), "Warehouse distance is 0.0");
    assertCondition(approxEqual(res.getDistance("Downtown"), 3.0), "Downtown distance is 3.0");
    assertCondition(approxEqual(res.getDistance("North_Station"), 5.5), "North_Station distance is 5.5");

    // Unreachable cluster: Harbor, Airport
    assertCondition(!res.isReachable("Harbor"), "Harbor is unreachable from Warehouse");
    assertCondition(!res.isReachable("Airport"), "Airport is unreachable from Warehouse");
    assertCondition(!res.isReachable("Suburbs"), "Isolated Suburbs is unreachable from Warehouse");

    assertCondition(res.unreachableVertices.size() == 3, "Exactly 3 unreachable vertices reported");

    // Query shortest path to unreachable destination
    ShortestPathResult spUnreachable = g.getShortestPath("Warehouse", "Airport");
    assertCondition(!spUnreachable.reachable, "getShortestPath reports reachable == false for unreachable stop");
    assertCondition(spUnreachable.path.empty(), "getShortestPath returns empty path for unreachable stop");
    assertCondition(spUnreachable.totalDistance == DijkstraResult::INF, "getShortestPath returns INF distance");
}

void testValidationAndExecutionTrace() {
    TEST_SECTION("Test 6: Exception Validation & Execution Trace");

    Graph g = SampleData::createSampleDeliveryGraph();

    // Non-existent source
    bool caughtBadSource = false;
    try {
        g.dijkstra("NonExistentStart");
    } catch (const std::invalid_argument& e) {
        caughtBadSource = true;
    }
    assertCondition(caughtBadSource, "Throws std::invalid_argument when starting vertex does not exist");

    // Non-existent destination in getShortestPath
    bool caughtBadDest = false;
    try {
        g.getShortestPath("Warehouse", "NonExistentStop");
    } catch (const std::invalid_argument& e) {
        caughtBadDest = true;
    }
    assertCondition(caughtBadDest, "Throws std::invalid_argument when destination vertex does not exist");

    // Execution trace verification
    DijkstraResult res = g.dijkstra("Warehouse");
    assertCondition(!res.steps.empty(), "Dijkstra generated step-by-step trace");
    assertCondition(res.settledOrder.size() == 8, "All 8 vertices are settled in order of increasing distance");

    // Verify settled order is monotonic non-decreasing in distance
    bool monotonic = true;
    for (size_t i = 0; i + 1 < res.settledOrder.size(); ++i) {
        double d1 = res.distances[res.settledOrder[i]];
        double d2 = res.distances[res.settledOrder[i + 1]];
        if (d1 > d2) {
            monotonic = false;
            break;
        }
    }
    assertCondition(monotonic, "Settled order vertices have monotonically non-decreasing distances");

    // Determinism test: multiple runs give identical results
    DijkstraResult res2 = g.dijkstra("Warehouse");
    assertCondition(res.settledOrder == res2.settledOrder && res.distances == res2.distances,
                    "Dijkstra execution is 100% deterministic across multiple runs");
}

int main() {
    std::cout << "====================================================\n";
    std::cout << "  RoutePilot C++ DSA Engine - Phase 2 Test Suite    \n";
    std::cout << "  Dijkstra Shortest Path & Path Reconstruction      \n";
    std::cout << "====================================================\n";

    testKnownShortestDistances();
    testPathReconstruction();
    testWeightedDijkstraVsUnweightedBFS();
    testZeroWeightEdges();
    testDisconnectedGraphAndUnreachableStops();
    testValidationAndExecutionTrace();

    std::cout << "\n====================================================\n";
    std::cout << "  Summary: " << (totalTests - totalFailed) << "/" << totalTests << " assertions passed.\n";
    if (totalFailed == 0) {
        std::cout << "  ALL PHASE 2 TESTS PASSED SUCCESSFULLY! (100%)\n";
    } else {
        std::cerr << "  " << totalFailed << " TESTS FAILED.\n";
    }
    std::cout << "====================================================\n";

    return (totalFailed == 0) ? 0 : 1;
}
