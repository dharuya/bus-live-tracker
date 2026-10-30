import React from 'react';
import { useTransit } from '../../context/TransitContext';
import { Bus, MapPin, Calendar, Compass, Server, Users } from 'lucide-react';
import { CITIES } from '../../data/transitData';
import { CityId } from '../../types/transit';

interface NavbarProps {
  onOpenReportModalDefault: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenReportModalDefault }) => {
  const {
    activeTab,
    setActiveTab,
    selectedCity,
    setSelectedCity,
    cityInfo,
  } = useTransit();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
            <Bus className="w-5 h-5" />
          </div>
          <button
            onClick={() => setActiveTab('tracker')}
            className="text-left cursor-pointer group"
          >
            <span className="text-base font-extrabold tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors whitespace-nowrap block">
              Smart Bus Tracker
            </span>
            <span className="text-[11px] font-medium text-slate-500 block leading-none">
              Tamil Nadu Urban Transit
            </span>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
          <button
            onClick={() => setActiveTab('tracker')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'tracker'
                ? 'text-emerald-700 border-b-2 border-emerald-600 font-bold'
                : 'hover:text-slate-900'
            }`}
          >
            Live Tracker
          </button>

          <button
            onClick={() => setActiveTab('schedule')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'schedule'
                ? 'text-emerald-700 border-b-2 border-emerald-600 font-bold'
                : 'hover:text-slate-900'
            }`}
          >
            Daily Schedules
          </button>

          <button
            onClick={() => setActiveTab('alternatives')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'alternatives'
                ? 'text-emerald-700 border-b-2 border-emerald-600 font-bold'
                : 'hover:text-slate-900'
            }`}
          >
            Alternative Buses
          </button>

          <button
            onClick={() => setActiveTab('real-api-guide')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'real-api-guide'
                ? 'text-emerald-700 border-b-2 border-emerald-600 font-bold'
                : 'hover:text-slate-900'
            }`}
          >
            API Integration
          </button>
        </nav>

        {/* Zone 3: 1 Primary Contextual Action */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="hidden sm:flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200 text-xs">
            {CITIES.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedCity(c.id as CityId)}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                  selectedCity === c.id
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          <button
            onClick={onOpenReportModalDefault}
            className="h-9 px-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs whitespace-nowrap"
          >
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            <span>Report Crowd</span>
          </button>
        </div>
      </div>
    </header>
  );
};
