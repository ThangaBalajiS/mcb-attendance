/** @type {import('next').NextConfig} */
// 'standalone' is for self-hosting (Docker, plain Node). Vercel does its own
// file tracing and fails on the standalone layout, so leave it off there.
const nextConfig = process.env.VERCEL ? {} : { output: 'standalone' };
export default nextConfig;
