import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search, Filter, MapPin, Compass, Grid, List, Map,
  Accessibility, X, RefreshCw, Loader2, AlertCircle, Globe
} from 'lucide-react';
import { placeService } from '../services/placeService';
import { useTheme } from '../context/ThemeContext';
import { PlaceCard } from '../components/places/PlaceCard';
import { CardSkeleton } from '../components/common/LoadingSkeleton';

const CATEGORIES = [
  'All',
  'Tourist attractions',
  'Restaurants',
  'Street food',
  'Cafes',
  'Hotels',
  'Budget stays',
  'Shopping',
  'Parks',
  'Hospitals',
  'Police stations',
  'Public transport',
  'Historical landmarks',
  'Cultural locations',
  'Public facilities'
];

export const Explore = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { activeCity } = useTheme();

  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  // Filter States - synced with URL params
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [priceRange, setPriceRange] = useState('all');
  const [minRating, setMinRating] = useState('');
  const [wheelchairOnly, setWheelchairOnly] = useState(false);
  const [sort, setSort] = useState('popularity');

  // User GPS Nearby Discovery
  const [userCoords, setUserCoords] = useState(null);
  const [nearbyLoading, setNearbyLoading] = useState(false);

  // Sync state whenever URL parameters change (e.g. navigation from Navbar or Home)
  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    const urlCategory = searchParams.get('category') || 'All';
    setSearch(urlSearch);
    setCategory(urlCategory);
  }, [searchParams]);

  const fetchPlaces = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const currentSearch = searchParams.get('search') ?? search;
      const currentCategory = searchParams.get('category') ?? category;

      const params = {
        city: activeCity,
        sort,
        limit: 30,
        ...(currentCategory !== 'All' && { category: currentCategory }),
        ...(priceRange !== 'all' && { priceRange }),
        ...(minRating && { minRating }),
        ...(wheelchairOnly && { wheelchairAccessible: 'true' }),
        ...(currentSearch.trim() && { search: currentSearch.trim() })
      };

      const res = await placeService.getPlaces(params);
      if (res.success) {
        setPlaces(res.data || []);
      } else {
        setError(res.message || 'Unable to load locations.');
      }
    } catch (err) {
      console.error('Explore places fetch error:', err);
      setError(err.response?.data?.message || err.message || 'Error connecting to the place discovery service.');
    } finally {
      setLoading(false);
    }
  }, [searchParams, search, category, activeCity, sort, priceRange, minRating, wheelchairOnly]);

  useEffect(() => {
    fetchPlaces();
  }, [fetchPlaces]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const nextParams = new URLSearchParams(searchParams);
    if (search.trim()) {
      nextParams.set('search', search.trim());
    } else {
      nextParams.delete('search');
    }
    setSearchParams(nextParams);
  };

  const handleCategorySelect = (cat) => {
    setCategory(cat);
    const nextParams = new URLSearchParams(searchParams);
    if (cat !== 'All') {
      nextParams.set('category', cat);
    } else {
      nextParams.delete('category');
    }
    setSearchParams(nextParams);
  };

  const handleNearbyLocate = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setNearbyLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserCoords(coords);
        try {
          const res = await placeService.getNearby(coords.lat, coords.lng, 10000, category !== 'All' ? category : null);
          if (res.success) {
            setPlaces(res.data || []);
          }
        } catch (err) {
          console.error('Nearby error:', err);
          setError('Failed to locate nearby places.');
        } finally {
          setNearbyLoading(false);
        }
      },
      (err) => {
        alert(`Location permission denied: ${err.message}`);
        setNearbyLoading(false);
      }
    );
  };

  const clearSearchQuery = () => {
    setSearch('');
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('search');
    setSearchParams(nextParams);
  };

  const clearFilters = () => {
    setSearch('');
    setCategory('All');
    setPriceRange('all');
    setMinRating('');
    setWheelchairOnly(false);
    setSort('popularity');
    setUserCoords(null);
    setSearchParams({});
  };

  const activeSearchQuery = searchParams.get('search') || '';
  const hasExternalPlaces = places.some(p => p.isExternal);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">
            {activeSearchQuery ? `Search Results` : `Discover ${activeCity}`}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {activeSearchQuery
              ? `Showing city and place matches for "${activeSearchQuery}"`
              : `Search verified monuments, food havens, hospitals, parks, and transit points.`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleNearbyLocate}
            disabled={nearbyLoading}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800 hover:bg-cyan-500/20 transition flex items-center gap-1.5"
          >
            {nearbyLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MapPin className="w-3.5 h-3.5 text-cyan-500" />}
            {userCoords ? 'Nearby Active' : 'Find Near Me'}
          </button>
          <Link
            to="/map"
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 dark:bg-slate-800 text-white hover:bg-slate-800 dark:hover:bg-slate-700 transition flex items-center gap-1.5"
          >
            <Map className="w-3.5 h-3.5" />
            Interactive Map
          </Link>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-4 rounded-2xl glass-panel space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by city (e.g. Pune, Mumbai, Jaipur), landmark, food, or category..."
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-900 dark:text-white"
            />
            {search && (
              <button
                type="button"
                onClick={clearSearchQuery}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 shadow-sm"
          >
            <Search className="w-3.5 h-3.5" />
            Search
          </button>
        </form>

        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategorySelect(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex-shrink-0 ${
                category === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Detailed Secondary Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
          {/* Price Range */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">Budget / Price</label>
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
            >
              <option value="all">Any Price</option>
              <option value="Free">Free</option>
              <option value="$">$ (Under ₹200)</option>
              <option value="$$">$$ (₹200 - ₹600)</option>
              <option value="$$$">$$$ (₹600 - ₹1500)</option>
            </select>
          </div>

          {/* Rating */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">Minimum Rating</label>
            <select
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
            >
              <option value="">Any Rating</option>
              <option value="4">4.0+ Stars</option>
              <option value="4.5">4.5+ Stars</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">Sort Results</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
            >
              <option value="popularity">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="price_asc">Lowest Budget First</option>
              <option value="price_desc">Highest Budget First</option>
              <option value="newest">Recently Added</option>
            </select>
          </div>

          {/* Wheelchair filter */}
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => setWheelchairOnly(!wheelchairOnly)}
              className={`w-full py-1.5 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                wheelchairOnly
                  ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Accessibility className="w-3.5 h-3.5" />
              Wheelchair Only
            </button>
          </div>

          {/* Clear Button */}
          <div className="flex items-end col-span-2 sm:col-span-1">
            <button
              type="button"
              onClick={clearFilters}
              className="w-full py-1.5 px-3 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition flex items-center justify-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Results Header with Source Provenance */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
        <div className="flex items-center gap-2 flex-wrap">
          <span>
            Showing <strong>{places.length}</strong> {places.length === 1 ? 'location' : 'locations'}
            {activeSearchQuery ? (
              <> for <span className="font-semibold text-slate-900 dark:text-white">"{activeSearchQuery}"</span></>
            ) : (
              <> in <span className="font-semibold text-slate-900 dark:text-white">{activeCity}</span></>
            )}
          </span>

          {hasExternalPlaces && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              <Globe className="w-3 h-3 text-blue-500" />
              OpenStreetMap Live Discovery
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-end sm:self-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg transition ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-cyan-500 shadow-sm' : 'text-slate-400'}`}
            title="Grid View"
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-lg transition ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 text-cyan-500 shadow-sm' : 'text-slate-400'}`}
            title="List View"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-8 text-center rounded-3xl glass-panel space-y-3 border border-rose-200 dark:border-rose-900/50">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h3 className="font-bold text-base text-slate-900 dark:text-white">Unable to Load Search Results</h3>
          <p className="text-xs text-rose-600 dark:text-rose-400 max-w-sm mx-auto">{error}</p>
          <button
            onClick={fetchPlaces}
            className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs inline-flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Try Again
          </button>
        </div>
      )}

      {/* Places List / Grid / Skeletons */}
      {loading ? (
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2 py-4 text-xs text-cyan-600 dark:text-cyan-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Discovering places across database & live map networks...</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton />
          </div>
        </div>
      ) : places.length === 0 && !error ? (
        <div className="p-12 text-center rounded-3xl glass-panel space-y-4">
          <Compass className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="font-bold text-lg text-slate-800 dark:text-white">
            {activeSearchQuery ? `No matching places found for "${activeSearchQuery}"` : 'No Matching Places Found'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            {activeSearchQuery
              ? `We searched both the local database and OpenStreetMap live geospatial records for "${activeSearchQuery}". Try adjusting your keywords, searching for another city, or clearing the category filters.`
              : 'Try adjusting your search terms or clearing price and accessibility filters.'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {activeSearchQuery && (
              <button
                onClick={clearSearchQuery}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition"
              >
                Clear Search Query
              </button>
            )}
            <button
              onClick={clearFilters}
              className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition"
            >
              Reset All Filters
            </button>
          </div>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {places.map((place) => (
            <PlaceCard key={place._id} place={place} />
          ))}
        </div>
      )}
    </div>
  );
};
