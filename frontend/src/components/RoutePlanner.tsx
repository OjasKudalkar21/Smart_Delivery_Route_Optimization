import React, { useState } from 'react';
import type { Vertex } from '../types';
import { Warehouse, Plus, Trash2, Sparkles, RefreshCw, AlertCircle, GitCompare, Check } from 'lucide-react';

interface RoutePlannerProps {
  availableVertices: Vertex[];
  startLocation: string;
  setStartLocation: (start: string) => void;
  selectedDestinations: string[];
  setSelectedDestinations: (stops: string[]) => void;
  onOptimize: () => void;
  onCompare: () => void;
  onReset: () => void;
  isLoading: boolean;
  error: string | null;
}

export const RoutePlanner: React.FC<RoutePlannerProps> = ({
  availableVertices,
  startLocation,
  setStartLocation,
  selectedDestinations,
  setSelectedDestinations,
  onOptimize,
  onCompare,
  onReset,
  isLoading,
  error,
}) => {
  const [newStopInput, setNewStopInput] = useState<string>('');
  const [validationWarning, setValidationWarning] = useState<string | null>(null);

  // Available options excluding startLocation
  const candidateStops = availableVertices.filter((v) => v.id !== startLocation);

  const handleAddStop = (stopId: string) => {
    setValidationWarning(null);
    if (!stopId) return;

    if (stopId === startLocation) {
      setValidationWarning("Warehouse cannot be added as a delivery stop.");
      return;
    }

    if (selectedDestinations.includes(stopId)) {
      setValidationWarning(`Location '${stopId}' is already in the delivery list.`);
      return;
    }

    setSelectedDestinations([...selectedDestinations, stopId]);
    setNewStopInput('');
  };

  const handleRemoveStop = (stopId: string) => {
    setValidationWarning(null);
    setSelectedDestinations(selectedDestinations.filter((id) => id !== stopId));
  };

  const handleSelectAll = () => {
    setValidationWarning(null);
    const allCandidates = candidateStops.map((v) => v.id);
    setSelectedDestinations(allCandidates);
  };

  const handleClearAll = () => {
    setValidationWarning(null);
    setSelectedDestinations([]);
  };

  return (
    <div className="bg-white/95 backdrop-blur-md p-6 rounded-3xl border border-gray-200/80 shadow-xl shadow-gray-200/40 space-y-6 text-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Warehouse className="w-5 h-5 text-[#f26522]" />
            Route Configuration
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Configure delivery origin and target delivery vertices on the graph
          </p>
        </div>
        <button
          onClick={onReset}
          className="text-xs font-medium text-gray-500 hover:text-gray-800 flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
          title="Reset to default stops"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Origin / Warehouse Selector */}
      <div className="space-y-2">
        <label htmlFor="warehouse-select" className="text-xs font-semibold text-gray-700 uppercase tracking-wider flex items-center justify-between">
          <span>Starting Depot (Warehouse)</span>
          <span className="text-[11px] font-medium text-[#f26522] bg-orange-50 border border-orange-200/80 px-2.5 py-0.5 rounded-full">
            Vertex Origin
          </span>
        </label>
        <div className="relative">
          <select
            id="warehouse-select"
            value={startLocation}
            onChange={(e) => {
              const newStart = e.target.value;
              setStartLocation(newStart);
              // Remove if already in destinations
              if (selectedDestinations.includes(newStart)) {
                setSelectedDestinations(selectedDestinations.filter((s) => s !== newStart));
              }
            }}
            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-sm text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#f26522]/20 focus:border-[#f26522] focus:bg-white transition-all appearance-none cursor-pointer"
          >
            {availableVertices.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} ({v.id})
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Quick Select Buttons from Graph Vertices */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-gray-700 uppercase tracking-wider">Quick-Select Graph Stops</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSelectAll}
              className="text-gray-900 hover:text-[#f26522] font-medium transition-colors"
            >
              Select All
            </button>
            <span className="text-gray-300">•</span>
            <button
              onClick={handleClearAll}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {candidateStops.map((v) => {
            const isSelected = selectedDestinations.includes(v.id);
            return (
              <button
                key={v.id}
                onClick={() => (isSelected ? handleRemoveStop(v.id) : handleAddStop(v.id))}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-orange-50 text-orange-950 border-orange-300/80 shadow-xs font-semibold'
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                {isSelected && <Check className="w-3 h-3 text-[#f26522]" />}
                {v.name.split(' ')[0]} ({v.id})
              </button>
            );
          })}
        </div>
      </div>

      {/* Add Custom Stop Input */}
      <div className="space-y-2">
        <label htmlFor="custom-stop-input" className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
          Add Delivery Stop by ID
        </label>
        <div className="flex gap-2">
          <input
            id="custom-stop-input"
            type="text"
            placeholder="e.g. Airport, Harbor, Downtown..."
            value={newStopInput}
            onChange={(e) => setNewStopInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddStop(newStopInput.trim());
              }
            }}
            className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f26522]/20 focus:border-[#f26522] focus:bg-white transition-all"
          />
          <button
            onClick={() => handleAddStop(newStopInput.trim())}
            disabled={!newStopInput.trim()}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed text-white rounded-2xl text-sm font-medium flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Active Delivery Stops Sequence */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-gray-700 uppercase tracking-wider">
            Selected Destinations ({selectedDestinations.length})
          </span>
          <span className="text-gray-400 text-[11px]">
            Input Order (Used for Baseline)
          </span>
        </div>

        {selectedDestinations.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
            <AlertCircle className="w-6 h-6 text-gray-400 mx-auto mb-2" />
            <p className="text-xs font-medium text-gray-500">No delivery stops selected.</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Select one or more stops from above.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {selectedDestinations.map((stopId, index) => {
              const vertexObj = availableVertices.find((v) => v.id === stopId);
              return (
                <div
                  key={`${stopId}-${index}`}
                  className="flex items-center justify-between p-3 rounded-2xl bg-gray-50/80 border border-gray-200/80 hover:bg-white hover:border-gray-300 transition-all text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-white border border-gray-200 text-gray-700 font-mono font-bold flex items-center justify-center text-[10px] shadow-xs">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-gray-900">{vertexObj?.name ?? stopId}</p>
                      <p className="text-[10px] text-gray-500 font-mono">ID: {stopId}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveStop(stopId)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    title="Remove Stop"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Validation Warnings */}
      {validationWarning && (
        <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-orange-50 border border-orange-200/80 text-orange-900 text-xs font-medium">
          <AlertCircle className="w-4 h-4 shrink-0 text-[#f26522]" />
          <span>{validationWarning}</span>
        </div>
      )}

      {/* Server/API Error Notice */}
      {error && (
        <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-red-50 border border-red-200/80 text-red-700 text-xs font-medium">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={onOptimize}
          disabled={isLoading || selectedDestinations.length === 0}
          className="w-full py-3 px-4 bg-[#f26522] hover:bg-[#d95318] disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-2xl text-sm shadow-md shadow-orange-500/10 hover:shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        >
          {isLoading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4 text-white" />
          )}
          <span>Optimize Route (Greedy)</span>
        </button>

        <button
          onClick={onCompare}
          disabled={isLoading || selectedDestinations.length === 0}
          className="w-full py-3 px-4 bg-white hover:bg-gray-50 disabled:bg-gray-50 disabled:text-gray-300 disabled:border-gray-200 disabled:cursor-not-allowed text-gray-700 font-semibold rounded-2xl text-sm border border-gray-200 flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-xs"
        >
          <GitCompare className="w-4 h-4 text-[#f26522]" />
          <span>Compare with Baseline</span>
        </button>
      </div>
    </div>
  );
};