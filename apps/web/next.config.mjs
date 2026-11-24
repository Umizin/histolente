/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  poweredByHeader: false,
  experimental: { serverComponentsExternalPackages: ["sharp", "pg", "ioredis", "amqplib", "bcryptjs"] },
};
export default nextConfig;
