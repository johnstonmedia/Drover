import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Allow the GitHub Pages site (and local dev) to call this API. Set
 * ALLOWED_ORIGIN in Vercel to your Pages URL, e.g.
 * https://johnstonmedia.github.io  — defaults to "*" if unset.
 */
export function applyCors(req: VercelRequest, res: VercelResponse): boolean {
  const allowed = process.env.ALLOWED_ORIGIN || '*';
  res.setHeader('Access-Control-Allow-Origin', allowed);
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true; // handled
  }
  return false;
}
