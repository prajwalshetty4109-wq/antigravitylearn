/** @type {import('next').NextConfig} */
const nextConfig = {
  // Uses standalone mode in Docker container environments (Cloud Run)
  // and native serverless optimization when deployed on Vercel
  output: process.env.DOCKER_BUILD === 'true' ? 'standalone' : undefined,
  reactStrictMode: true,
  swcMinify: true,
};

export default nextConfig;
