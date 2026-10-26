#include "RouteOptimizer.hpp"

#include <algorithm>
#include <sstream>
#include <iomanip>
#include <set>
#include <cmath>

RouteOptimizer::RouteOptimizer(const Graph& graph) : graph_(graph) {}

std::vector<std::string> RouteOptimizer::prepareDestinations(
    const std::string& start,
    const std::vector<std::string>& destinations) const {
    
    std::vector<std::string> prepared;
    std::set<std::string> seen;

    for (const auto& dest : destinations) {
        if (dest.empty() || dest == start) {
            continue; // Skip empty strings or accidental warehouse repeats
        }
        if (seen.find(dest) == seen.end()) {
            seen.insert(dest);
            prepared.push_back(dest);
        }
    }
    return prepared;
}

RouteResult RouteOptimizer::optimizeGreedy(
    const std::string& start,
    const std::vector<std::string>& destinations) const {

    if (!graph_.hasVertex(start)) {
        throw std::invalid_argument("Cannot optimize route: starting vertex '" + start + "' does not exist in graph.");
    }

    RouteResult result;
    result.strategy = "greedy";
    result.startLocation = start;
    result.requestedStops = destinations;
    result.fullPath.push_back(start);

    std::vector<std::string> remaining = prepareDestinations(start, destinations);
    if (remaining.empty()) {
        result.isComplete = true;
        result.totalDistance = 0.0;
        return result;
    }

    std::string currentLocation = start;
    int stepNum = 1;

    while (!remaining.empty()) {
        DijkstraResult dRes = graph_.dijkstra(currentLocation);

        std::vector<std::pair<std::string, double>> candidates;
        double bestDistance = DijkstraResult::INF;
        int bestIndex = -1;

        for (size_t i = 0; i < remaining.size(); ++i) {
            const std::string& stop = remaining[i];
            double dist = DijkstraResult::INF;
            if (graph_.hasVertex(stop)) {
                dist = dRes.getDistance(stop);
            }
            candidates.push_back({stop, dist});

            // Select nearest reachable stop; tie-break deterministically by alphabetical order
            if (dist < bestDistance) {
                bestDistance = dist;
                bestIndex = static_cast<int>(i);
            } else if (dist == bestDistance && bestIndex >= 0 && stop < remaining[bestIndex]) {
                bestIndex = static_cast<int>(i);
            }
        }

        // If no remaining stops are reachable from current location
        if (bestIndex < 0 || bestDistance == DijkstraResult::INF) {
            for (const auto& stop : remaining) {
                result.unreachableStops.push_back(stop);
            }
            result.isComplete = false;
            break;
        }

        std::string chosenStop = remaining[bestIndex];
        ShortestPathResult legPath = dRes.getPathTo(chosenStop);

        // Record RouteLeg
        RouteLeg leg;
        leg.legIndex = static_cast<int>(result.legs.size()) + 1;
        leg.from = currentLocation;
        leg.to = chosenStop;
        leg.distance = legPath.totalDistance;
        leg.path = legPath.path;
        result.legs.push_back(leg);

        result.totalDistance += legPath.totalDistance;
        result.orderedStops.push_back(chosenStop);

        // Stitch into full path (avoid repeating current location)
        for (size_t p = 1; p < legPath.path.size(); ++p) {
            result.fullPath.push_back(legPath.path[p]);
        }

        // Format step explanation
        std::ostringstream oss;
        oss << "From '" << currentLocation << "', evaluated " << candidates.size() << " candidate stops. ";
        oss << "Selected nearest unvisited stop '" << chosenStop << "' at " << std::fixed << std::setprecision(2)
            << bestDistance << " km.";

        result.executionTrace.push_back({
            stepNum++,
            currentLocation,
            remaining,
            candidates,
            chosenStop,
            bestDistance,
            oss.str()
        });

        // Advance current location and remove chosen stop
        currentLocation = chosenStop;
        remaining.erase(remaining.begin() + bestIndex);
    }

    result.isComplete = result.unreachableStops.empty();
    return result;
}

RouteResult RouteOptimizer::computeBaseline(
    const std::string& start,
    const std::vector<std::string>& destinations) const {

    if (!graph_.hasVertex(start)) {
        throw std::invalid_argument("Cannot compute baseline: starting vertex '" + start + "' does not exist in graph.");
    }

    RouteResult result;
    result.strategy = "baseline";
    result.startLocation = start;
    result.requestedStops = destinations;
    result.fullPath.push_back(start);

    std::vector<std::string> orderedInput = prepareDestinations(start, destinations);
    if (orderedInput.empty()) {
        result.isComplete = true;
        result.totalDistance = 0.0;
        return result;
    }

    std::string currentLocation = start;

    for (const auto& nextStop : orderedInput) {
        if (!graph_.hasVertex(nextStop)) {
            result.unreachableStops.push_back(nextStop);
            result.isComplete = false;
            continue;
        }

        DijkstraResult dRes = graph_.dijkstra(currentLocation);
        if (!dRes.isReachable(nextStop)) {
            result.unreachableStops.push_back(nextStop);
            result.isComplete = false;
        } else {
            ShortestPathResult legPath = dRes.getPathTo(nextStop);

            RouteLeg leg;
            leg.legIndex = static_cast<int>(result.legs.size()) + 1;
            leg.from = currentLocation;
            leg.to = nextStop;
            leg.distance = legPath.totalDistance;
            leg.path = legPath.path;
            result.legs.push_back(leg);

            result.totalDistance += legPath.totalDistance;
            result.orderedStops.push_back(nextStop);

            for (size_t p = 1; p < legPath.path.size(); ++p) {
                result.fullPath.push_back(legPath.path[p]);
            }

            currentLocation = nextStop;
        }
    }

    result.isComplete = result.unreachableStops.empty();
    return result;
}

RouteComparisonResult RouteOptimizer::compare(
    const std::string& start,
    const std::vector<std::string>& destinations) const {

    RouteComparisonResult comparison;
    comparison.greedyRoute = optimizeGreedy(start, destinations);
    comparison.baselineRoute = computeBaseline(start, destinations);

    comparison.distanceDifference = comparison.baselineRoute.totalDistance - comparison.greedyRoute.totalDistance;
    if (comparison.baselineRoute.totalDistance > 0.0) {
        comparison.percentageSavings = (comparison.distanceDifference / comparison.baselineRoute.totalDistance) * 100.0;
    } else {
        comparison.percentageSavings = 0.0;
    }

    comparison.greedyIsBetter = (comparison.greedyRoute.totalDistance < comparison.baselineRoute.totalDistance) &&
                                comparison.greedyRoute.isComplete;

    std::ostringstream oss;
    oss << "Greedy Route: " << std::fixed << std::setprecision(2) << comparison.greedyRoute.totalDistance << " km | ";
    oss << "Baseline Route: " << comparison.baselineRoute.totalDistance << " km. ";

    if (comparison.greedyIsBetter) {
        oss << "Greedy optimization saved " << comparison.distanceDifference << " km ("
            << comparison.percentageSavings << "% distance reduction). ";
    } else if (comparison.greedyRoute.totalDistance == comparison.baselineRoute.totalDistance) {
        oss << "Both greedy and baseline routes resulted in identical total distance ("
            << comparison.greedyRoute.totalDistance << " km). ";
    } else {
        oss << "Baseline input order was shorter by " << std::fabs(comparison.distanceDifference) << " km. ";
    }

    oss << "Note: The greedy nearest-neighbor heuristic makes locally optimal choices at each stop; "
        << "it does not guarantee a globally optimal minimum tour for the NP-hard Travelling Salesperson Problem (TSP).";

    comparison.analysisSummary = oss.str();
    return comparison;
}
