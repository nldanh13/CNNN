/**
 * Kiểm tra kho giao diện: mọi lớp màu trong src phải thuộc bảng màu của src/ui/tokens.css,
 * và không trang nào được nhập thành phần giao diện từ nơi khác ngoài src/ui.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ALLOWED = new Set([
  'ink', 'primary', 'accent', 'info', 'success', 'warning', 'danger', 'nanda', 'noc', 'nic',
  'canvas', 'surface', 'line', 'fg', 'white', 'black', 'transparent', 'current', 'inherit',
]);
const UTIL = '(?:bg|text|border|border-[trblxy]|ring|ring-offset|divide|outline|fill|stroke|from|via|to|placeholder|decoration|accent|caret|shadow)';
const COLOR_CLASS = new RegExp(`(?<![\\w-])(?:[a-z-]+:)*${UTIL}-([a-z]+)(?:-(?:50|[1-9]00|950|muted|subtle|soft))?(?:\\/\\d+)?(?![\\w-])`, 'g');
// Các hậu tố không phải màu của cùng tiện ích.
const NOT_COLOR = new Set([
  'xs', 'sm', 'base', 'lg', 'xl', 'left', 'right', 'center', 'justify', 'start', 'end', 'wrap', 'nowrap', 'balance', 'pretty', 'ellipsis', 'clip',
  'none', 'solid', 'dashed', 'dotted', 'double', 'hidden', 'collapse', 'separate', 'inset', 'card', 'raised', 'button', 'md', 'inner',
  'cover', 'contain', 'auto', 'fixed', 'local', 'scroll', 'repeat', 'top', 'bottom', 'opacity', 'offset', 'y', 'x', 't', 'b', 'l', 'r', 'gradient',
  // CSS declarations (not Tailwind colors) that the broad regex can encounter.
  'box', 'radius', 'align',
]);

function walk(dir: string, out: string[] = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(tsx|ts|css)$/.test(name) && !p.includes(`${join('src', 'data')}`)) out.push(p);
  }
  return out;
}

const problems: string[] = [];
for (const file of walk('src')) {
  const text = readFileSync(file, 'utf8');
  text.split('\n').forEach((line, i) => {
    for (const m of line.matchAll(COLOR_CLASS)) {
      const palette = m[1];
      if (ALLOWED.has(palette) || NOT_COLOR.has(palette) || /^\d/.test(palette)) continue;
      problems.push(`${file}:${i + 1}  ${m[0]}  (màu "${palette}" không có trong kho giao diện)`);
    }
    if (/from ['"][./]*components\/ui['"]/.test(line)) problems.push(`${file}:${i + 1}  nhập components/ui: dùng src/ui`);
  });
}

if (problems.length) {
  console.error(`Kho giao diện: ${problems.length} chỗ dùng màu hoặc thành phần ngoài kho\n` + problems.join('\n'));
  process.exit(1);
}
console.log('OK: mọi màu và thành phần giao diện đều lấy từ src/ui.');
