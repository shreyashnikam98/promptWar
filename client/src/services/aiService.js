import api from './api';

export const aiService = {
  async getHealth() {
    const res = await api.get('/ai/health');
    return res.data;
  },

  async classifyReport(title, description, category = null, severity = null) {
    const res = await api.post('/ai/classify-report', { title, description, category, severity });
    return res.data;
  },

  async parseSearch(query, city = null) {
    const res = await api.post('/ai/search', { query, city });
    return res.data;
  },

  async getRecommendations(params = {}) {
    const res = await api.post('/ai/recommendations', params);
    return res.data;
  },

  async analyzeFeedback(params = {}) {
    const res = await api.post('/ai/analyze-feedback', params);
    return res.data;
  }
};
