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

const files = getAllFiles(srcDir);
console.log('--- AUDITORÍA DE SEGURIDAD Y PRIVACIDAD ---');

// Check for service_role, secret, password, bearer
const secretPatterns = [
  /service_role/i,
  /secret/i,
  /supabase_service/i,
  /eyJh[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, // JWT
  /AIza[0-9A-Za-z-_]{35}/g, // Google API key
];

for (const f of files) {
  const content = fs.readFileSync(f, 'utf8');
  for (const pat of secretPatterns) {
    const matches = content.match(pat);
    if (matches) {
      // Filter out harmless words like 'secretaría'
      const filtered = matches.filter(m => !m.toLowerCase().includes('secretar') && !m.toLowerCase().includes('subsecretar'));
      if (filtered.length > 0) {
        console.log(`[POTENTIAL SECRET] ${path.relative(srcDir, f)} matches ${pat}:`, filtered.slice(0, 3));
      }
    }
  }
}

// Check lib/supabase.ts
console.log('\n--- CONTENIDO DE lib/supabase.ts ---');
console.log(fs.readFileSync(path.join(srcDir, 'lib/supabase.ts'), 'utf8'));

// Check lib/config.ts
console.log('\n--- CONTENIDO DE lib/config.ts ---');
console.log(fs.readFileSync(path.join(srcDir, 'lib/config.ts'), 'utf8'));
