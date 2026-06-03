import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nexus_access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401 — clear token and fire global logout event (FIX #13 & #14)
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('nexus_access_token');
      window.dispatchEvent(new CustomEvent('logout'));
    }
    return Promise.reject(error);
  }
);

export default api;