import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: '/api/google-auth/:path*',
        destination:
          'https://backend-promotoras.onrender.com/api/google-auth/:path*',
      },
      // Otras rutas del backend si las hay
      {
        source: '/api/users/:path*',
        destination: 'https://backend-promotoras.onrender.com/api/users/:path*',
      },
      {
        source: '/api/slots/:path*',
        destination: 'https://backend-promotoras.onrender.com/api/slots/:path*',
      },
      {
        source: '/api/schedule-config/:path*',
        destination:
          'https://backend-promotoras.onrender.com/api/schedule-config/:path*',
      },
      {
        source: '/api/attendance/:path*',
        destination:
          'https://backend-promotoras.onrender.com/api/attendance/:path*',
      },
      {
        source: '/api/approval/:path*',
        destination:
          'https://backend-promotoras.onrender.com/api/approval/:path*',
      },
      {
        source: '/api/initialize-slots/:path*',
        destination:
          'https://backend-promotoras.onrender.com/api/initialize-slots/:path*',
      },
      {
        source: '/api/appointments/:path*',
        destination:
          'https://backend-promotoras.onrender.com/api/appointments/:path*',
      },
    ];
  },
};

export default nextConfig;
