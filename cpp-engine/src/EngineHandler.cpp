#include "EngineHandler.hpp"

#include <iostream>
#include <chrono>

JsonValue EngineHandler::makeErrorResponse(const std::string& action, const std::string& errorMsg) {
    std::cerr << "[RouteEngine Error] Action: '" << action << "' failed: " << errorMsg << std::endl;
    JsonValue resp;
    resp["status"] = "error";
    resp["action"] = action;
    resp["error"] = errorMsg;
    return resp;
}

Graph EngineHandler::buildGraphFromJson(const JsonValue& graphJson) {
    if (graphJson.isNull() || graphJson["useSample"].asBool(false) || !graphJson.contains("vertices")) {
        std::cerr << "[RouteEngine] Using built-in sample delivery network graph" << std::endl;
        return SampleData::createSampleDeliveryGraph();
    }

    Graph g;
    const auto& verticesArr = graphJson["vertices"].asArray();
    for (const auto& vJson : verticesArr) {
        std::string id = vJson["id"].asString();
        std::string name = vJson["name"].asString(id);
        double lat = vJson["lat"].asDouble(0.0);
        double lon = vJson["lon"].asDouble(0.0);
        if (!id.empty()) {
            g.addVertex(id, name, lat, lon);
        }
    }

    const auto& edgesArr = graphJson["edges"].asArray();
    for (const auto& eJson : edgesArr) {
        std::string from = eJson["from"].asString();
        std::string to = eJson["to"].asString();
        double distance = eJson["distance"].asDouble(0.0);
        bool directed = eJson["directed"].asBool(false);
        std::string road = eJson["road"].asString("");
        if (!from.empty() && !to.empty()) {
            g.addEdge(from, to, distance, directed, road);
        }
    }

    std::cerr << "[RouteEngine] Loaded custom graph: " << g.getVertexCount() << " vertices, "
              << g.getEdgeCount() << " edges" << std::endl;
    return g;
}

JsonValue EngineHandler::handleHealth() {
    JsonValue resp;
    resp["status"] = "ok";
    resp["engine"] = "RoutePilot C++17 DSA Engine";
    resp["version"] = "1.0.0";
    return resp;
}

JsonValue EngineHandler::handleGetSampleGraph() {
    Graph g = SampleData::createSampleDeliveryGraph();
    JsonValue resp;
    resp["status"] = "success";
    resp["action"] = "get_sample_graph";
    resp["warehouse"] = "Warehouse";

    JsonValue verticesArr(std::vector<JsonValue>{});
    for (const auto& id : g.getAllVertexIds()) {
        const auto& v = g.getVertex(id);
        JsonValue vObj;
        vObj["id"] = v.id;
        vObj["name"] = v.name;
        vObj["lat"] = v.lat;
        vObj["lon"] = v.lon;
        verticesArr.push_back(vObj);
    }
    resp["vertices"] = verticesArr;

    JsonValue edgesArr(std::vector<JsonValue>{});
    for (const auto& u : g.getAllVertexIds()) {
        for (const auto& e : g.getNeighbors(u)) {
            // For undirected graphs, output each pair once (u < e.to)
            if (u < e.to) {
                JsonValue eObj;
                eObj["from"] = u;
                eObj["to"] = e.to;
                eObj["distance"] = e.weight;
                eObj["road"] = e.roadName;
                edgesArr.push_back(eObj);
            }
        }
    }
    resp["edges"] = edgesArr;
    return resp;
}

JsonValue EngineHandler::handleAnalyzeGraph(const JsonValue& req) {
    Graph g = buildGraphFromJson(req["graph"]);
    std::string start = req["start"].asString("Warehouse");

    if (!g.hasVertex(start)) {
        return makeErrorResponse("analyze_graph", "Starting vertex '" + start + "' not found in graph.");
    }

    BFSTraversalResult bfsRes = g.bfs(start);
    DFSTraversalResult dfsRes = g.dfs(start);

    JsonValue resp;
    resp["status"] = "success";
    resp["action"] = "analyze_graph";
    resp["start"] = start;

    // BFS serialization
    JsonValue bfsJson;
    bfsJson["startVertex"] = bfsRes.startVertex;

    JsonValue bfsOrder(std::vector<JsonValue>{});
    for (const auto& v : bfsRes.visitedOrder) bfsOrder.push_back(v);
    bfsJson["visitedOrder"] = bfsOrder;

    JsonValue hopLevels;
    for (const auto& pair : bfsRes.hopLevels) hopLevels[pair.first] = pair.second;
    bfsJson["hopLevels"] = hopLevels;

    JsonValue predecessors;
    for (const auto& pair : bfsRes.predecessors) predecessors[pair.first] = pair.second;
    bfsJson["predecessors"] = predecessors;

    JsonValue bfsUnreachable(std::vector<JsonValue>{});
    for (const auto& v : bfsRes.unreachableVertices) bfsUnreachable.push_back(v);
    bfsJson["unreachable"] = bfsUnreachable;

    JsonValue bfsSteps(std::vector<JsonValue>{});
    for (const auto& step : bfsRes.steps) {
        JsonValue sObj;
        sObj["stepNumber"] = step.stepNumber;
        sObj["currentVertex"] = step.currentVertex;
        JsonValue qSnap(std::vector<JsonValue>{});
        for (const auto& item : step.containerState) qSnap.push_back(item);
        sObj["queueState"] = qSnap;
        sObj["action"] = step.action;
        bfsSteps.push_back(sObj);
    }
    bfsJson["steps"] = bfsSteps;
    resp["bfs"] = bfsJson;

    // DFS serialization
    JsonValue dfsJson;
    dfsJson["startVertex"] = dfsRes.startVertex;
    dfsJson["hasCycle"] = dfsRes.hasCycle;

    JsonValue dfsOrder(std::vector<JsonValue>{});
    for (const auto& v : dfsRes.visitedOrder) dfsOrder.push_back(v);
    dfsJson["visitedOrder"] = dfsOrder;

    JsonValue discTimes;
    for (const auto& pair : dfsRes.discoveryTimes) discTimes[pair.first] = pair.second;
    dfsJson["discoveryTimes"] = discTimes;

    JsonValue finTimes;
    for (const auto& pair : dfsRes.finishTimes) finTimes[pair.first] = pair.second;
    dfsJson["finishTimes"] = finTimes;

    JsonValue dfsUnreachable(std::vector<JsonValue>{});
    for (const auto& v : dfsRes.unreachableVertices) dfsUnreachable.push_back(v);
    dfsJson["unreachable"] = dfsUnreachable;

    JsonValue dfsSteps(std::vector<JsonValue>{});
    for (const auto& step : dfsRes.steps) {
        JsonValue sObj;
        sObj["stepNumber"] = step.stepNumber;
        sObj["currentVertex"] = step.currentVertex;
        JsonValue stSnap(std::vector<JsonValue>{});
        for (const auto& item : step.containerState) stSnap.push_back(item);
        sObj["stackState"] = stSnap;
        sObj["action"] = step.action;
        dfsSteps.push_back(sObj);
    }
    dfsJson["steps"] = dfsSteps;
    resp["dfs"] = dfsJson;

    return resp;
}

static JsonValue serializeRouteResult(const RouteResult& route) {
    JsonValue rObj;
    rObj["strategy"] = route.strategy;
    rObj["startLocation"] = route.startLocation;
    rObj["totalDistance"] = route.totalDistance;
    rObj["isComplete"] = route.isComplete;

    JsonValue orderedArr(std::vector<JsonValue>{});
    for (const auto& s : route.orderedStops) orderedArr.push_back(s);
    rObj["route"] = orderedArr;

    JsonValue fullPathArr(std::vector<JsonValue>{});
    for (const auto& node : route.fullPath) fullPathArr.push_back(node);
    rObj["fullPath"] = fullPathArr;

    JsonValue legsArr(std::vector<JsonValue>{});
    for (const auto& leg : route.legs) {
        JsonValue legObj;
        legObj["legIndex"] = leg.legIndex;
        legObj["from"] = leg.from;
        legObj["to"] = leg.to;
        legObj["distance"] = leg.distance;
        JsonValue pathArr(std::vector<JsonValue>{});
        for (const auto& p : leg.path) pathArr.push_back(p);
        legObj["path"] = pathArr;
        legsArr.push_back(legObj);
    }
    rObj["legs"] = legsArr;

    JsonValue unreachableArr(std::vector<JsonValue>{});
    for (const auto& s : route.unreachableStops) unreachableArr.push_back(s);
    rObj["unreachableStops"] = unreachableArr;

    JsonValue traceArr(std::vector<JsonValue>{});
    for (const auto& step : route.executionTrace) {
        JsonValue stepObj;
        stepObj["stepNumber"] = step.stepNumber;
        stepObj["currentLocation"] = step.currentLocation;
        stepObj["selectedStop"] = step.selectedStop;
        stepObj["selectedDistance"] = step.selectedDistance;
        stepObj["explanation"] = step.explanation;

        JsonValue candArr(std::vector<JsonValue>{});
        for (const auto& cand : step.candidateDistances) {
            JsonValue cObj;
            cObj["stop"] = cand.first;
            cObj["distance"] = cand.second;
            candArr.push_back(cObj);
        }
        stepObj["candidates"] = candArr;
        traceArr.push_back(stepObj);
    }
    rObj["algorithmTrace"] = traceArr;

    return rObj;
}

JsonValue EngineHandler::handleOptimizeRoute(const JsonValue& req) {
    Graph g = buildGraphFromJson(req["graph"]);
    std::string start = req["start"].asString("Warehouse");

    if (!g.hasVertex(start)) {
        return makeErrorResponse("optimize_route", "Starting vertex '" + start + "' not found in graph.");
    }

    std::vector<std::string> destinations;
    const auto& destArr = req["destinations"].asArray();
    for (const auto& d : destArr) {
        destinations.push_back(d.asString());
    }

    RouteOptimizer optimizer(g);
    RouteResult route = optimizer.optimizeGreedy(start, destinations);

    JsonValue resp = serializeRouteResult(route);
    resp["status"] = route.isComplete ? "success" : "partial";
    resp["action"] = "optimize_route";
    return resp;
}

JsonValue EngineHandler::handleCompareRoutes(const JsonValue& req) {
    Graph g = buildGraphFromJson(req["graph"]);
    std::string start = req["start"].asString("Warehouse");

    if (!g.hasVertex(start)) {
        return makeErrorResponse("compare_routes", "Starting vertex '" + start + "' not found in graph.");
    }

    std::vector<std::string> destinations;
    const auto& destArr = req["destinations"].asArray();
    for (const auto& d : destArr) {
        destinations.push_back(d.asString());
    }

    RouteOptimizer optimizer(g);
    RouteComparisonResult comp = optimizer.compare(start, destinations);

    JsonValue resp;
    resp["status"] = "success";
    resp["action"] = "compare_routes";
    resp["start"] = start;
    resp["greedy"] = serializeRouteResult(comp.greedyRoute);
    resp["baseline"] = serializeRouteResult(comp.baselineRoute);
    resp["distanceDifference"] = comp.distanceDifference;
    resp["percentageSavings"] = comp.percentageSavings;
    resp["greedyIsBetter"] = comp.greedyIsBetter;
    resp["analysisSummary"] = comp.analysisSummary;

    return resp;
}

JsonValue EngineHandler::processRequest(const std::string& rawInput) {
    if (rawInput.empty()) {
        return makeErrorResponse("unknown", "Empty JSON request payload received.");
    }

    JsonValue req;
    try {
        req = JsonValue::parse(rawInput);
    } catch (const std::exception& e) {
        return makeErrorResponse("parse_error", std::string("Malformed JSON syntax: ") + e.what());
    }

    std::string action = req["action"].asString("");
    if (action.empty()) {
        // Fallback action detection from fields
        if (req.contains("destinations")) {
            action = "optimize_route";
        } else if (req.contains("start")) {
            action = "analyze_graph";
        } else {
            action = "health";
        }
    }

    try {
        if (action == "health") {
            return handleHealth();
        } else if (action == "get_sample_graph") {
            return handleGetSampleGraph();
        } else if (action == "analyze_graph") {
            return handleAnalyzeGraph(req);
        } else if (action == "optimize_route") {
            return handleOptimizeRoute(req);
        } else if (action == "compare_routes") {
            return handleCompareRoutes(req);
        } else {
            return makeErrorResponse(action, "Unknown action '" + action + "'. Supported: health, get_sample_graph, analyze_graph, optimize_route, compare_routes.");
        }
    } catch (const std::exception& e) {
        return makeErrorResponse(action, std::string("Execution exception: ") + e.what());
    }
}

int EngineHandler::runStdinStdout() {
    std::ios_base::sync_with_stdio(false);
    std::cin.tie(nullptr);

    std::cerr << "[RouteEngine] Listening on stdin for JSON requests..." << std::endl;
    std::string input((std::istreambuf_iterator<char>(std::cin)), std::istreambuf_iterator<char>());

    auto startT = std::chrono::high_resolution_clock::now();
    JsonValue response = processRequest(input);
    auto endT = std::chrono::high_resolution_clock::now();

    auto elapsedMs = std::chrono::duration_cast<std::chrono::microseconds>(endT - startT).count() / 1000.0;
    std::cerr << "[RouteEngine] Request processed in " << elapsedMs << " ms" << std::endl;

    std::cout << response.serialize(2) << std::endl;
    return response["status"].asString() == "error" ? 1 : 0;
}
