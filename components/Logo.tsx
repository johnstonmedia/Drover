'use client';

import { motion } from 'framer-motion';

/**
 * Drover logo: a "drove path" mark — an arc representing the supply-chain
 * journey with a head moving along it — beside the wordmark. When `animated`,
 * the arc draws itself in and a dot travels the route (the herd being droved).
 */
export default function Logo({
  size = 32,
  withWordmark = true,
  animated = true,
  loop = true,
  className = '',
  wordmarkClassName = '',
}: {
  size?: number;
  withWordmark?: boolean;
  animated?: boolean;
  /** Whether the "herd" dot keeps droving along the route on a loop. */
  loop?: boolean;
  className?: string;
  wordmarkClassName?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        aria-label="Drover"
        className="shrink-0"
      >
        {/* Rounded badge */}
        <motion.rect
          x="2"
          y="2"
          width="44"
          height="44"
          rx="13"
          className="fill-drover-paddock"
          initial={animated ? { scale: 0.8, opacity: 0 } : false}
          animate={animated ? { scale: 1, opacity: 1 } : undefined}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        />
        {/* The drove path (route through the supply chain) */}
        <motion.path
          d="M12 30 C 18 14, 30 14, 36 30"
          stroke="#f6f3ea"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          pathLength={1}
          initial={animated ? { pathLength: 0 } : false}
          animate={animated ? { pathLength: 1 } : undefined}
          transition={{ duration: 1.1, ease: 'easeInOut', delay: 0.2 }}
        />
        {/* Three stage markers along the route */}
        {[
          { cx: 12, cy: 30 },
          { cx: 24, cy: 18.5 },
          { cx: 36, cy: 30 },
        ].map((p, i) => (
          <motion.circle
            key={i}
            cx={p.cx}
            cy={p.cy}
            r="2.4"
            className="fill-drover-gold"
            initial={animated ? { scale: 0, opacity: 0 } : false}
            animate={animated ? { scale: 1, opacity: 1 } : undefined}
            transition={{ duration: 0.3, delay: 0.6 + i * 0.18 }}
          />
        ))}
        {/* The herd: a dot droving along the route */}
        {animated && loop && (
          <motion.circle
            r="3"
            className="fill-drover-fern"
            animate={{ cx: [12, 24, 36], cy: [30, 18.5, 30] }}
            transition={{ duration: 2.2, ease: 'easeInOut', delay: 1.2, repeat: Infinity, repeatDelay: 1.4 }}
          />
        )}
      </svg>
      {withWordmark && (
        <span className={`text-xl font-semibold tracking-tight ${wordmarkClassName}`}>
          Drover
        </span>
      )}
    </span>
  );
}
