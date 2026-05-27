/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        // OneBody Brand Colors
        primary: {
          DEFAULT: '#0A0E27',
          light: '#111530',
          dark: '#060919',
        },
        gold: {
          DEFAULT: '#C9A84C',
          light: '#E2C17A',
          dark: '#A07830',
        },
        electric: {
          DEFAULT: '#4F8EF7',
          light: '#7AACFF',
          dark: '#2D6FD4',
        },
      },
      fontFamily: {
        playfair: ['Playfair Display', 'serif'],
        inter: ['Inter', 'sans-serif'],
        cormorant: ['Cormorant Garamond', 'serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px #C9A84C40' },
          '50%': { boxShadow: '0 0 40px #C9A84C80' },
        },
        pulseGold: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.7 },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
      },
      backgroundImage: {
        'gradient-gold': 'linear-gradient(135deg, #C9A84C, #E2C17A)',
        'gradient-dark': 'linear-gradient(135deg, #0A0E27, #111530)',
        'gradient-divine': 'linear-gradient(135deg, #0A0E27 0%, #1a1f4a 50%, #0A0E27 100%)',
      },
    },
  },
  plugins: [],
}