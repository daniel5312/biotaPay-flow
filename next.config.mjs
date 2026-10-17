/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["@interledger/open-payments"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
