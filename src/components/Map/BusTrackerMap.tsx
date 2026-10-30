import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useTransit } from '../../context/TransitContext';
import { BUS_STOPS } from '../../data/transitData';
import { Locate, Navigation, Layers, Compass } from 'lucide-react';

export const BusTrackerMap: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const busMarkersRef = useRef<Map<string, L.Marker>>(new Map());
  const stopMarkersLayerRef = useRef<L.LayerGroup | null>(null);
  const polylineLayerRef = useRef<L.Polyline | null>(null);
  const allRoutesLayerRef = useRef<L.LayerGroup | null>(null);

  const {
    cityInfo,
    selectedCity,
    liveBuses,
    availableRoutes,
    selectedBusId,
    setSelectedBusId,
    selectedRouteId,
    setSelectedRouteId,
    selectedBus,
    selectedRoute,
    originStopId,
    destinationStopId,
  } = useTransit();

  // Initialize Map Once
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: cityInfo.center,
      zoom: cityInfo.zoom,
      zoomControl: false,
    });

    // High quality OpenStreetMap tiles with clean contrast
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    // Zoom control at bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    stopMarkersLayerRef.current = L.layerGroup().addTo(map);
    allRoutesLayerRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Recenter map when city changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.setView(cityInfo.center, cityInfo.zoom, { animate: true });
  }, [selectedCity, cityInfo]);

  // Update Route Polylines
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clean previous layers
    if (polylineLayerRef.current) {
      polylineLayerRef.current.remove();
      polylineLayerRef.current = null;
    }
    if (allRoutesLayerRef.current) {
      allRoutesLayerRef.current.clearLayers();
    }

    // Draw other routes faintly
    availableRoutes.forEach(r => {
      if (r.id !== selectedRouteId && r.waypoints.length > 1) {
        L.polyline(r.waypoints, {
          color: '#94A3B8',
          weight: 3,
          opacity: 0.35,
          dashArray: '4, 6',
        }).addTo(allRoutesLayerRef.current!);
      }
    });

    // Draw active highlighted route
    if (selectedRoute && selectedRoute.waypoints.length > 1) {
      const activePolyline = L.polyline(selectedRoute.waypoints, {
        color: selectedRoute.color || '#2563EB',
        weight: 6,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);

      polylineLayerRef.current = activePolyline;

      // Fit map bounds to selected route
      const bounds = activePolyline.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15, animate: true });
      }
    }
  }, [selectedRoute, selectedRouteId, availableRoutes]);

  // Update Stop Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = stopMarkersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    const cityStops = BUS_STOPS.filter(s => s.city === selectedCity);

    cityStops.forEach(stop => {
      const isOrigin = stop.id === originStopId;
      const isDestination = stop.id === destinationStopId;
      const isRouteStop = selectedRoute?.stops.includes(stop.id);

      if (!isRouteStop && !isOrigin && !isDestination && stop.hubType !== 'Major Terminal') {
        return; // Avoid marker clutter
      }

      let markerBg = '#64748B';
      let markerBorder = '#FFFFFF';
      let iconSize = 14;

      if (isOrigin) {
        markerBg = '#059669'; // Emerald
        markerBorder = '#ECFDF5';
        iconSize = 22;
      } else if (isDestination) {
        markerBg = '#DC2626'; // Red
        markerBorder = '#FEF2F2';
        iconSize = 22;
      } else if (isRouteStop) {
        markerBg = selectedRoute?.color || '#2563EB';
        iconSize = 16;
      }

      const stopIcon = L.divIcon({
        className: 'custom-stop-marker',
        html: `
          <div style="
            width: ${iconSize}px;
            height: ${iconSize}px;
            background-color: ${markerBg};
            border: 3px solid ${markerBorder};
            border-radius: 9999px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
          ">
          </div>
        `,
        iconSize: [iconSize, iconSize],
        iconAnchor: [iconSize / 2, iconSize / 2],
      });

      const marker = L.marker(stop.coordinates, { icon: stopIcon }).addTo(layer);
      
      const badgeText = isOrigin ? 'Origin Stop' : isDestination ? 'Destination Stop' : stop.hubType;
      marker.bindPopup(`
        <div style="font-family: inherit; min-width: 170px; padding: 2px;">
          <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: ${markerBg}; margin-bottom: 2px;">
            ${badgeText}
          </div>
          <div style="font-weight: 700; font-size: 14px; color: #0F172A;">
            ${stop.name}
          </div>
          <div style="font-size: 12px; color: #64748B; margin-top: 2px;">
            ${stop.tamilName}
          </div>
          <div style="margin-top: 6px; font-size: 11px; color: #475569;">
            Connecting Routes: <strong>${stop.connectingRoutes.join(', ')}</strong>
          </div>
        </div>
      `);
    });
  }, [selectedCity, selectedRoute, originStopId, destinationStopId]);

  // Update Live Moving Bus Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const currentMarkers = busMarkersRef.current;
    const cityBuses = liveBuses.filter(bus => {
      const route = availableRoutes.find(r => r.id === bus.routeId);
      return route && route.city === selectedCity;
    });

    // Remove old markers not in current city
    currentMarkers.forEach((marker, vId) => {
      if (!cityBuses.some(b => b.vehicleId === vId)) {
        marker.remove();
        currentMarkers.delete(vId);
      }
    });

    cityBuses.forEach(bus => {
      const isSelected = bus.vehicleId === selectedBusId;
      const route = availableRoutes.find(r => r.id === bus.routeId);
      const routeColor = route?.color || '#2563EB';

      const crowdBadgeColor =
        bus.crowdLevel === 'Low'
          ? '#059669'
          : bus.crowdLevel === 'Moderate'
          ? '#D97706'
          : bus.crowdLevel === 'High'
          ? '#EA580C'
          : '#DC2626';

      const customIcon = L.divIcon({
        className: 'bus-custom-marker',
        html: `
          <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
            ${isSelected ? '<div class="bus-pulse-ring"></div>' : ''}
            <div style="
              width: ${isSelected ? '38px' : '34px'};
              height: ${isSelected ? '38px' : '34px'};
              background-color: ${routeColor};
              border: 2px solid #FFFFFF;
              border-radius: 10px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              color: #FFFFFF;
              font-weight: 800;
              font-size: 12px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.35);
              transition: all 0.3s ease;
            ">
              <span style="line-height: 1;">${bus.routeNumber}</span>
              <span style="font-size: 8px; font-weight: 600; opacity: 0.9; margin-top: 1px;">${bus.speedKmh}k</span>
            </div>
            <div style="
              position: absolute;
              bottom: 0px;
              right: 0px;
              width: 10px;
              height: 10px;
              border-radius: 9999px;
              background-color: ${crowdBadgeColor};
              border: 1.5px solid #FFFFFF;
            "></div>
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });

      if (currentMarkers.has(bus.vehicleId)) {
        const marker = currentMarkers.get(bus.vehicleId)!;
        marker.setLatLng(bus.currentLocation);
        marker.setIcon(customIcon);
      } else {
        const marker = L.marker(bus.currentLocation, { icon: customIcon }).addTo(map);
        
        marker.on('click', () => {
          setSelectedBusId(bus.vehicleId);
          setSelectedRouteId(bus.routeId);
        });

        currentMarkers.set(bus.vehicleId, marker);
      }
    });
  }, [liveBuses, selectedBusId, selectedCity, availableRoutes, setSelectedBusId, setSelectedRouteId]);

  // Recenter controls
  const handleRecenterCity = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setView(cityInfo.center, cityInfo.zoom, { animate: true });
  };

  const handleRecenterBus = () => {
    if (!mapInstanceRef.current || !selectedBus) return;
    mapInstanceRef.current.setView(selectedBus.currentLocation, 15, { animate: true });
  };

  return (
    <div className="relative w-full h-full min-h-[420px] lg:min-h-full bg-slate-100 overflow-hidden">
      {/* Map Element */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Map HUD Controls Overlay */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <button
          onClick={handleRecenterCity}
          title={`Recenter on ${cityInfo.name}`}
          className="h-10 px-3 bg-white/95 backdrop-blur-md rounded-lg shadow-sm border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Navigation className="w-3.5 h-3.5 text-emerald-600" />
          <span>{cityInfo.name}</span>
        </button>

        {selectedBus && (
          <button
            onClick={handleRecenterBus}
            title="Focus on Selected Bus"
            className="h-10 px-3 bg-emerald-600 text-white rounded-lg shadow-md hover:bg-emerald-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer animate-fade-in"
          >
            <Locate className="w-3.5 h-3.5" />
            <span>Follow Bus {selectedBus.routeNumber}</span>
          </button>
        )}
      </div>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-20 bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-xl px-3.5 py-2.5 shadow-sm text-xs text-slate-600 flex items-center gap-4 flex-wrap max-w-[90vw]">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 border border-white shadow-xs"></span>
          <span className="font-medium text-slate-800">Origin</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 border border-white shadow-xs"></span>
          <span className="font-medium text-slate-800">Destination</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-md bg-blue-600 text-[9px] text-white font-bold flex items-center justify-center">
            70
          </div>
          <span className="font-medium text-slate-800">Live Bus</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-500 border-l border-slate-200 pl-3">
          <span>Crowd:</span>
          <span className="text-emerald-700 font-semibold">Low</span>
          <span>·</span>
          <span className="text-amber-700 font-semibold">Mod</span>
          <span>·</span>
          <span className="text-orange-700 font-semibold">High</span>
          <span>·</span>
          <span className="text-red-700 font-semibold">Full</span>
        </div>
      </div>
    </div>
  );
};
