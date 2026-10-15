import type { NextConfig } from 'next';

const config: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  async redirects() {
    return [
      { source: '/favicon.ico', destination: '/icon.svg', permanent: true },
    ];
  },
};
export default config;
