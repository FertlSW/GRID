import type { Config } from 'tailwindcss'

// Design-Tokens für Grid.legal.
// Minimalistisch, wenig Farbe, viele Grautöne — angelehnt an Apple/Framer.
const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
        // `mono` ist bewusst auf die gleiche Stack wie `sans` gemappt — der
        // User wollte alle Monospace-Akzente (Labels, Counts, Letter A-I)
        // durch die normale Sans ersetzen. So wirkt jede vorhandene
        // `font-mono`-Klasse als No-op und benutzt Inter.
        mono: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
      colors: {
        ink: {
          DEFAULT: '#0A0A0A',
          soft: '#1A1A1A',
        },
        paper: {
          DEFAULT: '#FFFFFF',
          soft: '#FAFAFA',
          muted: '#F4F4F5',
        },
        line: {
          DEFAULT: '#E5E5E5',
          soft: '#EFEFEF',
          strong: '#D4D4D4',
        },
        muted: {
          DEFAULT: '#737373',
          soft: '#A3A3A3',
        },
        accent: {
          DEFAULT: '#1E40AF',
          soft: '#EEF2FF',
        },
        state: {
          req: '#B91C1C',
          reqBg: '#FEF2F2',
          dep: '#B45309',
          depBg: '#FFFBEB',
          check: '#1E40AF',
          checkBg: '#EEF2FF',
          ok: '#15803D',
          okBg: '#F0FDF4',
        },
      },
      borderRadius: {
        card: '10px',
        chip: '999px',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(0,0,0,0.04)',
        lift: '0 4px 20px rgba(0,0,0,0.06)',
      },
      fontSize: {
        'xxs': ['11px', { lineHeight: '16px' }],
      },
      transitionTimingFunction: {
        gentle: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
}

export default config
