/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      boxShadow: {
        candy: '0 18px 45px rgba(0,0,0,0.55)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(-1deg)' },
          '50%': { transform: 'translateY(-10px) rotate(1deg)' },
        },
        twinkle: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(0.9)' },
          '50%': { opacity: '1', transform: 'scale(1.1)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 0 rgba(255,255,255,0)' },
          '50%': { boxShadow: '0 0 25px rgba(255,255,255,0.9)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        jingle: {
          '0%,100%': { transform: 'translateY(0)' },
          '25%': { transform: 'translateY(-3px)' },
          '50%': { transform: 'translateY(1px)' },
          '75%': { transform: 'translateY(-2px)' },
        },
      },
      animation: {
        float: 'float 3s ease-in-out infinite',
        twinkle: 'twinkle 1.8s ease-in-out infinite',
        wiggle: 'wiggle 0.8s ease-in-out infinite',
        glow: 'glow 2s ease-in-out infinite',
        shimmer: 'shimmer 2.5s linear infinite',
        jingle: 'jingle 1.1s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
