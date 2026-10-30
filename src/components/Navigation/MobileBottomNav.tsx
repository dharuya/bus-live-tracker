import React from 'react';
import { useTransit } from '../../context/TransitContext';
import { Bus, Calendar, Compass, Server } from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const { activeTab, setActiveTab } = useTransit();

  const tabs = [
    { id: 'tracker', label: 'Live Map', icon: Bus },
    { id: 'schedule', label: 'Schedules', icon: Calendar },
    { id: 'alternatives', label: 'Alternatives', icon: Compass },
    { id: 'real-api-guide', label: 'API Setup', icon: Server },
  ] as const;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200">
      <div className="grid grid-cols-4 items-center h-16 px-1">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`min-h-[44px] flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
                isActive ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
              <span className="text-[11px] mt-0.5 tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
