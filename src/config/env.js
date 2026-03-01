/**
 * App-level config from environment (Vite exposes VITE_* to client).
 * No code defaults: set VITE_API_BASE_URL and VITE_APP_NAME in .env (required in production; see .env.example).
 */

export const appConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
  appName: import.meta.env.VITE_APP_NAME,
};
