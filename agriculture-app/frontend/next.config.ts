/** @type {import('next').NextConfig} */
const nextConfig: import("next").NextConfig = {
  images: {
    remotePatterns: [
      { 
        protocol: "https", 
        hostname: "res.cloudinary.com",
        pathname: "/**"
      },
    ],
  },
  async redirects() {
    return [];
  },
};

export default nextConfig;
