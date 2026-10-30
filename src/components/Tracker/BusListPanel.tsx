import React, { useState } from 'react';
import { useTransit } from '../../context/TransitContext';
import { BusResultCard } from './BusResultCard';
import { LiveBus } from '../../types/transit';
import {
  Play,
  Pause,
  FastForward,
  Info,
  SlidersHorizontal,
  Compass,
  Bus,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface BusListPanelProps {
  onOpenReportModal: (bus: LiveBus) => void;
  onViewSchedule: (routeId: string) => void;
}

export const BusListPanel: React.FC<BusListPanelProps> = ({
  onOpenReportModal,
  onViewSchedule,
}) => {
  const {
    searchResults,
    hasSearched,
    isSimulationRunning,
    toggleSimulation,
    simulationSpeed,
    setSimulationSpeed,
    cityInfo,
    showDemoNotice,
    setShowDemoNotice,
    setActiveTab,
  } = useTransit();

  const [filterServiceType, setFilterServiceType] = useState<string>('all');

  const { directResults, alternativeResults } = searchResults;

  const filteredDirect = directResults.filter(r => {
    if (filterServiceType === 'all') return true;
    return r.route.serviceType.toLowerCase().includes(filterServiceType.toLowerCase());
  });

  return (
    <div className="p-4 lg:p-5 space-y-4">
      {/* Demo Notice Banner */}
      {showDemoNotice && (
        <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 text-xs text-amber-900 flex items-start justify-between gap-2.5">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-950">Demonstration Mode Active: </span>
              Bus coordinates, speeds, and passenger occupancies are simulated using authentic routes for {cityInfo.name}.
              <button
                onClick={() => setActiveTab('real-api-guide')}
                className="ml-1 text-emerald-800 underline font-semibold hover:text-emerald-950 cursor-pointer"
              >
                Learn how to connect real TNSTC/MTC GPS feeds →
              </button>
            </div>
          </div>
          <button
            onClick={() => setShowDemoNotice(false)}
            className="text-amber-700 hover:text-amber-950 text-base font-bold leading-none cursor-pointer p-0.5"
            title="Dismiss notice"
          >
            ×
          </button>
        </div>
      )}

      {/* Simulation Controls Strip */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2 flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-800">Live Simulator:</span>
          <span className="text-[11px] text-slate-500 hidden sm:inline">Advancing along road waypoints</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleSimulation}
            className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
              isSimulationRunning
                ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            {isSimulationRunning ? (
              <>
                <Pause className="w-3 h-3" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-current" />
                <span>Resume</span>
              </>
            )}
          </button>

          <button
            onClick={() => setSimulationSpeed(simulationSpeed === 1 ? 2 : 1)}
            className={`px-2 py-1 rounded-lg font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
              simulationSpeed === 2
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
            title="Toggle simulation speed"
          >
            <FastForward className="w-3 h-3" />
            <span>{simulationSpeed}x</span>
          </button>
        </div>
      </div>

      {/* Service Type Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 font-medium mr-1 text-[11px]">Filter:</span>
        {['all', 'ordinary', 'deluxe', 'express'].map(type => (
          <button
            key={type}
            onClick={() => setFilterServiceType(type)}
            className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer capitalize ${
              filterServiceType === type
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {type === 'all' ? 'All Services' : type}
          </button>
        ))}
      </div>

      {/* Direct Buses Results */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Bus className="w-4 h-4 text-emerald-600" />
            Direct Buses ({filteredDirect.length})
          </h2>
          <span className="text-xs text-slate-500">Sorted by earliest arrival</span>
        </div>

        {filteredDirect.length > 0 ? (
          <div className="space-y-3">
            {filteredDirect.map(result => (
              <BusResultCard
                key={result.route.id}
                result={result}
                onOpenReportModal={onOpenReportModal}
                onViewSchedule={onViewSchedule}
              />
            ))}
          </div>
        ) : (
          <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center">
            <Bus className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-slate-700">No direct buses found</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Check the alternative bus routes below or try choosing a nearby major interchange like Gandhipuram, Ukkadam, or CMBT.
            </p>
          </div>
        )}
      </div>

      {/* Alternative Bus Suggestions */}
      {alternativeResults.length > 0 && (
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-indigo-600" />
              Alternative Buses & Smart Transfers ({alternativeResults.length})
            </h2>
          </div>
          <p className="text-xs text-slate-500 mb-3">
            If your preferred bus is delayed or crowded, these connecting lines reach your destination with minimal walking or 1 quick transfer.
          </p>

          <div className="space-y-3">
            {alternativeResults.map(result => (
              <BusResultCard
                key={`alt-${result.route.id}`}
                result={result}
                onOpenReportModal={onOpenReportModal}
                onViewSchedule={onViewSchedule}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
