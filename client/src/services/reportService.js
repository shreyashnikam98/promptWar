import api from './api';

export const reportService = {
  async getReports(params = {}) {
    const res = await api.get('/reports', { params });
    return res.data;
  },

  async getReportById(id) {
    const res = await api.get(`/reports/${id}`);
    return res.data;
  },

  async getMyReports() {
    const res = await api.get('/reports/mine');
    return res.data;
  },

  async submitReport(formData) {
    const res = await api.post('/reports', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  async updateReport(id, data) {
    const res = await api.patch(`/reports/${id}`, data);
    return res.data;
  },

  async deleteReport(id) {
    const res = await api.delete(`/reports/${id}`);
    return res.data;
  },

  async submitFeedback(id, feedbackType, comment = '') {
    const res = await api.post(`/reports/${id}/feedback`, { feedbackType, comment });
    return res.data;
  },

  // Admin / Moderator
  async getAdminReports(params = {}) {
    const res = await api.get('/admin/reports', { params });
    return res.data;
  },

  async updateReportStatus(id, status, note = '') {
    const res = await api.patch(`/admin/reports/${id}/status`, { status, note });
    return res.data;
  },

  async verifyReport(id, notes, confidenceScore = 0.95) {
    const res = await api.patch(`/admin/reports/${id}/verify`, { notes, confidenceScore });
    return res.data;
  }
};
