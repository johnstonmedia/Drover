/** @type {import('next').NextConfig} */

// When deployed to GitHub Pages at https://<user>.github.io/drover the app is
// served from a sub-path. Set NEXT_PUBLIC_BASE_PATH=/drover in the GitHub
// Actions build. For local dev and Vercel it stays empty.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const nextConfig = {
  // Produce a fully static site (HTML/CSS/JS) so it can be hosted on GitHub
  // Pages. All dynamic behaviour runs client-side (Firebase, EmailJS) or via
  // the separate Vercel API (Groq advisor + price fetcher).
  output: 'export',
  basePath,
  assetPrefix: basePath || undefined,
  images: { unoptimized: true },
  trailingSlash: true,
  reactStrictMode: true,
};

export default nextConfig;
