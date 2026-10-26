#ifndef ENGINE_HANDLER_HPP
#define ENGINE_HANDLER_HPP

#include "SimpleJson.hpp"
#include "Graph.hpp"
#include "RouteOptimizer.hpp"
#include "SampleData.hpp"

#include <string>
#include <iostream>

/**
 * @brief Dispatcher and handler bridging the C++ engine with the Express API.
 * 
 * Communication Protocol:
 * - Reads JSON request from standard input (stdin)
 * - Validates input fields and schema
 * - Executes requested DSA algorithm (BFS, DFS, Dijkstra, Greedy, Baseline)
 * - Emits machine-readable JSON response to standard output (stdout)
 * - Emits diagnostic and debugging logs exclusively to standard error (stderr)
 */
class EngineHandler {
public:
    /**
     * @brief Processes a raw JSON request string and returns the JSON response.
     */
    static JsonValue processRequest(const std::string& rawInput);

    /**
     * @brief Reads JSON from std::cin, processes it, and writes JSON to std::cout.
     */
    static int runStdinStdout();

private:
    static Graph buildGraphFromJson(const JsonValue& graphJson);
    static JsonValue handleHealth();
    static JsonValue handleGetSampleGraph();
    static JsonValue handleAnalyzeGraph(const JsonValue& req);
    static JsonValue handleOptimizeRoute(const JsonValue& req);
    static JsonValue handleCompareRoutes(const JsonValue& req);
    static JsonValue makeErrorResponse(const std::string& action, const std::string& errorMsg);
};

#endif // ENGINE_HANDLER_HPP
