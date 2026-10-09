import React, { useState, useEffect } from 'react';
import {
  CloudSun, Wind, Droplets, Thermometer, Compass,
  Search, AlertCircle, Info, RefreshCw, MapPin
} from 'lucide-react';
import { weatherService } from '../services/weatherService';
import { useTheme } from '../context/ThemeContext';
import { Badge } from '../components/common/Badge';

export const Weather = () => {
  const { activeCity, changeCity } = useTheme();
  const [cityInput, setCityInput] = useState(activeCity);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchWeather = async (targetCity) => {
    setLoading(true);
    try {
      const res = await weatherService.getCurrentWeather(targetCity);
      if (res.success) {
        setWeather(res.data);
      }
    } catch (err) {
      console.error('Weather error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(activeCity);
    setCityInput(activeCity);
  }, [activeCity]);

  const handleCitySearch = (e) => {
    e.preventDefault();
    if (cityInput.trim()) {
      changeCity(cityInput.trim());
      fetchWeather(cityInput.trim());
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <CloudSun className="w-8 h-8 text-amber-500" />
            Urban Weather & Atmospheric Intelligence
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time meteorology and air telemetry for smart city route planning.
          </p>
        </div>

        <form onSubmit={handleCitySearch} className="flex items-center gap-2">
          <input
            type="text"
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
            placeholder="Search city (e.g. Pune, Mumbai)..."
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition"
          >
            Update
          </button>
        </form>
      </div>

      {loading ? (
        <div className="p-16 text-center text-xs text-slate-500">
          Gathering atmospheric telemetry...
        </div>
      ) : weather ? (
        <div className="space-y-6">
          {/* Main Weather Card */}
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-950 text-white border border-blue-800/50 shadow-2xl space-y-6 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs uppercase font-bold tracking-wider text-cyan-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  {weather.city}, {weather.country}
                </span>
                <h2 className="text-4xl sm:text-6xl font-black">{weather.temp}°C</h2>
                <p className="text-sm font-semibold text-slate-300 capitalize">{weather.condition} — {weather.description}</p>
              </div>

              {weather.icon ? (
                <img src={weather.icon} alt={weather.condition} className="w-24 h-24 sm:w-32 sm:h-32 object-contain" />
              ) : (
                <CloudSun className="w-24 h-24 sm:w-28 sm:h-28 text-amber-400" />
              )}
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-white/10 text-xs">
              <div className="p-3 rounded-xl bg-white/5 space-y-1">
                <span className="text-slate-400 flex items-center gap-1">
                  <Thermometer className="w-3.5 h-3.5 text-rose-400" /> Feels Like
                </span>
                <span className="font-bold text-base">{weather.feelsLike}°C</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 space-y-1">
                <span className="text-slate-400 flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5 text-cyan-400" /> Humidity
                </span>
                <span className="font-bold text-base">{weather.humidity}%</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 space-y-1">
                <span className="text-slate-400 flex items-center gap-1">
                  <Wind className="w-3.5 h-3.5 text-emerald-400" /> Wind Speed
                </span>
                <span className="font-bold text-base">{weather.windSpeed} km/h</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 space-y-1">
                <span className="text-slate-400 flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 text-amber-400" /> Atmospheric Pressure
                </span>
                <span className="font-bold text-base">{weather.pressure} hPa</span>
              </div>
            </div>
          </div>

          {/* Telemetry Provenance & Verification Notice */}
          <div className="p-5 rounded-2xl glass-panel space-y-2 text-xs">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold">
              <Info className="w-4 h-4 text-cyan-500" />
              <span>Data Provenance: {weather.source}</span>
            </div>
            {weather.sourceNote && (
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                {weather.sourceNote}
              </p>
            )}
            <p className="text-[11px] text-slate-400">
              Last synchronized timestamp: {new Date(weather.timestamp).toLocaleString()}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
};
