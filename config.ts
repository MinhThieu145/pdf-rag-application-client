// Server configuration
const IS_PRODUCTION = process.env.NEXT_PUBLIC_USE_PRODUCTION_API === 'true';

// Remove any trailing slashes from the URLs
const PROD_URL = 'https://pdf-rag-application-server.onrender.com'.replace(/\/$/, '');
const DEV_URL = 'http://127.0.0.1:8080'.replace(/\/$/, '');

// Log the environment configuration
console.log('Environment Config:', {
  IS_PRODUCTION,
  NEXT_PUBLIC_USE_PRODUCTION_API: process.env.NEXT_PUBLIC_USE_PRODUCTION_API,
  NODE_ENV: process.env.NODE_ENV,
  SELECTED_URL: IS_PRODUCTION ? PROD_URL : DEV_URL
});

export const API_BASE_URL = IS_PRODUCTION ? PROD_URL : DEV_URL;
