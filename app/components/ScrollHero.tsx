'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { withBase } from '@/lib/basePath';
import Logo from '@/components/Logo';

/**
 * Cinematic scroll-scrub hero (the "Apple product page" effect): as you scroll
 * forward, the video scrubs forward. The playhead is lerped toward the target
 * time (factor 0.22) so it glides instead of snapping.
 *
 * The source clip carries a faint centred watermark, so a permanent centred
 * overlay (animated logo + copy + vignette) sits over the video the entire time
 * to keep it covered.
 */
export default function ScrollHero({ ctaLabel = 'Get started' }: { ctaLabel?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // 200ms opacity fade-in on first mount.
    const t = requestAnimationFrame(() => setVisible(true));

    const container = containerRef.current;
    const video = videoRef.current;
    if (!container || !video) return () => cancelAnimationFrame(t);

    let target = 0; // target currentTime derived from scroll
    let raf = 0;

    const computeTarget = () => {
      const rect = container.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      const scrolled = Math.min(Math.max(-rect.top, 0), scrollable);
      const progress = scrollable > 0 ? scrolled / scrollable : 0;
      const duration = video.duration || 0;
      target = progress * duration;
    };

    const tick = () => {
      const duration = video.duration || 0;
      if (duration > 0) {
        // Lerp currentTime toward target with smoothing factor 0.22.
        const current = video.currentTime;
        const next = current + (target - current) * 0.22;
        if (Math.abs(next - current) > 0.001) {
          video.currentTime = next;
        }
      }
      raf = requestAnimationFrame(tick);
    };

    const onScroll = () => computeTarget();
    const onResize = () => computeTarget();

    // Paused on mount (no autoplay), start at frame 0.
    video.pause();
    video.currentTime = 0;

    computeTarget();
    raf = requestAnimationFrame(tick);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(t);
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative h-[300vh] w-full">
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-drover-ink">
        <video
          ref={videoRef}
          className="h-screen w-screen object-cover transition-opacity duration-200"
          style={{ opacity: visible ? 1 : 0 }}
          muted
          playsInline
          preload="auto"
          poster={withBase('/hero-poster.jpg')}
        >
          <source src={withBase('/hero.mp4')} type="video/mp4" />
        </video>

        {/* Vignette + centre darken — buries the faint centred watermark and
            lifts the text. */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(15,35,26,0.62) 0%, rgba(15,35,26,0.30) 38%, rgba(15,35,26,0.78) 100%)',
          }}
        />

        {/* Permanent centred lockup (always over the watermark). */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-drover-bone">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="animate-float"
          >
            <Logo size={72} withWordmark={false} />
          </motion.div>

          <motion.h1
            className="mt-6 text-5xl font-semibold tracking-tight drop-shadow-xl md:text-7xl"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            Drover
          </motion.h1>

          <motion.p
            className="mt-4 max-w-xl text-lg text-drover-bone/90 drop-shadow md:text-xl"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            Live margins across every stage of the Australian beef supply chain.
          </motion.p>

          <motion.div
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
          >
            <Link href="/login" className="btn-gold text-base">
              {ctaLabel}
              <span aria-hidden>→</span>
            </Link>
            <Link href="#stages" className="btn border border-drover-bone/40 text-drover-bone hover:bg-drover-bone/10">
              See how it works
            </Link>
          </motion.div>

          <motion.span
            className="mt-12 text-xs uppercase tracking-[0.3em] text-drover-bone/70"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.8, repeat: Infinity }}
          >
            Scroll
          </motion.span>
        </div>
      </div>
    </div>
  );
}
