// Helper for building asset/links that respect the GitHub Pages sub-path.
// Next automatically prefixes its own assets and <Link> hrefs with basePath,
// but raw URLs (e.g. a <video src>) need this helper.
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

export function withBase(path: string): string {
  if (!path.startsWith('/')) path = `/${path}`;
  return `${basePath}${path}`;
}
