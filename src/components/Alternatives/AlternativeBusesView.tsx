import React, { useState } from 'react';
import { useTransit } from '../../context/TransitContext';
import { BusResultCard } from '../Tracker/BusResultCard';
import { LiveBus } from '../../types/transit';
import {
  Compass,
  ArrowRight,
  TrendingDown,
  Sparkles,
  ShieldCheck,
  Clock,
  Users,
} from 'lucide-react';

interface AlternativeBusesViewProps {
  onOpenReportModal: (bus: LiveBus) => void;
  onViewSchedule: (routeId: string) => void;
}

export const AlternativeBusesView: React.FC<AlternativeBusesViewProps> = ({
  onOpenReportModal,
  onViewSchedule,
}) => {
  const { searchResults, originStopId, destinationStopId, availableStops, cityInfo } = useTransit();
  const [sortBy, setSortBy] = useState<'duration' | 'wait' | 'crowd'>('duration');

  const originStop = availableStops.find(s => s.id === originStopId);
  const destStop = availableStops.find(s => s.id === destinationStopId);

  const { alternativeResults, directResults } = searchResults;

  const sortedAlternatives = [...alternativeResults].sort((a, b) => {
    if (sortBy === 'duration') return a.totalEstimatedMinutes - b.totalEstimatedMinutes;
    if (sortBy === 'wait') return a.estimatedWaitMinutes - b.estimatedWaitMinutes;
    if (sortBy === 'crowd') {
      const crowdScore = { Low: 1, Moderate: 2, High: 3, Full: 4 };
      const aCrowd = a.liveBuses[0] ? crowdScore[a.liveBuses[0].crowdLevel] : 2;
      const bCrowd = b.liveBuses[0] ? crowdScore[b.liveBuses[0].crowdLevel] : 2;
      return aCrowd - bCrowd;
    }
    return 0;
  });

  return (
    <div className="p-4 lg:p-6 space-y-5 bg-white min-h-full">
      {/* View Header */}
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <Compass className="w-5 h-5 text-indigo-600" />
          <h1 className="text-xl font-bold text-slate-900">
            Smart Alternative Bus Suggestions
          </h1>
        </div>
        <p className="text-xs text-slate-500">
          Ranked alternative routes, nearby parallel lines, and low-crowd options when your primary bus is delayed or packed.
        </p>

        {originStop && destStop && (
          <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <span>Route:</span>
            <span className="text-emerald-700">{originStop.name}</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-red-700">{destStop.name}</span>
          </div>
        )}
      </div>

      {/* Sorting Tabs */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-slate-400 font-medium">Rank by:</span>
        <button
          onClick={() => setSortBy('duration')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
            sortBy === 'duration'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Fastest Overall Travel Time
        </button>
        <button
          onClick={() => setSortBy('wait')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
            sortBy === 'wait'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Earliest Bus Arrival
        </button>
        <button
          onClick={() => setSortBy('crowd')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
            sortBy === 'crowd'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Least Crowded Seats
        </button>
      </div>

      {/* Alternatives List */}
      {sortedAlternatives.length > 0 ? (
        <div className="space-y-4">
          <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs text-indigo-900 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <strong>Why choose an alternative?</strong> Direct buses may suffer from peak-hour traffic bottlenecks or high passenger loads. These options board at a nearby stop or utilize high-frequency transit corridors in {cityInfo.name}.
            </div>
          </div>

          <div className="space-y-3">
            {sortedAlternatives.map(alt => (
              <BusResultCard
                key={`page-alt-${alt.route.id}`}
                result={alt}
                onOpenReportModal={onOpenReportModal}
                onViewSchedule={onViewSchedule}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <Compass className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-700">No Alternative Routes Required</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            All direct bus services between the selected stops are operating smoothly on schedule. You can board any of the direct services listed on the main live tracker.
          </p>
        </div>
      )}
    </div>
  );
};
