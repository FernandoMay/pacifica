/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
  basePath: process.env.NODE_ENV === 'production' ? '' : '',
  
  // Enable static export for Netlify
  distDir: 'out',
  
  // Custom webpack config for WebSocket support
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      };
    }
    return config;
  },
  
  // Environment variables
  env: {
    PACIFICA_WS_URL: process.env.PACIFICA_WS_URL,
    PACIFICA_API_URL: process.env.PACIFICA_API_URL,
    PACIFICA_API_KEY: process.env.PACIFICA_API_KEY,
    PACIFICA_TESTNET: process.env.PACIFICA_TESTNET,
  },
};

module.exports = nextConfig;
