import api from './api';

export const authService = {
  async register(data) {
    const res = await api.post('/auth/register', data);
    if (res.data.token) {
      localStorage.setItem('citylife_token', res.data.token);
      localStorage.setItem('citylife_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  async login(email, password) {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.token) {
      localStorage.setItem('citylife_token', res.data.token);
      localStorage.setItem('citylife_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  async getMe() {
    const res = await api.get('/auth/me');
    if (res.data.user) {
      localStorage.setItem('citylife_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  async updateProfile(updates) {
    const res = await api.patch('/auth/profile', updates);
    if (res.data.user) {
      localStorage.setItem('citylife_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  logout() {
    localStorage.removeItem('citylife_token');
    localStorage.removeItem('citylife_user');
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('citylife_user');
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  getToken() {
    return localStorage.getItem('citylife_token');
  }
};
