'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { listMobs } from '@/lib/firestore';
import { can } from '@/lib/rbac';
import {
  evaluateRoute,
  compareRoutes,
  stageLabel,
  AUD,
  AUD2,
} from '@/lib/supplyChain';
import { exportRouteEvaluation } from '@/lib/excel';
import { getAdvisorBrief } from '@/lib/api';
import { SAMPLE_MOB } from '@/lib/sampleData';
import type { LivestockMob, StagePlan } from '@/lib/types';

export default function MarginsPage() {
  const { profile } = useAuth();
  const [mobs, setMobs] = useState<LivestockMob[]>([]);
  const [selected, setSelected] = useState<LivestockMob>(SAMPLE_MOB);
  const [directFreight, setDirectFreight] = useState(0);

  useEffect(() => {
    if (!profile?.companyId) return;
    listMobs(profile.companyId).then((m) => {
      setMobs(m);
      if (m.length) setSelected(m[0]);
    });
  }, [profile?.companyId]);

  // Local editable copy of the plan so the user can enter real prices/costs.
  const [plan, setPlan] = useState<StagePlan[]>(selected.plan);
  useEffect(() => setPlan(selected.plan), [selected]);

  const working: LivestockMob = useMemo(() => ({ ...selected, plan }), [selected, plan]);
  const evaln = useMemo(() => evaluateRoute(working), [working]);

  // Route comparison: full chain vs direct-to-processing (e.g. Darwin export).
  const comparison = useMemo(() => {
    const processingLeg = plan.find((l) => l.stage === 'processing');
    if (!processingLeg) return null;
    const directPlan: StagePlan[] = [
      {
        ...processingLeg,
        costs: { ...processingLeg.costs, freight: directFreight },
      },
    ];
    return compareRoutes(selected, plan, directPlan);
  }, [selected, plan, directFreight]);

  function updateLeg(i: number, patch: Partial<StagePlan>) {
    setPlan((prev) => prev.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  }
  function updateCost(i: number, key: keyof StagePlan['costs'], val: number) {
    setPlan((prev) =>
      prev.map((l, idx) => (idx === i ? { ...l, costs: { ...l.costs, [key]: val } } : l)),
    );
  }

  const canExport = can(profile, 'export_data');
  const canAdvise = can(profile, 'use_advisor');

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Margins</h1>
          <p className="mt-1 text-sm text-drover-sage">
            Enter real sale prices and costs per stage. All values in AUD.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            className="input max-w-xs"
            value={selected.id}
            onChange={(e) =>
              setSelected(mobs.find((m) => m.id === e.target.value) ?? SAMPLE_MOB)
            }
          >
            {mobs.length === 0 && <option value="sample">{SAMPLE_MOB.name}</option>}
            {mobs.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
          {canExport && (
            <button className="btn-ghost" onClick={() => exportRouteEvaluation(evaln)}>
              Export Excel
            </button>
          )}
        </div>
      </div>

      {/* Editable per-stage table */}
      <div className="card mt-6 overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-drover-dust/60 text-xs uppercase tracking-wide text-drover-sage">
            <tr>
              <th className="px-4 py-3">Stage</th>
              <th className="px-4 py-3">Exit wt (kg)</th>
              <th className="px-4 py-3">Sale price</th>
              <th className="px-4 py-3">Freight</th>
              <th className="px-4 py-3">Feed/agist</th>
              <th className="px-4 py-3">Processing</th>
              <th className="px-4 py-3">Other</th>
              <th className="px-4 py-3 text-right">Margin/head</th>
            </tr>
          </thead>
          <tbody>
            {plan.map((leg, i) => {
              const r = evaln.legs[i];
              return (
                <tr key={i} className="border-b border-drover-dust/30 last:border-0">
                  <td className="px-4 py-2 font-medium">{stageLabel(leg.stage)}</td>
                  <td className="px-4 py-2">
                    <input className="input !py-1 w-24" type="number" value={leg.exitWeightKg}
                      onChange={(e) => updateLeg(i, { exitWeightKg: +e.target.value })} />
                  </td>
                  <td className="px-4 py-2">
                    <input className="input !py-1 w-28" type="number" value={leg.exitPrice ?? 0}
                      onChange={(e) => updateLeg(i, { exitPrice: +e.target.value })}
                      placeholder={leg.stage === 'processing' ? 'c/kg cwt' : 'c/kg lwt'} />
                  </td>
                  <td className="px-4 py-2">
                    <input className="input !py-1 w-24" type="number" value={leg.costs.freight ?? 0}
                      onChange={(e) => updateCost(i, 'freight', +e.target.value)} />
                  </td>
                  <td className="px-4 py-2">
                    <input className="input !py-1 w-24" type="number" value={leg.costs.agistmentOrFeed ?? 0}
                      onChange={(e) => updateCost(i, 'agistmentOrFeed', +e.target.value)} />
                  </td>
                  <td className="px-4 py-2">
                    <input className="input !py-1 w-24" type="number" value={leg.costs.processing ?? 0}
                      onChange={(e) => updateCost(i, 'processing', +e.target.value)} />
                  </td>
                  <td className="px-4 py-2">
                    <input className="input !py-1 w-24" type="number" value={leg.costs.other ?? 0}
                      onChange={(e) => updateCost(i, 'other', +e.target.value)} />
                  </td>
                  <td
                    className={`px-4 py-2 text-right font-medium tabular-nums ${
                      (r?.marginPerHead ?? 0) > 0
                        ? 'text-green-600'
                        : (r?.marginPerHead ?? 0) < 0
                          ? 'text-red-600'
                          : ''
                    }`}
                  >
                    {(r?.marginPerHead ?? 0) > 0 ? '▲' : (r?.marginPerHead ?? 0) < 0 ? '▼' : ''}{' '}
                    {AUD2.format(r?.marginPerHead ?? 0)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Margin / head" value={AUD2.format(evaln.totalMarginPerHead)} />
        <Stat label={`Total margin (${working.head} head)`} value={AUD.format(evaln.totalMargin)} />
        <Stat label="Return on cost" value={`${evaln.returnOnCostPct}%`} />
      </div>

      {/* Computed summary (factual — derived only from the figures above) */}
      <div className="card mt-4 border-l-4 border-drover-grass">
        <p className="text-sm leading-relaxed text-drover-bark/90">{marginSummary(evaln)}</p>
      </div>

      {/* Route comparison */}
      <div className="card mt-8">
        <h2 className="text-lg font-medium">Route comparison</h2>
        <p className="mt-1 text-sm text-drover-sage">
          Full chain (through feedlot) vs. direct to processing/export — e.g.
          trucking south to a feedlot vs. live export straight from Darwin.
        </p>
        <div className="mt-4 max-w-xs">
          <label className="label">Direct route freight (AUD/head)</label>
          <input className="input" type="number" value={directFreight}
            onChange={(e) => setDirectFreight(+e.target.value)} placeholder="supply real freight rate" />
        </div>
        {comparison && (
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <Stat label="Full chain / head" value={AUD2.format(comparison.a.totalMarginPerHead)} />
            <Stat label="Direct / head" value={AUD2.format(comparison.b.totalMarginPerHead)} />
            <Stat
              label="Advantage"
              value={
                comparison.differencePerHead >= 0
                  ? `Full chain +${AUD2.format(comparison.differencePerHead)}`
                  : `Direct +${AUD2.format(-comparison.differencePerHead)}`
              }
            />
          </div>
        )}
      </div>

      {/* AI advisor */}
      {canAdvise && <Advisor mob={working} evaluation={evaln} />}
    </div>
  );
}

function Advisor({ mob, evaluation }: { mob: LivestockMob; evaluation: ReturnType<typeof evaluateRoute> }) {
  const [brief, setBrief] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function ask() {
    setBusy(true);
    setErr(null);
    try {
      const context = [
        `Mob: ${mob.name}, ${mob.head} head, entry stage ${mob.entryStage} at ${mob.entryWeightKg}kg.`,
        `Per-stage margins (AUD/head): ${evaluation.legs
          .map((l) => `${stageLabel(l.stage)} ${l.marginPerHead}`)
          .join(', ')}.`,
        `Total margin/head ${evaluation.totalMarginPerHead} AUD, total ${evaluation.totalMargin} AUD, return on cost ${evaluation.returnOnCostPct}%.`,
      ].join(' ');
      const res = await getAdvisorBrief({ context, evaluation });
      setBrief(res.brief);
    } catch (e) {
      setErr(
        'Advisor unavailable. Set NEXT_PUBLIC_API_BASE_URL to your Vercel API (which holds the Groq key).',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card mt-8">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">AI advisor</h2>
        <button className="btn-primary" onClick={ask} disabled={busy}>
          {busy ? 'Thinking…' : 'Generate brief'}
        </button>
      </div>
      <p className="mt-1 text-sm text-drover-sage">
        A short written evaluation grounded only in the figures above.
      </p>
      {err && <p className="mt-4 text-sm text-amber-700">{err}</p>}
      {brief && <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed">{brief}</p>}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card">
      <p className="text-xs uppercase tracking-wide text-drover-sage">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
    </div>
  );
}

/** A factual one-liner derived purely from the evaluation — no AI, no guessing. */
function marginSummary(e: ReturnType<typeof evaluateRoute>): string {
  const realised = e.legs.filter((l) => l.outValuePerHead !== l.inValuePerHead || l.costsPerHead > 0);
  if (realised.length === 0) {
    return 'Enter sale prices and costs for each stage to see a margin summary.';
  }
  const best = realised.reduce((a, b) => (b.marginPerHead > a.marginPerHead ? b : a));
  const worst = realised.reduce((a, b) => (b.marginPerHead < a.marginPerHead ? b : a));
  const verdict =
    e.totalMarginPerHead > 0
      ? `profitable at ${AUD2.format(e.totalMarginPerHead)}/head`
      : e.totalMarginPerHead < 0
        ? `running at a loss of ${AUD2.format(Math.abs(e.totalMarginPerHead))}/head`
        : 'breaking even';
  const bestPart = `Strongest stage: ${stageLabel(best.stage)} (${AUD2.format(best.marginPerHead)}/head)`;
  const worstPart =
    best.stage !== worst.stage
      ? `; weakest: ${stageLabel(worst.stage)} (${AUD2.format(worst.marginPerHead)}/head)`
      : '';
  return `This route is ${verdict} across ${e.head} head (${AUD.format(e.totalMargin)} total). ${bestPart}${worstPart}.`;
}
