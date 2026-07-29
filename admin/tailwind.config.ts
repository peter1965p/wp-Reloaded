import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

export default {
  content: [
    './app/**/*.{vue,ts,tsx}',
    './components/**/*.{vue,ts}',
    './pages/**/*.vue',
    './layouts/**/*.vue',
  ],
  theme: {
    extend: {
      colors: {
        pit: {
          bg:      '#05070a',
          dark:    '#0d1117',
          card:    '#161b22',
          slate:   '#1e293b',
          blue:    '#3b82f6',
          'blue-h':'#2563eb',
          'blue-l':'#93c5fd',
          green:   '#22c55e',
          red:     '#ef4444',
          muted:   '#64748b',
          text:    '#e5e7eb',
          border:  'rgba(255,255,255,0.10)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'Consolas', 'monospace'],
      },
      borderRadius: {
        card: '6px',
      },
    },
  },
  plugins: [typography],
} satisfies Config
