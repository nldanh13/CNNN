/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Be Vietnam Pro"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        brand: {
          50: '#effefb', 100: '#c8fff4', 200: '#91feea', 300: '#53f5dc', 400: '#1fe0c9',
          500: '#06c4b0', 600: '#029e90', 700: '#077e74', 800: '#0b645e', 900: '#0e534e', 950: '#003331',
        },
        nanda: { DEFAULT: '#e11d48', soft: '#fff1f2' },
        noc: { DEFAULT: '#0284c7', soft: '#f0f9ff' },
        nic: { DEFAULT: '#059669', soft: '#ecfdf5' },
      },
      keyframes: {
        fade: { from: { opacity: '0' }, to: { opacity: '1' } },
        slide: { from: { transform: 'translateX(24px)', opacity: '0' }, to: { transform: 'none', opacity: '1' } },
        pop: { from: { transform: 'scale(.97) translateY(-4px)', opacity: '0' }, to: { transform: 'none', opacity: '1' } },
        rise: { from: { transform: 'translateY(8px)', opacity: '0' }, to: { transform: 'none', opacity: '1' } },
      },
      animation: {
        fade: 'fade .15s ease-out',
        slide: 'slide .2s cubic-bezier(.2,.8,.2,1)',
        pop: 'pop .15s ease-out',
        rise: 'rise .2s ease-out',
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,23,42,.04), 0 1px 3px rgba(15,23,42,.06)',
      },
    },
  },
  plugins: [],
};
