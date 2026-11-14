import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3000/:path*', // <-- ESTA URL DEBE TENER EL HTTP
      },
    ];
  },
};

export default nextConfig;