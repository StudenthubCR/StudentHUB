const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../apps/web/src');
const publicDir = path.join(__dirname, '../apps/web/public');
const assetsDir = path.join(__dirname, '../assets');

function getAllFiles(dir, exts = ['.tsx', '.ts']) {
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

const files = getAllFiles(srcDir);
console.log('--- AUDITORÍA DE REFERENCIAS A IMÁGENES / ACTIVOS ESTÁTICOS ---');

const imageReferences = [];

for (const f of files) {
  const content = fs.readFileSync(f, 'utf8');
  // Match src="..." or src={...}
  const matches = [...content.matchAll(/src=["'](\/[^"']+\.(?:png|webp|svg|ico|jpg|jpeg))["']/g)];
  for (const m of matches) {
    imageReferences.push({ file: path.relative(srcDir, f), src: m[1] });
  }
}

console.log(`Found ${imageReferences.length} static image references:`);
const missing = [];
for (const item of imageReferences) {
  const rel = item.src.replace(/^\//, '');
  const inPublic = fs.existsSync(path.join(publicDir, rel));
  const inAssets = fs.existsSync(path.join(assetsDir, rel));
  if (!inPublic && !inAssets) {
    missing.push(item);
  } else {
    console.log(`[EXISTS] ${item.src} (referenced in ${item.file})`);
  }
}

if (missing.length > 0) {
  console.error('\n[FAIL] Missing image assets:');
  console.log(missing);
} else {
  console.log('\n[PASS] All referenced image assets exist!');
}
