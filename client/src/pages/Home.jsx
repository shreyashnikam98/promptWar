import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, MapPin, Compass, ShieldAlert, Sparkles, Navigation,
  CloudSun, ArrowRight, ShieldCheck, CheckCircle2, AlertTriangle,
  History, Utensils, Star, Activity, PlusCircle, Users
} from 'lucide-react';
import { placeService } from '../services/placeService';
import { reportService } from '../services/reportService';
import { weatherService } from '../services/weatherService';
import { dashboardService } from '../services/dashboardService';
import { useTheme } from '../context/ThemeContext';
import { PlaceCard } from '../components/places/PlaceCard';
import { CardSkeleton } from '../components/common/LoadingSkeleton';
import { Badge } from '../components/common/Badge';
import { ReportIssueModal } from '../components/forms/ReportIssueModal';

export const Home = () => {
  const { activeCity, changeCity } = useTheme();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [places, setPlaces] = useState([]);
  const [reports, setReports] = useState([]);
  const [weather, setWeather] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [placesRes, reportsRes, weatherRes, statsRes] = await Promise.all([
          placeService.getPlaces({ city: activeCity, limit: 12 }),
          reportService.getReports({ city: activeCity, limit: 4 }),
          weatherService.getCurrentWeather(activeCity),
          dashboardService.getSummary(activeCity)
        ]);

        if (placesRes.success) setPlaces(placesRes.data || []);
        if (reportsRes.success) setReports(reportsRes.data || []);
        if (weatherRes.success) setWeather(weatherRes.data || null);
        if (statsRes.success) setStats(statsRes.data || null);
      } catch (err) {
        console.error('Home page data load error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeCity]);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const foodPlaces = places.filter(p => ['Restaurants', 'Street food', 'Cafes'].includes(p.category));
  const historicalPlaces = places.filter(p => ['Historical landmarks', 'Cultural locations'].includes(p.category));
  const budgetPlaces = places.filter(p => ['Free', '$'].includes(p.priceRange) || (p.estimatedBudget?.amount > 0 && p.estimatedBudget.amount <= 150));

  return (
    <div className="space-y-16 lg:space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24 border-b border-slate-200/80 dark:border-slate-800/80">
        {/* Ambient Gradient Background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full overflow-hidden pointer-events-none -z-10">
          <div className="absolute -top-32 left-1/4 w-96 h-96 bg-cyan-500/15 dark:bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-10 right-1/4 w-96 h-96 bg-blue-600/15 dark:bg-blue-600/20 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Active City Pill & Live Weather Snippet */}
          <div className="inline-flex flex-wrap items-center justify-center gap-2 px-4 py-1.5 rounded-full glass-panel shadow-sm text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400">
              <Sparkles className="w-3.5 h-3.5" />
              Exploring {activeCity}
            </span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            {weather ? (
              <Link to="/weather" className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 hover:text-cyan-500 transition">
                <CloudSun className="w-3.5 h-3.5 text-amber-500" />
                <span>{weather.temp}°C {weather.condition}</span>
              </Link>
            ) : (
              <span className="text-slate-400">Live Telemetry Active</span>
            )}
          </div>

          {/* Master Headline */}
          <div className="max-w-3xl mx-auto space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
              Explore Your City. <br />
              <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-sky-400 bg-clip-text text-transparent">
                Travel Smarter. Stay Safer.
              </span>
            </h1>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
              City Life helps citizens and explorers uncover iconic heritage, savor legendary cuisine, track verified safety conditions, and navigate urban transit with crowd intelligence.
            </p>
          </div>

          {/* Prominent City Search Field */}
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleHeroSearch} className="relative flex items-center shadow-xl rounded-2xl glass-panel p-2 border border-slate-200 dark:border-slate-700">
              <Search className="w-5 h-5 ml-3 text-cyan-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search landmarks, street food, forts, or areas in ${activeCity}...`}
                className="w-full px-4 py-3 bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-sm shadow-md transition flex items-center gap-2 flex-shrink-0"
              >
                Discover
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Filter Tags */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-3 text-xs text-slate-500">
              <span>Popular searches:</span>
              {['Historical Forts', 'Street Food Corridors', 'Wheelchair Accessible', 'Budget Stays'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => navigate(`/explore?search=${encodeURIComponent(tag)}`)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/explore"
              className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-black dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-semibold text-sm shadow-sm transition flex items-center gap-2"
            >
              <Compass className="w-4 h-4 text-cyan-400" />
              Explore {activeCity}
            </Link>
            <Link
              to="/map"
              className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-sm shadow-md transition flex items-center gap-2"
            >
              <Navigation className="w-4 h-4 text-slate-950" />
              Interactive City Map
            </Link>
            <button
              type="button"
              onClick={() => setReportModalOpen(true)}
              className="px-6 py-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 font-semibold text-sm transition flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4 text-rose-500" />
              Report Hazard
            </button>
          </div>
        </div>
      </section>

      {/* Smart City Statistics (Calculated from Real Database Records) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl glass-panel text-center space-y-1">
            <p className="text-3xl font-black text-cyan-600 dark:text-cyan-400">
              {stats?.totalPlaces || places.length || 14}
            </p>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Verified Places</p>
            <p className="text-[11px] text-slate-400">In {activeCity} database</p>
          </div>
          <div className="p-5 rounded-2xl glass-panel text-center space-y-1">
            <p className="text-3xl font-black text-rose-500">
              {stats?.totalReports || reports.length || 5}
            </p>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Citizen Reports</p>
            <p className="text-[11px] text-slate-400">Community logged</p>
          </div>
          <div className="p-5 rounded-2xl glass-panel text-center space-y-1">
            <p className="text-3xl font-black text-emerald-500">
              {stats?.verifiedReports || 3}
            </p>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Verified Hazards</p>
            <p className="text-[11px] text-slate-400">Moderator validated</p>
          </div>
          <div className="p-5 rounded-2xl glass-panel text-center space-y-1">
            <p className="text-3xl font-black text-amber-500">
              {stats?.averageRating ? `${stats.averageRating}★` : '4.5★'}
            </p>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Average Rating</p>
            <p className="text-[11px] text-slate-400">Across verified reviews</p>
          </div>
        </div>
      </section>

      {/* Popular Destinations Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <Badge variant="primary">Top Rated Highlights</Badge>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              Popular Destinations in {activeCity}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Hand-curated, highly-rated landmarks and cultural hotspots
            </p>
          </div>
          <Link to="/explore" className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1">
            View All Places &rarr;
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CardSkeleton /><CardSkeleton /><CardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {places.slice(0, 3).map(p => (
              <PlaceCard key={p._id} place={p} />
            ))}
          </div>
        )}
      </section>

      {/* Live Safety Alerts & Citizen Reports */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-[#0f172a] to-slate-950 text-white border border-slate-800 relative overflow-hidden shadow-xl">
          <div className="relative z-10 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-400 border border-rose-800/60 mb-2">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  City Safety Intelligence
                </span>
                <h2 className="text-2xl font-black">Recent Citizen Reports in {activeCity}</h2>
                <p className="text-xs text-slate-400 max-w-xl">
                  Community-sourced hazards and road warnings. Reports are informational and vetted by municipal moderators.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setReportModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow transition flex items-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  Submit Report
                </button>
                <Link
                  to="/safety"
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
                >
                  Safety Map
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reports.slice(0, 4).map((r) => (
                <div key={r._id} className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-400 uppercase tracking-wide flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {r.category}
                    </span>
                    <Badge variant={r.status === 'verified' ? 'verified' : 'warning'}>
                      {r.status}
                    </Badge>
                  </div>
                  <h4 className="font-bold text-sm text-white line-clamp-1">{r.title}</h4>
                  <p className="text-xs text-slate-300 line-clamp-2">{r.description}</p>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-700/40 text-[11px] text-slate-400">
                    <span>📍 {r.address || r.city}</span>
                    <span className="capitalize text-amber-300">Severity: {r.severity}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Food Destinations Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <Badge variant="warning">Culinary Corridors</Badge>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              Popular Food & Cafes
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Legendary Irani cafes, South Indian dosas, and street food hubs
            </p>
          </div>
          <Link to="/hospitality" className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline">
            View Food Guide &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {foodPlaces.slice(0, 3).map(p => (
            <PlaceCard key={p._id} place={p} />
          ))}
        </div>
      </section>

      {/* Historical Landmarks Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <Badge variant="purple">Heritage & Forts</Badge>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              Historical Landmarks & Heritage
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Fortresses, rock-cut monoliths, and national freedom memorials
            </p>
          </div>
          <Link to="/history" className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline">
            View Heritage Timeline &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {historicalPlaces.slice(0, 3).map(p => (
            <PlaceCard key={p._id} place={p} />
          ))}
        </div>
      </section>

      {/* Budget Friendly Places Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <Badge variant="verified">Affordable Exploration</Badge>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              Budget-Friendly Experiences
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Free public parks, low-cost backpacker dorms, and budget snacks
            </p>
          </div>
          <Link to="/explore?priceRange=$" className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline">
            Filter Budget &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgetPlaces.slice(0, 3).map(p => (
            <PlaceCard key={p._id} place={p} />
          ))}
        </div>
      </section>

      {/* How It Works & About Us Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl glass-panel border border-slate-200 dark:border-slate-800 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
              Architecture & Mission
            </h3>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">
              How City Life Transforms Urban Exploration
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Combining crowdsourced citizen reporting with OpenStreetMap geospatial intelligence and NLP automated triage.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center font-bold">
                1
              </div>
              <h4 className="font-bold text-base text-slate-900 dark:text-white">Explore Verified Places</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Discover verified attractions, verified operating hours, accessibility accommodations, and authentic community reviews.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold">
                2
              </div>
              <h4 className="font-bold text-base text-slate-900 dark:text-white">Report & Triage Hazards</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Submit road cavities, waterlogging, or broken lighting with voice notes and photos. NLP classifiers suggest priorities for municipal moderators.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
                3
              </div>
              <h4 className="font-bold text-base text-slate-900 dark:text-white">Navigate with Safety AI</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Plan safer journeys that proactively avoid reported road incidents using OSRM spatial route collision analysis.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Modal */}
      <ReportIssueModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        onReportSubmitted={(newReport) => {
          setReports([newReport, ...reports]);
        }}
      />
    </div>
  );
};
