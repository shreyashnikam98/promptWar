import React, { useState, useEffect } from 'react';
import {
  ShieldAlert, AlertTriangle, CheckCircle2, Trash2, Clock,
  MapPin, PlusCircle, MessageSquare, Loader2
} from 'lucide-react';
import { reportService } from '../services/reportService';
import { Badge } from '../components/common/Badge';
import { ReportIssueModal } from '../components/forms/ReportIssueModal';

export const MyReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchMyReports = async () => {
    setLoading(true);
    try {
      const res = await reportService.getMyReports();
      if (res.success) {
        setReports(res.data || []);
      }
    } catch (err) {
      console.error('My reports error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyReports();
  }, []);

  const handleWithdrawReport = async (reportId) => {
    if (!window.confirm('Are you sure you want to withdraw this incident report?')) return;
    setDeletingId(reportId);
    try {
      const res = await reportService.deleteReport(reportId);
      if (res.success) {
        setReports(reports.filter(r => r._id !== reportId));
      }
    } catch (err) {
      alert('Could not withdraw report: ' + (err.response?.data?.message || err.message));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-rose-500" />
            My Incident Reports
          </h1>
          <p className="text-xs text-slate-500">Track moderation progress and municipal review status of your submissions.</p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition flex items-center gap-1.5"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          New Report
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500">Loading your reports...</div>
      ) : reports.length === 0 ? (
        <div className="p-12 text-center rounded-3xl glass-panel space-y-3">
          <ShieldAlert className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="font-bold text-base text-slate-800 dark:text-white">No Submitted Reports Yet</h3>
          <p className="text-xs text-slate-500">You haven't submitted any civic safety issues. When you report potholes, broken lights, or flooding, track them here.</p>
          <button
            onClick={() => setModalOpen(true)}
            className="px-5 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs"
          >
            Submit First Report
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report._id}
              className="p-5 rounded-2xl glass-panel border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-rose-500 uppercase">{report.category}</span>
                    <span className="text-xs text-slate-400">• Severity: {report.severity}</span>
                  </div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white mt-0.5">
                    {report.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={report.status === 'verified' ? 'verified' : report.status === 'resolved' ? 'default' : 'warning'}>
                    Status: {report.status}
                  </Badge>
                  {report.status === 'pending' && (
                    <button
                      onClick={() => handleWithdrawReport(report._id)}
                      disabled={deletingId === report._id}
                      className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Withdraw Pending Report"
                    >
                      {deletingId === report._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {report.description}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-cyan-500" />
                  {report.address}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {new Date(report.reportedAt).toLocaleString()}
                </span>
              </div>

              {/* Moderation Notes History */}
              {report.moderationNotes?.length > 0 && (
                <div className="mt-2 p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 space-y-1 text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block text-[11px]">
                    Municipal Moderation Trail:
                  </span>
                  {report.moderationNotes.map((note, i) => (
                    <p key={i} className="text-[11px] text-slate-600 dark:text-slate-400">
                      • <strong>{note.author}:</strong> {note.note}
                    </p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <ReportIssueModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onReportSubmitted={() => fetchMyReports()}
      />
    </div>
  );
};
