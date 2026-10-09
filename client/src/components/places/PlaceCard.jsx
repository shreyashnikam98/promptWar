import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, MapPin, Heart, Share2, Navigation, Clock, Accessibility, CheckCircle2 } from 'lucide-react';
import { placeService } from '../../services/placeService';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../common/Badge';

export const PlaceCard = ({ place, isFavoriteInitial = false, onFavoriteToggle }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(isFavoriteInitial);
  const [copied, setCopied] = useState(false);

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      if (isFavorite) {
        await placeService.removeFavorite(place._id);
        setIsFavorite(false);
      } else {
        await placeService.addFavorite(place._id);
        setIsFavorite(true);
      }
      if (onFavoriteToggle) onFavoriteToggle(place._id, !isFavorite);
    } catch (err) {
      console.warn('Favorite toggle error:', err);
    }
  };

  const handleShareClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/place/${place._id}`;
    if (navigator.share) {
      navigator.share({ title: place.name, text: place.description, url });
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const fallbackImage = 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?w=800&auto=format&fit=crop';
  const imgUrl = place.images && place.images[0] ? place.images[0] : fallbackImage;

  return (
    <div className="group bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 overflow-hidden glass-panel-hover flex flex-col h-full shadow-sm">
      {/* Thumbnail */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
        <img
          src={imgUrl}
          alt={place.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent"></div>

        {/* Category Badge & Live Tag */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap max-w-[70%]">
          <Badge variant="primary" className="bg-slate-900/80 backdrop-blur-md text-white border-0">
            {place.category}
          </Badge>
          {place.isExternal && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600/90 text-white backdrop-blur-md shadow-sm">
              OSM Live
            </span>
          )}
        </div>

        {/* Favorite & Share Buttons */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          <button
            onClick={handleShareClick}
            title={copied ? 'Link Copied!' : 'Share Place'}
            className="p-2 rounded-xl bg-slate-900/60 hover:bg-slate-900/90 backdrop-blur-md text-white transition"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleFavoriteClick}
            title={isFavorite ? 'Remove Favorite' : 'Save to Favorites'}
            className={`p-2 rounded-xl backdrop-blur-md transition ${
              isFavorite
                ? 'bg-rose-500 text-white'
                : 'bg-slate-900/60 hover:bg-slate-900/90 text-white'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-white' : ''}`} />
          </button>
        </div>

        {/* Price & Rating Overlay */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
          <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="font-bold">{place.rating?.average ? place.rating.average.toFixed(1) : 'New'}</span>
            <span className="text-slate-300 text-[10px]">({place.rating?.count || 0})</span>
          </div>

          <div className="bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg font-semibold text-cyan-300">
            {place.estimatedBudget?.amount > 0 ? `₹${place.estimatedBudget.amount}` : place.priceRange || 'Free'}
          </div>
        </div>
      </div>

      {/* Body Details */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <Link to={`/place/${place._id}`} className="block">
            <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-cyan-500 transition line-clamp-1">
              {place.name}
            </h3>
          </Link>
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1 line-clamp-1">
            <MapPin className="w-3.5 h-3.5 text-cyan-500 flex-shrink-0" />
            {place.address}
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-2 leading-relaxed">
            {place.description}
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            {place.accessibility?.wheelchairAccessible && (
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium" title="Wheelchair Accessible">
                <Accessibility className="w-3.5 h-3.5" />
                Accessible
              </span>
            )}
            {place.isVerifiedHours && (
              <span className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400 font-medium" title="Verified Operating Hours">
                <CheckCircle2 className="w-3 h-3" />
                Verified Hours
              </span>
            )}
          </div>

          <Link
            to={`/place/${place._id}`}
            className="text-cyan-600 dark:text-cyan-400 font-semibold hover:underline inline-flex items-center gap-1 text-xs"
          >
            Explore &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
};
