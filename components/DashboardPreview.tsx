'use client';

import { motion } from 'framer-motion';
import Logo from './Logo';

/**
 * Animated "taste of the dashboard": a mock margins panel where a cursor glides
 * in, clicks the AI button, and a brief reveals — on a loop.
 */
export default function DashboardPreview() {
  return (
    <motion.div
      className="relative mx-auto w-full max-w-md"
      initial={{ opacity: 0, scale: 0.94, y: 20 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="rounded-3xl border border-white/10 bg-drover-bone/95 p-5 shadow-2xl shadow-black/40 backdrop-blur">
        <div className="flex items-center justify-between">
          <Logo size={22} withWordmark={false} animated={false} />
          <span className="text-sm font-medium text-drover-ink">Margins</span>
          <span className="text-xs text-drover-sage">400 head</span>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            { l: 'Margin/hd', v: '$184' },
            { l: 'Total', v: '$73.6k' },
            { l: 'On cost', v: '14.2%' },
          ].map((s, i) => (
            <motion.div
              key={s.l}
              className="rounded-xl bg-white p-3"
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + i * 0.12 }}
            >
              <div className="text-[10px] uppercase tracking-wide text-drover-sage">{s.l}</div>
              <div className="mt-1 text-lg font-semibold tabular-nums text-drover-ink">{s.v}</div>
            </motion.div>
          ))}
        </div>

        <div className="mt-4 space-y-2">
          {[
            { l: 'Post breeding', w: '40%' },
            { l: 'Backgrounding', w: '62%' },
            { l: 'Feedlot', w: '85%' },
            { l: 'Processing', w: '70%' },
          ].map((b, i) => (
            <div key={b.l} className="flex items-center gap-3">
              <span className="w-24 text-[11px] text-drover-bark/70">{b.l}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-drover-sand">
                <motion.div
                  className="h-full rounded-full bg-drover-grass"
                  initial={{ width: 0 }}
                  whileInView={{ width: b.w }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9, delay: 0.5 + i * 0.12, ease: 'easeOut' }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="relative mt-5">
          <motion.button
            className="w-full rounded-xl bg-drover-paddock py-2.5 text-sm font-medium text-drover-bone"
            animate={{
              scale: [1, 1, 0.95, 1, 1],
              filter: ['brightness(1)', 'brightness(1)', 'brightness(1.25)', 'brightness(1)', 'brightness(1)'],
            }}
            transition={{ duration: 5, times: [0, 0.42, 0.5, 0.58, 1], repeat: Infinity }}
          >
            Generate AI brief
          </motion.button>

          <motion.div
            className="absolute left-0 right-0 top-full mt-3 rounded-xl border border-drover-fern/30 bg-white p-3 text-left text-[11px] leading-relaxed text-drover-bark shadow-lg"
            animate={{ opacity: [0, 0, 0, 1, 1, 0], y: [10, 10, 10, 0, 0, 10] }}
            transition={{ duration: 5, times: [0, 0.5, 0.55, 0.64, 0.92, 1], repeat: Infinity }}
          >
            <span className="font-semibold text-drover-paddock">Drover advisor:</span> Feedlot is
            your strongest stage at $96/head. Direct export trims freight but forgoes the
            finishing margin.
          </motion.div>
        </div>
      </div>

      {/* Animated cursor */}
      <motion.div
        className="pointer-events-none absolute z-10"
        initial={{ x: 60, y: 40 }}
        animate={{ x: [60, 60, 150, 150, 150, 60], y: [40, 40, 250, 250, 250, 40] }}
        transition={{ duration: 5, times: [0, 0.25, 0.46, 0.5, 0.8, 1], repeat: Infinity, ease: 'easeInOut' }}
      >
        <motion.span
          className="absolute -left-1 -top-1 block h-7 w-7 rounded-full bg-drover-gold/40"
          animate={{ scale: [0, 0, 0, 1.6, 0, 0], opacity: [0, 0, 0.6, 0, 0, 0] }}
          transition={{ duration: 5, times: [0, 0.48, 0.5, 0.56, 0.6, 1], repeat: Infinity }}
        />
        <svg width="22" height="22" viewBox="0 0 24 24" className="drop-shadow">
          <path d="M4 2 L4 20 L9 15 L12 22 L15 21 L12 14 L19 14 Z" className="fill-drover-ink stroke-white" strokeWidth="1.2" />
        </svg>
      </motion.div>
    </motion.div>
  );
}
