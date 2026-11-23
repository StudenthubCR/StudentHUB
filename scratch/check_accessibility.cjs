const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../apps/web/src');

function getAllFiles(dir, exts = ['.tsx']) {
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
console.log('--- AUDITORÍA DE ACCESIBILIDAD Y BOTONES ---');

const buttonsWithoutType = [];
const buttonsWithoutLabel = [];
const imgsWithoutAlt = [];

for (const f of files) {
  if (f.includes('.test.')) continue;
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    // Check <button ... without type=
    if (line.includes('<button') && !line.includes('type=')) {
      // Check if type= is on next 3 lines
      const snippet = lines.slice(idx, idx + 4).join(' ');
      if (!snippet.includes('type=')) {
        buttonsWithoutType.push({ file: path.relative(srcDir, f), line: idx + 1, code: line.trim() });
      }
    }

    // Check <img ... without alt=
    if (line.includes('<img') && !line.includes('alt=')) {
      const snippet = lines.slice(idx, idx + 4).join(' ');
      if (!snippet.includes('alt=')) {
        imgsWithoutAlt.push({ file: path.relative(srcDir, f), line: idx + 1, code: line.trim() });
      }
    }
  });
}

console.log(`\nButtons without explicit type= (${buttonsWithoutType.length}):`);
buttonsWithoutType.slice(0, 10).forEach(b => console.log(`  ${b.file}:${b.line} -> ${b.code}`));

console.log(`\nImages without alt= (${imgsWithoutAlt.length}):`);
imgsWithoutAlt.forEach(i => console.log(`  ${i.file}:${i.line} -> ${i.code}`));
