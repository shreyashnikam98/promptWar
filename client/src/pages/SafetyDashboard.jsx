import React, { useState, useEffect } from 'react';
import {
  ShieldAlert, AlertTriangle, CheckCircle2, Clock, MapPin,
  ThumbsUp, PlusCircle, Filter, Info, ShieldCheck, Eye, Loader2
} from 'lucide-react';
import { reportService } from '../services/reportService';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/common/Badge';
import { CityMap } from '../components/maps/CityMap';
import { ReportIssueModal } from '../components/forms/ReportIssueModal';

export const SafetyDashboard = () => {
  const { activeCity } = useTheme();
  const { user, isAuthenticated } = useAuth();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [confirmingId, setConfirmingId] = useState(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = {
        city: activeCity,
        limit: 50,
        ...(filterSeverity !== 'all' && { severity: filterSeverity }),
        ...(filterStatus !== 'all' && { status: filterStatus })
      };
      const res = await reportService.getReports(params);
      if (res.success) {
        setReports(res.data || []);
      }
    } catch (err) {
      console.error('Safety reports error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [activeCity, filterSeverity, filterStatus]);

  const handleConfirmReport = async (reportId) => {
    setConfirmingId(reportId);
    try {
      const res = await reportService.submitFeedback(reportId, 'accuracy_confirm', 'Citizen corroboration recorded via Safety Intelligence.');
      if (res.success) {
        setReports(reports.map(r => {
          if (r._id === reportId) {
            return {
              ...r,
              communityConfirmations: {
                ...r.communityConfirmations,
                count: (r.communityConfirmations?.count || 0) + 1
              }
            };
          }
          return r;
        }));
      }
    } catch (err) {
      alert('Could not submit confirmation: ' + (err.response?.data?.message || err.message));
    } finally {
      setConfirmingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-rose-950 via-slate-900 to-[#0a0f1d] text-white border border-rose-900/60 relative overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <Badge variant="danger" className="bg-rose-500/20 text-rose-300 border border-rose-800">
              <ShieldAlert className="w-3.5 h-3.5 mr-1 inline" />
              City Safety Intelligence
            </Badge>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
              Civic Hazard Radar & Safety Telemetry — {activeCity}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Crowdsourced public incident monitoring. Unverified citizen reports are labeled objectively as "reported concerns" until validated by municipal safety moderators.
            </p>
          </div>

          <button
            onClick={() => setReportModalOpen(true)}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-sm shadow-lg transition flex items-center gap-2 self-start md:self-auto flex-shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            Report Civic Hazard
          </button>
        </div>
      </div>

      {/* Safety Map View */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Geolocated Hazard Map
          </h2>
          <span className="text-xs text-slate-500">Displaying active reports across {activeCity}</span>
        </div>
        <div className="h-96 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md">
          <CityMap
            center={[18.5204, 73.8567]}
            zoom={13}
            reports={reports}
            height="100%"
          />
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="p-4 rounded-2xl glass-panel flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-xs font-semibold">
          <span>Filter Severity:</span>
          {['all', 'critical', 'high', 'medium', 'low'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1.5 rounded-lg capitalize transition ${
                filterSeverity === sev
                  ? 'bg-rose-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 text-xs font-semibold">
          <span>Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 capitalize"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="under_review">Under Review</option>
            <option value="verified">Verified Hazard</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Reports Feed */}
      <div className="space-y-4">
        <h3 className="text-xl font-black text-slate-900 dark:text-white">
          Active Hazard Feeds ({reports.length})
        </h3>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Loading safety telemetry...</div>
        ) : reports.length === 0 ? (
          <div className="p-12 text-center rounded-3xl glass-panel text-xs text-slate-500">
            No incident reports matching active filters in {activeCity}.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reports.map((report) => (
              <div
                key={report._id}
                className="p-5 rounded-2xl glass-panel border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-rose-500 uppercase tracking-wide flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {report.category}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1">
                      {report.title}
                    </h4>
                  </div>
                  <Badge variant={report.status === 'verified' ? 'verified' : report.status === 'resolved' ? 'default' : 'warning'}>
                    {report.status === 'verified' ? 'Verified Hazard' : report.status}
                  </Badge>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {report.description}
                </p>

                <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 gap-2">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-cyan-500" />
                    {report.address || report.city}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {new Date(report.reportedAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Moderation note if verified */}
                {report.verification?.notes && (
                  <div className="p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-start gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0 text-emerald-500 mt-0.5" />
                    <span><strong>Moderator note:</strong> {report.verification.notes}</span>
                  </div>
                )}

                {/* Confirmations & Action */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] font-semibold text-slate-500">
                    👍 {report.communityConfirmations?.count || 0} Citizens Confirmed
                  </span>
                  <button
                    onClick={() => handleConfirmReport(report._id)}
                    disabled={confirmingId === report._id}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition flex items-center gap-1"
                  >
                    {confirmingId === report._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <ThumbsUp className="w-3 h-3" />}
                    Confirm Hazard
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ReportIssueModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        onReportSubmitted={(newRep) => setReports([newRep, ...reports])}
      />
    </div>
  );
};
