'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { isSiteAdmin, isCompanyAdmin } from '@/lib/rbac';
import Logo from '@/components/Logo';
import LoadingScreen from '@/components/LoadingScreen';

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
    return <LoadingScreen />;
  }

  return (
    <div className="flex min-h-screen bg-drover-bone">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-drover-dust/60 bg-white p-6 md:flex">
        <Link href="/" className="transition-transform hover:scale-[1.03]">
          <Logo size={28} loop={false} />
        </Link>
        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {NAV.map((item, i) => {
            const active = pathname === item.href;
            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * i, duration: 0.3 }}
              >
                <Link
                  href={item.href}
                  className={`block rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'bg-drover-paddock text-drover-bone shadow-sm'
                      : 'text-drover-bark hover:bg-drover-sand hover:translate-x-0.5'
                  }`}
                >
                  {item.label}
                </Link>
              </motion.div>
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

      <motion.main
        key={pathname}
        className="flex-1 px-6 py-8 md:px-10"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.main>
    </div>
  );
}
