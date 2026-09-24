import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api/v1';

export const SESSION_EXPIRED_MESSAGE_KEY = 'brainly:session-expired-message';

export const API = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token automatically to outgoing requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// authMiddleware rejects a missing/expired/invalid JWT with a 401 on every
// protected route — without this, a stale token left the app "signed in"
// (isAuthenticated stayed true) while every request silently failed, with
// no way back in short of manually clearing localStorage.
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const hadToken = !!localStorage.getItem('token');
    if (error.response?.status === 401 && hadToken) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/signin') {
        sessionStorage.setItem(SESSION_EXPIRED_MESSAGE_KEY, 'Your session has expired. Please sign in again.');
        window.location.href = '/signin';
      }
    }
    return Promise.reject(error);
  },
);

export const api = API;
export default API;