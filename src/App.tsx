import React, { useState } from 'react';
import { TransitProvider, useTransit } from './context/TransitContext';
import { Navbar } from './components/Navigation/Navbar';
import { MobileBottomNav } from './components/Navigation/MobileBottomNav';
import { TripSearchPanel } from './components/Search/TripSearchPanel';
import { BusListPanel } from './components/Tracker/BusListPanel';
import { BusTrackerMap } from './components/Map/BusTrackerMap';
import { RouteScheduleView } from './components/Schedule/RouteScheduleView';
import { AlternativeBusesView } from './components/Alternatives/AlternativeBusesView';
import { RealApiIntegrationGuide } from './components/Guide/RealApiIntegrationGuide';
import { CrowdReportModal } from './components/Crowd/CrowdReportModal';
import { LiveBus } from './types/transit';
import { Map, ListFilter, AlertCircle } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activeTab, setActiveTab, selectedBus, liveBuses } = useTransit();
  const [reportModalBus, setReportModalBus] = useState<LiveBus | null>(null);
  const [scheduleRouteId, setScheduleRouteId] = useState<string | null>(null);

  // Mobile sub-view toggle between List and Map when in tracker tab
  const [mobileViewMode, setMobileViewMode] = useState<'list' | 'map'>('list');

  const handleOpenReportModal = (bus: LiveBus) => {
    setReportModalBus(bus);
  };

  const handleOpenReportModalDefault = () => {
    const fallbackBus = selectedBus || liveBuses[0];
    if (fallbackBus) {
      setReportModalBus(fallbackBus);
    }
  };

  const handleViewSchedule = (routeId: string) => {
    setScheduleRouteId(routeId);
    setActiveTab('schedule');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900 pb-16 md:pb-0">
      {/* Top Bar Contract Navbar */}
      <Navbar onOpenReportModalDefault={handleOpenReportModalDefault} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {activeTab === 'tracker' && (
          <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden">
            {/* Mobile View Toggle Bar */}
            <div className="lg:hidden flex items-center bg-white border-b border-slate-200 px-4 py-2 shrink-0 justify-between">
              <span className="text-xs font-bold text-slate-700">Display Mode:</span>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                <button
                  onClick={() => setMobileViewMode('list')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                    mobileViewMode === 'list'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <ListFilter className="w-3.5 h-3.5" />
                    Bus List & ETAs
                  </span>
                </button>
                <button
                  onClick={() => setMobileViewMode('map')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                    mobileViewMode === 'map'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Map className="w-3.5 h-3.5 text-emerald-600" />
                    Live Map
                  </span>
                </button>
              </div>
            </div>

            {/* Left Column: Search & Bus ETAs */}
            <div
              className={`w-full lg:w-[460px] xl:w-[480px] flex flex-col bg-white border-r border-slate-200 overflow-y-auto shrink-0 ${
                mobileViewMode === 'map' ? 'hidden lg:flex' : 'flex'
              }`}
            >
              <TripSearchPanel />
              <div className="flex-1 overflow-y-auto">
                <BusListPanel
                  onOpenReportModal={handleOpenReportModal}
                  onViewSchedule={handleViewSchedule}
                />
              </div>
            </div>

            {/* Right Column: Live Interactive Map */}
            <div
              className={`flex-1 relative overflow-hidden ${
                mobileViewMode === 'list' ? 'hidden lg:block' : 'block h-full'
              }`}
            >
              <BusTrackerMap />
            </div>
          </div>
        )}

        {/* Dedicated Daily Schedule View */}
        {activeTab === 'schedule' && (
          <div className="flex-1 overflow-y-auto max-w-7xl mx-auto w-full py-4 px-4 sm:px-6">
            <RouteScheduleView initialRouteId={scheduleRouteId} />
          </div>
        )}

        {/* Alternatives View */}
        {activeTab === 'alternatives' && (
          <div className="flex-1 overflow-y-auto max-w-5xl mx-auto w-full py-4 px-4 sm:px-6">
            <AlternativeBusesView
              onOpenReportModal={handleOpenReportModal}
              onViewSchedule={handleViewSchedule}
            />
          </div>
        )}

        {/* Real API Integration Guide */}
        {activeTab === 'real-api-guide' && (
          <div className="flex-1 overflow-y-auto max-w-5xl mx-auto w-full py-4 px-4 sm:px-6">
            <RealApiIntegrationGuide />
          </div>
        )}
      </main>

      {/* Mobile Bottom Thumb Zone Bar */}
      <MobileBottomNav />

      {/* Passenger Crowd Reporting Modal */}
      {reportModalBus && (
        <CrowdReportModal
          bus={reportModalBus}
          isOpen={!!reportModalBus}
          onClose={() => setReportModalBus(null)}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <TransitProvider>
      <MainLayout />
    </TransitProvider>
  );
}
