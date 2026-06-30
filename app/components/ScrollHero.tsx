'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { withBase } from '@/lib/basePath';
import Logo from '@/components/Logo';

/**
 * Cinematic scroll-scrub hero — Apple-style. Instead of seeking a <video>
 * (which stutters), we pre-decode a sequence of JPEG frames and paint the
 * right one onto a <canvas> as you scroll. Drawing an already-loaded image is
 * instant, so the scrub is glassy. The frame index is lerped (0.15) so it
 * glides, and the overlay fades/parallaxes from the same scroll progress so it
 * stays in sync with the footage.
 */
const FRAME_COUNT = 98;

function framePath(i: number): string {
  return withBase(`/hero-frames/f_${String(i + 1).padStart(3, '0')}.jpg`);
}

export default function ScrollHero({ ctaLabel = 'Get started' }: { ctaLabel?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const fade = requestAnimationFrame(() => setVisible(true));
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return () => cancelAnimationFrame(fade);
    const ctx = canvas.getContext('2d');
    if (!ctx) return () => cancelAnimationFrame(fade);

    // Preload all frames.
    const images: HTMLImageElement[] = [];
    const loaded: boolean[] = new Array(FRAME_COUNT).fill(false);
    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      img.src = framePath(i);
      img.onload = () => {
        loaded[i] = true;
        if (i === 0) drawFrame(0); // paint first frame ASAP
      };
      images[i] = img;
    }

    const setSize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
    };

    const nearestLoaded = (idx: number): number => {
      if (loaded[idx]) return idx;
      for (let d = 1; d < FRAME_COUNT; d++) {
        if (idx - d >= 0 && loaded[idx - d]) return idx - d;
        if (idx + d < FRAME_COUNT && loaded[idx + d]) return idx + d;
      }
      return -1;
    };

    const drawFrame = (idx: number) => {
      const use = nearestLoaded(idx);
      if (use < 0) return;
      const img = images[use];
      const cw = canvas.width;
      const ch = canvas.height;
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      if (!iw || !ih) return;
      const scale = Math.max(cw / iw, ch / ih); // object-cover
      const dw = iw * scale;
      const dh = ih * scale;
      ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
    };

    let cur = 0;
    let raf = 0;

    const progress = () => {
      const rect = container.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      const scrolled = Math.min(Math.max(-rect.top, 0), scrollable);
      return scrollable > 0 ? scrolled / scrollable : 0;
    };

    const tick = () => {
      const p = progress();
      const target = p * (FRAME_COUNT - 1);
      cur += (target - cur) * 0.15; // glide
      if (Math.abs(target - cur) < 0.01) cur = target;
      drawFrame(Math.round(cur));

      // Keep the overlay copy in sync — recede + fade as the footage advances.
      if (overlayRef.current) {
        overlayRef.current.style.opacity = String(Math.max(0, 1 - p * 1.5));
        overlayRef.current.style.transform = `translateY(${-p * 48}px)`;
      }
      raf = requestAnimationFrame(tick);
    };

    setSize();
    drawFrame(0);
    raf = requestAnimationFrame(tick);
    window.addEventListener('resize', setSize);

    return () => {
      cancelAnimationFrame(fade);
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', setSize);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative h-[300vh] w-full">
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-drover-ink">
        <canvas
          ref={canvasRef}
          className="h-screen w-screen transition-opacity duration-200"
          style={{ opacity: visible ? 1 : 0 }}
        />

        {/* Vignette — always on, buries the faint centred watermark. */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(15,35,26,0.60) 0%, rgba(15,35,26,0.28) 38%, rgba(15,35,26,0.78) 100%)',
          }}
        />

        {/* Centred lockup (covers watermark; fades/parallaxes with scroll). */}
        <div
          ref={overlayRef}
          className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-drover-bone"
        >
          <motion.div
            className="animate-float"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <Logo size={72} withWordmark={false} />
          </motion.div>

          <motion.h1
            className="mt-6 text-5xl font-semibold tracking-tight drop-shadow-xl md:text-7xl"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            Know your margin
            <br />
            <span className="text-drover-fern">before the cattle move.</span>
          </motion.h1>

          <motion.p
            className="mt-5 max-w-xl text-lg text-drover-bone/90 drop-shadow md:text-xl"
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
            <Link href="#tour" className="btn border border-drover-bone/40 text-drover-bone hover:bg-drover-bone/10">
              See how it works
            </Link>
          </motion.div>
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
