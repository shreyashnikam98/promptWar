import React, { useState, useEffect } from 'react';
import {
  Scale, Plus, X, Star, DollarSign, Accessibility,
  CheckCircle2, AlertTriangle, ShieldAlert, Sparkles, Building
} from 'lucide-react';
import { placeService } from '../services/placeService';
import { useTheme } from '../context/ThemeContext';
import { Badge } from '../components/common/Badge';

export const ComparePlaces = () => {
  const { activeCity } = useTheme();
  const [allPlaces, setAllPlaces] = useState([]);
  const [selectedPlaceIds, setSelectedPlaceIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const res = await placeService.getPlaces({ city: activeCity, limit: 50 });
        if (res.success && res.data) {
          setAllPlaces(res.data);
          // Pick initial 2 places for immediate side-by-side demo comparison
          if (res.data.length >= 2) {
            setSelectedPlaceIds([res.data[0]._id, res.data[1]._id]);
          }
        }
      } catch (err) {
        console.error('Compare fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [activeCity]);

  const selectedPlaces = allPlaces.filter(p => selectedPlaceIds.includes(p._id));

  const addPlaceSlot = (placeId) => {
    if (selectedPlaceIds.length < 4 && !selectedPlaceIds.includes(placeId)) {
      setSelectedPlaceIds([...selectedPlaceIds, placeId]);
    }
  };

  const removePlaceSlot = (placeId) => {
    setSelectedPlaceIds(selectedPlaceIds.filter(id => id !== placeId));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Scale className="w-7 h-7 text-cyan-500" />
            Compare City Destinations
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Side-by-side metric comparison across affordability, accessibility, hygiene ratings, and community reviews.
          </p>
        </div>

        {/* Place Adder Dropdown */}
        {selectedPlaceIds.length < 4 && (
          <div className="flex items-center gap-2">
            <select
              onChange={(e) => {
                if (e.target.value) {
                  addPlaceSlot(e.target.value);
                  e.target.value = '';
                }
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800 focus:outline-none"
            >
              <option value="">+ Add Place to Compare ({selectedPlaceIds.length}/4)...</option>
              {allPlaces
                .filter(p => !selectedPlaceIds.includes(p._id))
                .map(p => (
                  <option key={p._id} value={p._id}>{p.name} ({p.category})</option>
                ))}
            </select>
          </div>
        )}
      </div>

      {/* Comparison Matrix Table */}
      {selectedPlaces.length < 2 ? (
        <div className="p-12 text-center rounded-3xl glass-panel space-y-3">
          <Scale className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="font-bold text-base text-slate-800 dark:text-white">Select at least 2 places to compare</h3>
          <p className="text-xs text-slate-500">Choose from the dropdown above to benchmark locations side-by-side.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500 w-48">
                  Comparative Attribute
                </th>
                {selectedPlaces.map(place => (
                  <th key={place._id} className="p-4 min-w-[220px] max-w-[280px]">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">{place.name}</h3>
                        <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-semibold">{place.category}</span>
                      </div>
                      <button
                        onClick={() => removePlaceSlot(place._id)}
                        className="p-1 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
                        title="Remove"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {/* Photo Preview */}
              <tr>
                <td className="p-4 font-semibold text-slate-500">Visual Preview</td>
                {selectedPlaces.map(p => (
                  <td key={p._id} className="p-4">
                    <img
                      src={p.images?.[0] || 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?w=400&auto=format&fit=crop'}
                      alt={p.name}
                      className="w-full h-28 object-cover rounded-xl"
                    />
                  </td>
                ))}
              </tr>

              {/* Rating & Reviews */}
              <tr>
                <td className="p-4 font-semibold text-slate-500">Rating & Community Feedback</td>
                {selectedPlaces.map(p => (
                  <td key={p._id} className="p-4 font-bold">
                    <div className="flex items-center gap-1.5 text-amber-500">
                      <Star className="w-4 h-4 fill-amber-400" />
                      <span className="text-sm">{p.rating?.average ? p.rating.average.toFixed(1) : 'Data unavailable'}</span>
                      <span className="text-slate-400 text-[11px]">({p.rating?.count || 0} reviews)</span>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Affordability / Budget */}
              <tr>
                <td className="p-4 font-semibold text-slate-500">Affordability Indicator</td>
                {selectedPlaces.map(p => (
                  <td key={p._id} className="p-4">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {p.estimatedBudget?.amount > 0 ? `₹${p.estimatedBudget.amount}` : p.priceRange || 'Data unavailable'}
                    </span>
                    <span className="text-[10px] text-slate-400 block">{p.estimatedBudget?.source || 'Verified Source'}</span>
                  </td>
                ))}
              </tr>

              {/* Cleanliness / Hygiene */}
              <tr>
                <td className="p-4 font-semibold text-slate-500">Cleanliness Assessment</td>
                {selectedPlaces.map(p => (
                  <td key={p._id} className="p-4">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {p.cleanlinessRating ? `${p.cleanlinessRating} / 5.0` : 'Data unavailable'}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Wheelchair Accessibility */}
              <tr>
                <td className="p-4 font-semibold text-slate-500">Wheelchair Accessibility</td>
                {selectedPlaces.map(p => (
                  <td key={p._id} className="p-4">
                    {p.accessibility?.wheelchairAccessible ? (
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Full Ramps / Ground Access
                      </span>
                    ) : (
                      <span className="text-slate-400">Limited / Steps only</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Operating Hours */}
              <tr>
                <td className="p-4 font-semibold text-slate-500">Operating Hours</td>
                {selectedPlaces.map(p => (
                  <td key={p._id} className="p-4 text-slate-700 dark:text-slate-300">
                    {p.openingHours || 'Data unavailable'}
                    {p.isVerifiedHours && (
                      <span className="text-[10px] text-cyan-600 block font-semibold mt-0.5">Verified Schedule</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Address / Transit */}
              <tr>
                <td className="p-4 font-semibold text-slate-500">Location & Transit</td>
                {selectedPlaces.map(p => (
                  <td key={p._id} className="p-4 text-slate-600 dark:text-slate-400">
                    {p.address}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
