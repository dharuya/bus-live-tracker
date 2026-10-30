# Smart City Public Bus Tracker (Coimbatore & Chennai)

A modern, responsive public transit tracking and route discovery platform tailored for Indian urban bus networks (starting with Coimbatore and Chennai). Passengers can search point-to-point routes, track moving buses live on an interactive map, inspect arrival predictions (ETAs) and crowd levels, explore complete stop-by-stop daily timetables, and find faster alternative connections—all with clear "Demo Data" transparency and a structured architecture ready for real GPS/GTFS feed integration.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> **Key Architecture & Data Decisions**:
> 1. **Interactive Map Engine**: Using **Leaflet with OpenStreetMap tiles** (via standard CSS & lightweight vector markers). This provides full interactive map panning, route polylines, moving bus pins, stop clusters, and custom bus icon styling with zero API keys or billing barriers.
> 2. **Dedicated Daily Schedule & Timetable View**: Added a first-class route schedule explorer allowing passengers to pick any bus route (e.g. Coimbatore Gandhipuram–Ukkadam, Chennai Broadway–Tambaram) to inspect trip departure times, stop-by-stop intermediate arrival schedules, frequency intervals, and first/last bus operational hours.
> 3. **Dual City Grounding**: Pre-configured with realistic transit hubs, arterial corridors, and popular routes for both **Coimbatore** (Gandhipuram, Ukkadam, Singanallur, RS Puram, Peelamedu, Hope College, Saravanampatti, Airport) and **Chennai** (Broadway, Chennai Central, T. Nagar, Koyambedu CMBT, Adyar, Guindy, Tambaram, OMR Sholinganallur).
> 4. **Demo Data Transparency**: Every screen, card, and schedule row clearly features an official "Demo Data" badge with an informational tooltip explaining how real-time GPS sensors and TNSTC/MTC transit feeds can be hooked up.

---

## 1. Overview & Core Concept

### What It Does
The Smart Bus Tracker equips commuters with live visibility into public bus services:
- **Smart Trip Search**: Enter origin and destination stops, choose city and departure time, and discover all direct and connecting buses.
- **Interactive Live Map**: View animated bus vehicles travelling along mapped road coordinates with real-time speed, heading, and distance to the passenger's stop.
- **Arrival & Delay Predictions**: Accurate countdown timers ($X\text{ mins remaining}$) factoring in current road traffic conditions, simulated delay warnings, and total trip duration.
- **Passenger Crowd Levels**: Four occupancy brackets (**Low**, **Moderate**, **High**, **Full**) with verified timestamps, capacity counts, and an interactive community crowd report dialog.
- **Alternative Bus Suggestions**: Smart recommendations for nearby alternative lines when the primary bus is delayed or overcrowded.
- **Dedicated Daily Route Schedule**: Complete timetables across early morning, peak hours, regular hours, and night services with per-stop intermediate arrival times.

### Target Audience
Daily commuters, students, office workers, and visitors navigating urban transit in Coimbatore and Chennai, looking to eliminate unpredictable bus stop waits.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Search & Discovery**:
   - Commuter selects City (Coimbatore or Chennai).
   - Enters Origin Stop and Destination Stop (with instant autocomplete from recognized transit hubs).
   - Clicks "Find Buses" to load matched direct routes and suggested alternative options.
2. **Live Map & Bus Detail**:
   - Tapping any bus card zooms the Leaflet map to the vehicle's live coordinates.
   - Shows the bus's route polyline, completed stops, next approaching stop, speed (e.g. 24 km/h), and crowd level.
3. **Daily Schedule View**:
   - Users can switch to the "Daily Schedule" tab or click "View Full Schedule" on any route card.
   - Selects route direction (Up / Down) and service type (Ordinary, Express, Deluxe).
   - Displays complete departure grid and stop-by-stop progression timeline with exact scheduled times.
4. **Crowd Reporting & Feedback**:
   - Passengers can open the "Report Crowd Level" modal to contribute live occupancy status, updating the bus's passenger gauge instantly with a "Passenger Reported" timestamp.

### Visual Identity & Layout Architecture
- **Aesthetic Direction**: Clean, modern, utilitarian smart-city transit aesthetic inspired by high-density urban transit systems (Transport for London, Singapore LTA, Chennai MTC).
- **Color Palette**:
  - Dominant Neutral Canvas: Crisp white (`#FFFFFF`) / soft cool slate (`#F8FAFC`), deep slate for dark elements (`#0F172A`).
  - Brand & Accent: Indian transit emerald green (`#059669`) for active routes and low crowd, amber (`#D97706`) for moderate crowd/delays, crimson (`#DC2626`) for heavy crowding/major delays, and deep transit blue (`#1D4ED8`) for navigation and route polylines.
  - 60-30-10 distribution enforced with no reliance on color alone (always paired with explicit labels and icons).
- **Typography**: Clean contemporary neo-grotesque sans (`Plus Jakarta Sans` / `DM Sans`), paired with `tabular-nums` for all countdown timers, vehicle numbers, and schedule times.
- **Responsive Layout**:
  - Desktop: Split-screen cockpit with responsive left control drawer (search, cards, alternatives) and expansive interactive map viewport on the right.
  - Mobile: Smooth ergonomic bottom sheet navigation with thumb-zone quick actions, floating top search pill, and full-screen map touch interactions.

---

## 3. Key Product Decisions & Trade-Offs

| Decision | Chosen Approach | Rationale | Alternatives Considered |
| :--- | :--- | :--- | :--- |
| **Map Rendering** | Leaflet + OpenStreetMap | Works out-of-the-box in sandboxed iframes without requiring external API keys, billing setup, or risk of quota exhaustion. Smooth custom SVG bus pins. | Google Maps (requires API key configuration), static SVG maps (lacks real geographic context). |
| **Simulation Engine** | Route polyline interpolator with dynamic traffic variations | Buses smoothly advance along genuine Coimbatore and Chennai road coordinates in real-time intervals (every 2-3 seconds) with realistic deceleration at stops. | Static mock timestamps (unrealistic, lacks visual movement). |
| **Schedule Integration** | Dedicated Tab & Direct Deep-link Modal | Commuters can either browse all city route schedules in a dedicated tab or drill into a specific bus's stop-by-stop timetable directly from search results. | Hiding schedule in a PDF download or external link. |
| **Real Feed Readiness** | Modular `TransitDataProvider` interface | Clean architecture separating UI from data layer. Enables swapping the built-in realistic simulator with GTFS-RT or TNSTC/MTC API endpoints via simple configuration. | Hardcoded state scattered across UI components. |

---

## 4. Technical Architecture & Data Strategy

### System Component Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Smart Bus Tracker App                           │
├────────────────────────────────────────────────────────────────────────┤
│  Top Navigation (Brand Wordmark · City Selector · Live Status · Nav)    │
├──────────────────────────────────┬─────────────────────────────────────┤
│  Left Pane / Drawer View         │  Right Viewport / Map Pane          │
│  ┌─────────────────────────────┐ │  ┌────────────────────────────────┐ │
│  │ Trip Search & Filter Bar    │ │  │ Leaflet Interactive Map Canvas │ │
│  │ (Origin, Dest, Time, City)  │ │  │ • Route Polylines (Blue/Green) │ │
│  ├─────────────────────────────┤ │  │ • Animated Bus Vehicle Markers │ │
│  │ Active Tab View:            │ │  │ • Stop Markers with Tooltips   │ │
│  │ [Live Buses] [Schedule]     │ │  │ • Recenter & Layer Controls    │ │
│  │ [Alternatives] [Crowd Feed] │ │  └────────────────────────────────┘ │
│  ├─────────────────────────────┤ │                                     │
│  │ Bus Card List & ETAs        │ │                                     │
│  │ • Next Stop · Delay · Crowd │ │                                     │
│  │ • Action: Track / Schedule  │ │                                     │
│  └─────────────────────────────┘ │                                     │
├──────────────────────────────────┴─────────────────────────────────────┤
│  Transit Data & State Engine (TypeScript)                              │
│  • City Route DB (Coimbatore & Chennai Stops, Geometries, Schedules)    │
│  • Live Simulation Loop (GPS coordinates, speed, ETA calculation)      │
│  • Crowd Reporter Store (Local persistence + timestamps)               │
│  • External API Integration Guide & Environment Variable Stubs         │
└────────────────────────────────────────────────────────────────────────┘
```

### Core Entities & Data Schema
1. **BusStop**: `id`, `name`, `tamilName`, `city`, `coordinates: [lat, lng]`, `popularHub: boolean`.
2. **BusRoute**: `id`, `routeNumber`, `routeName`, `city`, `stops: string[]`, `waypoints: [lat, lng][]`, `scheduleFrequencyMinutes`, `firstBusTime`, `lastBusTime`, `dailyTripsCount`.
3. **LiveBus**: `vehicleId`, `routeId`, `routeNumber`, `direction`, `currentLocation: [lat, lng]`, `speedKmh`, `nextStopId`, `delayMinutes`, `crowdLevel: 'Low'|'Moderate'|'High'|'Full'`, `occupancyPercentage`, `capacity`, `currentPassengers`, `lastUpdated`, `isDemoData: true`.
4. **StopSchedule**: `stopId`, `stopName`, `scheduledArrivalTime`, `scheduledDepartureTime`, `platformOrBay`.
5. **RouteDailySchedule**: `routeId`, `tripNumber`, `departureFromOrigin`, `stopsTimetable: StopSchedule[]`, `serviceType: 'Ordinary'|'Deluxe'|'Express'`.

---

## 5. Implementation Phases & Verification Steps

1. **Step 1: Leaflet & Map Setup**: Install Leaflet types, configure map canvas with OpenStreetMap tiles and custom bus markers.
2. **Step 2: Realistic Transit Data Repository**: Create structured stops, routes, and schedules for Coimbatore (Gandhipuram, Ukkadam, Singanallur, Peelamedu, Airport, etc.) and Chennai (Broadway, Central, T. Nagar, CMBT, Adyar, Tambaram, etc.).
3. **Step 3: Core Simulation & ETA Calculation Engine**: Implement real-time coordinate interpolation, dynamic traffic delays, and distance-to-stop ETA countdown calculations.
4. **Step 4: Search & Alternatives Engine**: Implement origin-destination routing, direct bus matching, and alternative bus ranking (sorting by shortest ETA, travel time, and crowd).
5. **Step 5: Dedicated Route Schedule & Timetables**: Build the comprehensive daily schedule viewer with trip selectors, stop progression timelines, and export/filter options.
6. **Step 6: Crowd Level & Passenger Reporting**: Build crowd indicators and the interactive passenger report modal with instant state updates.
7. **Step 7: Real-world Integration Documentation**: Provide in-app and project guidance explaining how to plug in live GTFS-RT and TNSTC/MTC GPS feeds.
8. **Step 8: Verification**: Run `compile_applet` and perform complete testing of all search flows, map interactions, schedule views, and reporting handlers.
