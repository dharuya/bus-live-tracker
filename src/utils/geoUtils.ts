import { BusRoute, BusStop, LiveBus, RouteSearchResult } from '../types/transit';
import { BUS_STOPS, BUS_ROUTES } from '../data/transitData';

// Haversine formula to calculate distance in km
export function getDistanceKm(coord1: [number, number], coord2: [number, number]): number {
  const [lat1, lon1] = coord1;
  const [lat2, lon2] = coord2;
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Interpolate coordinate along polyline waypoints given progress (0 to 1)
export function interpolateRoutePosition(
  waypoints: [number, number][],
  progress: number
): [number, number] {
  if (!waypoints || waypoints.length === 0) return [11.0183, 76.9654];
  if (waypoints.length === 1) return waypoints[0];

  const clamped = Math.max(0, Math.min(1, progress));
  const totalSegments = waypoints.length - 1;
  const rawIndex = clamped * totalSegments;
  const segIndex = Math.min(Math.floor(rawIndex), totalSegments - 1);
  const segFraction = rawIndex - segIndex;

  const p1 = waypoints[segIndex];
  const p2 = waypoints[segIndex + 1];

  const lat = p1[0] + (p2[0] - p1[0]) * segFraction;
  const lng = p1[1] + (p2[1] - p1[1]) * segFraction;

  return [lat, lng];
}

// Calculate estimated arrival time and travel duration
export function calculateArrivalPrediction(
  bus: LiveBus,
  route: BusRoute,
  targetStopId: string
): { arrivalMinutes: number; isApproaching: boolean; statusLabel: string } {
  const stopIndex = route.stops.indexOf(targetStopId);
  const nextStopIndex = route.stops.indexOf(bus.nextStopId);

  // If bus already passed or stop not on route
  if (stopIndex === -1) {
    return { arrivalMinutes: 999, isApproaching: false, statusLabel: 'Not on route' };
  }

  const effectiveNextIndex = nextStopIndex >= 0 ? nextStopIndex : 0;
  
  if (stopIndex < effectiveNextIndex) {
    // Bus already passed target stop in this trip
    return {
      arrivalMinutes: route.frequencyMinutes + 4,
      isApproaching: false,
      statusLabel: 'Next service en route',
    };
  }

  const stopsRemaining = stopIndex - effectiveNextIndex;
  const minutesPerStop = Math.max(3, Math.round(route.avgDurationMinutes / (route.stops.length || 1)));
  
  // Basic duration calculation with current vehicle delay
  const baseMinutes = Math.max(1, stopsRemaining * minutesPerStop + Math.round((1 - (bus.progressRatio % 0.25) * 4) * 2));
  const arrivalMinutes = Math.max(1, baseMinutes + (bus.delayMinutes || 0));

  let statusLabel = 'On time';
  if (arrivalMinutes <= 2) {
    statusLabel = 'Arriving now';
  } else if (bus.delayMinutes > 4) {
    statusLabel = `${bus.delayMinutes}m delay due to traffic`;
  }

  return {
    arrivalMinutes,
    isApproaching: arrivalMinutes <= 3,
    statusLabel,
  };
}

// Match direct routes and alternatives
export function searchRoutes(
  cityId: string,
  originStopId: string,
  destinationStopId: string,
  allRoutes: BusRoute[],
  allBuses: LiveBus[]
): { directResults: RouteSearchResult[]; alternativeResults: RouteSearchResult[] } {
  const originStop = BUS_STOPS.find(s => s.id === originStopId);
  const destinationStop = BUS_STOPS.find(s => s.id === destinationStopId);

  if (!originStop || !destinationStop) {
    return { directResults: [], alternativeResults: [] };
  }

  const cityRoutes = allRoutes.filter(r => r.city === cityId);
  const directResults: RouteSearchResult[] = [];
  const alternativeResults: RouteSearchResult[] = [];

  cityRoutes.forEach(route => {
    const oIndex = route.stops.indexOf(originStopId);
    const dIndex = route.stops.indexOf(destinationStopId);

    // Direct match: origin appears before destination in forward route direction
    if (oIndex !== -1 && dIndex !== -1 && oIndex < dIndex) {
      const liveBusesForRoute = allBuses.filter(b => b.routeId === route.id);
      
      // Calculate earliest ETA among live buses
      let minWaitMinutes = route.frequencyMinutes;
      if (liveBusesForRoute.length > 0) {
        const etas = liveBusesForRoute.map(b => calculateArrivalPrediction(b, route, originStopId).arrivalMinutes);
        minWaitMinutes = Math.min(...etas);
      }

      const stopsBetweenCount = dIndex - oIndex;
      const travelMinutes = Math.round((stopsBetweenCount / (route.stops.length - 1)) * route.avgDurationMinutes);

      directResults.push({
        route,
        liveBuses: liveBusesForRoute,
        estimatedWaitMinutes: Math.max(1, minWaitMinutes),
        estimatedTravelMinutes: Math.max(5, travelMinutes),
        totalEstimatedMinutes: Math.max(1, minWaitMinutes) + travelMinutes,
        originStop,
        destinationStop,
        isAlternative: false,
        stopsBetweenCount,
      });
    }
  });

  // Search alternatives if desired:
  // E.g., routes connecting to nearby hubs or alternative parallel routes
  cityRoutes.forEach(route => {
    // If not already in direct
    const isDirect = directResults.some(d => d.route.id === route.id);
    if (isDirect) return;

    const oIndex = route.stops.indexOf(originStopId);
    const dIndex = route.stops.indexOf(destinationStopId);

    // Alternative case 1: Route passes origin and reaches a major interchange
    if (oIndex !== -1 && dIndex === -1) {
      // Find connecting hub
      const sharedHubs = route.stops.slice(oIndex + 1).filter(stopId => {
        const otherRoutes = cityRoutes.filter(r => r.stops.includes(stopId) && r.stops.includes(destinationStopId));
        return otherRoutes.length > 0;
      });

      if (sharedHubs.length > 0) {
        const liveBuses = allBuses.filter(b => b.routeId === route.id);
        const waitMinutes = route.frequencyMinutes;
        const travelMinutes = Math.round(route.avgDurationMinutes * 0.7);

        alternativeResults.push({
          route,
          liveBuses,
          estimatedWaitMinutes: waitMinutes,
          estimatedTravelMinutes: travelMinutes,
          totalEstimatedMinutes: waitMinutes + travelMinutes + 10, // transfer buffer
          originStop,
          destinationStop,
          isAlternative: true,
          alternativeReason: `1 Easy Transfer via ${BUS_STOPS.find(s => s.id === sharedHubs[0])?.name || 'Transit Hub'}`,
          stopsBetweenCount: 4,
        });
      }
    }

    // Alternative case 2: Route starts at adjacent nearby stop (< 1.5 km) and goes directly to destination
    if (oIndex === -1 && dIndex !== -1) {
      // Check if route has any stop near origin
      const nearbyStopId = route.stops.find(sId => {
        const stop = BUS_STOPS.find(s => s.id === sId);
        if (!stop) return false;
        return getDistanceKm(originStop.coordinates, stop.coordinates) <= 1.8;
      });

      if (nearbyStopId) {
        const nearbyStop = BUS_STOPS.find(s => s.id === nearbyStopId);
        const nearIndex = route.stops.indexOf(nearbyStopId);
        if (nearIndex < dIndex) {
          const liveBuses = allBuses.filter(b => b.routeId === route.id);
          const waitMinutes = route.frequencyMinutes + 3;
          const travelMinutes = route.avgDurationMinutes;

          alternativeResults.push({
            route,
            liveBuses,
            estimatedWaitMinutes: waitMinutes,
            estimatedTravelMinutes: travelMinutes,
            totalEstimatedMinutes: waitMinutes + travelMinutes,
            originStop: nearbyStop || originStop,
            destinationStop,
            isAlternative: true,
            alternativeReason: `Board at nearby ${nearbyStop?.name.split(' ')[0]} (~5 min walk)`,
            stopsBetweenCount: dIndex - nearIndex,
          });
        }
      }
    }
  });

  // Sort direct by total estimated minutes
  directResults.sort((a, b) => a.totalEstimatedMinutes - b.totalEstimatedMinutes);
  // Sort alternatives by total estimated minutes
  alternativeResults.sort((a, b) => a.totalEstimatedMinutes - b.totalEstimatedMinutes);

  return { directResults, alternativeResults };
}
