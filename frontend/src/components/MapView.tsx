import React, { useEffect, useRef } from 'react';
import type { Vertex, Edge, RouteResult } from '../types';
import { Map as MapIcon } from 'lucide-react';
import L from 'leaflet';

interface MapViewProps {
  vertices: Vertex[];
  edges: Edge[];
  routeResult: RouteResult | null;
  startLocation: string;
}

export const MapView: React.FC<MapViewProps> = ({
  vertices,
  edges,
  routeResult,
  startLocation,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Leaflet map once
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [37.765, -122.415],
        zoom: 12,
        zoomControl: true,
        attributionControl: true,
      });

      // Dark style tile layer from OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors | RoutePilot DSA Engine',
      }).addTo(map);

      mapInstanceRef.current = map;
      layerGroupRef.current = L.layerGroup().addTo(map);
    }

    const map = mapInstanceRef.current;
    const layers = layerGroupRef.current;
    if (!map || !layers) return;

    layers.clearLayers();

    // Map vertex lookup by ID
    const vertexMap = new Map<string, Vertex>();
    vertices.forEach((v) => vertexMap.set(v.id, v));

    // Draw all road edges as faint background lines
    edges.forEach((edge) => {
      const u = vertexMap.get(edge.from);
      const v = vertexMap.get(edge.to);
      if (u && v) {
        L.polyline(
          [
            [u.lat, u.lon],
            [v.lat, v.lon],
          ],
          {
            color: '#334155',
            weight: 2,
            opacity: 0.6,
            dashArray: '4, 4',
          }
        ).addTo(layers);
      }
    });

    // Draw active route path if computed
    if (routeResult && routeResult.fullPath.length > 1) {
      const routeCoords: [number, number][] = [];
      for (const nodeId of routeResult.fullPath) {
        const node = vertexMap.get(nodeId);
        if (node) {
          routeCoords.push([node.lat, node.lon]);
        }
      }

      if (routeCoords.length > 1) {
        L.polyline(routeCoords, {
          color: '#6366f1',
          weight: 4.5,
          opacity: 0.9,
          lineJoin: 'round',
        }).addTo(layers);

        // Fit map bounds to the route
        map.fitBounds(L.latLngBounds(routeCoords), { padding: [40, 40] });
      }
    }

    // Place Markers for all Vertices
    vertices.forEach((vertex) => {
      const isStart = vertex.id === startLocation;
      const stopOrderIndex = routeResult ? routeResult.route.indexOf(vertex.id) : -1;
      const isVisited = stopOrderIndex !== -1;

      // Custom HTML Marker Icon
      let markerBg = 'bg-slate-700 text-slate-300 border-slate-600';
      let label = vertex.id.charAt(0);

      if (isStart) {
        markerBg = 'bg-emerald-600 text-white border-white shadow-lg shadow-emerald-500/50 ring-2 ring-emerald-400';
        label = 'Depot';
      } else if (isVisited) {
        markerBg = 'bg-indigo-600 text-white border-white shadow-lg shadow-indigo-500/50 ring-2 ring-indigo-400';
        label = `#${stopOrderIndex + 1}`;
      }

      const customIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div class="flex items-center justify-center rounded-full text-[10px] font-bold border ${markerBg} w-7 h-7 -translate-x-3.5 -translate-y-3.5 transition-transform hover:scale-125">
            ${label}
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([vertex.lat, vertex.lon], { icon: customIcon }).addTo(layers);
      marker.bindPopup(`
        <div class="text-xs font-sans text-slate-900 p-1">
          <strong class="text-sm font-bold">${vertex.name}</strong><br/>
          <span class="text-slate-600">ID: ${vertex.id}</span><br/>
          ${isStart ? '<span class="text-emerald-700 font-bold">Origin Depot</span>' : ''}
          ${isVisited ? `<span class="text-indigo-700 font-bold">Stop Order: #${stopOrderIndex + 1}</span>` : ''}
        </div>
      `);
    });
  }, [vertices, edges, routeResult, startLocation]);

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
      {/* Header & Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <MapIcon className="w-5 h-5 text-indigo-400" />
            Interactive Route Map
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Visualizing vertices, graph edges, and calculated delivery path
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 border border-white" />
            <span className="text-slate-300">Depot</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-indigo-500 border border-white" />
            <span className="text-slate-300">Delivery Stop</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-1 bg-indigo-500 rounded" />
            <span className="text-slate-300">Active Route</span>
          </div>
        </div>
      </div>

      {/* Map Canvas Container */}
      <div className="relative rounded-xl overflow-hidden border border-slate-800 h-[380px] w-full">
        <div ref={mapContainerRef} className="h-full w-full dark-tiles z-0" />
      </div>

      {/* Attribution and note */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
        <span>Leaflet &bull; OpenStreetMap Data &bull; WGS84 Geo Coordinates</span>
        <span className="text-slate-400">DSA Demo Mode (Custom Graph Network)</span>
      </div>
    </div>
  );
};
