// Base URL of the AXIONIK backend.
// Set VITE_API_URL in a .env file (or in Vercel's project env vars) to your
// deployed Render URL, e.g. https://axionik-api.onrender.com
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export function apiUrl(path: string): string {
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
