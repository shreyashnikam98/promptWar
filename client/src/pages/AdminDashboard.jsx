import React, { useState, useEffect } from 'react';
import {
  ShieldAlert, Users, Plus, MapPin, Database, Activity,
  Trash2, Shield, CheckCircle2, AlertTriangle, Loader2
} from 'lucide-react';
import { dashboardService } from '../services/dashboardService';
import { placeService } from '../services/placeService';
import { Badge } from '../components/common/Badge';

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('places'); // 'places' | 'users' | 'logs'

  const [places, setPlaces] = useState([]);
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Place Modal State
  const [showAddPlaceModal, setShowAddPlaceModal] = useState(false);
  const [newPlace, setNewPlace] = useState({
    name: '',
    category: 'Historical landmarks',
    city: 'Pune',
    address: '',
    description: '',
    lng: 73.8567,
    lat: 18.5204,
    priceRange: 'Free',
    wheelchairAccessible: true
  });
  const [submittingPlace, setSubmittingPlace] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [placesRes, usersRes, logsRes] = await Promise.all([
        placeService.getPlaces({ limit: 100 }),
        dashboardService.getUsers(),
        dashboardService.getAuditLogs()
      ]);
      if (placesRes.success) setPlaces(placesRes.data || []);
      if (usersRes.success) setUsers(usersRes.data || []);
      if (logsRes.success) setAuditLogs(logsRes.data || []);
    } catch (err) {
      console.error('Admin data error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreatePlace = async (e) => {
    e.preventDefault();
    setSubmittingPlace(true);
    try {
      const res = await placeService.createPlace({
        name: newPlace.name,
        category: newPlace.category,
        city: newPlace.city,
        address: newPlace.address,
        description: newPlace.description,
        coordinates: [parseFloat(newPlace.lng), parseFloat(newPlace.lat)],
        priceRange: newPlace.priceRange,
        accessibility: { wheelchairAccessible: newPlace.wheelchairAccessible }
      });
      if (res.success) {
        setPlaces([res.data, ...places]);
        setShowAddPlaceModal(false);
        alert('Place created successfully!');
      }
    } catch (err) {
      alert('Failed to create place: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmittingPlace(false);
    }
  };

  const handleDeletePlace = async (id) => {
    if (!window.confirm('Delete this place from database?')) return;
    try {
      const res = await placeService.deletePlace(id);
      if (res.success) {
        setPlaces(places.filter(p => p._id !== id));
      }
    } catch (err) {
      alert('Delete failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      const res = await dashboardService.updateUserRole(userId, newRole);
      if (res.success) {
        setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
        alert(`User role updated to ${newRole}`);
      }
    } catch (err) {
      alert('Failed to update role: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="w-7 h-7 text-cyan-500" />
            Administrator Control Center
          </h1>
          <p className="text-xs text-slate-500">
            Manage database entities, place directory, user roles, and security audit logs.
          </p>
        </div>

        {activeTab === 'places' && (
          <button
            onClick={() => setShowAddPlaceModal(true)}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Add Verified Place
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('places')}
          className={`px-4 py-2 rounded-xl transition ${activeTab === 'places' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
        >
          📍 Places Directory ({places.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl transition ${activeTab === 'users' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
        >
          👥 User Roles ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 rounded-xl transition ${activeTab === 'logs' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
        >
          📜 Audit Logs ({auditLogs.length})
        </button>
      </div>

      {/* Places Tab Content */}
      {activeTab === 'places' && (
        <div className="overflow-x-auto rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 font-bold text-slate-500">
                <th className="p-3.5">Place Name</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">City</th>
                <th className="p-3.5">Coordinates</th>
                <th className="p-3.5">Rating</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {places.map((p) => (
                <tr key={p._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="p-3.5 font-bold text-slate-900 dark:text-white">{p.name}</td>
                  <td className="p-3.5 text-slate-600 dark:text-slate-300">{p.category}</td>
                  <td className="p-3.5">{p.city}</td>
                  <td className="p-3.5 text-[11px] text-slate-400">
                    {p.location?.coordinates?.[1]?.toFixed(4)}, {p.location?.coordinates?.[0]?.toFixed(4)}
                  </td>
                  <td className="p-3.5 font-bold text-amber-500">{p.rating?.average || 0}★</td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => handleDeletePlace(p._id)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
                      title="Delete Place"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Users Tab Content */}
      {activeTab === 'users' && (
        <div className="overflow-x-auto rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 font-bold text-slate-500">
                <th className="p-3.5">User</th>
                <th className="p-3.5">Email</th>
                <th className="p-3.5">Current Role</th>
                <th className="p-3.5">Joined Date</th>
                <th className="p-3.5 text-right">Change Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="p-3.5 font-bold text-slate-900 dark:text-white">{u.name}</td>
                  <td className="p-3.5 text-slate-600 dark:text-slate-300">{u.email}</td>
                  <td className="p-3.5">
                    <Badge variant={u.role === 'admin' ? 'danger' : u.role === 'moderator' ? 'warning' : 'default'}>
                      {u.role}
                    </Badge>
                  </td>
                  <td className="p-3.5 text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="p-3.5 text-right">
                    <select
                      value={u.role}
                      onChange={(e) => handleUpdateRole(u._id, e.target.value)}
                      className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                    >
                      <option value="user">User</option>
                      <option value="moderator">Moderator</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Audit Logs Tab Content */}
      {activeTab === 'logs' && (
        <div className="space-y-2">
          {auditLogs.map((log) => (
            <div key={log._id} className="p-3.5 rounded-2xl glass-panel text-xs flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="font-bold text-cyan-600 dark:text-cyan-400">{log.action}</span>
                <p className="text-slate-600 dark:text-slate-300">
                  Resource: {log.resourceType} ({log.resourceId}) • Actor: {log.actorId?.name || 'System'}
                </p>
              </div>
              <span className="text-[11px] text-slate-400 whitespace-nowrap">
                {new Date(log.createdAt).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Add Place Modal */}
      {showAddPlaceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4 my-8">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Add New Verified Place</h3>
            <form onSubmit={handleCreatePlace} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 mb-1 font-semibold">Place Name *</label>
                <input
                  type="text"
                  required
                  value={newPlace.name}
                  onChange={(e) => setNewPlace({ ...newPlace, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 mb-1 font-semibold">Category *</label>
                  <select
                    value={newPlace.category}
                    onChange={(e) => setNewPlace({ ...newPlace, category: e.target.value })}
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <option value="Historical landmarks">Historical landmarks</option>
                    <option value="Tourist attractions">Tourist attractions</option>
                    <option value="Restaurants">Restaurants</option>
                    <option value="Cafes">Cafes</option>
                    <option value="Parks">Parks</option>
                    <option value="Hospitals">Hospitals</option>
                    <option value="Police stations">Police stations</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 mb-1 font-semibold">City *</label>
                  <input
                    type="text"
                    required
                    value={newPlace.city}
                    onChange={(e) => setNewPlace({ ...newPlace, city: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-semibold">Address *</label>
                <input
                  type="text"
                  required
                  value={newPlace.address}
                  onChange={(e) => setNewPlace({ ...newPlace, address: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 mb-1 font-semibold">Longitude *</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={newPlace.lng}
                    onChange={(e) => setNewPlace({ ...newPlace, lng: e.target.value })}
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1 font-semibold">Latitude *</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={newPlace.lat}
                    onChange={(e) => setNewPlace({ ...newPlace, lat: e.target.value })}
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-semibold">Description *</label>
                <textarea
                  rows={3}
                  required
                  value={newPlace.description}
                  onChange={(e) => setNewPlace({ ...newPlace, description: e.target.value })}
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddPlaceModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPlace}
                  className="px-5 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold"
                >
                  {submittingPlace ? 'Saving...' : 'Create Place'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
