import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        coal: '#2E3440',
        graphite: '#3B4252',
        smoke: '#434C5E',
        mist: '#4C566A',
        fog: '#D8DEE9',
        chalk: '#ECEFF4',
        frost: '#88C0D0',
        glow: '#81A1C1',
        warning: '#EBCB8B',
        success: '#A3BE8C',
        danger: '#BF616A',
      },
      boxShadow: {
        radar: '0 0 0 1px rgba(129, 161, 193, 0.24), 0 18px 48px rgba(46, 52, 64, 0.42)',
      },
      backgroundImage: {
        'dashboard-grid': 'radial-gradient(circle at top, rgba(136,192,208,0.14), transparent 34%), linear-gradient(rgba(216,222,233,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(216,222,233,0.05) 1px, transparent 1px)',
      },
      backgroundSize: {
        'dashboard-grid': 'auto, 24px 24px, 24px 24px',
      },
      fontFamily: {
        sans: ['"Avenir Next"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['"Bebas Neue"', '"Avenir Next Condensed"', 'Impact', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
