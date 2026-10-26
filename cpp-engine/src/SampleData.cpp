#include "SampleData.hpp"

namespace SampleData {

Graph createSampleDeliveryGraph() {
    Graph g;

    // Add 8 Locations (1 Warehouse + 7 Delivery Stops) with realistic coordinates
    g.addVertex("Warehouse",     "Central Warehouse Depot", 37.7749, -122.4194);
    g.addVertex("Downtown",      "Downtown Plaza",          37.7833, -122.4167);
    g.addVertex("North_Station", "North Train Station",     37.7950, -122.4050);
    g.addVertex("West_Mall",     "West Shopping Mall",      37.7650, -122.4400);
    g.addVertex("Tech_Park",     "Silicon Tech Park",       37.7500, -122.3900);
    g.addVertex("Harbor",        "Maritime Cargo Harbor",   37.8050, -122.4100);
    g.addVertex("Suburbs",       "Greenfield Suburbs",      37.7300, -122.4300);
    g.addVertex("Airport",       "International Airport",   37.7120, -122.3850);

    // Add 11 Interconnecting roads with road names and distances in kilometers
    g.addEdge("Warehouse",     "Downtown",      3.2, false, "Main Avenue");
    g.addEdge("Warehouse",     "West_Mall",     4.5, false, "West Expressway");
    g.addEdge("Warehouse",     "Tech_Park",     5.1, false, "Southern Boulevard");
    g.addEdge("Downtown",      "North_Station", 2.4, false, "North Transit Way");
    g.addEdge("Downtown",      "Harbor",        3.8, false, "Pier Corridor");
    g.addEdge("Downtown",      "Tech_Park",     4.8, false, "Central Connector");
    g.addEdge("North_Station", "Harbor",        1.9, false, "Bayside Parkway");
    g.addEdge("West_Mall",     "Suburbs",       4.0, false, "Valley Arterial");
    g.addEdge("Tech_Park",     "Suburbs",       3.5, false, "Industrial Link");
    g.addEdge("Tech_Park",     "Airport",       6.2, false, "Airport Freeway");
    g.addEdge("Suburbs",       "Airport",       5.8, false, "Outer Ring Road");

    return g;
}

Graph createDisconnectedGraph() {
    Graph g;

    // Component 1
    g.addVertex("Warehouse",     "Central Depot",       37.7749, -122.4194);
    g.addVertex("Downtown",      "Downtown Plaza",      37.7833, -122.4167);
    g.addVertex("North_Station", "North Train Station", 37.7950, -122.4050);
    g.addEdge("Warehouse", "Downtown", 3.0, false, "Road 1");
    g.addEdge("Downtown", "North_Station", 2.5, false, "Road 2");

    // Component 2 (Disconnected cluster)
    g.addVertex("Harbor",  "Harbor Port", 37.8050, -122.4100);
    g.addVertex("Airport", "Airport",     37.7120, -122.3850);
    g.addEdge("Harbor", "Airport", 8.0, false, "Coast Highway");

    // Component 3 (Completely Isolated Node)
    g.addVertex("Suburbs", "Isolated Suburbs", 37.7300, -122.4300);

    return g;
}

Graph createTreeGraph() {
    Graph g;

    // Root
    g.addVertex("Warehouse", "Depot", 0, 0);

    // Level 1
    g.addVertex("Node_A", "Node A", 1, 0);
    g.addVertex("Node_B", "Node B", 0, 1);

    // Level 2
    g.addVertex("Node_A1", "Node A1", 2, 0);
    g.addVertex("Node_A2", "Node A2", 2, 1);
    g.addVertex("Node_B1", "Node B1", 0, 2);

    g.addEdge("Warehouse", "Node_A", 2.0, false);
    g.addEdge("Warehouse", "Node_B", 3.0, false);
    g.addEdge("Node_A", "Node_A1", 1.5, false);
    g.addEdge("Node_A", "Node_A2", 2.5, false);
    g.addEdge("Node_B", "Node_B1", 1.8, false);

    return g;
}

} // namespace SampleData
