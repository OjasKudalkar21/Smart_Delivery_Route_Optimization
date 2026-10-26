#ifndef EDGE_HPP
#define EDGE_HPP

#include <string>
#include <stdexcept>
#include <iostream>

/**
 * @brief Represents a directed road connection to an adjacent vertex.
 * 
 * Road distance (weight) must be strictly non-negative.
 */
struct Edge {
    std::string to;         // Target vertex identifier
    double weight;          // Road travel distance/weight (must be >= 0.0)
    std::string roadName;   // Optional road/street name (e.g., "Highway 101")

    Edge() : to(""), weight(0.0), roadName("") {}

    Edge(std::string to, double weight, std::string roadName = "")
        : to(std::move(to)), weight(weight), roadName(std::move(roadName)) {
        if (this->weight < 0.0) {
            throw std::invalid_argument("Edge weight cannot be negative: " + std::to_string(this->weight));
        }
    }

    bool operator<(const Edge& other) const {
        if (to != other.to) {
            return to < other.to;
        }
        return weight < other.weight;
    }

    bool operator==(const Edge& other) const {
        return to == other.to && weight == other.weight && roadName == other.roadName;
    }
};

inline std::ostream& operator<<(std::ostream& os, const Edge& e) {
    os << "Edge(to=" << e.to << ", weight=" << e.weight;
    if (!e.roadName.empty()) {
        os << ", road=" << e.roadName;
    }
    os << ")";
    return os;
}

#endif // EDGE_HPP
