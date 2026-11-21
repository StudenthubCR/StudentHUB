const fs = require('fs');
const path = require('path');

const tables = new Set();
const references = [];

function scan(dir) {
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) scan(full);
    else if (item.name.endsWith('.ts') || item.name.endsWith('.tsx')) {
      const text = fs.readFileSync(full, 'utf8');
      const matches = text.matchAll(/\.from\(['"]([a-zA-Z0-9_-]+)['"]\)/g);
      for (const m of matches) {
        tables.add(m[1]);
        references.push({ table: m[1], file: path.relative(path.resolve(__dirname, '..'), full) });
      }
    }
  }
}

scan(path.resolve(__dirname, '../apps/web/src'));
console.log('Total references:', references.length);
console.log('Tables detected:');
for (const t of tables) {
  console.log(` - ${t}`);
}
