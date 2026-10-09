import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, Clock, ShieldAlert, Info } from 'lucide-react';
import { dashboardService } from '../services/dashboardService';

export const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    setLoading(true);
    try {
      const res = await dashboardService.getNotifications();
      if (res.success) {
        setNotifications(res.data || []);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (err) {
      console.error('Notifications error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await dashboardService.markAllNotificationsRead();
      setNotifications(notifications.map(n => ({ ...n, readAt: new Date() })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Mark all read error:', err);
    }
  };

  const handleMarkSingleRead = async (id) => {
    try {
      await dashboardService.markNotificationRead(id);
      setNotifications(notifications.map(n => n._id === id ? { ...n, readAt: new Date() } : n));
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (err) {
      console.error('Single mark read error:', err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-cyan-500" />
            Notifications & System Alerts
          </h1>
          <p className="text-xs text-slate-500">Live moderation updates, incident resolutions, and community confirmations.</p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-cyan-600 dark:text-cyan-400 transition flex items-center gap-1.5"
          >
            <CheckCheck className="w-4 h-4" />
            Mark All Read
          </button>
        )}
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="p-12 text-center rounded-3xl glass-panel space-y-2">
          <Bell className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="font-bold text-sm text-slate-800 dark:text-white">All Caught Up!</h3>
          <p className="text-xs text-slate-500">No new alerts at this moment.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => {
            const isRead = !!n.readAt;
            return (
              <div
                key={n._id}
                onClick={() => !isRead && handleMarkSingleRead(n._id)}
                className={`p-4 rounded-2xl border transition cursor-pointer flex items-start justify-between gap-4 ${
                  !isRead
                    ? 'bg-cyan-50/50 dark:bg-cyan-950/20 border-cyan-300 dark:border-cyan-800'
                    : 'glass-panel border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{n.title}</span>
                    {!isRead && (
                      <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{n.message}</p>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 pt-1">
                    <Clock className="w-3 h-3" />
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
