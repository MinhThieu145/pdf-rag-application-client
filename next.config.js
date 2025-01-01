/** @type {import('next').NextConfig} */

// API URLs
const PROD_URL = 'https://pdf-rag-application-server.onrender.com'.replace(/\/$/, '');
const DEV_URL = 'http://127.0.0.1:8080'.replace(/\/$/, '');

const nextConfig = {
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
    config.module.rules.push({
      test: /\.(pdf)$/,
      type: 'asset/resource',
    });
    return config;
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
};

// Log environment configuration in development
if (process.env.NODE_ENV !== 'production') {
  console.log('Next.js Environment Config:', {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_USE_PRODUCTION_API: nextConfig.env.NEXT_PUBLIC_USE_PRODUCTION_API,
    NEXT_PUBLIC_API_URL: nextConfig.env.NEXT_PUBLIC_API_URL,
  });
}

module.exports = nextConfig;
