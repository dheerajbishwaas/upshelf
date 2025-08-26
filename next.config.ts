import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // next13+ / app router use kar rahe ho, phir bhi ye outside experimental hona chahiye
  allowedDevOrigins: ['db9268192cc9.ngrok-free.app'],
  experimental: {
    // tum jo bhi experimental flags use kar rahe ho
    serverActions: {
      // etc.
    },
  },
};

export default nextConfig;
