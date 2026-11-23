const fs = require('fs');
const path = require('path');

const distHtml = fs.readFileSync('apps/web/dist/index.html', 'utf8');
const manifest = JSON.parse(fs.readFileSync('apps/web/dist/manifest.webmanifest', 'utf8'));

console.log('--- ICONOS EN dist/index.html ---');
const iconLinks = [...distHtml.matchAll(/<link[^>]+(?:icon|apple-touch-icon)[^>]+>/g)].map(m => m[0]);
console.log(iconLinks);

console.log('\n--- ICONOS EN dist/manifest.webmanifest ---');
console.log(manifest.icons);

console.log('\n--- VERIFICACIÓN DE EXISTENCIA Y TAMAÑO EN dist/ ---');
const allIcons = new Set();
for (const link of iconLinks) {
  const match = link.match(/href=["']([^"'?]+)/);
  if (match) allIcons.add(match[1].replace(/^\//, ''));
}
for (const icon of manifest.icons) {
  allIcons.add(icon.src.replace(/^\//, ''));
}

let allExist = true;
for (const file of allIcons) {
  const fullPath = path.join('apps/web/dist', file);
  if (fs.existsSync(fullPath)) {
    const size = fs.statSync(fullPath).size;
    console.log('[OK]', file, '->', size, 'bytes');
    if (size === 0) {
      console.error('[FAIL] File is 0 bytes:', file);
      allExist = false;
    }
  } else {
    console.error('[FAIL] File does not exist in dist:', file);
    allExist = false;
  }
}

if (!allExist) process.exit(1);
console.log('\n[PASS] Todos los iconos referenciados existen en dist/ con tamaño > 0.');
