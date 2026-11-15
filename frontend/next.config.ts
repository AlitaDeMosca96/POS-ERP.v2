import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        // Usa la variable de entorno de Docker, o localhost si corre local
        destination: `${process.env.BACKEND_URL || 'http://localhost:3000'}/:path*`, 
      },
    ];
  },
};

export default nextConfig;