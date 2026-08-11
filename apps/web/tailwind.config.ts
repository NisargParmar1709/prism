import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      /* ─── Colors ─── */
      colors: {
        prism: {
          // Neutral Scale
          white: '#FFFFFF',
          surface: '#F8FAFC',
          elevated: '#F1F5F9',
          border: '#E2E8F0',
          'border-strong': '#CBD5E1',
          text: '#0F172A',
          'text-secondary': '#475569',
          'text-muted': '#94A3B8',

          // Violet Spectrum
          'violet-50': '#F5F3FF',
          'violet-100': '#EDE9FE',
          'violet-200': '#DDD6FE',
          'violet-400': '#A78BFA',
          'violet-500': '#8B5CF6',
          'violet-600': '#7C3AED',
          'violet-700': '#6D28D9',
          'violet-900': '#4C1D95',

          // Semantic Colors
          success: '#10B981',
          'success-bg': '#ECFDF5',
          'success-text': '#065F46',
          warning: '#F59E0B',
          'warning-bg': '#FFFBEB',
          'warning-text': '#92400E',
          danger: '#EF4444',
          'danger-bg': '#FEF2F2',
          'danger-text': '#991B1B',
          info: '#3B82F6',
          'info-bg': '#EFF6FF',

          // Dark Accent Cards
          'dark-card': '#1E293B',
          'dark-text': '#F8FAFC',
          'dark-muted': '#94A3B8',
        },

        // Chart Palette (Monochromatic Purple)
        chart: {
          1: '#7C3AED',
          2: '#A78BFA',
          3: '#C4B5FD',
          4: '#DDD6FE',
          5: '#EDE9FE',
          6: '#F5F3FF',
        },
      },

      /* ─── Typography ─── */
      fontFamily: {
        sans: ['var(--font-inter)', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'Fira Code', 'monospace'],
      },

      fontSize: {
        display: ['2.25rem', { lineHeight: '1.1', fontWeight: '700' }],
        h1: ['1.5rem', { lineHeight: '1.3', fontWeight: '600' }],
        h2: ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }],
        h3: ['1rem', { lineHeight: '1.5', fontWeight: '600' }],
        body: ['0.875rem', { lineHeight: '1.6', fontWeight: '400' }],
        small: ['0.8125rem', { lineHeight: '1.5', fontWeight: '500' }],
        xs: ['0.75rem', { lineHeight: '1.4', fontWeight: '500' }],
        mono: ['0.875rem', { lineHeight: '1.2', fontWeight: '600' }],
      },

      /* ─── Spacing (4px grid) ─── */
      spacing: {
        'prism-1': '4px',
        'prism-2': '8px',
        'prism-3': '12px',
        'prism-4': '16px',
        'prism-5': '24px',
        'prism-6': '32px',
        'prism-7': '40px',
        'prism-8': '44px',
        'prism-9': '48px',
        'prism-10': '64px',
      },

      /* ─── Border Radius ─── */
      borderRadius: {
        button: '10px',
        card: '16px',
        input: '12px',
        pill: '9999px',
      },

      /* ─── Shadows ─── */
      boxShadow: {
        card: '0 1px 3px rgba(15, 23, 42, 0.04), 0 1px 2px rgba(15, 23, 42, 0.02)',
        'card-hover': '0 4px 12px rgba(15, 23, 42, 0.08), 0 2px 4px rgba(15, 23, 42, 0.04)',
        'dark-card': '0 8px 24px rgba(30, 41, 59, 0.3)',
        fab: '0 4px 16px rgba(124, 58, 237, 0.35)',
      },

      /* ─── Animations ─── */
      keyframes: {
        'skeleton-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'progress-fill': {
          from: { width: '0%' },
          to: { width: 'var(--progress-width)' },
        },
        'slide-up': {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
      animation: {
        'skeleton-pulse': 'skeleton-pulse 1.5s ease-in-out infinite',
        'progress-fill': 'progress-fill 600ms cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-up': 'slide-up 250ms cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fade-in 300ms cubic-bezier(0.4, 0, 0.2, 1)',
      },

      /* ─── Transitions ─── */
      transitionDuration: {
        page: '300ms',
        'card-hover': '150ms',
        progress: '600ms',
        number: '800ms',
        modal: '250ms',
        toast: '300ms',
        chart: '800ms',
      },

      transitionTimingFunction: {
        'prism-ease': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'prism-spring': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
