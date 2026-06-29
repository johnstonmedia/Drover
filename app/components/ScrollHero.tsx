'use client';

import { useEffect, useRef, useState } from 'react';
import { withBase } from '@/lib/basePath';

/**
 * Cinematic scroll-scrub hero (the "Apple product page" effect): as you scroll
 * forward, the video scrubs forward. The playhead is lerped toward the target
 * time so it glides instead of snapping.
 *
 * Drop your generated video at /public/hero.mp4 (see public/README-hero.md).
 */
export default function ScrollHero() {
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
      // Progress 0 → 1 across the scrollable height of the container.
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
        // Avoid micro-seeks that cause stutter.
        if (Math.abs(next - current) > 0.001) {
          video.currentTime = next;
        }
      }
      raf = requestAnimationFrame(tick);
    };

    const onScroll = () => computeTarget();
    const onResize = () => computeTarget();

    // Ensure the video is paused on mount (no autoplay) and starts at 0.
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

        {/* Overlay copy — sits above the scrubbing video */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-black/30 via-transparent to-black/60 text-center text-drover-bone">
          <h1 className="px-6 text-5xl font-semibold tracking-tight drop-shadow-lg md:text-7xl">
            Drover
          </h1>
          <p className="mt-4 max-w-xl px-6 text-lg text-drover-bone/90 drop-shadow md:text-xl">
            Live margins across every stage of the Australian beef supply chain.
          </p>
          <span className="mt-10 animate-bounce text-sm uppercase tracking-widest text-drover-bone/70">
            Scroll
          </span>
        </div>
      </div>
    </div>
  );
}
