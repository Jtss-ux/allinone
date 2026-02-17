// Centralized API configuration
// Use environment variables for production, fallback to localhost for development

export const API_CONFIG = {
  // Main backend API (port 5000)
  BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000',
  
  // ML/AI service API (port 5001)
  ML_SERVICE_URL: process.env.NEXT_PUBLIC_ML_SERVICE_URL || 'http://localhost:5001',
};

// Helper function to build backend API URLs
export const backendApi = (endpoint: string): string => {
  const baseUrl = API_CONFIG.BACKEND_URL.replace(/\/$/, '');
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${path}`;
};

// Helper function to build ML service API URLs
export const mlApi = (endpoint: string): string => {
  const baseUrl = API_CONFIG.ML_SERVICE_URL.replace(/\/$/, '');
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${path}`;
};

// Helper function for ML service asset URLs (for audio/image files)
export const mlAssetUrl = (assetPath: string): string => {
  const baseUrl = API_CONFIG.ML_SERVICE_URL.replace(/\/$/, '');
  const path = assetPath.startsWith('/') ? assetPath : `/${assetPath}`;
  return `${baseUrl}${path}`;
};
