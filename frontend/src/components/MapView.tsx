import React, { useEffect, useRef, useCallback } from 'react';
import type { Vertex, Edge, RouteResult } from '../types';
import { Map as MapIcon, Maximize2, AlertTriangle, Home } from 'lucide-react';
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

  // Fit bounds helper to center map on active route or all vertices
  const handleFitBounds = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map || vertices.length === 0) return;

    const vertexMap = new Map<string, Vertex>();
    vertices.forEach((v) => vertexMap.set(v.id, v));

    // Priority 1: Fit to active route path if present
    if (routeResult && routeResult.fullPath.length > 1) {
      const routeCoords: [number, number][] = [];
      for (const nodeId of routeResult.fullPath) {
        const node = vertexMap.get(nodeId);
        if (node) routeCoords.push([node.lat, node.lon]);
      }
      if (routeCoords.length > 0) {
        map.fitBounds(L.latLngBounds(routeCoords), { padding: [50, 50], maxZoom: 14 });
        return;
      }
    }

    // Priority 2: Fit to all vertices in graph
    const allCoords: [number, number][] = vertices.map((v) => [v.lat, v.lon]);
    if (allCoords.length > 0) {
      map.fitBounds(L.latLngBounds(allCoords), { padding: [40, 40], maxZoom: 13 });
    }
  }, [vertices, routeResult]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Leaflet map instance once
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
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors | RoutePilot C++ Engine',
      }).addTo(map);

      mapInstanceRef.current = map;
      layerGroupRef.current = L.layerGroup().addTo(map);

      // Force size recalculation to prevent tile clipping
      setTimeout(() => {
        map.invalidateSize();
      }, 200);
    }

    const map = mapInstanceRef.current;
    const layers = layerGroupRef.current;
    if (!map || !layers) return;

    layers.clearLayers();

    // Map vertex lookup by ID
    const vertexMap = new Map<string, Vertex>();
    vertices.forEach((v) => vertexMap.set(v.id, v));

    // 1. Draw all road edges as background graph lines
    edges.forEach((edge) => {
      const u = vertexMap.get(edge.from);
      const v = vertexMap.get(edge.to);
      if (u && v) {
        const polyline = L.polyline(
          [
            [u.lat, u.lon],
            [v.lat, v.lon],
          ],
          {
            color: '#334155',
            weight: 2,
            opacity: 0.7,
            dashArray: '5, 5',
          }
        ).addTo(layers);

        polyline.bindTooltip(
          `<div class="text-[11px] font-sans">
            <strong>${edge.road || 'Road'}</strong>: ${edge.distance} km
            <br/><span class="text-slate-400">${edge.from} &harr; ${edge.to}</span>
          </div>`,
          { sticky: true, className: 'leaflet-dark-tooltip' }
        );
      }
    });

    // 2. Draw active route path if computed by C++ engine
    if (routeResult && routeResult.fullPath.length > 1) {
      const routeCoords: [number, number][] = [];
      for (const nodeId of routeResult.fullPath) {
        const node = vertexMap.get(nodeId);
        if (node) {
          routeCoords.push([node.lat, node.lon]);
        }
      }

      if (routeCoords.length > 1) {
        // Outer glowing outline
        L.polyline(routeCoords, {
          color: '#4338ca',
          weight: 7,
          opacity: 0.5,
          lineJoin: 'round',
        }).addTo(layers);

        // Core route polyline
        const routeLine = L.polyline(routeCoords, {
          color: '#818cf8',
          weight: 4,
          opacity: 0.95,
          lineJoin: 'round',
        }).addTo(layers);

        routeLine.bindPopup(
          `<div class="text-xs p-1">
            <strong class="text-indigo-400 font-bold">${
              routeResult.strategy === 'greedy' ? 'Greedy TSP Delivery Route' : 'Baseline Route'
            }</strong><br/>
            <span>Total Distance: <strong>${routeResult.totalDistance} km</strong></span><br/>
            <span>Stops Visited: <strong>${routeResult.route.length}</strong></span>
          </div>`
        );

        // Auto-fit bounds to the computed path
        map.fitBounds(L.latLngBounds(routeCoords), { padding: [50, 50], maxZoom: 14 });
      }
    } else if (vertices.length > 0) {
      // Auto-fit to all graph vertices if no route is active
      const allCoords: [number, number][] = vertices.map((v) => [v.lat, v.lon]);
      map.fitBounds(L.latLngBounds(allCoords), { padding: [40, 40], maxZoom: 13 });
    }

    // 3. Place Markers for all Vertices in graph
    vertices.forEach((vertex) => {
      const isStart = vertex.id === startLocation;
      const stopOrderIndex = routeResult ? routeResult.route.indexOf(vertex.id) : -1;
      const isVisited = stopOrderIndex !== -1;
      const isUnreachable =
        routeResult && routeResult.unreachableStops
          ? routeResult.unreachableStops.includes(vertex.id)
          : false;

      // Custom HTML Marker Styling
      let markerHtml = '';
      if (isStart) {
        markerHtml = `
          <div class="flex items-center justify-center rounded-full text-[10px] font-bold border-2 border-white bg-emerald-600 text-white w-8 h-8 -translate-x-4 -translate-y-4 shadow-xl shadow-emerald-500/50 ring-4 ring-emerald-500/20 transition-transform hover:scale-125 cursor-pointer">
            <span class="text-xs">&#9962;</span>
          </div>
        `;
      } else if (isVisited) {
        markerHtml = `
          <div class="flex items-center justify-center rounded-full text-[11px] font-extrabold border-2 border-white bg-indigo-600 text-white w-7 h-7 -translate-x-3.5 -translate-y-3.5 shadow-lg shadow-indigo-500/50 ring-2 ring-indigo-400 transition-transform hover:scale-125 cursor-pointer">
            #${stopOrderIndex + 1}
          </div>
        `;
      } else if (isUnreachable) {
        markerHtml = `
          <div class="flex items-center justify-center rounded-full text-[10px] font-bold border-2 border-amber-300 bg-amber-600 text-white w-7 h-7 -translate-x-3.5 -translate-y-3.5 shadow-lg shadow-amber-500/40 ring-2 ring-amber-400 transition-transform hover:scale-125 cursor-pointer">
            !
          </div>
        `;
      } else {
        markerHtml = `
          <div class="flex items-center justify-center rounded-full text-[10px] font-semibold border border-slate-600 bg-slate-800 text-slate-300 w-6 h-6 -translate-x-3 -translate-y-3 shadow transition-transform hover:scale-125 cursor-pointer">
            ${vertex.id.charAt(0)}
          </div>
        `;
      }

      const customIcon = L.divIcon({
        className: 'custom-map-marker',
        html: markerHtml,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([vertex.lat, vertex.lon], { icon: customIcon }).addTo(layers);

      marker.bindPopup(`
        <div class="text-xs font-sans text-slate-100 p-1 space-y-1">
          <div class="font-bold text-sm text-indigo-300 border-b border-slate-700 pb-1">${vertex.name}</div>
          <div class="text-[11px] text-slate-400 font-mono">ID: ${vertex.id}</div>
          <div class="text-[11px] text-slate-400">Coords: ${vertex.lat.toFixed(4)}, ${vertex.lon.toFixed(4)}</div>
          ${
            isStart
              ? '<div class="inline-block px-2 py-0.5 mt-1 rounded bg-emerald-950 border border-emerald-700 text-emerald-300 font-bold text-[10px]">Origin Depot</div>'
              : ''
          }
          ${
            isVisited
              ? `<div class="inline-block px-2 py-0.5 mt-1 rounded bg-indigo-950 border border-indigo-700 text-indigo-300 font-bold text-[10px]">Delivery Stop #${
                  stopOrderIndex + 1
                }</div>`
              : ''
          }
          ${
            isUnreachable
              ? '<div class="inline-block px-2 py-0.5 mt-1 rounded bg-amber-950 border border-amber-700 text-amber-300 font-bold text-[10px]">Unreachable from Depot</div>'
              : ''
          }
        </div>
      `);
    });
  }, [vertices, edges, routeResult, startLocation]);

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <MapIcon className="w-5 h-5 text-indigo-400" />
            Interactive Route Map (Phase 7)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Leaflet visualization of graph vertices, road edges, and ordered delivery legs
          </p>
        </div>

        {/* Legend & Center View Button */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-3 text-xs bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 border border-white" />
              <span className="text-slate-300 text-[11px]">Depot</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-indigo-500 border border-white" />
              <span className="text-slate-300 text-[11px]">Delivery Stop</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-1 bg-indigo-400 rounded" />
              <span className="text-slate-300 text-[11px]">Route</span>
            </div>
          </div>

          <button
            onClick={handleFitBounds}
            title="Fit bounds to route"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Fit Map</span>
          </button>
        </div>
      </div>

      {/* Map Canvas Container */}
      <div className="relative rounded-xl overflow-hidden border border-slate-800 h-[400px] w-full shadow-inner">
        <div ref={mapContainerRef} className="h-full w-full dark-tiles z-0" />
      </div>

      {/* Attribution & Legend Footer */}
      <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-1 gap-2">
        <div className="flex items-center gap-2">
          <span>&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-400">OpenStreetMap</a> contributors</span>
          <span>&bull;</span>
          <span>Leaflet Tile Layer</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <span className="flex items-center gap-1">
            <Home className="w-3 h-3 text-emerald-400" />
            Depot: <strong className="text-slate-200">{startLocation}</strong>
          </span>
          {routeResult && (
            <>
              <span>&bull;</span>
              <span>Sequence: <strong>{routeResult.route.length} stops</strong> ({routeResult.totalDistance} km)</span>
            </>
          )}
          {routeResult && routeResult.unreachableStops && routeResult.unreachableStops.length > 0 && (
            <>
              <span>&bull;</span>
              <span className="text-amber-400 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {routeResult.unreachableStops.length} Unreachable
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
