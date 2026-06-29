'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { isSiteAdmin, isCompanyAdmin } from '@/lib/rbac';

const NAV = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/prices', label: 'Prices' },
  { href: '/dashboard/livestock', label: 'Livestock' },
  { href: '/dashboard/margins', label: 'Margins' },
];

/** Client-side route guard + shared dashboard chrome (sidebar + topbar). */
export default function DashboardChrome({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-drover-sage">
        Loading…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-drover-bone">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-drover-dust/60 bg-white p-6 md:flex">
        <Link href="/" className="text-xl font-semibold tracking-tight">
          Drover
        </Link>
        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
                  active ? 'bg-drover-paddock text-drover-bone' : 'text-drover-bark hover:bg-drover-dust/40'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          {isCompanyAdmin(profile) && (
            <Link
              href="/admin"
              className="mt-2 rounded-xl px-3 py-2 text-sm font-medium text-drover-grass hover:bg-drover-dust/40"
            >
              {isSiteAdmin(profile) ? 'Site Admin' : 'Company Admin'}
            </Link>
          )}
        </nav>
        <div className="mt-auto border-t border-drover-dust/60 pt-4 text-sm">
          <p className="truncate font-medium">{profile?.displayName || profile?.email}</p>
          <p className="text-xs capitalize text-drover-sage">{profile?.role.replace('_', ' ')}</p>
          <button onClick={() => signOut()} className="mt-3 text-xs text-drover-sage hover:text-drover-ink">
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 px-6 py-8 md:px-10">{children}</main>
    </div>
  );
}
