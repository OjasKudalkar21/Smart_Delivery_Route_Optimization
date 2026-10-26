#include "EngineHandler.hpp"

/**
 * @brief Entry point for the RoutePilot C++17 DSA Engine executable.
 * 
 * Invocation:
 *   route_engine.exe < request.json > response.json
 * 
 * All outputs on stdout are guaranteed valid, machine-parseable JSON.
 * Diagnostic logs and metrics are emitted exclusively to stderr.
 */
int main() {
    return EngineHandler::runStdinStdout();
}
