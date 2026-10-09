import React, { useState, useEffect } from 'react';
import {
  MapPin, Navigation, Compass, AlertTriangle, ShieldCheck,
  Search, Crosshair, ArrowRight, Layers, Sliders, Info, Loader2
} from 'lucide-react';
import { placeService } from '../services/placeService';
import { reportService } from '../services/reportService';
import { useTheme } from '../context/ThemeContext';
import { CityMap } from '../components/maps/CityMap';
import { Badge } from '../components/common/Badge';

export const MapExplorer = () => {
  const { activeCity } = useTheme();

  const [places, setPlaces] = useState([]);
  const [reports, setReports] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters on Map
  const [showPlaces, setShowPlaces] = useState(true);
  const [showReports, setShowReports] = useState(true);
  const [filterCategory, setFilterCategory] = useState('All');

  // GPS User Location
  const [userCoords, setUserCoords] = useState(null);
  const [locating, setLocating] = useState(false);

  // Safer Routing Planner
  const [startPlaceId, setStartPlaceId] = useState('');
  const [endPlaceId, setEndPlaceId] = useState('');
  const [routeMode, setRouteMode] = useState('driving');
  const [calculatingRoute, setCalculatingRoute] = useState(false);
  const [routeData, setRouteData] = useState(null);

  // City Center mapping
  const cityCoordinates = {
    Pune: [18.5204, 73.8567],
    Mumbai: [18.9220, 72.8347],
    Delhi: [28.6139, 77.2090],
    Bengaluru: [12.9716, 77.5946]
  };

  const currentCenter = cityCoordinates[activeCity] || [18.5204, 73.8567];

  useEffect(() => {
    const loadMapData = async () => {
      setLoading(true);
      try {
        const [placesRes, reportsRes] = await Promise.all([
          placeService.getPlaces({ city: activeCity, limit: 50 }),
          reportService.getReports({ city: activeCity, limit: 50 })
        ]);
        if (placesRes.success) setPlaces(placesRes.data || []);
        if (reportsRes.success) setReports(reportsRes.data || []);
      } catch (err) {
        console.error('Map data load error:', err);
      } finally {
        setLoading(false);
      }
    };
    loadMapData();
  }, [activeCity]);

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
        setLocating(false);
      },
      (err) => {
        alert(`Location permission denied or unavailable: ${err.message}`);
        setLocating(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleCalculateRoute = async () => {
    if (!startPlaceId || !endPlaceId) {
      alert('Please select both a starting point and destination.');
      return;
    }

    const start = places.find(p => p._id === startPlaceId);
    const end = places.find(p => p._id === endPlaceId);

    if (!start || !end) return;

    setCalculatingRoute(true);
    try {
      const res = await placeService.getSaferRoute(
        start.location.coordinates[0],
        start.location.coordinates[1],
        end.location.coordinates[0],
        end.location.coordinates[1],
        routeMode
      );
      if (res.success) {
        setRouteData(res);
      }
    } catch (err) {
      alert('Route calculation error: ' + (err.response?.data?.message || err.message));
    } finally {
      setCalculatingRoute(false);
    }
  };

  // Filtered places and reports for Map display
  const displayPlaces = showPlaces
    ? places.filter(p => filterCategory === 'All' || p.category === filterCategory)
    : [];

  const displayReports = showReports ? reports : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Navigation className="w-6 h-6 text-cyan-500" />
            Interactive Smart City GIS Map — {activeCity}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time urban navigation, citizen hazard overlays, and safer routing paths
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleLocateMe}
            disabled={locating}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition flex items-center gap-1.5 shadow-sm"
          >
            {locating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Crosshair className="w-3.5 h-3.5" />}
            {locating ? 'Locating...' : 'Locate Me'}
          </button>
        </div>
      </div>

      {/* Main Grid: Left Controls & Details Panel, Right Interactive Leaflet Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Layers, Route Planner, and Selected Item Details */}
        <div className="space-y-4 order-2 lg:order-1">
          {/* Map Layer Toggles */}
          <div className="p-4 rounded-2xl glass-panel space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-500" />
              Active Map Overlays
            </h3>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPlaces}
                  onChange={(e) => setShowPlaces(e.target.checked)}
                  className="rounded text-cyan-600 focus:ring-cyan-500"
                />
                Verified Places ({places.length})
              </label>

              <label className="flex items-center gap-2 text-xs font-semibold text-rose-600 dark:text-rose-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showReports}
                  onChange={(e) => setShowReports(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500"
                />
                Hazard Reports ({reports.length})
              </label>
            </div>

            {showPlaces && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="text-[11px] text-slate-400 block mb-1">Filter by Category</label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                >
                  <option value="All">All Categories</option>
                  <option value="Historical landmarks">Historical landmarks</option>
                  <option value="Tourist attractions">Tourist attractions</option>
                  <option value="Restaurants">Restaurants & Cafes</option>
                  <option value="Hospitals">Hospitals</option>
                  <option value="Police stations">Police stations</option>
                  <option value="Parks">Parks & Gardens</option>
                </select>
              </div>
            )}
          </div>

          {/* Safer Route Planner */}
          <div className="p-4 rounded-2xl glass-panel space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-cyan-500" />
              Safer Route Navigator
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
              Calculates shortest path and detects reported road cavities, waterlogging, or hazards within 200m of travel corridor.
            </p>

            <div className="space-y-2 text-xs">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Origin Point</label>
                <select
                  value={startPlaceId}
                  onChange={(e) => setStartPlaceId(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                >
                  <option value="">Select Starting Place...</option>
                  {places.map((p) => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Destination</label>
                <select
                  value={endPlaceId}
                  onChange={(e) => setEndPlaceId(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                >
                  <option value="">Select Destination...</option>
                  {places.map((p) => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setRouteMode('driving')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold ${routeMode === 'driving' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
                >
                  🚗 Car
                </button>
                <button
                  type="button"
                  onClick={() => setRouteMode('walking')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold ${routeMode === 'walking' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
                >
                  🚶 Walk
                </button>
                <button
                  type="button"
                  onClick={() => setRouteMode('cycling')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold ${routeMode === 'cycling' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
                >
                  🚲 Cycle
                </button>
              </div>

              <button
                type="button"
                onClick={handleCalculateRoute}
                disabled={calculatingRoute}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs shadow transition flex items-center justify-center gap-1.5 mt-2"
              >
                {calculatingRoute ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Navigation className="w-3.5 h-3.5" />}
                {calculatingRoute ? 'Calculating Route...' : 'Analyze Safe Path'}
              </button>
            </div>

            {/* Route Outcome Panel */}
            {routeData && routeData.routes && routeData.routes[0] && (
              <div className="mt-3 p-3 rounded-xl bg-cyan-50/60 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 text-xs space-y-2">
                <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                  <span>Distance: {routeData.routes[0].distanceKm} km</span>
                  <span>Est. Time: ~{routeData.routes[0].durationMinutes} mins</span>
                </div>

                <div className="pt-1 border-t border-cyan-200/60 dark:border-cyan-800/60">
                  <span className={`font-semibold block ${routeData.routes[0].hazardCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    🛡️ {routeData.routes[0].safetyRating}
                  </span>
                  {routeData.routes[0].hazards?.map((h) => (
                    <p key={h.id} className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">
                      ⚠️ {h.title} (~{h.distanceFromPathMeters}m off route)
                    </p>
                  ))}
                </div>

                <p className="text-[10px] text-slate-500 italic mt-1">
                  {routeData.safetyDisclaimer}
                </p>
              </div>
            )}
          </div>

          {/* Map Legend */}
          <div className="p-4 rounded-2xl glass-panel space-y-2 text-xs">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide text-[10px]">
              Map Markers Legend
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-purple-500"></span> Heritage Site</div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-orange-500"></span> Food & Cafe</div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500"></span> Public Park</div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-500"></span> Police / Transit</div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-rose-500"></span> Hazard Report</div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-sky-500 ring-2 ring-white"></span> You (GPS)</div>
            </div>
          </div>
        </div>

        {/* Right Column: Full Leaflet Map */}
        <div className="lg:col-span-2 order-1 lg:order-2 h-[560px] lg:h-[680px]">
          <CityMap
            center={userCoords ? [userCoords.lat, userCoords.lng] : currentCenter}
            zoom={13}
            places={displayPlaces}
            reports={displayReports}
            userCoords={userCoords}
            routeCoordinates={routeData?.routes?.[0]?.coordinates || null}
            selectedItem={selectedItem}
            onMarkerClick={(item, type) => setSelectedItem({ ...item, itemType: type })}
            height="100%"
          />
        </div>
      </div>
    </div>
  );
};
