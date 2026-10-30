import React from 'react';
import { RouteSearchResult, LiveBus } from '../../types/transit';
import { useTransit } from '../../context/TransitContext';
import { calculateArrivalPrediction } from '../../utils/geoUtils';
import {
  Navigation,
  Clock,
  Users,
  MapPin,
  Calendar,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  Activity,
  MessageSquarePlus,
} from 'lucide-react';

interface BusResultCardProps {
  result: RouteSearchResult;
  onOpenReportModal: (bus: LiveBus) => void;
  onViewSchedule: (routeId: string) => void;
}

export const BusResultCard: React.FC<BusResultCardProps> = ({
  result,
  onOpenReportModal,
  onViewSchedule,
}) => {
  const {
    route,
    liveBuses,
    originStop,
    destinationStop,
    isAlternative,
    alternativeReason,
    estimatedTravelMinutes,
    totalEstimatedMinutes,
  } = result;

  const {
    selectedBusId,
    setSelectedBusId,
    selectedRouteId,
    setSelectedRouteId,
  } = useTransit();

  const primaryBus = liveBuses.length > 0 ? liveBuses[0] : null;
  const isSelected = selectedRouteId === route.id;

  const prediction = primaryBus
    ? calculateArrivalPrediction(primaryBus, route, originStop.id)
    : {
        arrivalMinutes: result.estimatedWaitMinutes,
        isApproaching: false,
        statusLabel: 'Scheduled service',
      };

  const crowdColors = {
    Low: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    Moderate: 'text-amber-800 bg-amber-50 border-amber-200',
    High: 'text-orange-800 bg-orange-50 border-orange-200',
    Full: 'text-red-800 bg-red-50 border-red-200',
  };

  const handleSelect = () => {
    setSelectedRouteId(route.id);
    if (primaryBus) {
      setSelectedBusId(primaryBus.vehicleId);
    }
  };

  return (
    <div
      onClick={handleSelect}
      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
        isSelected
          ? 'bg-emerald-50/30 border-emerald-500 shadow-sm'
          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
      }`}
    >
      {/* Alternative Route Banner if applicable */}
      {isAlternative && alternativeReason && (
        <div className="mb-2 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-lg px-2.5 py-1 flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5" />
          <span>Recommended Alternative: {alternativeReason}</span>
        </div>
      )}

      {/* Header Row: Route Number, Service Type, Demo Tag */}
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2.5">
          <div
            className="w-11 h-11 rounded-xl text-white font-extrabold text-base flex items-center justify-center shadow-xs shrink-0"
            style={{ backgroundColor: route.color || '#2563EB' }}
          >
            {route.routeNumber}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 leading-tight">
                {route.name}
              </h3>
              <span className="text-[11px] font-medium text-slate-500 px-1.5 py-0.5 bg-slate-100 rounded-md">
                {route.serviceType}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {route.tamilName} · Fare {route.fareRange}
            </p>
          </div>
        </div>

        {/* Demo Data Tag */}
        <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2 py-0.5 whitespace-nowrap shrink-0">
          Demo Data
        </span>
      </div>

      {/* Arrival Prediction Strip */}
      <div className="grid grid-cols-2 gap-2 my-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
        <div>
          <span className="text-[11px] text-slate-500 block mb-0.5">Arriving at {originStop.name.split(' ')[0]}</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-emerald-700 font-mono tabular-nums">
              {prediction.arrivalMinutes}
            </span>
            <span className="text-xs font-semibold text-slate-600">mins</span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-0.5">
            {prediction.statusLabel}
          </span>
        </div>

        <div className="border-l border-slate-200 pl-3">
          <span className="text-[11px] text-slate-500 block mb-0.5">Journey to {destinationStop.name.split(' ')[0]}</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-slate-900 font-mono tabular-nums">
              ~{estimatedTravelMinutes}
            </span>
            <span className="text-xs font-medium text-slate-600">mins</span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-0.5">
            {result.stopsBetweenCount} stops along route
          </span>
        </div>
      </div>

      {/* Live Vehicle & Crowd Level Info */}
      {primaryBus ? (
        <div className="space-y-2 text-xs border-t border-slate-100 pt-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-600">
              <Navigation className="w-3.5 h-3.5 text-slate-400" />
              <span>Next: <strong className="text-slate-800">{primaryBus.nextStopId.replace(/^(cbe|chn)-/, '').replace(/-/g, ' ').toUpperCase()}</strong></span>
              <span className="text-slate-300">·</span>
              <span className="font-mono tabular-nums">{primaryBus.speedKmh} km/h</span>
            </div>
            <span className="font-mono text-slate-400 text-[11px]">{primaryBus.vehicleId}</span>
          </div>

          {/* Crowd Level Display */}
          <div className="flex items-center justify-between p-2 rounded-lg border bg-white">
            <div className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-slate-600 font-medium">Passenger Occupancy:</span>
              <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] border ${crowdColors[primaryBus.crowdLevel]}`}>
                {primaryBus.crowdLevel}
              </span>
            </div>

            <div className="text-right">
              <span className="text-[11px] font-semibold text-slate-700 font-mono tabular-nums">
                {primaryBus.currentPassengers} / {primaryBus.capacity}
              </span>
              <span className="text-[10px] text-slate-400 block">
                {primaryBus.occupancyPercentage}% capacity
              </span>
            </div>
          </div>

          {/* Source and update timestamp */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-slate-400" />
              Source: {primaryBus.lastUpdatedSource}
            </span>
            <span>Updated {primaryBus.lastUpdated}</span>
          </div>
        </div>
      ) : (
        <div className="text-xs text-slate-500 italic py-1">
          Next bus departure scheduled per timetable ({route.frequencyMinutes}m frequency).
        </div>
      )}

      {/* Card Action Buttons */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewSchedule(route.id);
          }}
          className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Full Timetable</span>
        </button>

        {primaryBus && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenReportModal(primaryBus);
            }}
            className="py-1.5 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs rounded-lg border border-emerald-200 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <MessageSquarePlus className="w-3.5 h-3.5 text-emerald-600" />
            <span>Report Crowd</span>
          </button>
        )}
      </div>
    </div>
  );
};
