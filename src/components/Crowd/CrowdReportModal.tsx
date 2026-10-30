import React, { useState } from 'react';
import { LiveBus, CrowdLevel } from '../../types/transit';
import { useTransit } from '../../context/TransitContext';
import { BUS_STOPS } from '../../data/transitData';
import {
  Users,
  X,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  Send,
} from 'lucide-react';

interface CrowdReportModalProps {
  bus: LiveBus;
  isOpen: boolean;
  onClose: () => void;
}

export const CrowdReportModal: React.FC<CrowdReportModalProps> = ({
  bus,
  isOpen,
  onClose,
}) => {
  const { submitCrowdReport, availableStops } = useTransit();

  const [selectedCrowd, setSelectedCrowd] = useState<CrowdLevel>(bus.crowdLevel);
  const [selectedStopId, setSelectedStopId] = useState<string>(bus.nextStopId || availableStops[0]?.id || '');
  const [reporterName, setReporterName] = useState<string>('Passenger at Stop');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  const crowdOptions: { level: CrowdLevel; label: string; desc: string; color: string }[] = [
    {
      level: 'Low',
      label: 'Low (< 40%)',
      desc: 'Many seats available throughout the bus',
      color: 'border-emerald-500 bg-emerald-50 text-emerald-900',
    },
    {
      level: 'Moderate',
      label: 'Moderate (40% - 70%)',
      desc: 'Most seats occupied; a few seats or comfortable standing room',
      color: 'border-amber-500 bg-amber-50 text-amber-900',
    },
    {
      level: 'High',
      label: 'High (70% - 90%)',
      desc: 'All seats taken; moderate standing crowd in aisle',
      color: 'border-orange-500 bg-orange-50 text-orange-900',
    },
    {
      level: 'Full',
      label: 'Full (90%+)',
      desc: 'Packed to maximum capacity; boarding may be difficult',
      color: 'border-red-500 bg-red-50 text-red-900',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitCrowdReport({
      vehicleId: bus.vehicleId,
      routeNumber: bus.routeNumber,
      stopId: selectedStopId,
      crowdLevel: selectedCrowd,
      reporterLabel: reporterName,
      notes,
    });

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-200 overflow-hidden animate-scale-in">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Report Passenger Crowd
              </h2>
              <p className="text-xs text-slate-500">
                Bus {bus.routeNumber} ({bus.vehicleId})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        {isSubmitted ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
            <h4 className="text-base font-bold text-slate-900">
              Crowd Status Updated!
            </h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Thank you for helping fellow commuters. The bus occupancy gauge and prediction have been updated in real-time.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">
                Observed Crowd Level:
              </label>
              <div className="space-y-2">
                {crowdOptions.map(opt => {
                  const isSelected = selectedCrowd === opt.level;
                  return (
                    <button
                      type="button"
                      key={opt.level}
                      onClick={() => setSelectedCrowd(opt.level)}
                      className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? `${opt.color} shadow-xs font-semibold`
                          : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold">{opt.label}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{opt.desc}</div>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-slate-800 bg-slate-800' : 'border-slate-300'
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Current Observation Stop */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Boarding / Observation Bus Stop:
              </label>
              <select
                value={selectedStopId}
                onChange={e => setSelectedStopId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                {availableStops.map(stop => (
                  <option key={stop.id} value={stop.id}>
                    {stop.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Optional Passenger Note:
              </label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g. Free seats in women's section, standing room near front door"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Verification Disclaimer */}
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Crowd reports are labeled as "Passenger Verified" with immediate live effect.</span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 px-3 border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Crowd Report</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
