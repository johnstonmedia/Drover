'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { withBase } from '@/lib/basePath';
import Logo from '@/components/Logo';
import DashboardPreview from '@/components/DashboardPreview';

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
      // Only issue a new seek once the previous one has settled (!seeking).
      // Firing seeks every frame makes the decoder thrash — that's the jank.
      if (duration > 0 && !video.seeking) {
        // Lerp currentTime toward target with smoothing factor 0.22.
        const current = video.currentTime;
        const next = current + (target - current) * 0.22;
        if (Math.abs(target - current) > 0.01) {
          video.currentTime = Math.min(duration - 0.05, Math.max(0, next));
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

        {/* Overlay sits over the video the entire scroll — left lockup keeps
            the centred watermark covered, right shows the live dashboard. */}
        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto grid w-full max-w-7xl items-center gap-10 px-6 md:grid-cols-2">
            {/* Left: brand + copy + CTA */}
            <div className="text-center text-drover-bone md:text-left">
              <motion.div
                className="flex justify-center md:justify-start"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              >
                <Logo size={60} withWordmark={false} className="animate-float" />
              </motion.div>

              <motion.h1
                className="mt-5 text-5xl font-semibold tracking-tight drop-shadow-xl md:text-6xl"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.15 }}
              >
                Know your margin
                <br />
                <span className="text-drover-fern">before the cattle move.</span>
              </motion.h1>

              <motion.p
                className="mx-auto mt-5 max-w-md text-lg text-drover-bone/90 drop-shadow md:mx-0"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
              >
                Live margins across every stage of the Australian beef supply chain.
              </motion.p>

              <motion.div
                className="mt-8 flex flex-wrap items-center justify-center gap-3 md:justify-start"
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
            </div>

            {/* Right: live dashboard preview with the cursor reveal */}
            <div className="hidden md:block">
              <DashboardPreview />
            </div>
          </div>
        </div>

        <motion.span
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs uppercase tracking-[0.3em] text-drover-bone/70"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity }}
        >
          Scroll
        </motion.span>
      </div>
    </div>
  );
}
