'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { createMob, deleteMob, listMobs } from '@/lib/firestore';
import { can } from '@/lib/rbac';
import { STAGES, STAGE_ORDER, stageIndex, evaluateRoute, AUD } from '@/lib/supplyChain';
import type { LivestockMob, StageId, StagePlan } from '@/lib/types';

/** Build a default forward plan through every stage after the entry stage. */
function defaultPlan(entryStage: StageId, entryWeightKg: number): StagePlan[] {
  const start = stageIndex(entryStage) + 1;
  return STAGE_ORDER.slice(start).map((stage, i) => ({
    stage,
    exitWeightKg: entryWeightKg + (i + 1) * 120, // rough growth placeholder; edit on Margins
    days: 100,
    costs: {},
  }));
}

export default function LivestockPage() {
  const { profile } = useAuth();
  const [mobs, setMobs] = useState<LivestockMob[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const editable = can(profile, 'manage_livestock');

  async function reload() {
    if (!profile?.companyId) {
      setLoading(false);
      return;
    }
    setMobs(await listMobs(profile.companyId));
    setLoading(false);
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.companyId]);

  if (!profile?.companyId) {
    return <Empty msg="Link to a company first (see Admin) to manage livestock." />;
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Livestock profiles</h1>
          <p className="mt-1 text-sm text-drover-sage">
            Each mob locks its entry price. Margins flow through to processing.
          </p>
        </div>
        {editable && (
          <button className="btn-primary" onClick={() => setOpen((o) => !o)}>
            {open ? 'Close' : 'New mob'}
          </button>
        )}
      </div>

      {open && editable && (
        <NewMobForm
          companyId={profile.companyId}
          createdBy={profile.uid}
          onCreated={async () => {
            setOpen(false);
            await reload();
          }}
        />
      )}

      <div className="mt-6 grid gap-4">
        {loading && <p className="text-sm text-drover-sage">Loading…</p>}
        {!loading && mobs.length === 0 && <Empty msg="No mobs yet. Create your first above." />}
        {mobs.map((m) => {
          const evaln = evaluateRoute(m);
          return (
            <div key={m.id} className="card flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-medium">{m.name}</h3>
                <p className="text-sm text-drover-sage">
                  {m.head.toLocaleString('en-AU')} head · {m.breed || 'mixed'} · entry @{' '}
                  {STAGES.find((s) => s.id === m.entryStage)?.label} ({m.entryWeightKg}kg)
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-wide text-drover-sage">Projected margin</p>
                <p className="text-xl font-semibold tabular-nums">{AUD.format(evaln.totalMargin)}</p>
              </div>
              {editable && (
                <button
                  className="text-xs text-red-600 hover:underline"
                  onClick={async () => {
                    if (confirm(`Delete ${m.name}?`)) {
                      await deleteMob(m.id);
                      await reload();
                    }
                  }}
                >
                  Delete
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function NewMobForm({
  companyId,
  createdBy,
  onCreated,
}: {
  companyId: string;
  createdBy: string;
  onCreated: () => void;
}) {
  const [name, setName] = useState('');
  const [head, setHead] = useState(400);
  const [breed, setBreed] = useState('');
  const [sex, setSex] = useState<LivestockMob['sex']>('steer');
  const [entryStage, setEntryStage] = useState<StageId>('post_breeding');
  const [entryWeightKg, setEntryWeightKg] = useState(240);
  const [entryPrice, setEntryPrice] = useState(0);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    try {
      await createMob({
        companyId,
        createdBy,
        name: name || 'Untitled mob',
        head,
        breed,
        sex,
        entryStage,
        entryWeightKg,
        entryPrice,
        entryBasis: 'c_per_kg_lwt',
        entryDate: new Date().toISOString().slice(0, 10),
        plan: defaultPlan(entryStage, entryWeightKg),
        createdAt: Date.now(),
      });
      onCreated();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card mt-6 grid gap-4 sm:grid-cols-2">
      <Field label="Mob name">
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Northern weaners 2026" />
      </Field>
      <Field label="Head">
        <input className="input" type="number" value={head} onChange={(e) => setHead(+e.target.value)} />
      </Field>
      <Field label="Breed">
        <input className="input" value={breed} onChange={(e) => setBreed(e.target.value)} placeholder="Brahman-cross" />
      </Field>
      <Field label="Sex">
        <select className="input" value={sex} onChange={(e) => setSex(e.target.value as LivestockMob['sex'])}>
          <option value="steer">Steer</option>
          <option value="heifer">Heifer</option>
          <option value="cow">Cow</option>
          <option value="bull">Bull</option>
          <option value="mixed">Mixed</option>
        </select>
      </Field>
      <Field label="Entry stage">
        <select className="input" value={entryStage} onChange={(e) => setEntryStage(e.target.value as StageId)}>
          {STAGES.map((s) => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>
      </Field>
      <Field label="Entry weight (kg lwt)">
        <input className="input" type="number" value={entryWeightKg} onChange={(e) => setEntryWeightKg(+e.target.value)} />
      </Field>
      <Field label="Entry price (c/kg lwt) — locked">
        <input className="input" type="number" value={entryPrice} onChange={(e) => setEntryPrice(+e.target.value)} placeholder="enter real price" />
      </Field>
      <div className="flex items-end">
        <button className="btn-primary w-full" onClick={submit} disabled={busy}>
          {busy ? 'Saving…' : 'Save mob'}
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}

function Empty({ msg }: { msg: string }) {
  return (
    <div className="card mt-6 text-sm text-drover-sage">{msg}</div>
  );
}
