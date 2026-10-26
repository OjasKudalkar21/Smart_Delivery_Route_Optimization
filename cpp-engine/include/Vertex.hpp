#ifndef VERTEX_HPP
#define VERTEX_HPP

#include <string>
#include <iostream>

/**
 * @brief Represents a delivery vertex/location in the route network.
 * 
 * Each vertex has a unique identifier, an optional human-readable name,
 * and geographic coordinates (latitude, longitude) for map rendering.
 */
struct Vertex {
    std::string id;       // Unique identifier (e.g., "Warehouse", "Stop_A")
    std::string name;     // Human-readable location title (e.g., "Central Depot")
    double lat;           // Geographic latitude (for map visualization)
    double lon;           // Geographic longitude (for map visualization)

    Vertex() : id(""), name(""), lat(0.0), lon(0.0) {}

    Vertex(std::string id, std::string name = "", double lat = 0.0, double lon = 0.0)
        : id(std::move(id)), name(std::move(name)), lat(lat), lon(lon) {
        if (this->name.empty()) {
            this->name = this->id;
        }
    }

    bool operator==(const Vertex& other) const {
        return id == other.id;
    }

    bool operator<(const Vertex& other) const {
        return id < other.id;
    }
};

inline std::ostream& operator<<(std::ostream& os, const Vertex& v) {
    os << "Vertex(id=" << v.id << ", name=" << v.name << ", lat=" << v.lat << ", lon=" << v.lon << ")";
    return os;
}

#endif // VERTEX_HPP
