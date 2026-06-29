'use client';

import { useState } from 'react';
import { fetchLivePrices } from '@/lib/api';
import { PLACEHOLDER_PRICES } from '@/lib/sampleData';
import { stageLabel } from '@/lib/supplyChain';
import { exportRowsToExcel } from '@/lib/excel';
import type { PriceRecord } from '@/lib/types';

const BASIS_LABEL: Record<string, string> = {
  per_head: 'AUD/head',
  c_per_kg_lwt: 'c/kg lwt',
  c_per_kg_cwt: 'c/kg cwt',
};

export default function PricesPage() {
  const [prices, setPrices] = useState<PriceRecord[]>(PLACEHOLDER_PRICES);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function refresh() {
    setBusy(true);
    setStatus('Fetching live prices…');
    try {
      const res = await fetchLivePrices();
      setPrices(res.prices.length ? res.prices : PLACEHOLDER_PRICES);
      setWarnings(res.warnings ?? []);
      setStatus(`Updated ${new Date(res.fetchedAt).toLocaleString('en-AU')}`);
    } catch (e) {
      setStatus(
        'Could not reach the price service. Set NEXT_PUBLIC_API_BASE_URL to your Vercel API. Showing placeholders.',
      );
    } finally {
      setBusy(false);
    }
  }

  function exportXlsx() {
    exportRowsToExcel(
      prices.map((p) => ({
        Stage: stageLabel(p.stage),
        Category: p.category,
        Value: p.value,
        Basis: BASIS_LABEL[p.basis] ?? p.basis,
        Region: p.region ?? '',
        'As of': p.asOf,
        Source: p.source,
      })),
      'drover_prices',
      'Prices',
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Prices</h1>
          <p className="mt-1 text-sm text-drover-sage">
            Buy/sell prices by supply-chain stage. Sourced from MLA / AuctionsPlus
            via the price service. All values in AUD.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="btn-ghost" onClick={exportXlsx}>Export Excel</button>
          <button className="btn-primary" onClick={refresh} disabled={busy}>
            {busy ? 'Refreshing…' : 'Refresh live prices'}
          </button>
        </div>
      </div>

      {status && <p className="mt-4 text-sm text-drover-sage">{status}</p>}
      {warnings.map((w, i) => (
        <p key={i} className="mt-1 text-sm text-amber-700">⚠ {w}</p>
      ))}

      <div className="card mt-6 overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-drover-dust/60 text-xs uppercase tracking-wide text-drover-sage">
            <tr>
              <th className="px-5 py-3">Stage</th>
              <th className="px-5 py-3">Category</th>
              <th className="px-5 py-3 text-right">Value</th>
              <th className="px-5 py-3">Basis</th>
              <th className="px-5 py-3">Region</th>
              <th className="px-5 py-3">As of</th>
              <th className="px-5 py-3">Source</th>
            </tr>
          </thead>
          <tbody>
            {prices.map((p, i) => (
              <tr key={i} className="border-b border-drover-dust/30 last:border-0">
                <td className="px-5 py-3 font-medium">{stageLabel(p.stage)}</td>
                <td className="px-5 py-3">{p.category}</td>
                <td className="px-5 py-3 text-right tabular-nums">
                  {p.value ? p.value.toLocaleString('en-AU') : '—'}
                </td>
                <td className="px-5 py-3">{BASIS_LABEL[p.basis] ?? p.basis}</td>
                <td className="px-5 py-3">{p.region ?? '—'}</td>
                <td className="px-5 py-3">{p.asOf}</td>
                <td className="px-5 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      p.source === 'estimate'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-drover-grass/15 text-drover-paddock'
                    }`}
                  >
                    {p.source}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
