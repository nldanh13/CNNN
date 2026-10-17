import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';

const app = readFileSync('src/App.tsx', 'utf8');
const layout = readFileSync('src/components/Layout.tsx', 'utf8');
const login = readFileSync('src/pages/AccountPage.tsx', 'utf8');
const home = readFileSync('src/pages/HomePage.tsx', 'utf8');

assert.ok(app.includes("const [section = 'home', id] = path"), 'The root route must open Home');
assert.ok(app.includes("default:\n      page = <HomePage />"), 'Unknown routes must fall back to Home');
assert.ok(app.includes("case 'library':\n      page = <LibraryPage"), 'Library must remain reachable');
assert.ok(layout.includes("href: '#/home', key: 'home'"), 'Home needs a dedicated navigation item');
assert.ok(layout.includes("href: '#/library', key: 'library'"), 'Library needs an independent navigation item');
assert.ok(layout.includes('href="#/home"'), 'Brand logo should return to Home');
assert.ok(layout.includes("items.filter(item => item.key !== 'references').map"), 'Mobile navigation should have five primary items');
assert.ok(/await auth\.signIn\(email, password(?:, [^\n]*)?\);\s*navigate\('\/home'\);/.test(login),
  'Sign-in should open Home instead of a stale Library hash');
assert.ok(home.includes('useAuth()') && home.includes('user?.user_metadata?.full_name'),
  'Home should provide a personalized greeting for signed-in users');
assert.ok(home.includes('href="#/assistant"') && home.includes('href="#/plans"'),
  'Home should have clear workflow entry points');
assert.ok(home.includes("dataHub.listLibrary(item.system).length"),
  'Home should show counts from the shared NNN catalog');
assert.ok(home.includes("dataHub.search(system, query)"),
  'Unified search should remain functional');

console.log('OK: welcome home, five mobile navigation items, independent library and care-plan routes.');
