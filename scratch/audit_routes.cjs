const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../apps/web/src');

function getAllFiles(dir, exts = ['.ts', '.tsx']) {
  let files = [];
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      files = files.concat(getAllFiles(fullPath, exts));
    } else if (exts.includes(path.extname(item.name))) {
      files.push(fullPath);
    }
  }
  return files;
}

const routerContent = fs.readFileSync(path.join(srcDir, 'app/router.tsx'), 'utf8');
// Extract defined routes from router.tsx
const routeMatches = [...routerContent.matchAll(/path:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
console.log('Defined route paths in router.tsx:');
console.log(routeMatches);

// Also top-level routes
const validRoutes = new Set([
  '/',
  '/carnet',
  '/estudiante',
  '/horarios',
  '/horarios/:grupo',
  '/comedor',
  '/agenda',
  '/avisos',
  '/entrar',
  '/expo',
  '/creditos',
  '/admin',
  '/admin/avisos',
  '/admin/noticias',
  '/admin/estudiantes',
  '/admin/auditoria',
  '/acceso-denegado',
]);

const files = getAllFiles(srcDir);
const linkTargets = [];

for (const f of files) {
  const content = fs.readFileSync(f, 'utf8');
  // Match to="..." in Link, NavLink
  const toMatches = [...content.matchAll(/\bto=(?:\{['"`]([^'"`]+)['"`]\}|['"]([^'"]+)['"])/g)];
  for (const m of toMatches) {
    const target = m[1] || m[2];
    linkTargets.push({ file: path.relative(srcDir, f), target });
  }
  // Match navigate('...')
  const navMatches = [...content.matchAll(/\bnavigate\(\s*['"]([^'"]+)['"]/g)];
  for (const m of navMatches) {
    linkTargets.push({ file: path.relative(srcDir, f), target: m[1] });
  }
}

console.log('\nChecking all Link/navigate targets:');
const invalid = [];
for (const item of linkTargets) {
  const t = item.target.split('?')[0].split('#')[0];
  if (t.startsWith('http') || t.startsWith('mailto:') || t.startsWith('tel:') || t === '' || t === '..' || t === '.') continue;
  // If dynamic e.g. /horarios/10-1
  let matched = validRoutes.has(t);
  if (!matched && t.startsWith('/horarios/')) matched = true;
  if (!matched && t.startsWith('/#')) matched = true;

  if (!matched) {
    invalid.push(item);
  }
}

console.log(`Found ${linkTargets.length} link targets. Invalid or unmapped:`);
console.log(invalid);
