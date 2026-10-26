#include "Graph.hpp"
#include "SampleData.hpp"
#include "RouteOptimizer.hpp"

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

void testGreedyRouteOnSampleGraph() {
    TEST_SECTION("Test 1: Greedy Delivery Route on Sample Graph");

    Graph g = SampleData::createSampleDeliveryGraph();
    RouteOptimizer optimizer(g);

    std::vector<std::string> destinations = {
        "Harbor", "Downtown", "West_Mall", "Tech_Park", "Airport"
    };

    RouteResult route = optimizer.optimizeGreedy("Warehouse", destinations);

    assertCondition(route.strategy == "greedy", "Strategy is 'greedy'");
    assertCondition(route.startLocation == "Warehouse", "Start location is 'Warehouse'");
    assertCondition(route.isComplete, "Route is complete (all 5 requested stops visited)");
    assertCondition(route.unreachableStops.empty(), "Zero unreachable stops");
    assertCondition(route.orderedStops.size() == 5, "Ordered stops contains exactly 5 stops");
    assertCondition(route.legs.size() == 5, "Route contains exactly 5 delivery legs");

    // Verify sum of leg distances equals totalDistance
    double legSum = 0.0;
    for (const auto& leg : route.legs) {
        legSum += leg.distance;
    }
    assertCondition(approxEqual(legSum, route.totalDistance),
                    "Total distance exactly matches the sum of leg distances");

    // First stop from Warehouse must be Downtown (nearest at 3.2 km)
    assertCondition(route.orderedStops[0] == "Downtown", "First greedy stop is Downtown (3.2 km)");
    assertCondition(approxEqual(route.legs[0].distance, 3.2), "First leg distance is 3.2 km");

    // From Downtown, Harbor is nearest (3.8 km)
    assertCondition(route.orderedStops[1] == "Harbor", "Second greedy stop is Harbor (3.8 km)");
    assertCondition(approxEqual(route.legs[1].distance, 3.8), "Second leg distance is 3.8 km");

    // Verify continuous stitched fullPath
    assertCondition(!route.fullPath.empty() && route.fullPath.front() == "Warehouse",
                    "Full path starts at Warehouse");
    assertCondition(route.fullPath.back() == route.orderedStops.back(),
                    "Full path ends at the final delivery stop");

    // Verify execution trace was recorded
    assertCondition(route.executionTrace.size() == 5,
                    "Execution trace contains 5 discrete greedy selection steps");

    std::cout << "\n     Greedy Delivery Order:\n";
    std::cout << "       Warehouse -> ";
    for (size_t i = 0; i < route.orderedStops.size(); ++i) {
        std::cout << route.orderedStops[i] << " (" << route.legs[i].distance << " km)"
                  << (i + 1 < route.orderedStops.size() ? " -> " : "\n");
    }
    std::cout << "       Total Distance: " << route.totalDistance << " km\n";
}

void testBaselineAndComparison() {
    TEST_SECTION("Test 2: Baseline Route and Comparison (Greedy Advantage)");

    Graph g = SampleData::createSampleDeliveryGraph();
    RouteOptimizer optimizer(g);

    // Provide a deliberately zig-zagging sequence
    std::vector<std::string> zigzagInput = {
        "Airport", "Downtown", "Suburbs", "North_Station"
    };

    RouteResult baseline = optimizer.computeBaseline("Warehouse", zigzagInput);
    assertCondition(baseline.strategy == "baseline", "Baseline strategy is 'baseline'");
    assertCondition(baseline.orderedStops == zigzagInput, "Baseline preserves user input order exactly");
    assertCondition(baseline.legs.size() == 4, "Baseline has 4 legs");

    double baselineLegSum = 0.0;
    for (const auto& leg : baseline.legs) {
        baselineLegSum += leg.distance;
    }
    assertCondition(approxEqual(baselineLegSum, baseline.totalDistance),
                    "Baseline total distance equals sum of its legs");

    // Compare greedy vs baseline
    RouteComparisonResult comp = optimizer.compare("Warehouse", zigzagInput);
    assertCondition(comp.greedyIsBetter, "Greedy route outperforms zig-zag baseline");
    assertCondition(comp.distanceDifference > 0.0, "Greedy achieved positive distance savings");
    assertCondition(comp.percentageSavings > 0.0, "Percentage savings is strictly positive");

    std::cout << "\n     Comparison Summary:\n";
    std::cout << "       Baseline Distance: " << comp.baselineRoute.totalDistance << " km\n";
    std::cout << "       Greedy Distance:   " << comp.greedyRoute.totalDistance << " km\n";
    std::cout << "       Saved:             " << comp.distanceDifference << " km ("
              << comp.percentageSavings << "%)\n";
}

void testGreedySuboptimalCounterexample() {
    TEST_SECTION("Test 3: Counterexample Proving Greedy is NOT Globally Optimal (Viva Proof)");

    // Classic "Greedy Trap on a Line" graph:
    // Positions: B (-2), W (0), A (1), C (3)
    // Vertices connected along a line:
    // W <-> A: 1.0 km
    // W <-> B: 2.0 km
    // A <-> C: 2.0 km (W -> C = 3.0 km)
    //
    // Required stops to visit from Warehouse: {A, B, C}
    //
    // GREEDY HEURISTIC:
    // 1. At W: dist(A)=1, dist(B)=2, dist(C)=3 -> Greedy picks A (1.0 km)
    // 2. At A: dist(C)=2, dist(B)=3 -> Greedy picks C (2.0 km)
    // 3. At C: only B remains -> must double back all the way across line: dist(C -> B) = 5.0 km!
    // Total Greedy Distance = 1.0 + 2.0 + 5.0 = 8.0 km
    //
    // OPTIMAL BASELINE (Visiting order: B -> A -> C):
    // 1. W -> B: 2.0 km
    // 2. B -> A: 3.0 km
    // 3. A -> C: 2.0 km
    // Total Optimal Distance = 2.0 + 3.0 + 2.0 = 7.0 km!
    //
    // 7.0 km < 8.0 km! Greedy is strictly worse than the optimal sequence!

    Graph lineGraph;
    lineGraph.addVertex("Warehouse", "Origin W (0)", 0, 0);
    lineGraph.addVertex("Stop_A",    "Stop A (+1)",   1, 0);
    lineGraph.addVertex("Stop_B",    "Stop B (-2)",  -2, 0);
    lineGraph.addVertex("Stop_C",    "Stop C (+3)",   3, 0);

    lineGraph.addEdge("Warehouse", "Stop_A", 1.0, false);
    lineGraph.addEdge("Warehouse", "Stop_B", 2.0, false);
    lineGraph.addEdge("Stop_A",    "Stop_C", 2.0, false);

    RouteOptimizer optimizer(lineGraph);

    // Required stops
    std::vector<std::string> stops = {"Stop_A", "Stop_B", "Stop_C"};
    RouteResult greedyResult = optimizer.optimizeGreedy("Warehouse", stops);

    // Verify Greedy was lured into visiting Stop_A first, then Stop_C, then Stop_B
    std::vector<std::string> expectedGreedyOrder = {"Stop_A", "Stop_C", "Stop_B"};
    assertCondition(greedyResult.orderedStops == expectedGreedyOrder,
                    "Greedy chooses locally nearest stops: Stop_A -> Stop_C -> Stop_B");
    assertCondition(approxEqual(greedyResult.totalDistance, 8.0),
                    "Greedy total distance is 8.0 km");

    // Now test optimal sequence B -> A -> C via baseline
    std::vector<std::string> optimalSequence = {"Stop_B", "Stop_A", "Stop_C"};
    RouteResult optimalResult = optimizer.computeBaseline("Warehouse", optimalSequence);

    assertCondition(approxEqual(optimalResult.totalDistance, 7.0),
                    "Optimal sequence total distance is 7.0 km");
    assertCondition(optimalResult.totalDistance < greedyResult.totalDistance,
                    "PROOF VERIFIED: Optimal sequence (7.0 km) is strictly shorter than Greedy (8.0 km)");

    // Route comparison confirms greedyIsBetter is false here
    RouteComparisonResult comp = optimizer.compare("Warehouse", optimalSequence);
    assertCondition(!comp.greedyIsBetter,
                    "RouteComparison reports greedy is NOT better when baseline is the optimal tour");

    std::cout << "\n     Viva Counterexample Verification:\n";
    std::cout << "       Greedy Route:   Warehouse -> Stop_A -> Stop_C -> Stop_B = "
              << greedyResult.totalDistance << " km (Trap!)\n";
    std::cout << "       Optimal Route:  Warehouse -> Stop_B -> Stop_A -> Stop_C = "
              << optimalResult.totalDistance << " km (Shorter!)\n";
}

void testUnreachableStopsReporting() {
    TEST_SECTION("Test 4: Detection & Reporting of Unreachable Delivery Stops");

    Graph g = SampleData::createDisconnectedGraph();
    RouteOptimizer optimizer(g);

    // Downtown is in Component 1 (reachable)
    // Airport and Suburbs are in Component 2 / Isolated (unreachable)
    std::vector<std::string> requested = {"Downtown", "Airport", "Suburbs"};

    RouteResult route = optimizer.optimizeGreedy("Warehouse", requested);

    assertCondition(!route.isComplete, "Route is marked isComplete == false");
    assertCondition(route.orderedStops.size() == 1 && route.orderedStops[0] == "Downtown",
                    "Downtown was successfully visited as Leg 1");
    assertCondition(route.unreachableStops.size() == 2,
                    "Exactly 2 unreachable stops reported");

    auto containsStop = [](const std::vector<std::string>& vec, const std::string& target) {
        return std::find(vec.begin(), vec.end(), target) != vec.end();
    };

    assertCondition(containsStop(route.unreachableStops, "Airport"), "Airport reported as unreachable");
    assertCondition(containsStop(route.unreachableStops, "Suburbs"), "Suburbs reported as unreachable");
    assertCondition(approxEqual(route.totalDistance, 3.0), "Total distance only counts reachable legs (3.0 km)");

    // Baseline also handles unreachable stops gracefully
    RouteResult baseline = optimizer.computeBaseline("Warehouse", requested);
    assertCondition(!baseline.isComplete, "Baseline is marked isComplete == false");
    assertCondition(baseline.unreachableStops.size() == 2, "Baseline reports 2 unreachable stops");
}

void testInputEdgeCases() {
    TEST_SECTION("Test 5: Edge Cases, Duplicates, and Validation");

    Graph g = SampleData::createSampleDeliveryGraph();
    RouteOptimizer optimizer(g);

    // Invalid start location
    bool caughtBadStart = false;
    try {
        optimizer.optimizeGreedy("FakeWarehouse", {"Downtown"});
    } catch (const std::invalid_argument& e) {
        caughtBadStart = true;
    }
    assertCondition(caughtBadStart, "Throws std::invalid_argument for non-existent start location");

    // Empty destination list
    RouteResult emptyRoute = optimizer.optimizeGreedy("Warehouse", {});
    assertCondition(emptyRoute.isComplete && emptyRoute.legs.empty() && emptyRoute.totalDistance == 0.0,
                    "Empty destinations list returns 0 distance and 0 legs without crashing");

    // Duplicate stops input (e.g., ["Downtown", "Downtown", "West_Mall"])
    std::vector<std::string> withDuplicates = {"Downtown", "Downtown", "West_Mall", "Warehouse"};
    RouteResult dedupRoute = optimizer.optimizeGreedy("Warehouse", withDuplicates);
    assertCondition(dedupRoute.orderedStops.size() == 2,
                    "Duplicate stops and warehouse repeat were deduplicated (exactly 2 unique delivery stops visited)");
}

int main() {
    std::cout << "====================================================\n";
    std::cout << "  RoutePilot C++ DSA Engine - Phase 3 Test Suite    \n";
    std::cout << "  Greedy Route Optimization & Baseline Comparison   \n";
    std::cout << "====================================================\n";

    testGreedyRouteOnSampleGraph();
    testBaselineAndComparison();
    testGreedySuboptimalCounterexample();
    testUnreachableStopsReporting();
    testInputEdgeCases();

    std::cout << "\n====================================================\n";
    std::cout << "  Summary: " << (totalTests - totalFailed) << "/" << totalTests << " assertions passed.\n";
    if (totalFailed == 0) {
        std::cout << "  ALL PHASE 3 TESTS PASSED SUCCESSFULLY! (100%)\n";
    } else {
        std::cerr << "  " << totalFailed << " TESTS FAILED.\n";
    }
    std::cout << "====================================================\n";

    return (totalFailed == 0) ? 0 : 1;
}
