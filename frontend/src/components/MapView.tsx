import React, { useEffect, useRef, useState } from 'react';
import type { Vertex, Edge, RouteResult } from '../types';
import { Map as MapIcon, Maximize2, Minimize2, Package, Warehouse } from 'lucide-react';
import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';

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
  const mapViewportRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapStyle, setMapStyle] = useState<'street' | 'satellite'>('street');

  const toggleFullscreen = async () => {
    const viewport = mapViewportRef.current;
    if (!viewport) return;

    if (document.fullscreenElement === viewport) {
      await document.exitFullscreen();
    } else {
      await viewport.requestFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === mapViewportRef.current);
      requestAnimationFrame(() => mapInstanceRef.current?.invalidateSize());
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

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

      // Style tile layer from OpenStreetMap
      tileLayerRef.current = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
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
            color: '#cbd5e1',
            weight: 2,
            opacity: 0.8,
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
          color: '#f59e0b',
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

      // Use recognizable location icons while retaining route-state colors.
      let markerBg = 'bg-white text-slate-600 border-slate-300 shadow-md';

      if (isStart) {
        markerBg = 'bg-emerald-600 text-white border-white shadow-md shadow-emerald-500/30 ring-2 ring-emerald-500';
      } else if (isVisited) {
        markerBg = 'bg-amber-500 text-white border-white shadow-md shadow-amber-500/30 ring-2 ring-amber-400';
      }

      const locationIcon = renderToStaticMarkup(
        isStart
          ? <Warehouse size={18} strokeWidth={2.2} aria-hidden="true" />
          : <Package size={18} strokeWidth={2.2} aria-hidden="true" />
      );

      const customIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div class="relative flex items-center justify-center rounded-full border ${markerBg} w-10 h-10 transition-transform hover:scale-125">
            ${locationIcon}
            ${isVisited && !isStart ? `<span class="absolute -top-1.5 -right-1.5 flex items-center justify-center w-4 h-4 rounded-full bg-slate-900 text-white text-[9px] font-bold border border-white">${stopOrderIndex + 1}</span>` : ''}
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      const marker = L.marker([vertex.lat, vertex.lon], { icon: customIcon }).addTo(layers);
      marker.bindPopup(`
        <div class="text-xs font-sans text-slate-900 p-1">
          <strong class="text-sm font-bold text-slate-900">${vertex.name}</strong><br/>
          <span class="text-slate-500">ID: ${vertex.id}</span><br/>
          ${isStart ? '<span class="text-emerald-700 font-bold">Origin Depot</span>' : ''}
          ${isVisited ? `<span class="text-amber-700 font-bold">Stop Order: #${stopOrderIndex + 1}</span>` : ''}
        </div>
      `);
    });
  }, [vertices, edges, routeResult, startLocation]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    tileLayerRef.current?.remove();
    tileLayerRef.current = mapStyle === 'satellite'
      ? L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          maxZoom: 19,
          attribution: 'Tiles &copy; Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community',
        })
      : L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors | RoutePilot DSA Engine',
        });

    tileLayerRef.current.addTo(map);
  }, [mapStyle]);

  return (
    <div className="bg-white/95 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/40 space-y-4 text-slate-800">
      {/* Header & Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <MapIcon className="w-5 h-5 text-amber-500" />
            Interactive Route Map
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Visualizing vertices, graph edges, and calculated delivery path
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <Warehouse className="w-4 h-4 text-emerald-700" aria-hidden="true" />
            <span className="text-slate-700 font-medium">Depot</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Package className="w-4 h-4 text-amber-600" aria-hidden="true" />
            <span className="text-slate-700 font-medium">Delivery Stop</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-1 bg-amber-500 rounded" />
            <span className="text-slate-700 font-medium">Active Route</span>
          </div>
        </div>
      </div>

      {/* Map Canvas Container */}
      <div
        ref={mapViewportRef}
        className="map-fullscreen-viewport relative rounded-2xl overflow-hidden border border-slate-200 h-[380px] w-full shadow-inner"
      >
        <div className="absolute top-3 left-3 z-[1000] flex items-center rounded-lg border border-slate-200 bg-white/95 p-1 shadow-md">
          <button
            type="button"
            onClick={() => setMapStyle('street')}
            aria-pressed={mapStyle === 'street'}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              mapStyle === 'street' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            Street
          </button>
          <button
            type="button"
            onClick={() => setMapStyle('satellite')}
            aria-pressed={mapStyle === 'satellite'}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              mapStyle === 'satellite' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            Satellite
          </button>
        </div>
        <button
          type="button"
          onClick={toggleFullscreen}
          className="absolute top-3 right-3 z-[1000] p-2 rounded-lg bg-white/95 text-slate-700 border border-slate-200 shadow-md hover:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          aria-label={isFullscreen ? 'Exit fullscreen map' : 'View map fullscreen'}
          title={isFullscreen ? 'Exit fullscreen' : 'View fullscreen'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
        <div ref={mapContainerRef} className="h-full w-full z-0" />
      </div>

      {/* Attribution and note */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
        <span>Leaflet &bull; OpenStreetMap Data &bull; WGS84 Geo Coordinates</span>
        <span className="text-slate-500 font-medium">DSA Demo Mode (Custom Graph Network)</span>
      </div>
    </div>
  );
};