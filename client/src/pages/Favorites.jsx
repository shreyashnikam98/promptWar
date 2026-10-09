import React, { useState, useEffect } from 'react';
import { Heart, Compass } from 'lucide-react';
import { placeService } from '../services/placeService';
import { PlaceCard } from '../components/places/PlaceCard';

export const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const res = await placeService.getFavorites();
      if (res.success) {
        setFavorites(res.data || []);
      }
    } catch (err) {
      console.error('Favorites error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
          Saved Places & Itineraries
        </h1>
        <p className="text-xs text-slate-500">Your curated collection of favorite spots, monuments, and food joints.</p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500">Loading saved places...</div>
      ) : favorites.length === 0 ? (
        <div className="p-12 text-center rounded-3xl glass-panel space-y-3">
          <Compass className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="font-bold text-base text-slate-800 dark:text-white">No Saved Places Yet</h3>
          <p className="text-xs text-slate-500">Click the heart icon on any place card while exploring to save it for quick access.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((place) => (
            <PlaceCard
              key={place._id}
              place={place}
              isFavoriteInitial={true}
              onFavoriteToggle={(id, isFav) => {
                if (!isFav) setFavorites(favorites.filter(f => f._id !== id));
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
