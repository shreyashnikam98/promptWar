import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  History, Landmark, Calendar, MapPin, Building, ShieldCheck,
  Search, ExternalLink, Sparkles, BookOpen
} from 'lucide-react';
import { placeService } from '../services/placeService';
import { useTheme } from '../context/ThemeContext';
import { PlaceCard } from '../components/places/PlaceCard';
import { Badge } from '../components/common/Badge';

export const HistoryCulture = () => {
  const { activeCity } = useTheme();
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchHeritage = async () => {
      setLoading(true);
      try {
        const res = await placeService.getPlaces({
          city: activeCity,
          category: 'Historical landmarks'
        });
        if (res.success) {
          setPlaces(res.data || []);
        }
      } catch (err) {
        console.error('History fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHeritage();
  }, [activeCity]);

  // Timeline events specific to active city
  const cityTimelines = {
    Pune: [
      { year: '750 AD', title: 'Rashtrakuta Dynasty & Pataleshwar Rock-Cut Caves', desc: 'Monolithic subterranean rock temples carved out of black basalt rock during the Rashtrakuta reign.' },
      { year: '1630 AD', title: 'Birth of Chhatrapati Shivaji Maharaj & Shivneri Fort', desc: 'Founding epoch of the Maratha Swarajya in the Sahyadri mountains surrounding Pune.' },
      { year: '1732 AD', title: 'Peshwa Baji Rao I commissions Shaniwar Wada', desc: 'Shaniwar Wada established as the grand political seat of the Maratha Confederacy.' },
      { year: '1892 AD', title: 'Aga Khan Palace Construction & Freedom Movement', desc: 'Built to provide relief to famine-hit villagers, later serving as Mahatma Gandhi\'s ashram prison during Quit India.' }
    ],
    Mumbai: [
      { year: '1534 AD', title: 'Treaty of Bassein & Seven Islands of Bombay', desc: 'Portuguese control established over the seven fishing hamlets and coastal forts.' },
      { year: '1661 AD', title: 'British Royal Dowry & East India Company Charter', desc: 'Ceded to King Charles II upon marriage to Catherine of Braganza; transformed into major port.' },
      { year: '1924 AD', title: 'Gateway of India Completed', desc: 'Indo-Saracenic triumphal arch monument raised to commemorate the 1911 imperial visit of King George V.' }
    ]
  };

  const timeline = cityTimelines[activeCity] || cityTimelines.Pune;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Hero Banner */}
      <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-purple-950 via-slate-900 to-[#0a0f1d] text-white border border-purple-900/50 relative overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <Badge variant="purple" className="bg-purple-500/20 text-purple-300 border border-purple-700/60">
            <Landmark className="w-3.5 h-3.5 mr-1 inline" />
            Heritage & Cultural Chronicler
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Heritage, Monuments & Living History of {activeCity}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Trace the stone bastions, rock-cut shrines, colonial architecture, and centuries of civilizational evolution across {activeCity}. Verified historical narratives sourced from Archaeological Survey records.
          </p>
        </div>
      </div>

      {/* Historical Chronology Timeline */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel space-y-6">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-purple-500" />
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            Historical Epochs & Chronology
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {timeline.map((item, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850/80 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="inline-block px-2.5 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold text-xs">
                {item.year}
              </span>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">{item.title}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Historical Sites Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              Heritage Landmarks & Monuments
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Verified archaeological sites, museums, and national memorials in {activeCity}
            </p>
          </div>
          <Link to="/map" className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline">
            View on Map &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {places.map((place) => (
            <PlaceCard key={place._id} place={place} />
          ))}
        </div>
      </div>
    </div>
  );
};
