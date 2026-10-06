/** @type {import('next').NextConfig} */
const basePath = process.env.NEXT_BASE_PATH || "";

const nextConfig = {
  reactStrictMode: true,
  // Static export (no server): deployed as plain files under a subpath
  output: "export",
  basePath,
  trailingSlash: true,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
