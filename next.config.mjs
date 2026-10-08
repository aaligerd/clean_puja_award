/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.assettype.com",
      },
      {
        protocol: "https",
        hostname: "d243y9xj05uh4.cloudfront.net",
      },
    ],
  },
};

export default nextConfig;
