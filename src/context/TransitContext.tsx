import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  CityId,
  CityInfo,
  BusStop,
  BusRoute,
  LiveBus,
  CrowdReportSubmission,
  RouteSearchResult,
  CrowdLevel,
} from '../types/transit';
import { CITIES, BUS_STOPS, BUS_ROUTES, INITIAL_LIVE_BUSES } from '../data/transitData';
import { interpolateRoutePosition, searchRoutes } from '../utils/geoUtils';

interface TransitContextType {
  selectedCity: CityId;
  setSelectedCity: (city: CityId) => void;
  cityInfo: CityInfo;
  availableStops: BusStop[];
  availableRoutes: BusRoute[];
  
  // Search parameters
  originStopId: string;
  destinationStopId: string;
  setOriginStopId: (id: string) => void;
  setDestinationStopId: (id: string) => void;
  preferredDepartureTime: string;
  setPreferredDepartureTime: (time: string) => void;
  swapStops: () => void;
  
  // Search results
  searchResults: {
    directResults: RouteSearchResult[];
    alternativeResults: RouteSearchResult[];
  };
  hasSearched: boolean;
  handleSearch: () => void;
  clearSearch: () => void;
  
  // Live Simulation & Selected Bus
  liveBuses: LiveBus[];
  selectedBusId: string | null;
  setSelectedBusId: (id: string | null) => void;
  selectedRouteId: string | null;
  setSelectedRouteId: (id: string | null) => void;
  selectedBus: LiveBus | null;
  selectedRoute: BusRoute | null;
  
  // Simulation controls
  isSimulationRunning: boolean;
  toggleSimulation: () => void;
  simulationSpeed: number;
  setSimulationSpeed: (speed: number) => void;
  
  // Crowd reporting
  crowdReports: CrowdReportSubmission[];
  submitCrowdReport: (report: Omit<CrowdReportSubmission, 'id' | 'timestamp'>) => void;
  
  // Navigation / Tab
  activeTab: 'tracker' | 'schedule' | 'alternatives' | 'real-api-guide';
  setActiveTab: (tab: 'tracker' | 'schedule' | 'alternatives' | 'real-api-guide') => void;
  
  // Demo Mode Banner
  showDemoNotice: boolean;
  setShowDemoNotice: (show: boolean) => void;
}

const TransitContext = createContext<TransitContextType | undefined>(undefined);

export const TransitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedCity, setSelectedCityState] = useState<CityId>('coimbatore');
  
  // Default search endpoints for Coimbatore
  const [originStopId, setOriginStopId] = useState<string>('cbe-gandhipuram');
  const [destinationStopId, setDestinationStopId] = useState<string>('cbe-ukkadam');
  const [preferredDepartureTime, setPreferredDepartureTime] = useState<string>('Now');
  
  const [liveBuses, setLiveBuses] = useState<LiveBus[]>(INITIAL_LIVE_BUSES);
  const [selectedBusId, setSelectedBusId] = useState<string | null>('TN-38-N-2840');
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>('cbe-route-111');
  
  const [isSimulationRunning, setIsSimulationRunning] = useState<boolean>(true);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'tracker' | 'schedule' | 'alternatives' | 'real-api-guide'>('tracker');
  const [hasSearched, setHasSearched] = useState<boolean>(true);
  const [showDemoNotice, setShowDemoNotice] = useState<boolean>(true);

  const [crowdReports, setCrowdReports] = useState<CrowdReportSubmission[]>([
    {
      id: 'rep-1',
      vehicleId: 'TN-38-N-3129',
      routeNumber: '111',
      stopId: 'cbe-townhall',
      crowdLevel: 'Low',
      timestamp: '2 mins ago',
      reporterLabel: 'Commuter App',
      notes: 'Plenty of window seats available after Town Hall.',
    },
    {
      id: 'rep-2',
      vehicleId: 'TN-01-AN-3902',
      routeNumber: '21G',
      stopId: 'chn-guindy',
      crowdLevel: 'Full',
      timestamp: '5 mins ago',
      reporterLabel: 'Passenger Community',
      notes: 'Peak office hour rush towards Airport & Chromepet.',
    },
  ]);

  // When city changes, reset default stops and selected route/bus
  const setSelectedCity = useCallback((city: CityId) => {
    setSelectedCityState(city);
    if (city === 'coimbatore') {
      setOriginStopId('cbe-gandhipuram');
      setDestinationStopId('cbe-ukkadam');
      setSelectedRouteId('cbe-route-111');
      setSelectedBusId('TN-38-N-2840');
    } else {
      setOriginStopId('chn-cmbt');
      setDestinationStopId('chn-siruseri');
      setSelectedRouteId('chn-route-570');
      setSelectedBusId('TN-01-AN-4819');
    }
  }, []);

  const cityInfo = useMemo(() => {
    return CITIES.find(c => c.id === selectedCity) || CITIES[0];
  }, [selectedCity]);

  const availableStops = useMemo(() => {
    return BUS_STOPS.filter(s => s.city === selectedCity);
  }, [selectedCity]);

  const availableRoutes = useMemo(() => {
    return BUS_ROUTES.filter(r => r.city === selectedCity);
  }, [selectedCity]);

  // Compute search results
  const searchResults = useMemo(() => {
    if (!originStopId || !destinationStopId) {
      return { directResults: [], alternativeResults: [] };
    }
    return searchRoutes(selectedCity, originStopId, destinationStopId, BUS_ROUTES, liveBuses);
  }, [selectedCity, originStopId, destinationStopId, liveBuses]);

  const handleSearch = () => {
    setHasSearched(true);
    if (searchResults.directResults.length > 0) {
      setSelectedRouteId(searchResults.directResults[0].route.id);
      if (searchResults.directResults[0].liveBuses.length > 0) {
        setSelectedBusId(searchResults.directResults[0].liveBuses[0].vehicleId);
      }
    }
  };

  const clearSearch = () => {
    setOriginStopId('');
    setDestinationStopId('');
    setHasSearched(false);
  };

  const swapStops = () => {
    const temp = originStopId;
    setOriginStopId(destinationStopId);
    setDestinationStopId(temp);
  };

  const selectedBus = useMemo(() => {
    return liveBuses.find(b => b.vehicleId === selectedBusId) || null;
  }, [liveBuses, selectedBusId]);

  const selectedRoute = useMemo(() => {
    return BUS_ROUTES.find(r => r.id === selectedRouteId) || (selectedBus ? BUS_ROUTES.find(r => r.id === selectedBus.routeId) : null) || null;
  }, [selectedRouteId, selectedBus]);

  // Realistic Simulation Engine: advance buses every 2.5s
  useEffect(() => {
    if (!isSimulationRunning) return;

    const interval = setInterval(() => {
      setLiveBuses(prevBuses => {
        return prevBuses.map(bus => {
          const route = BUS_ROUTES.find(r => r.id === bus.routeId);
          if (!route || !route.waypoints || route.waypoints.length < 2) return bus;

          // Progress delta based on speed and simulation multiplier
          const progressStep = (0.012 * simulationSpeed) + (Math.random() * 0.004);
          let newProgress = bus.progressRatio + progressStep;
          let direction = bus.direction;

          // Bounce back or wrap around route when reaching terminus
          if (newProgress >= 1) {
            newProgress = 0.02;
            direction = direction === 'Outbound' ? 'Inbound' : 'Outbound';
          }

          // Compute new position along polyline
          const waypoints = direction === 'Outbound' ? route.waypoints : [...route.waypoints].reverse();
          const newCoord = interpolateRoutePosition(waypoints, newProgress);

          // Realistic speed variation
          const speedVariation = (Math.random() - 0.5) * 4;
          const newSpeed = Math.round(Math.max(12, Math.min(48, bus.speedKmh + speedVariation)));

          // Determine next stop along route based on progress
          const stopCount = route.stops.length;
          const stopFractionIndex = Math.min(
            stopCount - 1,
            Math.floor(newProgress * stopCount) + 1
          );
          const nextStopId = (direction === 'Outbound' ? route.stops : [...route.stops].reverse())[stopFractionIndex] || route.stops[0];

          // Occasional slight delay shift (traffic signal or boarding congestion)
          const delayShift = Math.random() < 0.2 ? (Math.random() > 0.5 ? 1 : -1) : 0;
          const newDelay = Math.max(0, Math.min(15, bus.delayMinutes + delayShift));

          return {
            ...bus,
            direction,
            progressRatio: newProgress,
            currentLocation: newCoord,
            speedKmh: newSpeed,
            nextStopId,
            delayMinutes: newDelay,
            lastUpdated: 'Just now',
          };
        });
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [isSimulationRunning, simulationSpeed]);

  const toggleSimulation = () => {
    setIsSimulationRunning(prev => !prev);
  };

  // Submit passenger crowd report
  const submitCrowdReport = (reportData: Omit<CrowdReportSubmission, 'id' | 'timestamp'>) => {
    const newReport: CrowdReportSubmission = {
      ...reportData,
      id: `rep-${Date.now()}`,
      timestamp: 'Just now',
    };

    setCrowdReports(prev => [newReport, ...prev]);

    // Update live bus state
    setLiveBuses(prevBuses => {
      return prevBuses.map(bus => {
        if (bus.vehicleId === reportData.vehicleId) {
          const occupancyMap: Record<CrowdLevel, { pct: number; pass: number }> = {
            Low: { pct: 28, pass: Math.round(bus.capacity * 0.28) },
            Moderate: { pct: 58, pass: Math.round(bus.capacity * 0.58) },
            High: { pct: 82, pass: Math.round(bus.capacity * 0.82) },
            Full: { pct: 98, pass: Math.round(bus.capacity * 0.98) },
          };
          const crowdInfo = occupancyMap[reportData.crowdLevel];

          return {
            ...bus,
            crowdLevel: reportData.crowdLevel,
            occupancyPercentage: crowdInfo.pct,
            currentPassengers: crowdInfo.pass,
            lastUpdated: 'Just now',
            lastUpdatedSource: 'Passenger Verified',
          };
        }
        return bus;
      });
    });
  };

  return (
    <TransitContext.Provider
      value={{
        selectedCity,
        setSelectedCity,
        cityInfo,
        availableStops,
        availableRoutes,
        originStopId,
        destinationStopId,
        setOriginStopId,
        setDestinationStopId,
        preferredDepartureTime,
        setPreferredDepartureTime,
        swapStops,
        searchResults,
        hasSearched,
        handleSearch,
        clearSearch,
        liveBuses,
        selectedBusId,
        setSelectedBusId,
        selectedRouteId,
        setSelectedRouteId,
        selectedBus,
        selectedRoute,
        isSimulationRunning,
        toggleSimulation,
        simulationSpeed,
        setSimulationSpeed,
        crowdReports,
        submitCrowdReport,
        activeTab,
        setActiveTab,
        showDemoNotice,
        setShowDemoNotice,
      }}
    >
      {children}
    </TransitContext.Provider>
  );
};

export const useTransit = (): TransitContextType => {
  const context = useContext(TransitContext);
  if (!context) {
    throw new Error('useTransit must be used within a TransitProvider');
  }
  return context;
};
