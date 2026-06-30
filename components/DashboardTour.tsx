'use client';

import { useRef, useState } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
import Logo from './Logo';

/**
 * Scroll-driven product tour. As you scroll through a tall section, a sticky
 * mock of the app stays in view while a cursor walks the real workflow and the
 * content steps through scenes — all driven by one scroll-progress value, so it
 * stays perfectly in sync (no video, so it's buttery).
 */
const SCENES = [
  { eyebrow: '01 · Livestock', title: 'Lock in a mob at its buy price.' },
  { eyebrow: '02 · Prices', title: 'Watch live prices move, stage by stage.' },
  { eyebrow: '03 · Margins', title: 'See the margin build to processing.' },
  { eyebrow: '04 · Advisor', title: 'Get a plain-English verdict — and export it.' },
];

export default function DashboardTour() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const [scene, setScene] = useState(0);

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    setScene(v < 0.28 ? 0 : v < 0.52 ? 1 : v < 0.78 ? 2 : 3);
  });

  // Cursor glides across keyframes (percent of the mock card).
  const cx = useTransform(scrollYProgress, [0, 0.2, 0.4, 0.6, 0.8, 1], ['16%', '58%', '12%', '66%', '12%', '52%']);
  const cy = useTransform(scrollYProgress, [0, 0.2, 0.4, 0.6, 0.8, 1], ['34%', '72%', '46%', '40%', '60%', '86%']);

  const navActive = scene === 0 ? 'Livestock' : scene === 1 ? 'Prices' : 'Margins';

  return (
    <section id="tour" ref={ref} className="relative h-[420vh] bg-drover-bark">
      <div className="sticky top-0 flex h-screen flex-col items-center justify-center gap-8 px-6">
        {/* Heading swaps per scene */}
        <div className="h-20 text-center text-drover-bone">
          <motion.div key={scene} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <p className="text-sm font-semibold uppercase tracking-widest text-drover-gold">{SCENES[scene].eyebrow}</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-4xl">{SCENES[scene].title}</h2>
          </motion.div>
        </div>

        {/* Mock app */}
        <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-white shadow-2xl shadow-black/50">
          {/* Browser bar */}
          <div className="flex items-center gap-2 border-b border-drover-dust/70 bg-drover-sand/60 px-4 py-2.5">
            <span className="h-3 w-3 rounded-full bg-red-400/70" />
            <span className="h-3 w-3 rounded-full bg-amber-400/70" />
            <span className="h-3 w-3 rounded-full bg-green-400/70" />
            <span className="ml-3 rounded-md bg-white px-3 py-1 text-xs text-drover-sage">app.drover.com/dashboard</span>
          </div>

          <div className="flex h-[440px]">
            {/* Sidebar */}
            <div className="hidden w-44 shrink-0 border-r border-drover-dust/60 p-3 sm:block">
              <Logo size={22} loop={false} />
              <div className="mt-5 space-y-1">
                {['Overview', 'Prices', 'Livestock', 'Margins'].map((n) => (
                  <div
                    key={n}
                    className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                      n === navActive ? 'bg-drover-paddock font-medium text-drover-bone' : 'text-drover-bark/70'
                    }`}
                  >
                    {n}
                  </div>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="relative flex-1 overflow-hidden p-5">
              <motion.div key={scene} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="h-full">
                {scene === 0 && <SceneLivestock />}
                {scene === 1 && <ScenePrices />}
                {scene === 2 && <SceneMargins />}
                {scene === 3 && <SceneAdvisor />}
              </motion.div>
            </div>
          </div>

          {/* Cursor */}
          <motion.div style={{ left: cx, top: cy }} className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2">
            <motion.span
              key={scene}
              className="absolute -left-2 -top-2 block h-8 w-8 rounded-full bg-drover-gold/40"
              initial={{ scale: 0, opacity: 0.7 }}
              animate={{ scale: 1.8, opacity: 0 }}
              transition={{ duration: 0.6 }}
            />
            <svg width="24" height="24" viewBox="0 0 24 24" className="drop-shadow-lg">
              <path d="M4 2 L4 20 L9 15 L12 22 L15 21 L12 14 L19 14 Z" className="fill-drover-ink stroke-white" strokeWidth="1.3" />
            </svg>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Field({ label, value, fill = false }: { label: string; value: string; fill?: boolean }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-drover-sage">{label}</div>
      <div className="mt-1 rounded-lg border border-drover-dust bg-white px-3 py-2 text-sm text-drover-ink">
        {fill ? (
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            {value}
          </motion.span>
        ) : (
          value
        )}
      </div>
    </div>
  );
}

function SceneLivestock() {
  return (
    <div>
      <h3 className="text-sm font-semibold text-drover-ink">New mob</h3>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <Field label="Mob name" value="Northern weaners 2026" fill />
        <Field label="Head" value="400" fill />
        <Field label="Entry stage" value="Post breeding" />
        <Field label="Entry price (c/kg lwt)" value="365" fill />
      </div>
      <button className="mt-4 rounded-lg bg-drover-paddock px-4 py-2 text-sm font-medium text-drover-bone">Save mob</button>
    </div>
  );
}

function ScenePrices() {
  const rows = [
    { s: 'Post breeding', v: '365', c: '+2.1%', up: true },
    { s: 'Backgrounding', v: '372', c: '-0.8%', up: false },
    { s: 'Feedlot', v: '418', c: '+1.4%', up: true },
    { s: 'Processing (cwt)', v: 'c 720', c: '+0.6%', up: true },
  ];
  return (
    <div>
      <h3 className="text-sm font-semibold text-drover-ink">Live prices</h3>
      <div className="mt-3 overflow-hidden rounded-lg border border-drover-dust">
        {rows.map((r, i) => (
          <motion.div
            key={r.s}
            className="flex items-center justify-between border-b border-drover-dust/60 px-3 py-2 text-sm last:border-0"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.08 }}
          >
            <span className="text-drover-bark/80">{r.s}</span>
            <span className="flex items-center gap-3 tabular-nums">
              <span className="text-drover-ink">{r.v}</span>
              <span className={r.up ? 'text-green-600' : 'text-red-600'}>{r.up ? '▲' : '▼'} {r.c}</span>
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function SceneMargins() {
  const bars = [
    { l: 'Post breeding', w: '38%', v: '$0' },
    { l: 'Backgrounding', w: '58%', v: '+$42' },
    { l: 'Feedlot', w: '88%', v: '+$96' },
    { l: 'Processing', w: '72%', v: '+$46' },
  ];
  return (
    <div>
      <h3 className="text-sm font-semibold text-drover-ink">Margin by stage (per head)</h3>
      <div className="mt-4 space-y-3">
        {bars.map((b, i) => (
          <div key={b.l} className="flex items-center gap-3">
            <span className="w-28 text-xs text-drover-bark/70">{b.l}</span>
            <div className="h-3 flex-1 overflow-hidden rounded-full bg-drover-sand">
              <motion.div className="h-full rounded-full bg-drover-grass" initial={{ width: 0 }} animate={{ width: b.w }} transition={{ duration: 0.7, delay: 0.1 + i * 0.1 }} />
            </div>
            <span className="w-12 text-right text-xs font-medium tabular-nums text-drover-ink">{b.v}</span>
          </div>
        ))}
      </div>
      <button className="mt-5 rounded-lg bg-drover-paddock px-4 py-2 text-sm font-medium text-drover-bone">Generate AI brief</button>
    </div>
  );
}

function SceneAdvisor() {
  return (
    <div>
      <h3 className="text-sm font-semibold text-drover-ink">Advisor brief</h3>
      <motion.div
        className="mt-3 rounded-xl border border-drover-fern/40 bg-drover-bone/60 p-4 text-sm leading-relaxed text-drover-bark"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <span className="font-semibold text-drover-paddock">Drover advisor:</span> This route is
        profitable at <span className="font-medium">$184/head</span> across 400 head ($73.6k).
        Feedlot is your strongest stage (+$96/head); backgrounding is thin. Trucking south beats
        live export here by ~$23/head once freight is in.
      </motion.div>
      <div className="mt-4 flex gap-2">
        <button className="rounded-lg bg-drover-gold px-4 py-2 text-sm font-medium text-drover-ink">Export Excel</button>
        <button className="rounded-lg border border-drover-dust px-4 py-2 text-sm text-drover-bark">Email summary</button>
      </div>
    </div>
  );
}
