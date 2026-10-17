/**
 * Bảng màu chỉ lấy từ kho giao diện (src/ui/tokens.css).
 * `theme.colors` được thay hẳn (không phải extend) nên các màu Tailwind rời
 * như slate-500 hay red-600 không còn tồn tại: mọi trang buộc phải dùng chung một bảng màu.
 */
const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const PALETTES = ['ink', 'primary', 'info', 'success', 'warning', 'danger', 'nanda', 'noc', 'nic'];

const v = (name) => `rgb(var(--${name}) / <alpha-value>)`;
const palette = (name) => {
  const scale = Object.fromEntries(STEPS.map((s) => [s, v(`c-${name}-${s}`)]));
  return { ...scale, DEFAULT: scale[600] };
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      white: '#ffffff',
      black: '#000000',
      ...Object.fromEntries(PALETTES.map((p) => [p, palette(p)])),
      canvas: v('canvas'),
      surface: { DEFAULT: v('surface'), muted: v('surface-muted') },
      line: { DEFAULT: v('line'), soft: v('line-soft') },
      fg: { DEFAULT: v('fg'), muted: v('fg-muted'), subtle: v('fg-subtle') },
    },
    extend: {
      fontFamily: {
        sans: ['"Be Vietnam Pro"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        control: 'var(--radius-control)',
        card: 'var(--radius-card)',
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
        card: '0 1px 2px rgb(15 23 42 / .04), 0 2px 8px -2px rgb(15 23 42 / .06)',
        raised: '0 4px 16px -4px rgb(15 23 42 / .12)',
      },
    },
  },
  plugins: [],
};
