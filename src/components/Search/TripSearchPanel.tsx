import React, { useState } from 'react';
import { useTransit } from '../../context/TransitContext';
import { ArrowUpDown, Search, MapPin, Clock, Building2, AlertCircle } from 'lucide-react';
import { CITIES } from '../../data/transitData';
import { CityId } from '../../types/transit';

export const TripSearchPanel: React.FC = () => {
  const {
    selectedCity,
    setSelectedCity,
    availableStops,
    originStopId,
    destinationStopId,
    setOriginStopId,
    setDestinationStopId,
    preferredDepartureTime,
    setPreferredDepartureTime,
    swapStops,
    handleSearch,
    cityInfo,
    availableRoutes,
  } = useTransit();

  const [fromSearchQuery, setFromSearchQuery] = useState('');
  const [toSearchQuery, setToSearchQuery] = useState('');

  const departureTimeOptions = ['Now (Live)', '06:00 AM', '08:00 AM', '10:30 AM', '01:00 PM', '04:30 PM', '06:30 PM', '09:00 PM'];

  const filteredOriginStops = availableStops.filter(s =>
    s.name.toLowerCase().includes(fromSearchQuery.toLowerCase()) ||
    s.tamilName.toLowerCase().includes(fromSearchQuery.toLowerCase())
  );

  const filteredDestinationStops = availableStops.filter(s =>
    s.name.toLowerCase().includes(toSearchQuery.toLowerCase()) ||
    s.tamilName.toLowerCase().includes(toSearchQuery.toLowerCase())
  );

  return (
    <div className="bg-white border-b border-slate-200 p-4 lg:p-5">
      {/* City Switcher Row */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-emerald-700" />
          <span className="text-xs font-semibold text-slate-700">Select City:</span>
        </div>
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          {CITIES.map(city => (
            <button
              key={city.id}
              onClick={() => setSelectedCity(city.id as CityId)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer whitespace-nowrap ${
                selectedCity === city.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {city.name}
            </button>
          ))}
        </div>
      </div>

      {/* From and To Input Form */}
      <div className="space-y-3">
        {/* Origin Stop */}
        <div className="relative">
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              From (Origin Stop)
            </label>
            <span className="text-[11px] text-slate-400">Boarding</span>
          </div>
          <div className="relative">
            <select
              value={originStopId}
              onChange={e => setOriginStopId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-emerald-500 focus:bg-white focus:outline-none rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 transition-colors cursor-pointer"
            >
              <option value="" disabled>Select Starting Bus Stop</option>
              {availableStops.map(stop => (
                <option key={stop.id} value={stop.id}>
                  {stop.name} ({stop.tamilName})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Swap Button Divider */}
        <div className="flex justify-center -my-1 relative z-10">
          <button
            onClick={swapStops}
            title="Swap origin and destination"
            className="w-8 h-8 rounded-full bg-white border border-slate-200 shadow-xs text-slate-600 hover:text-emerald-700 hover:border-emerald-300 hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Destination Stop */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-600"></span>
              To (Destination Stop)
            </label>
            <span className="text-[11px] text-slate-400">Alighting</span>
          </div>
          <select
            value={destinationStopId}
            onChange={e => setDestinationStopId(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-emerald-500 focus:bg-white focus:outline-none rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 transition-colors cursor-pointer"
          >
            <option value="" disabled>Select Destination Bus Stop</option>
            {availableStops.map(stop => (
              <option key={stop.id} value={stop.id}>
                {stop.name} ({stop.tamilName})
              </option>
            ))}
          </select>
        </div>

        {/* Departure Time Selector */}
        <div>
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mb-1">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            Preferred Departure Time
          </label>
          <select
            value={preferredDepartureTime}
            onChange={e => setPreferredDepartureTime(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-emerald-500 focus:bg-white focus:outline-none rounded-xl px-3.5 py-2 text-xs font-medium text-slate-700 transition-colors cursor-pointer"
          >
            {departureTimeOptions.map(time => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>
        </div>

        {/* Find Buses Action Button */}
        <button
          onClick={handleSearch}
          disabled={!originStopId || !destinationStopId}
          className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2"
        >
          <Search className="w-4 h-4" />
          <span>Find Buses in {cityInfo.name}</span>
        </button>
      </div>

      {/* Operator and Network metadata */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-3 border-t border-slate-100">
        <span>Network: {cityInfo.operator}</span>
        <span>{availableRoutes.length} Active Routes</span>
      </div>
    </div>
  );
};
