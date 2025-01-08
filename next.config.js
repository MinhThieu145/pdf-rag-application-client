/** @type {import('next').NextConfig} */
const path = require('path');

// API URLs
const PROD_URL = 'https://pdf-rag-application-server.onrender.com'.replace(/\/$/, '');
const DEV_URL = 'http://127.0.0.1:8080'.replace(/\/$/, '');

const nextConfig = {
  output: 'standalone',
  env: {
    NEXT_PUBLIC_USE_PRODUCTION_API: process.env.NODE_ENV === 'production' ? 'true' : 'false',
    NEXT_PUBLIC_API_URL: process.env.NODE_ENV === 'production' ? PROD_URL : DEV_URL,
  },
  images: {
    domains: ['pdf-chat-application.s3.amazonaws.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pdf-chat-application.s3.amazonaws.com',
        port: '',
        pathname: '/documents/**',
      },
    ],
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    
    // Add alias configuration
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.join(__dirname),
    };
    
    return config;
  },
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
