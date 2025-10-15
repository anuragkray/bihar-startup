/** @type {import('next').NextConfig} */
const nextConfig: import("next").NextConfig = {
  images: {
    remotePatterns: [
      { 
        protocol: "https", 
        hostname: "drive.google.com",
        pathname: "/**"
      },
    ],
  },
  async redirects() {
    return [];
  },
};

export default nextConfig;
