'use client';

import { motion } from 'framer-motion';
import Logo from './Logo';

/** Full-screen branded loader shown while auth resolves / the app boots. */
export default function LoadingScreen({ label = 'Saddling up…' }: { label?: string }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-drover-bark to-drover-ink text-drover-bone"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Logo size={64} withWordmark={false} />
      <motion.p
        className="mt-6 text-sm uppercase tracking-[0.3em] text-drover-bone/60"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.6, repeat: Infinity }}
      >
        {label}
      </motion.p>
    </motion.div>
  );
}
