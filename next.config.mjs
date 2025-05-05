const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
const url = new URL(apiBaseUrl);
const protocol = url.protocol.replace(':', '');
  const hostname = url.hostname;

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_BASE_URL: apiBaseUrl,
  },
  swcMinify: true, // Enable SWC minification
  compiler: {
    // Additional SWC-specific configurations can be added here
  },
  images: {
    remotePatterns: [
      {
        protocol,
        hostname,
        port: '4000',
        pathname: '/api/v2/uploads/**',
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920], // for different size of devices
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};

export default nextConfig;
