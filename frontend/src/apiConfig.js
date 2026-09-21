/**
 * When the frontend and Go backend are one deployment (e.g. the Go binary
 * embedding and serving the built frontend, or the Vite dev proxy), API and
 * WebSocket calls are same-origin relative paths and this file is a no-op.
 *
 * When they're deployed separately (frontend on Vercel, backend on
 * Railway/Render/Fly), set VITE_API_BASE_URL to the backend's base URL
 * (e.g. https://blockvote-backend.up.railway.app) at build time and every
 * call below points there instead.
 */
const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

/** Prefixes a same-origin path like '/api/vote' with the configured API base. */
export function apiUrl(path) {
  if (!path || /^https?:\/\//.test(path)) return path;
  return `${API_BASE}${path}`;
}

/** Builds the WebSocket URL, deriving ws/wss and host from API_BASE when set. */
export function wsUrl() {
  if (API_BASE) {
    return `${API_BASE.replace(/^http/, 'ws')}/ws`;
  }
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}/ws`;
}
