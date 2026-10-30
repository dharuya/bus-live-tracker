import React, { useState, useMemo } from 'react';
import { useTransit } from '../../context/TransitContext';
import { generateDailyTripsForRoute, BUS_STOPS } from '../../data/transitData';
import {
  Calendar,
  Clock,
  MapPin,
  Bus,
  ArrowRight,
  Info,
  Download,
  Filter,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';
import { BusRoute, RouteTrip } from '../../types/transit';

interface RouteScheduleViewProps {
  initialRouteId?: string | null;
}

export const RouteScheduleView: React.FC<RouteScheduleViewProps> = ({ initialRouteId }) => {
  const {
    availableRoutes,
    selectedCity,
    cityInfo,
    selectedRouteId,
    setSelectedRouteId,
  } = useTransit();

  const [activeRouteId, setActiveRouteId] = useState<string>(
    initialRouteId || selectedRouteId || availableRoutes[0]?.id || ''
  );

  const [direction, setDirection] = useState<'Outbound' | 'Inbound'>('Outbound');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('all');
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);

  const currentRoute = useMemo(() => {
    return availableRoutes.find(r => r.id === activeRouteId) || availableRoutes[0];
  }, [availableRoutes, activeRouteId]);

  // Generate daily timetable trips
  const allTrips = useMemo(() => {
    if (!currentRoute) return [];
    return generateDailyTripsForRoute(currentRoute);
  }, [currentRoute]);

  // Filter trips by time of day
  const filteredTrips = useMemo(() => {
    if (selectedTimeSlot === 'all') return allTrips;
    return allTrips.filter(trip => {
      const depHour = parseInt(trip.departureTime.split(':')[0], 10);
      const isPM = trip.departureTime.includes('PM');
      const hour24 = isPM && depHour < 12 ? depHour + 12 : !isPM && depHour === 12 ? 0 : depHour;

      if (selectedTimeSlot === 'morning') return hour24 >= 5 && hour24 < 11;
      if (selectedTimeSlot === 'afternoon') return hour24 >= 11 && hour24 < 16;
      if (selectedTimeSlot === 'evening') return hour24 >= 16 && hour24 < 20;
      if (selectedTimeSlot === 'night') return hour24 >= 20 || hour24 < 5;
      return true;
    });
  }, [allTrips, selectedTimeSlot]);

  // Active highlighted trip for detailed stop progression
  const activeTrip = useMemo(() => {
    if (selectedTripId) {
      return allTrips.find(t => t.tripId === selectedTripId) || allTrips[0];
    }
    return allTrips[0];
  }, [allTrips, selectedTripId]);

  if (!currentRoute) {
    return (
      <div className="p-8 text-center text-slate-500">
        No routes found for {cityInfo.name}.
      </div>
    );
  }

  const originStop = BUS_STOPS.find(s => s.id === currentRoute.originStopId);
  const destStop = BUS_STOPS.find(s => s.id === currentRoute.destinationStopId);

  return (
    <div className="p-4 lg:p-6 space-y-5 bg-white min-h-full">
      {/* Header and Route Selector */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600" />
              <h1 className="text-xl font-bold text-slate-900">
                Daily Route Timetable & Stop Schedule
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Complete scheduled departure and intermediate arrival times for {cityInfo.name} public bus corridors.
            </p>
          </div>

          {/* Prominent Demo Data Badge */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200">
              <Info className="w-3.5 h-3.5 text-amber-700" />
              Schedule Status: Demo Timetable
            </span>
          </div>
        </div>

        {/* Route Dropdown Picker & Direction Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Select Bus Route:
            </label>
            <select
              value={activeRouteId}
              onChange={e => {
                setActiveRouteId(e.target.value);
                setSelectedRouteId(e.target.value);
                setSelectedTripId(null);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {availableRoutes.map(r => (
                <option key={r.id} value={r.id}>
                  Route {r.routeNumber} — {r.name} ({r.serviceType})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Trip Direction:
            </label>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setDirection('Outbound')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  direction === 'Outbound' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Forward (Outbound)
              </button>
              <button
                onClick={() => setDirection('Inbound')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  direction === 'Inbound' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Return (Inbound)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Route Metadata Overview Card */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div>
          <span className="text-slate-500 block mb-0.5">Route Corridor</span>
          <span className="font-bold text-slate-900 text-sm">
            {direction === 'Outbound' ? originStop?.name.split(' ')[0] : destStop?.name.split(' ')[0]} →{' '}
            {direction === 'Outbound' ? destStop?.name.split(' ')[0] : originStop?.name.split(' ')[0]}
          </span>
          <span className="text-[11px] text-slate-500 block mt-0.5">{currentRoute.distanceKm} km total</span>
        </div>

        <div>
          <span className="text-slate-500 block mb-0.5">Operating Hours</span>
          <span className="font-bold text-slate-900 text-sm font-mono tabular-nums">
            {currentRoute.firstBus} – {currentRoute.lastBus}
          </span>
          <span className="text-[11px] text-slate-500 block mt-0.5">First / Last Bus</span>
        </div>

        <div>
          <span className="text-slate-500 block mb-0.5">Frequency & Duration</span>
          <span className="font-bold text-emerald-700 text-sm">
            Every {currentRoute.frequencyMinutes} mins
          </span>
          <span className="text-[11px] text-slate-500 block mt-0.5">~{currentRoute.avgDurationMinutes} mins one-way</span>
        </div>

        <div>
          <span className="text-slate-500 block mb-0.5">Fare & Service</span>
          <span className="font-bold text-slate-900 text-sm">
            {currentRoute.fareRange}
          </span>
          <span className="text-[11px] text-slate-500 block mt-0.5">{currentRoute.serviceType}</span>
        </div>
      </div>

      {/* Filter Trips by Time of Day */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-500 font-semibold mr-1">Time Filter:</span>
        {[
          { id: 'all', label: 'All Day (34 Trips)' },
          { id: 'morning', label: 'Morning Peak (05:00 - 11:00)' },
          { id: 'afternoon', label: 'Afternoon (11:00 - 16:00)' },
          { id: 'evening', label: 'Evening Peak (16:00 - 20:00)' },
          { id: 'night', label: 'Night (20:00+)' },
        ].map(slot => (
          <button
            key={slot.id}
            onClick={() => setSelectedTimeSlot(slot.id)}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
              selectedTimeSlot === slot.id
                ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {slot.label}
          </button>
        ))}
      </div>

      {/* Daily Departures Grid */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Daily Departures from {direction === 'Outbound' ? originStop?.name : destStop?.name}
          </h2>
          <span className="text-[11px] text-slate-500">Tap a departure time to view stop timings</span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
          {filteredTrips.map(trip => {
            const isSelected = activeTrip?.tripId === trip.tripId;
            return (
              <button
                key={trip.tripId}
                onClick={() => setSelectedTripId(trip.tripId)}
                className={`p-2 rounded-xl text-center border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white text-slate-800 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40'
                }`}
              >
                <span className="block text-xs font-bold font-mono tabular-nums">
                  {trip.departureTime}
                </span>
                <span className={`text-[10px] block mt-0.5 ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                  Trip #{trip.tripNumber}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stop Progression Timeline for Active Trip */}
      {activeTrip && (
        <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span className="font-bold text-sm text-slate-900">
                Stop-by-Stop Schedule for Trip #{activeTrip.tripNumber}
              </span>
              <span className="text-xs font-mono text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                Departs {activeTrip.departureTime} → Arrives {activeTrip.arrivalTime}
              </span>
            </div>

            <span className="text-[11px] text-slate-500">
              Simulated demonstration timetable for testing
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-2.5 px-4 w-12 text-center">#</th>
                  <th className="py-2.5 px-4">Bus Stop & Locality</th>
                  <th className="py-2.5 px-4 font-mono">Distance</th>
                  <th className="py-2.5 px-4 font-mono">Arrival Time</th>
                  <th className="py-2.5 px-4 font-mono">Departure</th>
                  <th className="py-2.5 px-4">Platform / Bay</th>
                  <th className="py-2.5 px-4">Status Indicator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeTrip.schedule.map((entry, idx) => {
                  const stop = BUS_STOPS.find(s => s.id === entry.stopId);
                  const isFirst = idx === 0;
                  const isLast = idx === activeTrip.schedule.length - 1;

                  return (
                    <tr
                      key={entry.stopId}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isFirst || isLast ? 'bg-slate-50/40 font-medium' : ''
                      }`}
                    >
                      <td className="py-3 px-4 text-center font-mono text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isFirst
                                ? 'bg-emerald-600 ring-4 ring-emerald-100'
                                : isLast
                                ? 'bg-red-600 ring-4 ring-red-100'
                                : 'bg-slate-400'
                            }`}
                          />
                          <div>
                            <span className="font-semibold text-slate-900 block text-xs">
                              {entry.stopName}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {stop?.tamilName} {stop?.hubType ? `· ${stop.hubType}` : ''}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600 tabular-nums">
                        {entry.distanceFromStartKm} km
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-800 tabular-nums">
                        {isFirst ? 'Origin Stop' : entry.scheduledArrivalTime}
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-emerald-700 tabular-nums">
                        {isLast ? 'Terminus' : entry.scheduledDepartureTime}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <span className="px-2 py-0.5 bg-slate-100 rounded text-[11px] font-medium">
                          {entry.platformOrBay}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Demo Scheduled
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Schedule Disclaimer Note */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-start gap-3">
        <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-slate-800 mb-0.5">
            Real Schedule Integration Notice
          </p>
          <p className="text-slate-500 leading-relaxed">
            This schedule is populated from representative operating hours and frequencies for TNSTC / MTC routes. When integrating with official transport open data portals (such as Chennai MTC Open Data GTFS or Tamil Nadu State Transport Corporation RT-feeds), this screen automatically ingests official agency timetables without changes to the frontend presentation.
          </p>
        </div>
      </div>
    </div>
  );
};
