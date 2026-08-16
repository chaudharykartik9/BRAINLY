// export const formatRelativeDate = (dateString: string): string => {
//   const date = new Date(dateString);
//   const now = new Date();
//   const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

//   if (diffInSeconds < 60) return 'Just now';
//   if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
//   if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
//   if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
//   return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
// };

import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api/v1';

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

export const api = API;
export default API;