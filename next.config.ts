import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: '/api/google-auth/:path*',
        destination: 'http://localhost:5001/api/google-auth/:path*',
      },
      // Otras rutas del backend si las hay
      {
        source: '/api/users/:path*',
        destination: 'http://localhost:5001/api/users/:path*',
      },
      {
        source: '/api/slots/:path*',
        destination: 'http://localhost:5001/api/slots/:path*',
      },
      {
        source: '/api/schedule-config/:path*',
        destination: 'http://localhost:5001/api/schedule-config/:path*',
      },
      {
        source: '/api/attendance/:path*',
        destination: 'http://localhost:5001/api/attendance/:path*',
      },
      {
        source: '/api/approval/:path*',
        destination: 'http://localhost:5001/api/approval/:path*',
      },
      {
        source: '/api/initialize-slots/:path*',
        destination: 'http://localhost:5001/api/initialize-slots/:path*',
      },
      {
        source: '/api/appointments/:path*',
        destination: 'http://localhost:5001/api/appointments/:path*',
      },
    ];
  },
};

export default nextConfig;

