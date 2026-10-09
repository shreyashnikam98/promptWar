import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, AlertTriangle, CheckCircle2, XCircle, Clock,
  MapPin, MessageSquare, Mic, Image, Loader2, ArrowRight
} from 'lucide-react';
import { reportService } from '../services/reportService';
import { Badge } from '../components/common/Badge';

export const ModeratorDashboard = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [statusInput, setStatusInput] = useState('verified');
  const [noteInput, setNoteInput] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await reportService.getAdminReports({ limit: 50 });
      if (res.success) {
        setReports(res.data || []);
      }
    } catch (err) {
      console.error('Moderator report fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedReport) return;
    setUpdating(true);
    try {
      const res = await reportService.updateReportStatus(selectedReport._id, statusInput, noteInput);
      if (res.success) {
        setReports(reports.map(r => r._id === selectedReport._id ? res.data : r));
        setSelectedReport(res.data);
        setNoteInput('');
        alert('Report status updated successfully.');
      }
    } catch (err) {
      alert('Failed to update status: ' + (err.response?.data?.message || err.message));
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-7 h-7 text-amber-500" />
          Municipal Safety Moderation Console
        </h1>
        <p className="text-xs text-slate-500">
          Review, authenticate, verify, or resolve crowdsourced public safety hazard reports.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Reports Queue List */}
        <div className="lg:col-span-1 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Incoming Report Stream ({reports.length})
          </h2>

          <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-500">Loading queue...</div>
            ) : reports.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">No reports in moderation queue.</div>
            ) : (
              reports.map((r) => (
                <div
                  key={r._id}
                  onClick={() => {
                    setSelectedReport(r);
                    setStatusInput(r.status === 'pending' ? 'under_review' : r.status);
                  }}
                  className={`p-3.5 rounded-2xl border transition cursor-pointer space-y-1.5 ${
                    selectedReport?._id === r._id
                      ? 'border-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/40 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-500 uppercase">{r.category}</span>
                    <Badge variant={r.status === 'verified' ? 'verified' : r.status === 'resolved' ? 'default' : 'warning'}>
                      {r.status}
                    </Badge>
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">{r.title}</h4>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>📍 {r.city}</span>
                    <span>{new Date(r.reportedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Selected Report Inspection & Moderation Panel */}
        <div className="lg:col-span-2 space-y-6">
          {selectedReport ? (
            <div className="p-6 rounded-3xl glass-panel space-y-6 shadow-xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-bold text-rose-500 uppercase flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {selectedReport.category}
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                    {selectedReport.title}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Reporter: {selectedReport.reporterName} • Submitted {new Date(selectedReport.reportedAt).toLocaleString()}
                  </p>
                </div>
                <Badge variant="primary" className="uppercase font-bold text-xs">
                  Severity: {selectedReport.severity}
                </Badge>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Citizen Description</h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl">
                  {selectedReport.description}
                </p>
              </div>

              {/* AI Auto-Triage Metadata */}
              {selectedReport.classification?.predictedCategory && (
                <div className="p-3.5 rounded-2xl bg-cyan-50/70 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800 text-xs space-y-1">
                  <span className="font-bold text-cyan-800 dark:text-cyan-300 block">
                    🤖 AI Classifier Triage:
                  </span>
                  <p className="text-slate-600 dark:text-slate-300">
                    Predicted: <strong>{selectedReport.classification.predictedCategory}</strong> (Confidence: {Math.round(selectedReport.classification.confidence * 100)}%)
                  </p>
                  <p className="text-slate-500 dark:text-slate-400">
                    Triage Priority: <span className="uppercase font-bold">{selectedReport.priority}</span>
                  </p>
                </div>
              )}

              {/* Duplicate Candidate Notification */}
              {selectedReport.isDuplicateCandidate && (
                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300">
                  ⚠️ <strong>Potential Duplicate Candidate:</strong> Flagged by NLP proximity matcher. Review previous reports in this vicinity before verifying.
                </div>
              )}

              {/* Voice Note & Media Evidence */}
              {selectedReport.voiceNoteUrl && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Mic className="w-3.5 h-3.5 text-cyan-500" />
                    Attached Audio Voice Note
                  </h4>
                  <audio controls src={selectedReport.voiceNoteUrl} className="w-full h-10 rounded-xl" />
                </div>
              )}

              {/* Status Update Form */}
              <form onSubmit={handleUpdateStatus} className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Update Moderation Decision & Status
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">New Report Status</label>
                    <select
                      value={statusInput}
                      onChange={(e) => setStatusInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                    >
                      <option value="pending">Pending</option>
                      <option value="under_review">Under Review</option>
                      <option value="verified">Verified Hazard</option>
                      <option value="resolved">Resolved / Cleared</option>
                      <option value="rejected">Rejected (Invalid/False)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-500 block mb-1">Moderator Note / Ticket #</label>
                    <input
                      type="text"
                      value={noteInput}
                      onChange={(e) => setNoteInput(e.target.value)}
                      placeholder="e.g. Field inspection confirmed. PMC repair dispatched."
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={updating}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
                  >
                    {updating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                    {updating ? 'Saving...' : 'Apply Moderation Decision'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="p-16 text-center rounded-3xl glass-panel space-y-2">
              <ShieldCheck className="w-12 h-12 text-slate-400 mx-auto" />
              <h3 className="font-bold text-base text-slate-800 dark:text-white">Select a Report from the Queue</h3>
              <p className="text-xs text-slate-500">Click on any citizen report on the left to inspect evidence and update status.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
