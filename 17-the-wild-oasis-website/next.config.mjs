// Static export: the whole site is plain HTML/JS files, served under a
// subpath (the root build sets NEXT_BASE_PATH=/17-the-wild-oasis-website)
const basePath = process.env.NEXT_BASE_PATH || "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  env: {
    // next/image and <img> don't prefix plain public-file URLs with basePath
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
