import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        space: '#030303',
        surface: 'rgba(255,255,255,0.04)',
        'neon-cyan': '#00f2fe',
        'neon-purple': '#4facfe',
        'neon-pink': '#ff6b6b',
        'neon-green': '#00ff87',
        'neon-yellow': '#ffd93d',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backdropBlur: {
        glass: '16px',
      },
    },
  },
  plugins: [],
}
export default config
