/** @type {import('next').NextConfig} */
// Set BASE_PATH="/repo-name" when deploying to a subpath (e.g. GitHub Pages
// project sites: https://user.github.io/repo/). Leave empty for root domains
// (Cloudflare Pages, Netlify, custom domain).
const basePath = process.env.BASE_PATH || '';

const nextConfig = {
  output: 'export',
  basePath,
  assetPrefix: basePath || undefined,
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
