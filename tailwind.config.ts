import type { Config } from 'tailwindcss'

export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background:  '#0a0f1e',
        sidebar:     '#080d1a',
        card:        '#080d1a',
        border:      '#0d1830',
        foreground:  '#e2e8f0',
        muted:       '#94a3b8',
        'muted-foreground': '#475569',
        accent:         '#3b82f6',
        'accent-hover': '#2563eb',
        'accent-dim':   '#1e3a5f',
        'accent-light': '#60a5fa',
        success:     '#22c55e',
        'success-dim': '#0d2418',
        destructive: '#ef4444',
        // shadcn/ui CSS variable references
        primary: 'hsl(var(--primary))',
        'primary-foreground': 'hsl(var(--primary-foreground))',
        secondary: 'hsl(var(--secondary))',
        'secondary-foreground': 'hsl(var(--secondary-foreground))',
        ring: 'hsl(var(--ring))',
        input: 'hsl(var(--input))',
        'accent-foreground': 'hsl(var(--accent-foreground))',
        popover: 'hsl(var(--popover))',
        'popover-foreground': 'hsl(var(--popover-foreground))',
        'card-foreground': 'hsl(var(--card-foreground))',
        'destructive-foreground': 'hsl(var(--destructive-foreground))',
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [],
} satisfies Config
