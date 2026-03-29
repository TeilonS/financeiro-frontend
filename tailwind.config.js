/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['Syne', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        // Amber/gold — identidade premium, sem ser o "teal genérico de fintech"
        primary: {
          50:  '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#B45309', // botões — 4.9:1 contraste com branco ✓
          700: '#92400E', // hover
          800: '#78350F',
          900: '#451A03',
          950: '#1F0A01',
        },
        // Surface tokens para dark mode consistente
        surface: {
          900: '#09090B', // fundo base
          800: '#111113', // fundo principal
          700: '#18181B', // cards
          600: '#1F1F24', // cards elevados
          500: '#27272A', // bordas
          400: '#3F3F46', // bordas visíveis
          300: '#52525B', // texto sutil
          200: '#71717A', // texto muted
          100: '#A1A1AA', // texto secundário
          50:  '#D4D4D8', // texto terciário
        },
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],
      },
      letterSpacing: {
        widest: '0.2em',
      },
      boxShadow: {
        'glow-gold': '0 0 20px rgba(251,191,36,0.15)',
        'glow-sm':   '0 0 8px rgba(251,191,36,0.1)',
      },
    },
  },
  plugins: [],
}
