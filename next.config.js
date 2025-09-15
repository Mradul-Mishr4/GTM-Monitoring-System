// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: false, // keep the buggy SWC minifier OFF
  output: "standalone", // Enable standalone output for Docker
  experimental: {
    esmExternals: "loose",
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [],
  },
  webpack: (config, { isServer }) => {
    // Skip bundling puppeteer-core, lighthouse and chrome-launcher on the server build
    if (isServer) {
      (config.externals = config.externals || []).push(
        "puppeteer-core",
        "lighthouse",
        "chrome-launcher"
      );
    }
    return config;
  },
};

module.exports = nextConfig; // *** single export only ***
