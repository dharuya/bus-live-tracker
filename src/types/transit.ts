export type CityId = 'coimbatore' | 'chennai';

export interface CityInfo {
  id: CityId;
  name: string;
  tamilName: string;
  state: string;
  center: [number, number];
  zoom: number;
  terminalCount: number;
  routesCount: number;
  operator: string;
}

export type HubType = 'Major Terminal' | 'Transit Interchange' | 'Local Stop' | 'Suburban Junction';

export interface BusStop {
  id: string;
  name: string;
  tamilName: string;
  city: CityId;
  coordinates: [number, number];
  locality: string;
  hubType: HubType;
  connectingRoutes: string[];
}

export type ServiceType = 'Ordinary' | 'Deluxe' | 'Express AC' | 'Point-to-Point';

export interface BusRoute {
  id: string;
  routeNumber: string;
  name: string;
  tamilName: string;
  city: CityId;
  color: string;
  serviceType: ServiceType;
  originStopId: string;
  destinationStopId: string;
  stops: string[]; // stop IDs in order
  waypoints: [number, number][]; // coordinates along the path
  firstBus: string;
  lastBus: string;
  frequencyMinutes: number;
  fareRange: string;
  distanceKm: number;
  avgDurationMinutes: number;
}

export type CrowdLevel = 'Low' | 'Moderate' | 'High' | 'Full';

export interface LiveBus {
  vehicleId: string;
  routeId: string;
  routeNumber: string;
  direction: 'Outbound' | 'Inbound';
  currentLocation: [number, number];
  speedKmh: number;
  nextStopId: string;
  delayMinutes: number;
  crowdLevel: CrowdLevel;
  occupancyPercentage: number;
  capacity: number;
  currentPassengers: number;
  lastUpdated: string;
  lastUpdatedSource: 'Automated Sensor Feed' | 'Passenger Verified' | 'Conductor ETM';
  isDemoData: boolean;
  progressRatio: number; // 0 to 1 along waypoint track
}

export interface StopScheduleEntry {
  stopId: string;
  stopName: string;
  scheduledArrivalTime: string;
  scheduledDepartureTime: string;
  platformOrBay: string;
  distanceFromStartKm: number;
}

export interface RouteTrip {
  tripId: string;
  tripNumber: number;
  departureTime: string;
  arrivalTime: string;
  serviceType: ServiceType;
  schedule: StopScheduleEntry[];
}

export interface CrowdReportSubmission {
  id: string;
  vehicleId: string;
  routeNumber: string;
  stopId: string;
  crowdLevel: CrowdLevel;
  timestamp: string;
  reporterLabel: string;
  notes?: string;
}

export interface RouteSearchResult {
  route: BusRoute;
  liveBuses: LiveBus[];
  estimatedWaitMinutes: number;
  estimatedTravelMinutes: number;
  totalEstimatedMinutes: number;
  originStop: BusStop;
  destinationStop: BusStop;
  isAlternative: boolean;
  alternativeReason?: string;
  stopsBetweenCount: number;
}
