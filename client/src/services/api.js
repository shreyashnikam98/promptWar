import axios from 'axios';

let rawBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
if (rawBaseUrl !== '/api' && !rawBaseUrl.endsWith('/api')) {
  rawBaseUrl = `${rawBaseUrl.replace(/\/+$/, '')}/api`;
}
const API_BASE_URL = rawBaseUrl;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token from localStorage to outgoing requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('citylife_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for session expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized, clear token if expired
      const msg = error.response.data?.message || '';
      if (msg.includes('expired') || msg.includes('Invalid')) {
        localStorage.removeItem('citylife_token');
        localStorage.removeItem('citylife_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
