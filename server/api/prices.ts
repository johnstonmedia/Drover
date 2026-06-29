import type { VercelRequest, VercelResponse } from '@vercel/node';
import { applyCors } from './_lib.js';

// ---------------------------------------------------------------------------
// Price fetcher — MLA / AuctionsPlus adapters.
//
// IMPORTANT: This returns ONLY real data it can actually retrieve. If an
// adapter is not yet wired to a confirmed, permitted source, it returns no
// prices plus a warning — it never fabricates numbers.
//
// Before enabling automated pulls, confirm you are permitted to fetch from each
// source (terms of use / data agreement). Set the source URLs/keys via env.
// ---------------------------------------------------------------------------

interface PriceRecord {
  stage: 'post_breeding' | 'backgrounding' | 'feedlot' | 'processing';
  category: string;
  value: number;
  basis: 'per_head' | 'c_per_kg_lwt' | 'c_per_kg_cwt';
  asOf: string;
  source: 'MLA' | 'AuctionsPlus' | 'manual' | 'estimate';
  region?: string;
  note?: string;
}

async function fetchMla(): Promise<{ prices: PriceRecord[]; warnings: string[] }> {
  const warnings: string[] = [];
  const url = process.env.MLA_PRICES_URL;
  if (!url) {
    warnings.push(
      'MLA adapter not configured (set MLA_PRICES_URL and confirm you are permitted to fetch it). No MLA prices returned.',
    );
    return { prices: [], warnings };
  }
  try {
    const r = await fetch(url, {
      headers: process.env.MLA_API_KEY ? { Authorization: `Bearer ${process.env.MLA_API_KEY}` } : {},
    });
    if (!r.ok) {
      warnings.push(`MLA fetch failed: ${r.status}`);
      return { prices: [], warnings };
    }
    // TODO: map the real MLA payload shape into PriceRecord[]. The shape depends
    // on the specific MLA endpoint/report you are licensed to use. Until mapped,
    // we surface a warning rather than guess values.
    warnings.push('MLA response received — map its fields in fetchMla() to produce PriceRecord[].');
    return { prices: [], warnings };
  } catch (e) {
    warnings.push(`MLA fetch error: ${e instanceof Error ? e.message : 'unknown'}`);
    return { prices: [], warnings };
  }
}

async function fetchAuctionsPlus(): Promise<{ prices: PriceRecord[]; warnings: string[] }> {
  const warnings: string[] = [];
  const url = process.env.AUCTIONSPLUS_PRICES_URL;
  if (!url) {
    warnings.push(
      'AuctionsPlus adapter not configured. Most AuctionsPlus data sits behind their platform; confirm a data agreement before automating, then set AUCTIONSPLUS_PRICES_URL.',
    );
    return { prices: [], warnings };
  }
  try {
    const r = await fetch(url, {
      headers: process.env.AUCTIONSPLUS_API_KEY
        ? { Authorization: `Bearer ${process.env.AUCTIONSPLUS_API_KEY}` }
        : {},
    });
    if (!r.ok) {
      warnings.push(`AuctionsPlus fetch failed: ${r.status}`);
      return { prices: [], warnings };
    }
    warnings.push('AuctionsPlus response received — map its fields in fetchAuctionsPlus().');
    return { prices: [], warnings };
  } catch (e) {
    warnings.push(`AuctionsPlus fetch error: ${e instanceof Error ? e.message : 'unknown'}`);
    return { prices: [], warnings };
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res)) return;
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const [mla, ap] = await Promise.all([fetchMla(), fetchAuctionsPlus()]);
  const prices = [...mla.prices, ...ap.prices];
  const warnings = [...mla.warnings, ...ap.warnings];

  res.status(200).json({
    prices,
    warnings,
    fetchedAt: new Date().toISOString(),
  });
}
