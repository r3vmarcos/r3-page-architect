import type { Config } from 'tailwindcss'

// === TAILWIND CONFIG | inicio ===
// Tailwind padrão (JIT) + paths
// === TAILWIND CONFIG | fim ===
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config
