'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Logo from './Logo';
import { withBase } from '@/lib/basePath';

/**
 * Code-driven cinematic hero — no video file required. Shows the animated logo,
 * headline + CTA, and a live dashboard "preview" where a cursor glides to a
 * button, clicks, and reveals an AI brief. If a real clip exists at
 * /public/hero-clip.mp4 it layers in faintly behind everything.
 */
export default function AnimatedHero({ ctaLabel = 'Get started' }: { ctaLabel?: string }) {
  const [hasVideo, setHasVideo] = useState(true);

  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-gradient-to-b from-drover-bark via-drover-paddock to-drover-ink">
      {/* Optional real footage, faint, behind everything */}
      {hasVideo && (
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-20"
          autoPlay
          muted
          loop
          playsInline
          onError={() => setHasVideo(false)}
        >
          <source src={withBase('/hero-clip.mp4')} type="video/mp4" />
        </video>
      )}
      {/* Soft animated gradient orbs */}
      <div className="pointer-events-none absolute -left-24 top-1/4 h-96 w-96 rounded-full bg-drover-fern/20 blur-3xl animate-float" />
      <div className="pointer-events-none absolute -right-16 bottom-10 h-80 w-80 rounded-full bg-drover-gold/10 blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 px-6 py-24 md:grid-cols-2">
        {/* Left: brand + copy + CTA */}
        <div className="text-drover-bone">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Logo size={56} wordmarkClassName="text-3xl text-drover-bone" />
          </motion.div>

          <motion.h1
            className="mt-8 text-5xl font-semibold leading-[1.05] tracking-tight md:text-6xl"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            Know your margin
            <br />
            <span className="text-drover-fern">before the cattle move.</span>
          </motion.h1>

          <motion.p
            className="mt-6 max-w-md text-lg text-drover-bone/80"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            Live prices and trade margins across every stage of the Australian
            beef supply chain — post-breeding to processing and export.
          </motion.p>

          <motion.div
            className="mt-9 flex flex-wrap gap-3"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
          >
            <Link href="/login" className="btn-gold text-base">
              {ctaLabel}
              <span aria-hidden>→</span>
            </Link>
            <Link href="#stages" className="btn border border-drover-bone/30 text-drover-bone hover:bg-drover-bone/10">
              See how it works
            </Link>
          </motion.div>
        </div>

        {/* Right: dashboard preview with cursor reveal */}
        <DashboardPreview />
      </div>

      {/* Scroll cue */}
      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs uppercase tracking-widest text-drover-bone/60"
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 1.8, repeat: Infinity }}
      >
        Scroll
      </motion.div>
    </section>
  );
}

function DashboardPreview() {
  return (
    <motion.div
      className="relative mx-auto w-full max-w-md"
      initial={{ opacity: 0, scale: 0.94, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Floating card */}
      <div className="rounded-3xl border border-white/10 bg-drover-bone/95 p-5 shadow-2xl shadow-black/40 backdrop-blur">
        <div className="flex items-center justify-between">
          <Logo size={22} withWordmark={false} animated={false} />
          <span className="text-sm font-medium text-drover-ink">Margins</span>
          <span className="text-xs text-drover-sage">400 head</span>
        </div>

        {/* Stat tiles */}
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
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + i * 0.12 }}
            >
              <div className="text-[10px] uppercase tracking-wide text-drover-sage">{s.l}</div>
              <div className="mt-1 text-lg font-semibold tabular-nums text-drover-ink">{s.v}</div>
            </motion.div>
          ))}
        </div>

        {/* Stage bars */}
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
                  animate={{ width: b.w }}
                  transition={{ duration: 0.9, delay: 1.2 + i * 0.12, ease: 'easeOut' }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Click target: AI button */}
        <div className="relative mt-5">
          <motion.button
            className="w-full rounded-xl bg-drover-paddock py-2.5 text-sm font-medium text-drover-bone"
            animate={{ scale: [1, 1, 0.95, 1, 1], filter: ['brightness(1)', 'brightness(1)', 'brightness(1.25)', 'brightness(1)', 'brightness(1)'] }}
            transition={{ duration: 5, times: [0, 0.42, 0.5, 0.58, 1], repeat: Infinity }}
          >
            Generate AI brief
          </motion.button>

          {/* Revealed AI bubble — appears right after the "click" */}
          <motion.div
            className="absolute left-0 right-0 top-full mt-3 rounded-xl border border-drover-fern/30 bg-white p-3 text-left text-[11px] leading-relaxed text-drover-bark shadow-lg"
            animate={{ opacity: [0, 0, 0, 1, 1, 0], y: [10, 10, 10, 0, 0, 10] }}
            transition={{ duration: 5, times: [0, 0.5, 0.55, 0.64, 0.92, 1], repeat: Infinity }}
          >
            <span className="font-semibold text-drover-paddock">Drover advisor:</span> Feedlot
            is your strongest stage at $96/head. Direct export trims freight but
            forgoes the finishing margin.
          </motion.div>
        </div>
      </div>

      {/* Animated cursor */}
      <motion.div
        className="pointer-events-none absolute z-10"
        initial={{ x: 60, y: 40 }}
        animate={{
          x: [60, 60, 150, 150, 150, 60],
          y: [40, 40, 250, 250, 250, 40],
        }}
        transition={{ duration: 5, times: [0, 0.25, 0.46, 0.5, 0.8, 1], repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* click ripple */}
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
