// Base URL of the AXIONIK backend.
//
// On Render, the backend (server/) serves this dashboard's built static
// files itself (see server/index.js), so the frontend and API share the
// same origin — an empty base URL means every apiUrl() call is a relative
// path like "/api/marketplace/activity/all", which just works with no env
// var needed.
//
// If this dashboard is ever deployed separately from the backend (e.g. on
// Vercel, where the API lives on a different domain), set VITE_API_URL in
// that project's environment variables to the full backend URL, e.g.
// https://raymond-dashboard.onrender.com — and trigger a fresh build
// afterward, since Vite only reads env vars at build time.
export const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:8000" : "");

export function apiUrl(path: string): string {
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
