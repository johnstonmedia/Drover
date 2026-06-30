import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Drover two-tone ag palette: Paddock Green + Bone Cream, with a
        // restrained Harvest Gold accent for interactive "impact".
        drover: {
          ink: '#0f231a', // deep green-black (primary text)
          bark: '#16301f', // dark green (dark sections)
          paddock: '#1f4029', // primary green
          grass: '#2f7d4f', // hover / lively green
          fern: '#54a373', // bright green accent
          sage: '#6f8068', // muted green-grey (secondary text)
          bone: '#f6f3ea', // cream (secondary tone)
          sand: '#ece5d6', // warm surface
          dust: '#ddd6c4', // borders
          gold: '#d8a23f', // accent — harvest gold
          glow: '#f0cd86', // soft gold glow
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'draw-in': {
          '0%': { strokeDashoffset: '1' },
          '100%': { strokeDashoffset: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pop-in': {
          '0%': { opacity: '0', transform: 'scale(0.96) translateY(8px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 2.5s linear infinite',
        'pop-in': 'pop-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
      },
    },
  },
  plugins: [],
};

export default config;
