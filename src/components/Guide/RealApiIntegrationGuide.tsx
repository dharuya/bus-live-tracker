import React, { useState } from 'react';
import { useTransit } from '../../context/TransitContext';
import {
  FileText,
  Server,
  Key,
  Database,
  Radio,
  CheckCircle2,
  ExternalLink,
  Code2,
  Copy,
  Check,
  AlertTriangle,
} from 'lucide-react';

export const RealApiIntegrationGuide: React.FC = () => {
  const { cityInfo } = useTransit();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const envSample = `# Environment Configuration for Real Transit Feeds
# Port & Dev server
PORT=3000

# TNSTC (Coimbatore) / MTC (Chennai) API Keys & GTFS Feed URLs
MTC_CHENNAI_GTFS_RT_URL="https://api.chennaicorporation.gov.in/transit/gtfs-rt"
TNSTC_COIMBATORE_FEED_URL="https://transport.tn.gov.in/api/v1/coimbatore/live"
TRANSIT_API_KEY="YOUR_OFFICIAL_AGENCY_API_KEY_HERE"

# Mapping Provider (Optional: if switching from Leaflet/OSM to Google Maps)
# VITE_GOOGLE_MAPS_API_KEY=""
`;

  return (
    <div className="p-4 lg:p-6 space-y-6 bg-white min-h-full">
      {/* View Header */}
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <Server className="w-5 h-5 text-emerald-600" />
          <h1 className="text-xl font-bold text-slate-900">
            Real Public Bus Data Integration Architecture
          </h1>
        </div>
        <p className="text-xs text-slate-500">
          Technical roadmap, API feeds, and deployment steps for deploying real-time bus tracking in Coimbatore (TNSTC) and Chennai (MTC).
        </p>
      </div>

      {/* Current Status Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50">
          <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Working Out-of-the-Box (Demo Mode)
          </h3>
          <ul className="text-xs text-emerald-900 space-y-1.5 list-disc list-inside">
            <li>Interactive Leaflet map with genuine Coimbatore and Chennai road alignments</li>
            <li>Smooth real-time vehicle movement simulation and speed telemetry</li>
            <li>Stop-to-stop ETA calculations with dynamic traffic delay factors</li>
            <li>Complete daily schedule explorer for all routes and stops</li>
            <li>Community passenger crowd reporting with instant UI state updates</li>
            <li>Smart alternative route suggestions and travel time ranking</li>
          </ul>
        </div>

        <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50">
          <h3 className="text-sm font-bold text-amber-950 flex items-center gap-2 mb-2">
            <Radio className="w-4 h-4 text-amber-700" />
            Requires Official Agency API Access
          </h3>
          <ul className="text-xs text-amber-900 space-y-1.5 list-disc list-inside">
            <li>Direct live hardware GPS telemetry from onboard AIS-140 vehicle trackers</li>
            <li>Live Electronic Ticketing Machine (ETM) passenger count automated streaming</li>
            <li>Dynamic detour alerts issued by transport corporation dispatchers</li>
            <li>Official GTFS-Realtime (GTFS-RT) Protocol Buffer feeds</li>
          </ul>
        </div>
      </div>

      {/* Practical Roadmap for Coimbatore & Chennai */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-600" />
          Practical Roadmap: Connecting Official Tamil Nadu Feeds
        </h2>

        <div className="space-y-3 text-xs text-slate-700">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h4 className="font-bold text-slate-900 text-sm mb-1">
              Phase 1: Ingest Static GTFS (Schedules & Stops)
            </h4>
            <p className="text-slate-600 mb-2">
              Both Chennai MTC and TNSTC Coimbatore maintain route tables, bus stops, and departure schedules. Download the official GTFS static archive (<code className="bg-slate-200 px-1 rounded text-slate-800">routes.txt</code>, <code className="bg-slate-200 px-1 rounded text-slate-800">stops.txt</code>, <code className="bg-slate-200 px-1 rounded text-slate-800">stop_times.txt</code>).
            </p>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-800">
              Agency Portals: data.gov.in (Transport) · Chennai Smart City Open Data Portal
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h4 className="font-bold text-slate-900 text-sm mb-1">
              Phase 2: Ingest Real-time GPS Feeds (AIS-140 Protocol)
            </h4>
            <p className="text-slate-600 mb-2">
              Under India's AIS-140 standard, all public buses are equipped with certified GPS/GSM tracking units. An Express backend proxy fetches the Protocol Buffer feed (or webhook streaming payload), normalizes coordinates to Lat/Lng, and emits updates to connected clients via WebSockets or SSE.
            </p>
            <div className="bg-slate-900 text-emerald-400 p-3 rounded-lg font-mono text-[11px] overflow-x-auto">
              <code>{`// Server-side proxy ingestion endpoint
app.get('/api/buses/live', async (req, res) => {
  const { city } = req.query;
  // Fetch official GTFS-RT feed securely without exposing secret keys to client
  const feed = await fetchAgencyGtfsRt(city, process.env.TRANSIT_API_KEY);
  res.json(feed.entity.map(parseVehiclePosition));
});`}</code>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h4 className="font-bold text-slate-900 text-sm mb-1">
              Phase 3: Real Passenger Occupancy Feeds
            </h4>
            <p className="text-slate-600">
              Real passenger counts come from two reliable channels:
              <br />
              1. <strong>Handheld ETMs (Electronic Ticketing Machines)</strong>: Conductors issue tickets on Android-based ETMs, which upload boarding and alighting passenger deltas per stop.
              <br />
              2. <strong>Passenger Community Crowd Verification</strong>: The built-in reporting system implemented in this application allows passengers at bus stops to flag high crowd levels.
            </p>
          </div>
        </div>
      </div>

      {/* Environment Setup Instructions */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Key className="w-4 h-4 text-emerald-600" />
          Environment Setup & Configuration
        </h2>

        <div className="relative">
          <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto">
            {envSample}
          </pre>
          <button
            onClick={() => copyToClipboard(envSample, 'env')}
            className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
          >
            {copiedCode === 'env' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCode === 'env' ? 'Copied' : 'Copy .env'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
