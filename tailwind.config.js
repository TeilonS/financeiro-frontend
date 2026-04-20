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
        // Coral/Red — identidade vibrante e moderna
        primary: {
          50:  '#FFF5F5',
          100: '#FED7D7',
          200: '#FEB2B2',
          300: '#FC8181',
          400: '#F56565',
          500: '#EF4444', // base
          600: '#E53E3E', // botões
          700: '#C53030', // hover
          800: '#9B2C2C',
          900: '#742A2A',
          950: '#1A0505',
        },
        // Surface tokens para dark mode profundo (Deep Black)
        surface: {
          950: '#050505', // fundo absoluto
          900: '#0A0A0A', // fundo base
          800: '#111111', // fundo principal
          700: '#171717', // cards
          600: '#1F1F1F', // cards elevados
          500: '#262626', // bordas
          400: '#404040', // bordas visíveis
          300: '#525252', // texto sutil
          200: '#737373', // texto muted
          100: '#A3A3A3', // texto secundário
          50:  '#E5E5E5', // texto terciário
        },
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],
      },
      letterSpacing: {
        widest: '0.2em',
      },
      boxShadow: {
        'glow-coral': '0 0 20px rgba(239,68,68,0.15)',
        'glow-sm':    '0 0 8px rgba(239,68,68,0.1)',
      },
    },
  },
  plugins: [],
}
