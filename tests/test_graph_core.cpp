#include "Graph.hpp"
#include "SampleData.hpp"

#include <iostream>
#include <cassert>
#include <string>
#include <vector>
#include <algorithm>

// Simple colored console test reporter for college demonstration
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

void testGraphConstruction() {
    TEST_SECTION("Test 1: Graph Construction and Basic Operations");

    Graph g;
    assertCondition(g.getVertexCount() == 0, "Initial graph has 0 vertices");
    assertCondition(g.getEdgeCount() == 0, "Initial graph has 0 edges");

    bool added1 = g.addVertex("A", "Location A", 10.0, 20.0);
    bool added2 = g.addVertex("B", "Location B", 11.0, 21.0);
    bool addedDuplicate = g.addVertex("A", "Location A Duplicate", 10.0, 20.0);

    assertCondition(added1 && added2, "Successfully added distinct vertices 'A' and 'B'");
    assertCondition(!addedDuplicate, "Duplicate vertex 'A' insertion rejected (returns false)");
    assertCondition(g.hasVertex("A"), "hasVertex('A') returns true");
    assertCondition(g.hasVertex("B"), "hasVertex('B') returns true");
    assertCondition(!g.hasVertex("C"), "hasVertex('C') returns false for non-existent node");
    assertCondition(g.getVertexCount() == 2, "Vertex count is 2");

    // Add undirected edge A <-> B
    g.addEdge("A", "B", 5.5, false, "Highway 1");
    assertCondition(g.getEdgeCount() == 2, "Undirected edge creates 2 directed adjacency entries");

    const auto& neighborsA = g.getNeighbors("A");
    assertCondition(neighborsA.size() == 1 && neighborsA[0].to == "B" && neighborsA[0].weight == 5.5,
                    "Neighbors of 'A' correctly contains 'B' with weight 5.5");

    const auto& neighborsB = g.getNeighbors("B");
    assertCondition(neighborsB.size() == 1 && neighborsB[0].to == "A" && neighborsB[0].weight == 5.5,
                    "Neighbors of 'B' correctly contains 'A' with weight 5.5");
}

void testValidationAndErrorHandling() {
    TEST_SECTION("Test 2: Edge Validation & Exception Handling");

    Graph g;
    g.addVertex("Depot", "Depot", 0, 0);
    g.addVertex("Customer_1", "Customer 1", 1, 1);

    // Negative edge weight validation
    bool caughtNegativeWeight = false;
    try {
        g.addEdge("Depot", "Customer_1", -4.2);
    } catch (const std::invalid_argument& e) {
        caughtNegativeWeight = true;
    }
    assertCondition(caughtNegativeWeight, "Throws std::invalid_argument when edge weight is negative");

    // Missing source vertex
    bool caughtMissingSource = false;
    try {
        g.addEdge("NonExistent", "Customer_1", 3.0);
    } catch (const std::invalid_argument& e) {
        caughtMissingSource = true;
    }
    assertCondition(caughtMissingSource, "Throws std::invalid_argument when source vertex does not exist");

    // Missing target vertex
    bool caughtMissingTarget = false;
    try {
        g.addEdge("Depot", "GhostNode", 3.0);
    } catch (const std::invalid_argument& e) {
        caughtMissingTarget = true;
    }
    assertCondition(caughtMissingTarget, "Throws std::invalid_argument when target vertex does not exist");

    // Empty vertex ID validation
    bool caughtEmptyVertex = false;
    try {
        g.addVertex("", "Empty", 0, 0);
    } catch (const std::invalid_argument& e) {
        caughtEmptyVertex = true;
    }
    assertCondition(caughtEmptyVertex, "Throws std::invalid_argument when vertex ID is empty string");
}

void testSampleDeliveryGraphBFS() {
    TEST_SECTION("Test 3: BFS Traversal on Connected Sample Delivery Graph");

    Graph g = SampleData::createSampleDeliveryGraph();
    assertCondition(g.getVertexCount() == 8, "Sample delivery graph has 8 vertices");
    assertCondition(g.getEdgeCount() == 22, "Sample graph has 11 undirected edges (22 directed entries)");
    assertCondition(g.isConnected(), "Sample delivery graph is fully connected");

    BFSTraversalResult bfsResult = g.bfs("Warehouse");

    assertCondition(bfsResult.startVertex == "Warehouse", "BFS start vertex is 'Warehouse'");
    assertCondition(bfsResult.visitedOrder.size() == 8, "BFS visits all 8 vertices in connected graph");
    assertCondition(bfsResult.unreachableVertices.empty(), "Zero unreachable vertices in connected graph");

    // Verify first visited is start vertex
    assertCondition(!bfsResult.visitedOrder.empty() && bfsResult.visitedOrder[0] == "Warehouse",
                    "BFS visited order starts with 'Warehouse'");

    // Verify level hop counts
    assertCondition(bfsResult.hopLevels["Warehouse"] == 0, "Warehouse is at hop level 0");
    assertCondition(bfsResult.hopLevels["Downtown"] == 1, "Downtown is 1 hop from Warehouse");
    assertCondition(bfsResult.hopLevels["Tech_Park"] == 1, "Tech_Park is 1 hop from Warehouse");
    assertCondition(bfsResult.hopLevels["West_Mall"] == 1, "West_Mall is 1 hop from Warehouse");

    // Level 2 nodes (Harbor, North_Station, Suburbs, Airport)
    assertCondition(bfsResult.hopLevels["North_Station"] == 2, "North_Station is 2 hops from Warehouse");
    assertCondition(bfsResult.hopLevels["Harbor"] == 2, "Harbor is 2 hops from Warehouse");
    assertCondition(bfsResult.hopLevels["Suburbs"] == 2, "Suburbs is 2 hops from Warehouse");
    assertCondition(bfsResult.hopLevels["Airport"] == 2, "Airport is 2 hops from Warehouse (via Tech_Park)");

    // Predecessors
    assertCondition(bfsResult.predecessors["Downtown"] == "Warehouse", "Parent of Downtown is Warehouse");
    assertCondition(bfsResult.predecessors["North_Station"] == "Downtown", "Parent of North_Station is Downtown");

    // Verify step trace recorded
    assertCondition(!bfsResult.steps.empty(), "BFS generated step-by-step trace for visualizer");
    std::cout << "     BFS Visited Order: ";
    for (size_t i = 0; i < bfsResult.visitedOrder.size(); ++i) {
        std::cout << bfsResult.visitedOrder[i] << (i + 1 < bfsResult.visitedOrder.size() ? " -> " : "\n");
    }
}

void testSampleDeliveryGraphDFS() {
    TEST_SECTION("Test 4: DFS Traversal on Connected Sample Delivery Graph");

    Graph g = SampleData::createSampleDeliveryGraph();

    DFSTraversalResult dfsResult = g.dfs("Warehouse");
    assertCondition(dfsResult.startVertex == "Warehouse", "DFS start vertex is 'Warehouse'");
    assertCondition(dfsResult.visitedOrder.size() == 8, "DFS visits all 8 vertices");
    assertCondition(dfsResult.unreachableVertices.empty(), "DFS has zero unreachable vertices");
    assertCondition(dfsResult.hasCycle, "DFS detects cycle in interconnected delivery network");

    // Verify discovery and finish times
    bool timestampsValid = true;
    for (const auto& vId : g.getAllVertexIds()) {
        if (dfsResult.discoveryTimes[vId] >= dfsResult.finishTimes[vId]) {
            timestampsValid = false;
        }
    }
    assertCondition(timestampsValid, "DFS discovery time < finish time for all vertices");

    // Test Recursive DFS as well
    DFSTraversalResult dfsRec = g.dfsRecursive("Warehouse");
    assertCondition(dfsRec.visitedOrder.size() == 8, "Recursive DFS also visits all 8 vertices");
    assertCondition(dfsRec.hasCycle, "Recursive DFS detects cycles accurately");

    std::cout << "     Iterative DFS Visited Order: ";
    for (size_t i = 0; i < dfsResult.visitedOrder.size(); ++i) {
        std::cout << dfsResult.visitedOrder[i] << (i + 1 < dfsResult.visitedOrder.size() ? " -> " : "\n");
    }
}

void testDisconnectedGraphAndIsolatedVertices() {
    TEST_SECTION("Test 5: Disconnected Graphs & Isolated Vertices");

    Graph g = SampleData::createDisconnectedGraph();
    assertCondition(!g.isConnected(), "SampleData::createDisconnectedGraph() is not connected");
    assertCondition(g.getVertexCount() == 6, "Disconnected graph has 6 vertices");

    // Run BFS from Warehouse (Component 1)
    BFSTraversalResult bfsWh = g.bfs("Warehouse");
    assertCondition(bfsWh.visitedOrder.size() == 3, "BFS from Warehouse visits exactly 3 vertices");
    assertCondition(bfsWh.unreachableVertices.size() == 3, "BFS detects exactly 3 unreachable vertices");

    // Check unreachable nodes: Airport, Harbor, Suburbs
    auto containsNode = [](const std::vector<std::string>& vec, const std::string& target) {
        return std::find(vec.begin(), vec.end(), target) != vec.end();
    };

    assertCondition(containsNode(bfsWh.unreachableVertices, "Airport"), "Airport reported as unreachable");
    assertCondition(containsNode(bfsWh.unreachableVertices, "Harbor"), "Harbor reported as unreachable");
    assertCondition(containsNode(bfsWh.unreachableVertices, "Suburbs"), "Isolated Suburbs reported as unreachable");

    // Run BFS from isolated vertex "Suburbs" (0 edges)
    BFSTraversalResult bfsSuburbs = g.bfs("Suburbs");
    assertCondition(bfsSuburbs.visitedOrder.size() == 1 && bfsSuburbs.visitedOrder[0] == "Suburbs",
                    "BFS from isolated node 'Suburbs' visits only itself");
    assertCondition(bfsSuburbs.unreachableVertices.size() == 5,
                    "All 5 other vertices reported unreachable from isolated 'Suburbs'");

    // Run DFS from Warehouse
    DFSTraversalResult dfsWh = g.dfs("Warehouse");
    assertCondition(dfsWh.visitedOrder.size() == 3, "DFS from Warehouse visits exactly 3 vertices");
    assertCondition(dfsWh.unreachableVertices.size() == 3, "DFS reports 3 unreachable vertices");
}

void testAcyclicTreeGraph() {
    TEST_SECTION("Test 6: Acyclic Tree Graph & Cycle Flag");

    Graph tree = SampleData::createTreeGraph();
    assertCondition(tree.isConnected(), "Tree graph is connected");

    DFSTraversalResult dfsResult = tree.dfs("Warehouse");
    assertCondition(!dfsResult.hasCycle, "DFS reports hasCycle == false for acyclic tree");

    DFSTraversalResult dfsRec = tree.dfsRecursive("Warehouse");
    assertCondition(!dfsRec.hasCycle, "Recursive DFS also confirms no cycles in tree");

    BFSTraversalResult bfsResult = tree.bfs("Warehouse");
    assertCondition(bfsResult.hopLevels["Node_A"] == 1 && bfsResult.hopLevels["Node_B"] == 1,
                    "Level 1 children at depth 1");
    assertCondition(bfsResult.hopLevels["Node_A1"] == 2 && bfsResult.hopLevels["Node_A2"] == 2,
                    "Level 2 grandchildren at depth 2");
}

void testDeterministicTraversal() {
    TEST_SECTION("Test 7: Deterministic Traversal Verification");

    // Run BFS multiple times on same graph and ensure visitedOrder is identical
    Graph g = SampleData::createSampleDeliveryGraph();
    BFSTraversalResult r1 = g.bfs("Warehouse");
    BFSTraversalResult r2 = g.bfs("Warehouse");
    assertCondition(r1.visitedOrder == r2.visitedOrder, "BFS returns 100% deterministic traversal order");

    DFSTraversalResult d1 = g.dfs("Warehouse");
    DFSTraversalResult d2 = g.dfs("Warehouse");
    assertCondition(d1.visitedOrder == d2.visitedOrder, "DFS returns 100% deterministic traversal order");
}

int main() {
    std::cout << "====================================================\n";
    std::cout << "  RoutePilot C++ DSA Engine - Phase 1 Test Suite    \n";
    std::cout << "====================================================\n";

    testGraphConstruction();
    testValidationAndErrorHandling();
    testSampleDeliveryGraphBFS();
    testSampleDeliveryGraphDFS();
    testDisconnectedGraphAndIsolatedVertices();
    testAcyclicTreeGraph();
    testDeterministicTraversal();

    std::cout << "\n====================================================\n";
    std::cout << "  Summary: " << (totalTests - totalFailed) << "/" << totalTests << " assertions passed.\n";
    if (totalFailed == 0) {
        std::cout << "  ALL PHASE 1 TESTS PASSED SUCCESSFULLY! (100%)\n";
    } else {
        std::cerr << "  " << totalFailed << " TESTS FAILED.\n";
    }
    std::cout << "====================================================\n";

    return (totalFailed == 0) ? 0 : 1;
}
