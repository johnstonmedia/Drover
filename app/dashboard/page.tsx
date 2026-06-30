'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { listMobs } from '@/lib/firestore';
import { evaluateRoute, AUD } from '@/lib/supplyChain';
import { can } from '@/lib/rbac';
import { getAdvisorBrief } from '@/lib/api';
import type { LivestockMob } from '@/lib/types';

export default function DashboardOverview() {
  const { profile } = useAuth();
  const [mobs, setMobs] = useState<LivestockMob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.companyId) {
      setLoading(false);
      return;
    }
    listMobs(profile.companyId)
      .then(setMobs)
      .finally(() => setLoading(false));
  }, [profile?.companyId]);

  const totalHead = mobs.reduce((n, m) => n + m.head, 0);
  const totalMargin = mobs.reduce((n, m) => n + evaluateRoute(m).totalMargin, 0);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">
        G&apos;day{profile?.displayName ? `, ${profile.displayName.split(' ')[0]}` : ''}
      </h1>
      <p className="mt-1 text-sm text-drover-sage">
        Your beef supply-chain margins at a glance. All values in AUD.
      </p>

      {!profile?.companyId && (
        <div className="card mt-6 border-amber-300 bg-amber-50">
          <p className="text-sm text-amber-900">
            You&apos;re not linked to a company yet. A company admin needs to add
            you, or you can create a company in{' '}
            <Link href="/admin" className="font-medium underline">
              Admin
            </Link>
            .
          </p>
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Mobs tracked" value={loading ? '…' : String(mobs.length)} delay={0} />
        <Stat label="Head under management" value={loading ? '…' : totalHead.toLocaleString('en-AU')} delay={80} />
        <Stat label="Projected total margin" value={loading ? '…' : AUD.format(totalMargin)} delay={160} />
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/dashboard/livestock" className="btn-primary">Add a mob</Link>
        <Link href="/dashboard/prices" className="btn-ghost">View prices</Link>
        <Link href="/dashboard/margins" className="btn-ghost">Evaluate margins</Link>
      </div>

      {can(profile, 'use_advisor') && mobs.length > 0 && (
        <PortfolioSummary mobs={mobs} />
      )}
    </div>
  );
}

function PortfolioSummary({ mobs }: { mobs: LivestockMob[] }) {
  const [brief, setBrief] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function ask() {
    setBusy(true);
    setErr(null);
    try {
      const lines = mobs.map((m) => {
        const e = evaluateRoute(m);
        return `${m.name}: ${m.head} head from ${m.entryStage}, projected margin ${e.totalMarginPerHead}/head (${e.totalMargin} total, ${e.returnOnCostPct}% on cost).`;
      });
      const totalHead = mobs.reduce((n, m) => n + m.head, 0);
      const totalMargin = mobs.reduce((n, m) => n + evaluateRoute(m).totalMargin, 0);
      const context = `Portfolio of ${mobs.length} mobs, ${totalHead} head, total projected margin ${totalMargin} AUD. ${lines.join(' ')} Give a brief portfolio summary: overall position, which mob looks strongest/weakest, and one consideration. Use only these figures.`;
      const res = await getAdvisorBrief({ context });
      setBrief(res.brief);
    } catch {
      setErr('AI summary unavailable. Make sure the API URL (NEXT_PUBLIC_API_BASE_URL) is set to your Vercel deployment.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card mt-8">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">AI summary</h2>
        <button className="btn-primary" onClick={ask} disabled={busy}>
          {busy ? 'Thinking…' : 'Summarise my portfolio'}
        </button>
      </div>
      <p className="mt-1 text-sm text-drover-sage">
        A short written read on your whole herd, grounded only in your figures.
      </p>
      {err && <p className="mt-4 text-sm text-amber-700">{err}</p>}
      {brief && <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed">{brief}</p>}
    </div>
  );
}

function Stat({ label, value, delay = 0 }: { label: string; value: string; delay?: number }) {
  return (
    <div className="card-interactive animate-pop-in" style={{ animationDelay: `${delay}ms` }}>
      <p className="text-xs uppercase tracking-wide text-drover-sage">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}
