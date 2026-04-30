import type { Config } from 'tailwindcss';

/**
 * Mazy v2 Tailwind config.
 *
 * All colors resolve from CSS variables in app/globals.css — single source of truth.
 * Tailwind classes used in components: bg-paper, bg-cream-50, bg-brand-100,
 * text-ink-900, bg-info-bg, text-success-fg, etc.
 */
const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        paper:    'rgb(var(--color-paper) / <alpha-value>)',
        'cream-50': 'rgb(var(--color-cream-50) / <alpha-value>)',
        brand: {
          50:  'rgb(var(--color-brand-50) / <alpha-value>)',
          100: 'rgb(var(--color-brand-100) / <alpha-value>)',
          300: 'rgb(var(--color-brand-300) / <alpha-value>)',
          500: 'rgb(var(--color-brand-500) / <alpha-value>)',
        },
        ink: {
          900: 'rgb(var(--color-ink-900) / <alpha-value>)',
          700: 'rgb(var(--color-ink-700) / <alpha-value>)',
          500: 'rgb(var(--color-ink-500) / <alpha-value>)',
          300: 'rgb(var(--color-ink-300) / <alpha-value>)',
        },
        info:    { bg: 'rgb(var(--color-info-bg))',    fg: 'rgb(var(--color-info-fg))' },
        success: { bg: 'rgb(var(--color-success-bg))', fg: 'rgb(var(--color-success-fg))' },
        error:   { bg: 'rgb(var(--color-error-bg))',   fg: 'rgb(var(--color-error-fg))' },
        heat:    { bg: 'rgb(var(--color-heat-bg))',    fg: 'rgb(var(--color-heat-fg))' },
        pastel: {
          'peach-bg': 'rgb(var(--color-pastel-peach-bg) / <alpha-value>)',
          'peach-fg': 'rgb(var(--color-pastel-peach-fg) / <alpha-value>)',
          'cream-bg': 'rgb(var(--color-pastel-cream-bg) / <alpha-value>)',
          'cream-fg': 'rgb(var(--color-pastel-cream-fg) / <alpha-value>)',
          'sky-bg':   'rgb(var(--color-pastel-sky-bg) / <alpha-value>)',
          'sky-fg':   'rgb(var(--color-pastel-sky-fg) / <alpha-value>)',
          'mint-bg':  'rgb(var(--color-pastel-mint-bg) / <alpha-value>)',
          'mint-fg':  'rgb(var(--color-pastel-mint-fg) / <alpha-value>)',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        body:    ['var(--font-display)', 'system-ui', 'sans-serif'],
        mono:    ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        // Hi-fi uses generously rounded corners (Duolingo-influenced)
        card: '20px',
        pill: '9999px',
      },
      boxShadow: {
        // Subtle yellow-tinted shadow under the hero card
        hero: '0 8px 24px -8px rgba(232, 180, 0, 0.35)',
        cta:  '0 6px 16px -6px rgba(26, 26, 26, 0.30)',
      },
      keyframes: {
        shake: {
          '0%, 100%':       { transform: 'translateX(0)' },
          '20%, 60%':       { transform: 'translateX(-6px)' },
          '40%, 80%':       { transform: 'translateX(6px)' },
        },
        pulse: {
          '0%, 100%': { transform: 'scale(1)',    opacity: '1'   },
          '50%':      { transform: 'scale(1.05)', opacity: '0.95' },
        },
      },
      animation: {
        shake:      'shake 380ms ease-in-out',
        'pulse-soft': 'pulse 1800ms ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
