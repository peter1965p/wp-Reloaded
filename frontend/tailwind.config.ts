import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

export default {
  content: ['./app/**/*.{vue,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        pit: {
          bg:     '#080b10',
          dark:   '#0d1117',
          card:   '#111827',
          border: 'rgba(255,255,255,0.08)',
          blue:   '#3b82f6',
          'blue-h': '#2563eb',
          green:  '#22c55e',
          muted:  '#6b7280',
          text:   '#f3f4f6',
          sub:    '#9ca3af',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: { card: '8px' },
    },
  },
  plugins: [typography],
} satisfies Config
