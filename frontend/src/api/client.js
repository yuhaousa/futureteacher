import axios from 'axios';

// In development: points to Wrangler dev server (port 8787)
// In production: set VITE_API_URL in Cloudflare Pages environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

const api = axios.create({
  baseURL: `${API_URL}/api`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
