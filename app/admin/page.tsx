'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { isCompanyAdmin, isSiteAdmin, ALL_PERMISSIONS, PERMISSION_LABELS } from '@/lib/rbac';
import {
  createCompany,
  listAllCompanies,
  listAllUsers,
  listCompanyUsers,
  updateUserProfile,
} from '@/lib/firestore';
import type { Company, Permission, Role, UserProfile } from '@/lib/types';

export default function AdminPage() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace('/login');
    else if (!isCompanyAdmin(profile)) router.replace('/dashboard');
  }, [user, profile, loading, router]);

  if (loading || !profile || !isCompanyAdmin(profile)) {
    return <div className="flex min-h-screen items-center justify-center text-drover-sage">Loading…</div>;
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {isSiteAdmin(profile) ? 'Site Admin' : 'Company Admin'}
          </h1>
          <p className="mt-1 text-sm text-drover-sage">drover.app/admin</p>
        </div>
        <Link href="/dashboard" className="btn-ghost">Back to dashboard</Link>
      </div>

      {!profile.companyId && !isSiteAdmin(profile) && (
        <CreateCompany ownerUid={profile.uid} onCreated={refreshProfile} />
      )}

      {profile.companyId && (
        <CompanyUsers companyId={profile.companyId} canSetCompanyAdmin={isCompanyAdmin(profile)} />
      )}

      {isSiteAdmin(profile) && <SiteAdminPanel />}
    </div>
  );
}

function CreateCompany({ ownerUid, onCreated }: { ownerUid: string; onCreated: () => void }) {
  const { profile } = useAuth();
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!name.trim()) return;
    setBusy(true);
    try {
      const id = await createCompany({ name: name.trim(), ownerUid });
      // Promote creator to company admin and link them.
      await updateUserProfile(ownerUid, { companyId: id, role: 'company_admin' as Role });
      onCreated();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card mt-8">
      <h2 className="text-lg font-medium">Create your company</h2>
      <p className="mt-1 text-sm text-drover-sage">
        You&apos;ll become the company admin and can invite users.
      </p>
      <div className="mt-4 flex gap-3">
        <input className="input" value={name} onChange={(e) => setName(e.target.value)}
          placeholder="Company / station name" />
        <button className="btn-primary" onClick={submit} disabled={busy || !!profile?.companyId}>
          {busy ? 'Creating…' : 'Create'}
        </button>
      </div>
    </div>
  );
}

function CompanyUsers({ companyId, canSetCompanyAdmin }: { companyId: string; canSetCompanyAdmin: boolean }) {
  const [users, setUsers] = useState<UserProfile[]>([]);

  async function reload() {
    setUsers(await listCompanyUsers(companyId));
  }
  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  async function togglePermission(u: UserProfile, p: Permission) {
    const has = u.permissions.includes(p);
    const next = has ? u.permissions.filter((x) => x !== p) : [...u.permissions, p];
    await updateUserProfile(u.uid, { permissions: next });
    reload();
  }

  async function setRole(u: UserProfile, role: Role) {
    await updateUserProfile(u.uid, { role });
    reload();
  }

  return (
    <div className="card mt-8">
      <h2 className="text-lg font-medium">Company users</h2>
      <p className="mt-1 text-sm text-drover-sage">Toggle fine-grained access per user.</p>
      <div className="mt-4 space-y-4">
        {users.length === 0 && <p className="text-sm text-drover-sage">No users linked yet.</p>}
        {users.map((u) => (
          <div key={u.uid} className="rounded-xl border border-drover-dust/60 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{u.displayName || u.email}</p>
                <p className="text-xs capitalize text-drover-sage">{u.role.replace('_', ' ')}</p>
              </div>
              {canSetCompanyAdmin && u.role !== 'site_admin' && (
                <select className="input max-w-[10rem]" value={u.role}
                  onChange={(e) => setRole(u, e.target.value as Role)}>
                  <option value="member">Member</option>
                  <option value="company_admin">Company admin</option>
                </select>
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {ALL_PERMISSIONS.map((p) => {
                const has = u.permissions.includes(p);
                return (
                  <button key={p} onClick={() => togglePermission(u, p)}
                    className={`rounded-full px-3 py-1 text-xs ${
                      has ? 'bg-drover-paddock text-drover-bone' : 'bg-drover-dust/40 text-drover-bark'
                    }`}>
                    {PERMISSION_LABELS[p]}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SiteAdminPanel() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);

  async function reload() {
    setCompanies(await listAllCompanies());
    setUsers(await listAllUsers());
  }
  useEffect(() => {
    reload();
  }, []);

  async function assign(u: UserProfile, companyId: string) {
    await updateUserProfile(u.uid, { companyId: companyId || null });
    reload();
  }
  async function setRole(u: UserProfile, role: Role) {
    await updateUserProfile(u.uid, { role });
    reload();
  }

  return (
    <div className="card mt-8">
      <h2 className="text-lg font-medium">All users (site admin)</h2>
      <p className="mt-1 text-sm text-drover-sage">
        {companies.length} companies · {users.length} users
      </p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-wide text-drover-sage">
            <tr>
              <th className="py-2 pr-4">User</th>
              <th className="py-2 pr-4">Company</th>
              <th className="py-2 pr-4">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.uid} className="border-t border-drover-dust/40">
                <td className="py-2 pr-4">{u.displayName || u.email}</td>
                <td className="py-2 pr-4">
                  <select className="input !py-1" value={u.companyId ?? ''} onChange={(e) => assign(u, e.target.value)}>
                    <option value="">— none —</option>
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </td>
                <td className="py-2 pr-4">
                  <select className="input !py-1" value={u.role} onChange={(e) => setRole(u, e.target.value as Role)}>
                    <option value="member">Member</option>
                    <option value="company_admin">Company admin</option>
                    <option value="site_admin">Site admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
