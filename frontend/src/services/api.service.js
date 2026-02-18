import axios from "axios";

/**
 * This module sets up an Axios instance with a base URL defined in the environment variables.
 * It allows the frontend to make API calls to the backend without having to specify the full URL each time.
 * The base URL is typically something like "http://localhost:3000/api" during development, and can be 
 * configured for production as well. By centralizing the API configuration in this service, we can easily
 * manage and update the API endpoint across the entire frontend application.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});

export default api;
