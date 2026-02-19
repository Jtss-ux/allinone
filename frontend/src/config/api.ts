// Centralized API configuration
// Single-backend deploy: set NEXT_PUBLIC_ML_SERVICE_URL = NEXT_PUBLIC_BACKEND_URL
// so image/audio/img2img go to the Node backend.

const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000').replace(/\/$/, '');
const mlUrl = (process.env.NEXT_PUBLIC_ML_SERVICE_URL || 'http://localhost:5001').replace(/\/$/, '');

export const API_CONFIG = {
  BACKEND_URL: backendUrl,
  ML_SERVICE_URL: mlUrl,
};

export const backendApi = (endpoint: string): string => {
  const p = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_CONFIG.BACKEND_URL}${p}`;
};

export const mlApi = (endpoint: string): string => {
  const p = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_CONFIG.ML_SERVICE_URL}${p}`;
};

export const mlAssetUrl = (assetPath: string): string => {
  const p = assetPath.startsWith('/') ? assetPath : `/${assetPath}`;
  return `${API_CONFIG.ML_SERVICE_URL}${p}`;
};
