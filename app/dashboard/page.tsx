'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { listMobs } from '@/lib/firestore';
import { evaluateRoute, AUD } from '@/lib/supplyChain';
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
        <Stat label="Mobs tracked" value={loading ? '…' : String(mobs.length)} />
        <Stat label="Head under management" value={loading ? '…' : totalHead.toLocaleString('en-AU')} />
        <Stat label="Projected total margin" value={loading ? '…' : AUD.format(totalMargin)} />
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/dashboard/livestock" className="btn-primary">Add a mob</Link>
        <Link href="/dashboard/prices" className="btn-ghost">View prices</Link>
        <Link href="/dashboard/margins" className="btn-ghost">Evaluate margins</Link>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card">
      <p className="text-xs uppercase tracking-wide text-drover-sage">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}
