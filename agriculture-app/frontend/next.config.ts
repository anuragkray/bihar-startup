/** @type {import('next').NextConfig} */
const nextConfig: import("next").NextConfig = {
  // async rewrites() {
  //   return [
  //     {
  //       source: "/:path*",
  //       destination: "http://localhost:5000/:path*",
  //     },
  //   ];
  // },
  async redirects() {
    return [
    
    ];
  },
};

export default nextConfig;
