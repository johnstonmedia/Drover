// Client for the Drover API (the Vercel deployment that holds the secret Groq
// key and runs the MLA / AuctionsPlus price-fetcher). The base URL is
// configured via NEXT_PUBLIC_API_BASE_URL. When empty we fall back to a
// same-origin "/api" path (useful when running the whole thing on Vercel).
import type { PriceRecord, RouteEvaluation } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';

function url(path: string): string {
  const base = API_BASE.replace(/\/$/, '');
  return `${base}/api${path}`;
}

export interface AdvisorRequest {
  /** A compact, factual summary of the scenario for the model to evaluate. */
  context: string;
  evaluation?: RouteEvaluation;
  prices?: PriceRecord[];
}

export interface AdvisorResponse {
  brief: string;
  model: string;
}

/** Ask the Groq-backed advisor for a brief evaluation of real, supplied data. */
export async function getAdvisorBrief(body: AdvisorRequest): Promise<AdvisorResponse> {
  const res = await fetch(url('/advisor'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Advisor request failed: ${res.status} ${await res.text()}`);
  return res.json();
}

export interface PricesResponse {
  prices: PriceRecord[];
  fetchedAt: string;
  warnings?: string[];
}

/** Fetch the latest real prices the server could source (MLA / AuctionsPlus). */
export async function fetchLivePrices(): Promise<PricesResponse> {
  const res = await fetch(url('/prices'), { method: 'GET' });
  if (!res.ok) throw new Error(`Price fetch failed: ${res.status}`);
  return res.json();
}
