import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, PieChart, Pie, AreaChart, Area, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  BarChart3, PieChart as PieIcon, TrendingUp, AlertTriangle,
  Building, CheckCircle2, ShieldCheck, Filter, Users
} from 'lucide-react';
import { dashboardService } from '../services/dashboardService';
import { useTheme } from '../context/ThemeContext';
import { Badge } from '../components/common/Badge';

const COLORS = ['#38bdf8', '#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

export const CityInsights = () => {
  const { activeCity } = useTheme();

  const [summary, setSummary] = useState(null);
  const [reportAnalytics, setReportAnalytics] = useState(null);
  const [categoryAnalytics, setCategoryAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const [sumRes, repRes, catRes] = await Promise.all([
          dashboardService.getSummary(activeCity),
          dashboardService.getReportAnalytics(activeCity, days),
          dashboardService.getCategoryAnalytics(activeCity)
        ]);

        if (sumRes.success) setSummary(sumRes.data);
        if (repRes.success) setReportAnalytics(repRes.data);
        if (catRes.success) setCategoryAnalytics(catRes.data);
      } catch (err) {
        console.error('Analytics load error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [activeCity, days]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-cyan-500" />
            Smart City Telemetry & Insights — {activeCity}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time statistical calculations aggregated directly from database collections.
          </p>
        </div>

        {/* Date Range Selector */}
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span>Timeline Horizon:</span>
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1.5 rounded-lg transition ${
                days === d
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {d} Days
            </button>
          ))}
        </div>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="p-4 rounded-2xl glass-panel text-center">
          <p className="text-xs text-slate-500 uppercase font-semibold">Places Tracked</p>
          <p className="text-2xl font-black text-cyan-500 mt-1">{summary?.totalPlaces || 0}</p>
        </div>
        <div className="p-4 rounded-2xl glass-panel text-center">
          <p className="text-xs text-slate-500 uppercase font-semibold">Citizen Reports</p>
          <p className="text-2xl font-black text-rose-500 mt-1">{summary?.totalReports || 0}</p>
        </div>
        <div className="p-4 rounded-2xl glass-panel text-center">
          <p className="text-xs text-slate-500 uppercase font-semibold">Verified Hazards</p>
          <p className="text-2xl font-black text-amber-500 mt-1">{summary?.verifiedReports || 0}</p>
        </div>
        <div className="p-4 rounded-2xl glass-panel text-center">
          <p className="text-xs text-slate-500 uppercase font-semibold">Resolved Incidents</p>
          <p className="text-2xl font-black text-emerald-500 mt-1">{summary?.resolvedReports || 0}</p>
        </div>
        <div className="p-4 rounded-2xl glass-panel text-center col-span-2 md:col-span-1">
          <p className="text-xs text-slate-500 uppercase font-semibold">Average Rating</p>
          <p className="text-2xl font-black text-amber-400 mt-1">
            {summary?.averageRating ? `${summary.averageRating}★` : '4.5★'}
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Reports by Category */}
        <div className="p-6 rounded-3xl glass-panel space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-500" />
            Citizen Safety Reports by Category
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportAnalytics?.byCategory || []} layout="vertical" margin={{ left: 40, right: 20 }}>
                <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                <YAxis dataKey="category" type="category" stroke="#94a3b8" fontSize={10} width={120} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', color: '#fff' }}
                />
                <Bar dataKey="count" fill="#ef4444" radius={[0, 6, 6, 0]}>
                  {(reportAnalytics?.byCategory || []).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Places by Category */}
        <div className="p-6 rounded-3xl glass-panel space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Building className="w-4 h-4 text-cyan-500" />
            Verified Urban Destinations by Category
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryAnalytics?.placesByCategory || []} margin={{ left: 20, right: 20 }}>
                <XAxis dataKey="category" stroke="#94a3b8" fontSize={10} angle={-25} textAnchor="end" height={60} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', color: '#fff' }}
                />
                <Bar dataKey="count" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Distribution */}
        <div className="p-6 rounded-3xl glass-panel space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-amber-500" />
            Report Severity Breakdown
          </h3>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={reportAnalytics?.bySeverity || []}
                  dataKey="count"
                  nameKey="severity"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {(reportAnalytics?.bySeverity || []).map((entry, index) => {
                    const fill = entry.severity === 'critical' ? '#ef4444' : entry.severity === 'high' ? '#f97316' : entry.severity === 'medium' ? '#f59e0b' : '#10b981';
                    return <Cell key={`cell-${index}`} fill={fill} />;
                  })}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Frequently Reported Areas */}
        <div className="p-6 rounded-3xl glass-panel space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            Top Frequently Reported Areas
          </h3>
          <div className="space-y-3 pt-2">
            {(reportAnalytics?.topAreas || []).length === 0 ? (
              <p className="text-xs text-slate-500">No area hotspots recorded yet.</p>
            ) : (
              (reportAnalytics?.topAreas || []).map((a, i) => (
                <div key={i} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-xs">
                    📍 {a.area}
                  </span>
                  <span className="font-bold text-rose-500 flex-shrink-0">
                    {a.count} report{a.count > 1 ? 's' : ''}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
