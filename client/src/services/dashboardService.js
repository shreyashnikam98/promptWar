import api from './api';

export const dashboardService = {
  async getSummary(city = 'all') {
    const res = await api.get('/dashboard/summary', { params: { city } });
    return res.data;
  },

  async getReportAnalytics(city = 'all', days = 30) {
    const res = await api.get('/dashboard/reports', { params: { city, days } });
    return res.data;
  },

  async getCategoryAnalytics(city = 'all') {
    const res = await api.get('/dashboard/categories', { params: { city } });
    return res.data;
  },

  // Admin users & audit logs
  async getUsers() {
    const res = await api.get('/admin/users');
    return res.data;
  },

  async updateUserRole(id, role) {
    const res = await api.patch(`/admin/users/${id}/role`, { role });
    return res.data;
  },

  async getAuditLogs() {
    const res = await api.get('/admin/audit-logs');
    return res.data;
  },

  async getNotifications() {
    const res = await api.get('/notifications');
    return res.data;
  },

  async markNotificationRead(id) {
    const res = await api.patch(`/notifications/${id}/read`);
    return res.data;
  },

  async markAllNotificationsRead() {
    const res = await api.post('/notifications/mark-all-read');
    return res.data;
  }
};
