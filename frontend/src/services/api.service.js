import axios from "axios";
import { resolveApiOrigin } from "../utils/resolveApiUrl";

/**
 * This module sets up an Axios instance with a base URL defined in the environment variables.
 * It allows the frontend to make API calls to the backend without having to specify the full URL each time.
 * VITE_API_URL only needs to be the backend's origin (e.g. "http://localhost:3000"); resolveApiOrigin
 * normalizes scheme/trailing slashes and the "/api" suffix below is added once, here.
 */
const api = axios.create({
  baseURL: `${resolveApiOrigin(import.meta.env.VITE_API_URL)}/api`
});

const MUTATING_METHODS = ["post", "patch", "put", "delete"];

// Attaches the admin API key (set via ApiKeySettings) to mutating requests.
// Read-only requests are left untouched since those endpoints stay public.
api.interceptors.request.use((config) => {
  if (MUTATING_METHODS.includes((config.method || "").toLowerCase())) {
    const apiKey = localStorage.getItem("watchdog_api_key");
    if (apiKey) {
      config.headers["X-API-Key"] = apiKey;
    }
  }
  return config;
});

export default api;
