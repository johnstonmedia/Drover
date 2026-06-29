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
        // Drover palette — earthy, modern, minimal.
        drover: {
          ink: '#0d0f0c',
          bark: '#1a1d17',
          sage: '#7c8b6a',
          grass: '#4f6f3a',
          paddock: '#3a5226',
          bone: '#f4f3ee',
          dust: '#cfc9bd',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
