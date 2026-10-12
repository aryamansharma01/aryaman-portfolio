import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets the dev site hydrate when opened at 127.0.0.1 instead of localhost.
  allowedDevOrigins: ["127.0.0.1"],
  // Static export for GitHub Pages, which has no image optimizer.
  output: "export",
  // Emits blog/index.html rather than blog.html next to a blog/ folder.
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
