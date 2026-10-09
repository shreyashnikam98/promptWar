import React, { useState } from 'react';
import { X, MapPin, Camera, AlertTriangle, CheckCircle, Brain, Loader2 } from 'lucide-react';
import { reportService } from '../../services/reportService';
import { aiService } from '../../services/aiService';
import { AudioRecorder } from './AudioRecorder';
import { useTheme } from '../../context/ThemeContext';

const CATEGORIES = [
  'Road accident',
  'Dangerous road',
  'Poor street lighting',
  'Harassment or public disturbance',
  'Flooding',
  'Waterlogging',
  'Suspicious activity',
  'Infrastructure hazard',
  'Other public safety concern'
];

export const ReportIssueModal = ({ isOpen, onClose, onReportSubmitted }) => {
  const { activeCity } = useTheme();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[1]);
  const [severity, setSeverity] = useState('medium');
  const [city, setCity] = useState(activeCity || 'Pune');
  const [address, setAddress] = useState('');
  const [lng, setLng] = useState(73.8567);
  const [lat, setLat] = useState(18.5204);
  const [images, setImages] = useState([]);
  const [voiceNoteFile, setVoiceNoteFile] = useState(null);
  const [voiceNoteDuration, setVoiceNoteDuration] = useState(0);

  const [locating, setLocating] = useState(false);
  const [classifying, setClassifying] = useState(false);
  const [aiPreview, setAiPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(parseFloat(pos.coords.latitude.toFixed(5)));
        setLng(parseFloat(pos.coords.longitude.toFixed(5)));
        setAddress(`Near Lat: ${pos.coords.latitude.toFixed(4)}, Lng: ${pos.coords.longitude.toFixed(4)}`);
        setLocating(false);
      },
      (err) => {
        alert(`Location permission denied or unavailable: ${err.message}`);
        setLocating(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleTriggerAiTriage = async () => {
    if (!title && !description) return;
    setClassifying(true);
    try {
      const res = await aiService.classifyReport(title, description, category, severity);
      if (res.success) {
        setAiPreview(res);
        if (res.classification?.predictedCategory) {
          setCategory(res.classification.predictedCategory);
        }
      }
    } catch (err) {
      console.warn('AI Triage preview failed:', err);
    } finally {
      setClassifying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!title.trim() || !description.trim()) {
      setErrorMsg('Please provide a title and detailed description.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('category', category);
      formData.append('severity', severity);
      formData.append('city', city);
      formData.append('address', address || `${city} Metropolitan Area`);
      formData.append('lng', lng.toString());
      formData.append('lat', lat.toString());

      if (voiceNoteFile) {
        formData.append('voiceNote', voiceNoteFile);
        formData.append('voiceNoteDuration', voiceNoteDuration.toString());
      }

      for (let i = 0; i < images.length; i++) {
        formData.append('images', images[i]);
      }

      const res = await reportService.submitReport(formData);

      if (res.success) {
        setSuccessMsg('Report registered successfully! Municipal safety officers have been notified.');
        setTimeout(() => {
          if (onReportSubmitted) onReportSubmitted(res.data);
          onClose();
        }, 1500);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit report. Please check fields and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-500/10 text-rose-500 rounded-xl">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Submit Public Safety Incident</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Help your municipal community stay aware and secure</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-sm text-rose-600 dark:text-rose-300">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-sm text-emerald-600 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              {successMsg}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Incident Summary / Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Deep pothole opening near railway gate"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {/* Category & Severity Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Report Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Observed Severity *
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="low">Low (Minor nuisance / inconvenience)</option>
                <option value="medium">Medium (Moderate traffic or pedestrian hindrance)</option>
                <option value="high">High (Direct risk of vehicular or personal harm)</option>
                <option value="critical">Critical (Immediate public danger)</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Detailed Description *
              </label>
              <button
                type="button"
                onClick={handleTriggerAiTriage}
                disabled={classifying || !title}
                className="text-xs font-medium text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
              >
                <Brain className="w-3.5 h-3.5" />
                {classifying ? 'Analyzing...' : 'AI Auto-Classify'}
              </button>
            </div>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the incident location, cause, hazards, and current ground conditions..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {/* AI Preview Alert if triggered */}
          {aiPreview && (
            <div className="p-3.5 rounded-xl bg-cyan-50/70 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-cyan-800 dark:text-cyan-300">
                <Brain className="w-3.5 h-3.5" />
                AI Triage Suggestion:
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                Detected Category: <strong className="text-slate-900 dark:text-white">{aiPreview.classification?.predictedCategory}</strong> (Confidence: {Math.round(aiPreview.classification?.confidence * 100)}%)
              </p>
              <p className="text-slate-500 dark:text-slate-400">
                Priority: <span className="uppercase font-bold text-amber-600">{aiPreview.triage?.priority}</span> — {aiPreview.triage?.disclaimer}
              </p>
            </div>
          )}

          {/* Location & Coordinates */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-500" />
                Geographic Coordinates
              </span>
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={locating}
                className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
              >
                {locating ? <Loader2 className="w-3 h-3 animate-spin" /> : <MapPin className="w-3 h-3" />}
                {locating ? 'Acquiring GPS...' : 'Use My Current Location'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Longitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={lng}
                  onChange={(e) => setLng(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Latitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={lat}
                  onChange={(e) => setLat(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Address / Landmark</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Near Shivajinagar Bus Stand corner"
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
              />
            </div>
          </div>

          {/* Voice Note Recorder */}
          <AudioRecorder
            onAudioReady={(file, duration) => {
              setVoiceNoteFile(file);
              setVoiceNoteDuration(duration);
            }}
            onClearAudio={() => {
              setVoiceNoteFile(null);
              setVoiceNoteDuration(0);
            }}
          />

          {/* Photo Upload */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-cyan-500" />
              Attach Photographs (Optional)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setImages(Array.from(e.target.files))}
              className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-cyan-50 file:text-cyan-700 dark:file:bg-cyan-950 dark:file:text-cyan-300 hover:file:bg-cyan-100"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm shadow-md transition flex items-center gap-2"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {submitting ? 'Submitting...' : 'Submit Incident Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
