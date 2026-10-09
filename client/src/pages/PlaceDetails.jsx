import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin, Star, Heart, Share2, Navigation, Clock, ShieldAlert,
  Accessibility, CheckCircle2, MessageSquare, AlertCircle, Send,
  Calendar, Building2, Flag
} from 'lucide-react';
import { placeService } from '../services/placeService';
import { reportService } from '../services/reportService';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/common/Badge';
import { CityMap } from '../components/maps/CityMap';

export const PlaceDetails = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();

  const [place, setPlace] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [nearbyHazards, setNearbyHazards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [copied, setCopied] = useState(false);

  // Review submission state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  // Report incorrect info state
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  useEffect(() => {
    const fetchPlaceData = async () => {
      setLoading(true);
      try {
        const [placeRes, reviewsRes] = await Promise.all([
          placeService.getPlaceById(id),
          placeService.getReviews(id)
        ]);

        if (placeRes.success) {
          const p = placeRes.data;
          setPlace(p);

          // Fetch nearby hazards around place coordinates
          if (p.location?.coordinates) {
            const [lng, lat] = p.location.coordinates;
            const repRes = await reportService.getReports({
              lat,
              lng,
              radius: 3000,
              limit: 5
            });
            if (repRes.success) {
              setNearbyHazards(repRes.data || []);
            }
          }
        }

        if (reviewsRes.success) {
          setReviews(reviewsRes.data || []);
        }

        // Check favorite
        if (isAuthenticated) {
          const favs = await placeService.getFavorites();
          if (favs.success && favs.data) {
            setIsFavorite(favs.data.some(f => f._id === id));
          }
        }
      } catch (err) {
        console.error('Place details error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaceData();
  }, [id, isAuthenticated]);

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) return;
    try {
      if (isFavorite) {
        await placeService.removeFavorite(place._id);
        setIsFavorite(false);
      } else {
        await placeService.addFavorite(place._id);
        setIsFavorite(true);
      }
    } catch (err) {
      console.warn('Favorite toggle error:', err);
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: place?.name, text: place?.description, url });
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess('');

    if (!comment.trim()) {
      setReviewError('Please provide a written review comment.');
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await placeService.submitReview(place._id, rating, comment.trim());
      if (res.success) {
        setReviews([res.data, ...reviews]);
        setComment('');
        setReviewSuccess('Review published successfully!');
        // Refresh place stats
        const updated = await placeService.getPlaceById(place._id);
        if (updated.success) setPlace(updated.data);
      }
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleSendFeedback = () => {
    if (!feedbackText.trim()) return;
    setFeedbackSent(true);
    setTimeout(() => {
      setShowFeedbackModal(false);
      setFeedbackSent(false);
      setFeedbackText('');
    }, 1500);
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm text-slate-500">Loading verified place details...</p>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Place Not Found</h2>
        <Link to="/explore" className="px-5 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs inline-block">
          Return to Explore
        </Link>
      </div>
    );
  }

  const [lng, lat] = place.location?.coordinates || [73.8567, 18.5204];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Top Banner and Photo Gallery */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="primary">{place.category}</Badge>
              {place.isExternal ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-600 text-white shadow-sm inline-flex items-center gap-1">
                  Live OpenStreetMap POI
                </span>
              ) : (
                <Badge variant="verified">
                  <CheckCircle2 className="w-3 h-3 mr-1 inline" />
                  {place.verificationStatus}
                </Badge>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
              {place.name}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-cyan-500" />
              {place.address}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" />
              {copied ? 'Link Copied!' : 'Share'}
            </button>
            <button
              onClick={handleToggleFavorite}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                isFavorite
                  ? 'bg-rose-500 text-white'
                  : 'border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-white' : ''}`} />
              {isFavorite ? 'Saved' : 'Save'}
            </button>
            <button
              onClick={() => setShowFeedbackModal(true)}
              className="px-3 py-2 rounded-xl text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition"
              title="Report Incorrect Information"
            >
              <Flag className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Place Image */}
        <div className="h-72 sm:h-96 rounded-3xl overflow-hidden relative shadow-lg">
          <img
            src={place.images?.[0] || 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=1200&auto=format&fit=crop'}
            alt={place.name}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Main Grid: Details Left, Map & Safety Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Description & Metadata */}
        <div className="lg:col-span-2 space-y-8">
          {/* Overview Section */}
          <div className="p-6 rounded-3xl glass-panel space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">About This Location</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {place.description}
            </p>

            {/* Key Information Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Community Rating</span>
                <span className="font-bold text-amber-500 flex items-center gap-1 text-sm">
                  <Star className="w-4 h-4 fill-amber-400" />
                  {place.rating?.average?.toFixed(1) || 'N/A'} ({place.rating?.count || 0} reviews)
                </span>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">Budget / Price Range</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                  {place.estimatedBudget?.amount > 0 ? `₹${place.estimatedBudget.amount}` : place.priceRange}
                </span>
                <span className="text-[10px] text-slate-400 block">
                  {place.estimatedBudget?.source || 'Verified Estimate'}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">Operating Hours</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {place.openingHours}
                </span>
                {place.isVerifiedHours && (
                  <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" /> Verified Hours
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Historical / Architectural Significance (if applicable) */}
          {place.historicalDetails?.period && (
            <div className="p-6 rounded-3xl glass-panel space-y-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-purple-500" />
                Historical & Architectural Profile
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block">Historical Era:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{place.historicalDetails.period}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Construction Period / Year:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{place.historicalDetails.yearBuilt || 'Historical'}</span>
                </div>
                {place.historicalDetails.heritageSignificance && (
                  <div className="sm:col-span-2">
                    <span className="text-slate-400 block">Heritage Status:</span>
                    <span className="font-semibold text-purple-600 dark:text-purple-400">{place.historicalDetails.heritageSignificance}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Accessibility Accommodations */}
          <div className="p-6 rounded-3xl glass-panel space-y-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Accessibility className="w-4 h-4 text-emerald-500" />
              Accessibility & Inclusion Features
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className={`p-3 rounded-xl border ${place.accessibility?.wheelchairAccessible ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300' : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-500'}`}>
                Wheelchair Ramps: {place.accessibility?.wheelchairAccessible ? 'Available' : 'Limited / Steps'}
              </div>
              <div className={`p-3 rounded-xl border ${place.accessibility?.brailleSignage ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300' : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-500'}`}>
                Braille Signage: {place.accessibility?.brailleSignage ? 'Verified' : 'Unavailable'}
              </div>
              <div className={`p-3 rounded-xl border ${place.accessibility?.accessibleRestrooms ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300' : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-500'}`}>
                Accessible Restrooms: {place.accessibility?.accessibleRestrooms ? 'Available' : 'Standard Only'}
              </div>
            </div>
            {place.accessibility?.details && (
              <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                Note: {place.accessibility.details}
              </p>
            )}
          </div>

          {/* User Reviews Section */}
          <div className="p-6 rounded-3xl glass-panel space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-cyan-500" />
                Citizen Reviews ({reviews.length})
              </h3>
            </div>

            {/* Submit Review Form */}
            {isAuthenticated ? (
              <form onSubmit={handleReviewSubmit} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Write Your Review
                </h4>
                {reviewError && (
                  <p className="text-xs text-rose-600 dark:text-rose-400">{reviewError}</p>
                )}
                {reviewSuccess && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">{reviewSuccess}</p>
                )}

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Your Rating:</span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 text-amber-400"
                    >
                      <Star className={`w-4 h-4 ${star <= rating ? 'fill-amber-400' : 'text-slate-300'}`} />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 ml-1">
                    {rating} / 5
                  </span>
                </div>

                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share details regarding crowd times, entrance accessibility, food quality, or cleanliness..."
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {submittingReview ? 'Submitting...' : 'Post Review'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/40 text-center text-xs text-slate-600 dark:text-slate-400">
                <Link to="/login" className="font-bold text-cyan-600 dark:text-cyan-400 hover:underline">
                  Sign in
                </Link> to post an authenticated review for this location.
              </div>
            )}

            {/* Reviews List */}
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">
                  No community reviews submitted yet. Be the first to share your experience!
                </p>
              ) : (
                reviews.map((rev) => (
                  <div key={rev._id} className="p-4 rounded-2xl bg-white dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-cyan-600 text-white flex items-center justify-center text-xs font-bold uppercase">
                          {rev.userId?.name?.[0] || 'C'}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{rev.userId?.name || 'Verified Explorer'}</p>
                          <p className="text-[10px] text-slate-400">{new Date(rev.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-amber-400">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{rev.rating}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {rev.comment}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Location Map & Nearby Safety Intelligence */}
        <div className="space-y-6">
          {/* Mini Interactive Map */}
          <div className="p-5 rounded-3xl glass-panel space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-cyan-500" />
              Geographic Location
            </h3>
            <div className="h-56 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
              <CityMap
                center={[lat, lng]}
                zoom={14}
                places={[place]}
                reports={nearbyHazards}
                height="100%"
              />
            </div>
            <div className="text-[11px] text-slate-500 flex justify-between items-center">
              <span>Coordinates: {lat.toFixed(4)}, {lng.toFixed(4)}</span>
              <Link
                to={`/map?focus=${place._id}`}
                className="text-cyan-600 dark:text-cyan-400 font-bold hover:underline"
              >
                Directions in Map &rarr;
              </Link>
            </div>
          </div>

          {/* Safety Intelligence in Vicinity */}
          <div className="p-5 rounded-3xl glass-panel space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-500 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
              Safety Conditions in Vicinity
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
              Citizen reports within 3 km of this destination.
            </p>

            {nearbyHazards.length === 0 ? (
              <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>No active hazards or road concerns reported nearby.</span>
              </div>
            ) : (
              <div className="space-y-2">
                {nearbyHazards.map((h) => (
                  <div key={h._id} className="p-3 rounded-xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-rose-600 dark:text-rose-400">{h.category}</span>
                      <span className="text-[10px] uppercase font-semibold text-amber-500">{h.severity}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-[11px] line-clamp-1">{h.title}</p>
                    <span className="text-[10px] text-slate-400 block">{h.address}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Report Incorrect Info Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Flag className="w-4 h-4 text-rose-500" />
              Report Incorrect Information
            </h3>
            <p className="text-xs text-slate-500">
              Help us maintain factual accuracy. Describe what needs correcting (e.g. updated hours, closed establishment, changed entry fee).
            </p>
            {feedbackSent ? (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold">
                Thank you! Your feedback has been queued for moderator review.
              </div>
            ) : (
              <>
                <textarea
                  rows={3}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Describe inaccuracies here..."
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowFeedbackModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendFeedback}
                    className="px-5 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs"
                  >
                    Submit Correction
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
