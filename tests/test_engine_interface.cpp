#include "EngineHandler.hpp"
#include "SimpleJson.hpp"
#include "Graph.hpp"
#include "SampleData.hpp"

#include <iostream>
#include <iomanip>
#include <cassert>
#include <string>
#include <vector>
#include <cmath>

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

bool approxEqual(double a, double b, double eps = 1e-4) {
    return std::fabs(a - b) < eps;
}

void testHealthAction() {
    TEST_SECTION("Test 1: Health Check Endpoint");

    std::string req = R"({"action": "health"})";
    JsonValue resp = EngineHandler::processRequest(req);

    assertCondition(resp["status"].asString() == "ok", "Status is 'ok'");
    assertCondition(resp["engine"].asString() == "RoutePilot C++17 DSA Engine", "Engine name matches");
    assertCondition(resp["version"].asString() == "1.0.0", "Version matches 1.0.0");
}

void testSampleGraphAction() {
    TEST_SECTION("Test 2: Sample Graph Retrieval Endpoint");

    std::string req = R"({"action": "get_sample_graph"})";
    JsonValue resp = EngineHandler::processRequest(req);

    assertCondition(resp["status"].asString() == "success", "Status is 'success'");
    assertCondition(resp["action"].asString() == "get_sample_graph", "Action is 'get_sample_graph'");
    assertCondition(resp["warehouse"].asString() == "Warehouse", "Default warehouse is 'Warehouse'");

    const auto& vertices = resp["vertices"].asArray();
    assertCondition(vertices.size() == 8, "Sample graph returns exactly 8 vertices");

    const auto& edges = resp["edges"].asArray();
    assertCondition(edges.size() == 11, "Sample graph returns exactly 11 undirected edges");

    bool hasWarehouse = false;
    for (const auto& v : vertices) {
        if (v["id"].asString() == "Warehouse") {
            hasWarehouse = true;
            assertCondition(v["name"].asString() == "Central Warehouse Depot", "Warehouse name serialized correctly");
            assertCondition(approxEqual(v["lat"].asDouble(), 37.7749), "Warehouse latitude serialized correctly");
            assertCondition(approxEqual(v["lon"].asDouble(), -122.4194), "Warehouse longitude serialized correctly");
            break;
        }
    }
    assertCondition(hasWarehouse, "Warehouse vertex found in payload");
}

void testAnalyzeGraphAction() {
    TEST_SECTION("Test 3: Graph Analysis (BFS & DFS Traces)");

    std::string req = R"({"action": "analyze_graph", "start": "Warehouse"})";
    JsonValue resp = EngineHandler::processRequest(req);

    assertCondition(resp["status"].asString() == "success", "Status is 'success'");
    assertCondition(resp["action"].asString() == "analyze_graph", "Action is 'analyze_graph'");
    assertCondition(resp["start"].asString() == "Warehouse", "Start vertex is 'Warehouse'");

    // Verify BFS
    assertCondition(resp.contains("bfs"), "Response contains 'bfs' object");
    const auto& bfs = resp["bfs"];
    assertCondition(bfs["startVertex"].asString() == "Warehouse", "BFS start vertex is 'Warehouse'");
    assertCondition(bfs["visitedOrder"].asArray().size() == 8, "BFS visited all 8 vertices");
    assertCondition(bfs["unreachable"].asArray().empty(), "BFS reports 0 unreachable vertices");
    assertCondition(bfs["steps"].asArray().size() > 0, "BFS trace steps recorded for frontend playback");

    // Check hop levels
    assertCondition(bfs["hopLevels"]["Warehouse"].asInt() == 0, "Warehouse hop level is 0");
    assertCondition(bfs["hopLevels"]["Downtown"].asInt() == 1, "Downtown hop level is 1");

    // Verify DFS
    assertCondition(resp.contains("dfs"), "Response contains 'dfs' object");
    const auto& dfs = resp["dfs"];
    assertCondition(dfs["startVertex"].asString() == "Warehouse", "DFS start vertex is 'Warehouse'");
    assertCondition(dfs["visitedOrder"].asArray().size() == 8, "DFS visited all 8 vertices");
    assertCondition(dfs["hasCycle"].asBool() == true, "DFS correctly detects cycles in sample network");
    assertCondition(dfs["steps"].asArray().size() > 0, "DFS stack steps recorded for frontend playback");
}

void testOptimizeRouteAction() {
    TEST_SECTION("Test 4: Route Optimization (Greedy Heuristic)");

    std::string req = R"({
        "action": "optimize_route",
        "start": "Warehouse",
        "destinations": ["Harbor", "Downtown", "Airport"]
    })";

    JsonValue resp = EngineHandler::processRequest(req);

    assertCondition(resp["status"].asString() == "success", "Status is 'success'");
    assertCondition(resp["strategy"].asString() == "greedy", "Strategy is 'greedy'");
    assertCondition(resp["isComplete"].asBool() == true, "Route marked as complete");
    assertCondition(resp["startLocation"].asString() == "Warehouse", "Start is 'Warehouse'");

    const auto& route = resp["route"].asArray();
    assertCondition(route.size() == 3, "Route visits all 3 requested destinations");
    assertCondition(route[0].asString() == "Downtown", "First greedy stop is 'Downtown' (nearest at 3.2 km)");
    assertCondition(route[1].asString() == "Harbor", "Second greedy stop is 'Harbor' (nearest from Downtown at 3.8 km)");
    assertCondition(route[2].asString() == "Airport", "Third greedy stop is 'Airport'");

    const auto& legs = resp["legs"].asArray();
    assertCondition(legs.size() == 3, "Exactly 3 delivery legs generated");
    assertCondition(approxEqual(legs[0]["distance"].asDouble(), 3.2), "Leg 1 distance is 3.2 km");
    assertCondition(approxEqual(legs[1]["distance"].asDouble(), 3.8), "Leg 2 distance is 3.8 km");

    double totalDist = resp["totalDistance"].asDouble();
    double sumLegs = legs[0]["distance"].asDouble() + legs[1]["distance"].asDouble() + legs[2]["distance"].asDouble();
    assertCondition(approxEqual(totalDist, sumLegs), "Total distance equals sum of leg distances");

    const auto& trace = resp["algorithmTrace"].asArray();
    assertCondition(trace.size() == 3, "Execution trace contains 3 candidate decision steps");
}

void testCompareRoutesAction() {
    TEST_SECTION("Test 5: Route Comparison (Greedy vs Baseline)");

    std::string req = R"({
        "action": "compare_routes",
        "start": "Warehouse",
        "destinations": ["Airport", "Downtown", "Suburbs", "West_Mall"]
    })";

    JsonValue resp = EngineHandler::processRequest(req);

    assertCondition(resp["status"].asString() == "success", "Status is 'success'");
    assertCondition(resp["action"].asString() == "compare_routes", "Action is 'compare_routes'");
    assertCondition(resp.contains("greedy"), "Contains 'greedy' route result");
    assertCondition(resp.contains("baseline"), "Contains 'baseline' route result");
    assertCondition(resp.contains("analysisSummary"), "Contains Viva analysis summary");

    double greedyDist = resp["greedy"]["totalDistance"].asDouble();
    double baselineDist = resp["baseline"]["totalDistance"].asDouble();
    double diff = resp["distanceDifference"].asDouble();

    assertCondition(approxEqual(diff, baselineDist - greedyDist), "Distance difference equals baseline - greedy");
    assertCondition(resp["greedyIsBetter"].asBool() == (greedyDist < baselineDist), "greedyIsBetter flag matches distance comparison");
    assertCondition(resp["baseline"]["strategy"].asString() == "baseline", "Baseline strategy is 'baseline'");
}

void testCustomGraphPayload() {
    TEST_SECTION("Test 6: Custom Graph JSON Parsing");

    std::string req = R"({
        "action": "optimize_route",
        "start": "Depot",
        "destinations": ["Client_B", "Client_A"],
        "graph": {
            "vertices": [
                {"id": "Depot", "name": "Main Depot", "lat": 10.0, "lon": 20.0},
                {"id": "Client_A", "name": "Client Alpha", "lat": 10.1, "lon": 20.1},
                {"id": "Client_B", "name": "Client Beta", "lat": 10.2, "lon": 20.2}
            ],
            "edges": [
                {"from": "Depot", "to": "Client_A", "distance": 2.5, "road": "A-Road"},
                {"from": "Client_A", "to": "Client_B", "distance": 3.0, "road": "B-Road"},
                {"from": "Depot", "to": "Client_B", "distance": 10.0, "road": "C-Road"}
            ]
        }
    })";

    JsonValue resp = EngineHandler::processRequest(req);

    assertCondition(resp["status"].asString() == "success", "Custom graph optimization succeeded");
    assertCondition(resp["startLocation"].asString() == "Depot", "Start location is 'Depot'");
    assertCondition(resp["route"].asArray().size() == 2, "Visited 2 custom destinations");
    assertCondition(resp["route"].asArray()[0].asString() == "Client_A", "First stop is Client_A (2.5 km < 10.0 km)");
    assertCondition(resp["route"].asArray()[1].asString() == "Client_B", "Second stop is Client_B");
    assertCondition(approxEqual(resp["totalDistance"].asDouble(), 5.5), "Total distance is 2.5 + 3.0 = 5.5 km");
}

void testMalformedJsonAndErrorHandling() {
    TEST_SECTION("Test 7: Malformed Input & Error Handling");

    // Case 1: Empty input
    JsonValue rEmpty = EngineHandler::processRequest("");
    assertCondition(rEmpty["status"].asString() == "error", "Empty input returns status 'error'");

    // Case 2: Malformed JSON syntax
    JsonValue rMalformed = EngineHandler::processRequest("{ unquoted_key: 123 ");
    assertCondition(rMalformed["status"].asString() == "error", "Malformed syntax returns status 'error'");
    assertCondition(rMalformed["action"].asString() == "parse_error", "Action is 'parse_error'");

    // Case 3: Unknown action
    JsonValue rUnknown = EngineHandler::processRequest(R"({"action": "teleport_now"})");
    assertCondition(rUnknown["status"].asString() == "error", "Unknown action returns status 'error'");

    // Case 4: Non-existent starting vertex
    JsonValue rBadStart = EngineHandler::processRequest(R"({"action": "optimize_route", "start": "NonExistentPlace", "destinations": ["Downtown"]})");
    assertCondition(rBadStart["status"].asString() == "error", "Missing starting vertex returns status 'error'");
}

void testUnreachableStopsReporting() {
    TEST_SECTION("Test 8: Disconnected Custom Graph & Unreachable Stops");

    std::string req = R"({
        "action": "optimize_route",
        "start": "Island_A",
        "destinations": ["Island_B", "Island_C"],
        "graph": {
            "vertices": [
                {"id": "Island_A", "name": "Island A"},
                {"id": "Island_B", "name": "Island B"},
                {"id": "Island_C", "name": "Island C"}
            ],
            "edges": [
                {"from": "Island_A", "to": "Island_B", "distance": 4.0}
            ]
        }
    })";

    JsonValue resp = EngineHandler::processRequest(req);

    assertCondition(resp["status"].asString() == "partial", "Status is 'partial' due to unreachable stop");
    assertCondition(resp["isComplete"].asBool() == false, "Route marked isComplete == false");
    assertCondition(resp["route"].asArray().size() == 1, "Only reachable stop 'Island_B' added to route");
    assertCondition(resp["unreachableStops"].asArray().size() == 1, "Exactly 1 unreachable stop reported");
    assertCondition(resp["unreachableStops"].asArray()[0].asString() == "Island_C", "Island_C reported as unreachable");
    assertCondition(approxEqual(resp["totalDistance"].asDouble(), 4.0), "Total distance includes only reachable leg (4.0 km)");
}

int main() {
    std::cout << "====================================================" << std::endl;
    std::cout << "  RoutePilot C++ DSA Engine - Phase 4 Test Suite    " << std::endl;
    std::cout << "  Machine-Readable JSON Interface & Build Protocol  " << std::endl;
    std::cout << "====================================================" << std::endl;

    testHealthAction();
    testSampleGraphAction();
    testAnalyzeGraphAction();
    testOptimizeRouteAction();
    testCompareRoutesAction();
    testCustomGraphPayload();
    testMalformedJsonAndErrorHandling();
    testUnreachableStopsReporting();

    std::cout << "\n====================================================" << std::endl;
    std::cout << "  Summary: " << (totalTests - totalFailed) << "/" << totalTests << " assertions passed." << std::endl;
    if (totalFailed == 0) {
        std::cout << "  ALL PHASE 4 TESTS PASSED SUCCESSFULLY! (100%)" << std::endl;
        std::cout << "====================================================" << std::endl;
        return 0;
    } else {
        std::cout << "  " << totalFailed << " TESTS FAILED!" << std::endl;
        std::cout << "====================================================" << std::endl;
        return 1;
    }
}
