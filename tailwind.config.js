/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Modern White Theme Color System
        background: {
          primary: '#FFFFFF',
          secondary: '#F9FAFB',
          tertiary: '#F3F4F6',
        },
        accent: {
          primary: '#9945FF', // Solana purple
          secondary: '#14F195', // Solana green
          tertiary: '#00D4FF', // Cyan
        },
        status: {
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
          info: '#3B82F6',
        },
        text: {
          primary: '#000000',
          secondary: '#6B7280',
          muted: '#9CA3AF',
        },
        border: {
          DEFAULT: '#E5E7EB',
          focus: '#9945FF',
          hover: '#D1D5DB',
        },
      },
      fontFamily: {
        heading: ['Inter Tight', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        data: ['Roboto Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(153, 69, 255, 0.5), 0 0 10px rgba(153, 69, 255, 0.3)' },
          '100%': { boxShadow: '0 0 10px rgba(153, 69, 255, 0.8), 0 0 20px rgba(153, 69, 255, 0.5)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-mesh': 'radial-gradient(at 40% 20%, rgba(153, 69, 255, 0.3) 0, transparent 50%), radial-gradient(at 80% 0%, rgba(20, 241, 149, 0.2) 0, transparent 50%), radial-gradient(at 0% 50%, rgba(0, 212, 255, 0.2) 0, transparent 50%)',
        'grid-pattern': 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid': '50px 50px',
      },
      blur: {
        xs: '2px',
      },
      boxShadow: {
        'glow-sm': '0 0 10px rgba(153, 69, 255, 0.3)',
        'glow-md': '0 0 20px rgba(153, 69, 255, 0.4)',
        'glow-lg': '0 0 30px rgba(153, 69, 255, 0.5)',
        'neon': '0 0 5px theme("colors.accent.primary"), 0 0 20px theme("colors.accent.primary")',
      },
    },
  },
  plugins: [],
}
