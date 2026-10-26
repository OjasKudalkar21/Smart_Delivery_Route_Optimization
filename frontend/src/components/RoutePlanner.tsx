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
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Warehouse className="w-5 h-5 text-indigo-400" />
            Route Configuration
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure delivery origin and target delivery vertices on the graph
          </p>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          title="Reset to default stops"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Origin / Warehouse Selector */}
      <div className="space-y-2">
        <label htmlFor="warehouse-select" className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
          <span>Starting Depot (Warehouse)</span>
          <span className="text-[11px] font-normal text-indigo-400">Vertex Origin</span>
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
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          >
            {availableVertices.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} ({v.id})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick Select Buttons from Graph Vertices */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-300 uppercase tracking-wider">Quick-Select Graph Stops</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSelectAll}
              className="text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Select All
            </button>
            <span className="text-slate-600">•</span>
            <button
              onClick={handleClearAll}
              className="text-slate-400 hover:text-slate-300 transition-colors"
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
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/50 shadow-sm'
                    : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                {isSelected && <Check className="w-3 h-3 text-indigo-400" />}
                {v.name.split(' ')[0]} ({v.id})
              </button>
            );
          })}
        </div>
      </div>

      {/* Add Custom Stop Input */}
      <div className="space-y-2">
        <label htmlFor="custom-stop-input" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
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
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={() => handleAddStop(newStopInput.trim())}
            disabled={!newStopInput.trim()}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium flex items-center gap-1.5 transition-colors border border-slate-700"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Active Delivery Stops Sequence */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-300 uppercase tracking-wider">
            Selected Destinations ({selectedDestinations.length})
          </span>
          <span className="text-slate-400 text-[11px]">
            Input Order (Used for Baseline)
          </span>
        </div>

        {selectedDestinations.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-slate-800 rounded-xl bg-slate-900/30">
            <AlertCircle className="w-6 h-6 text-slate-500 mx-auto mb-2" />
            <p className="text-xs text-slate-400">No delivery stops selected.</p>
            <p className="text-[11px] text-slate-500 mt-1">Select one or more stops from above.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {selectedDestinations.map((stopId, index) => {
              const vertexObj = availableVertices.find((v) => v.id === stopId);
              return (
                <div
                  key={`${stopId}-${index}`}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 transition-all text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-mono font-bold flex items-center justify-center text-[10px]">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-slate-100">{vertexObj?.name ?? stopId}</p>
                      <p className="text-[10px] text-slate-400 font-mono">ID: {stopId}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveStop(stopId)}
                    className="p-1 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
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
        <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{validationWarning}</span>
        </div>
      )}

      {/* Server/API Error Notice */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={onOptimize}
          disabled={isLoading || selectedDestinations.length === 0}
          className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        >
          {isLoading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          <span>Optimize Route (Greedy)</span>
        </button>

        <button
          onClick={onCompare}
          disabled={isLoading || selectedDestinations.length === 0}
          className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-200 font-semibold rounded-xl text-sm border border-slate-700 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        >
          <GitCompare className="w-4 h-4 text-purple-400" />
          <span>Compare with Baseline</span>
        </button>
      </div>
    </div>
  );
};
