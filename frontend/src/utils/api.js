/**
 * API configuration and helper functions.
 * In local dev (Vite): VITE_API_URL is empty, requests use relative paths /api/... proxied by Vite to http://127.0.0.1:8000
 * In production (Vercel): Set VITE_API_URL to your Render backend URL (e.g. https://craveyard-backend.onrender.com)
 */
export const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

export const apiUrl = (endpoint) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE}${cleanEndpoint}`;
};

export default apiUrl;
