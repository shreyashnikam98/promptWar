import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Utensils, Coffee, Hotel, Sparkles, Filter, Star,
  Search, Check, DollarSign, HeartHandshake, Compass
} from 'lucide-react';
import { placeService } from '../services/placeService';
import { useTheme } from '../context/ThemeContext';
import { PlaceCard } from '../components/places/PlaceCard';
import { Badge } from '../components/common/Badge';

export const FoodHotels = () => {
  const { activeCity } = useTheme();

  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('all'); // 'all' | 'food' | 'stays'
  const [dietary, setDietary] = useState('all');
  const [maxBudget, setMaxBudget] = useState('all');

  useEffect(() => {
    const fetchHospitality = async () => {
      setLoading(true);
      try {
        const categories = activeSubTab === 'food'
          ? ['Restaurants', 'Street food', 'Cafes']
          : activeSubTab === 'stays'
          ? ['Hotels', 'Budget stays']
          : ['Restaurants', 'Street food', 'Cafes', 'Hotels', 'Budget stays'];

        const res = await placeService.getPlaces({
          city: activeCity,
          limit: 30
        });

        if (res.success) {
          let list = (res.data || []).filter(p => categories.includes(p.category));

          if (dietary !== 'all') {
            list = list.filter(p => p.dietaryOptions && p.dietaryOptions.includes(dietary));
          }

          if (maxBudget === 'budget') {
            list = list.filter(p => p.priceRange === '$' || (p.estimatedBudget?.amount && p.estimatedBudget.amount <= 250));
          }

          setPlaces(list);
        }
      } catch (err) {
        console.error('Hospitality fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHospitality();
  }, [activeCity, activeSubTab, dietary, maxBudget]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Banner */}
      <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-amber-950 via-slate-900 to-[#0a0f1d] text-white border border-amber-900/50 relative overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <Badge variant="warning" className="bg-amber-500/20 text-amber-300 border border-amber-700/60">
            <Utensils className="w-3.5 h-3.5 mr-1 inline" />
            Culinary & Hospitality Hub
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Flavors, Cafes & Budget Stays in {activeCity}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            From legendary century-old Irani bakeries and vibrant street chaat stalls to backpacker hostels and boutique stays.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="p-4 rounded-2xl glass-panel space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Main Category Subtabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveSubTab('all')}
              className={`px-3 py-1.5 rounded-lg transition ${activeSubTab === 'all' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-600 dark:text-slate-300'}`}
            >
              All Dining & Stays
            </button>
            <button
              onClick={() => setActiveSubTab('food')}
              className={`px-3 py-1.5 rounded-lg transition ${activeSubTab === 'food' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-600 dark:text-slate-300'}`}
            >
              🍴 Restaurants & Street Food
            </button>
            <button
              onClick={() => setActiveSubTab('stays')}
              className={`px-3 py-1.5 rounded-lg transition ${activeSubTab === 'stays' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-600 dark:text-slate-300'}`}
            >
              🏨 Hotels & Hostels
            </button>
          </div>

          {/* Quick Dietary and Budget Selectors */}
          <div className="flex items-center gap-3 text-xs">
            <select
              value={dietary}
              onChange={(e) => setDietary(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            >
              <option value="all">All Dietary Preferences</option>
              <option value="Vegetarian">Pure Vegetarian</option>
              <option value="Vegan">Vegan</option>
              <option value="Jain friendly">Jain Friendly</option>
              <option value="Non-Vegetarian">Non-Vegetarian</option>
            </select>

            <select
              value={maxBudget}
              onChange={(e) => setMaxBudget(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            >
              <option value="all">All Budgets</option>
              <option value="budget">Student / Budget (Under ₹250)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {places.map((place) => (
          <PlaceCard key={place._id} place={place} />
        ))}
      </div>
    </div>
  );
};
