import React, { useState } from 'react';
import { User, Mail, Shield, CheckCircle2, Sliders, Save, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/common/Badge';

export const Profile = () => {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [city, setCity] = useState(user?.preferences?.city || 'Pune');
  const [dietary, setDietary] = useState(user?.preferences?.dietary || 'all');
  const [accessibilityNeeds, setAccessibilityNeeds] = useState(user?.preferences?.accessibilityNeeds || false);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const res = await updateProfile({
        name,
        preferences: {
          city,
          dietary,
          accessibilityNeeds
        }
      });
      if (res.success) {
        setMessage('Profile preferences updated successfully!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      alert('Could not update profile: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Citizen Account Profile</h1>
          <p className="text-xs text-slate-500">Manage your urban preferences and access privileges</p>
        </div>
        <Badge variant={user?.role === 'admin' ? 'danger' : user?.role === 'moderator' ? 'warning' : 'primary'}>
          Role: {user?.role?.toUpperCase()}
        </Badge>
      </div>

      <form onSubmit={handleSave} className="p-6 rounded-3xl glass-panel space-y-6 shadow-xl">
        {message && (
          <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">Email Address</label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-400 cursor-not-allowed"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-500" />
            Urban Experience Preferences
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-500 block mb-1">Default City</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
              >
                <option value="Pune">Pune</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi">Delhi</option>
                <option value="Bengaluru">Bengaluru</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-500 block mb-1">Dietary Filter Preference</label>
              <select
                value={dietary}
                onChange={(e) => setDietary(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
              >
                <option value="all">No Dietary Restriction</option>
                <option value="Vegetarian">Pure Vegetarian</option>
                <option value="Vegan">Vegan</option>
                <option value="Jain friendly">Jain Friendly</option>
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={accessibilityNeeds}
              onChange={(e) => setAccessibilityNeeds(e.target.checked)}
              className="rounded text-cyan-500 focus:ring-cyan-500"
            />
            Highlight wheelchair accessible places by default
          </label>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition flex items-center gap-1.5"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </form>
    </div>
  );
};
