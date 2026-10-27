import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#FAF9FF',
        primary: {
          50: '#FAF5FF',
          100: '#F3E8FF',
          200: '#E9D5FF',
          300: '#D8B4FE',
          400: '#C084FC',
          500: '#A855F7',
          600: '#9333EA',
          700: '#7C3AED', // Royal Purple
          800: '#6B21A8',
          900: '#581C87',
        },
        clinic: {
          bg: '#FAF9FF',
          card: '#FFFFFF',
          purple: '#7C3AED',
          lavender: '#F3E8FF',
          border: '#EDE9FE',
          subtext: '#64748B',
          dark: '#0F172A',
        },
      },
      boxShadow: {
        '3d-purple': '0 20px 40px -15px rgba(124, 58, 237, 0.12), 0 0 0 1px rgba(124, 58, 237, 0.05)',
        '3d-purple-hover': '0 25px 50px -12px rgba(124, 58, 237, 0.22), 0 0 0 1px rgba(124, 58, 237, 0.15)',
        '3d-cabin': '0 15px 35px -5px rgba(124, 58, 237, 0.15), 0 10px 10px -5px rgba(124, 58, 237, 0.04)',
        'glow-purple': '0 0 25px -5px rgba(124, 58, 237, 0.35)',
        'card-depth': '0 10px 30px -5px rgba(99, 102, 241, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-slow': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
