const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../apps/web/src');

function getAllFiles(dir, exts = ['.ts', '.tsx', '.js', '.jsx']) {
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
console.log(`Auditing ${files.length} source files in apps/web/src...`);

// 1. Audit JSON.parse
console.log('\n=== AUDIT 1: JSON.parse ===');
for (const f of files) {
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (line.includes('JSON.parse(')) {
      // Check surrounding lines for try/catch
      const start = Math.max(0, idx - 8);
      const end = Math.min(lines.length, idx + 8);
      const snippet = lines.slice(start, end).join('\n');
      const hasTry = snippet.includes('try {') || snippet.includes('try{');
      if (!hasTry) {
        console.log(`[JSON.parse UNGUARDED] ${path.relative(srcDir, f)}:${idx + 1}: ${line.trim()}`);
      }
    }
  });
}

// 2. Audit localStorage setItem/getItem
console.log('\n=== AUDIT 2: localStorage ===');
for (const f of files) {
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (line.includes('localStorage.setItem') || line.includes('localStorage.removeItem')) {
      const start = Math.max(0, idx - 6);
      const end = Math.min(lines.length, idx + 6);
      const snippet = lines.slice(start, end).join('\n');
      const hasTry = snippet.includes('try {') || snippet.includes('try{');
      if (!hasTry) {
        console.log(`[localStorage UNGUARDED] ${path.relative(srcDir, f)}:${idx + 1}: ${line.trim()}`);
      }
    }
  });
}

// 3. Audit dangerouslySetInnerHTML
console.log('\n=== AUDIT 3: dangerouslySetInnerHTML ===');
for (const f of files) {
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (line.includes('dangerouslySetInnerHTML')) {
      console.log(`[DANGEROUS HTML] ${path.relative(srcDir, f)}:${idx + 1}: ${line.trim()}`);
    }
  });
}

// 4. Audit Emojis
console.log('\n=== AUDIT 4: Unicode Emojis ===');
const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}]/u;
for (const f of files) {
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (emojiRegex.test(line)) {
      console.log(`[EMOJI DETECTED] ${path.relative(srcDir, f)}:${idx + 1}: ${line.trim()}`);
    }
  });
}

// 5. Audit console.log / console.info
console.log('\n=== AUDIT 5: console.log with sensitive data ===');
for (const f of files) {
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (line.includes('console.log(') || line.includes('console.info(') || line.includes('console.dir(')) {
      if (!f.includes('.test.') && !f.includes('fixture')) {
        console.log(`[CONSOLE LOG] ${path.relative(srcDir, f)}:${idx + 1}: ${line.trim()}`);
      }
    }
  });
}

// 6. Audit setInterval / addEventListener in useEffect without cleanup
console.log('\n=== AUDIT 6: Missing cleanup in useEffect ===');
for (const f of files) {
  const content = fs.readFileSync(f, 'utf8');
  if (content.includes('addEventListener') || content.includes('setInterval')) {
    // Check if there is matching removeEventListener or clearInterval
    const hasAdd = content.includes('addEventListener');
    const hasRemove = content.includes('removeEventListener');
    if (hasAdd && !hasRemove) {
      console.log(`[EVENT LISTENER WITHOUT REMOVE] ${path.relative(srcDir, f)}`);
    }
    const hasInterval = content.includes('setInterval');
    const hasClearInterval = content.includes('clearInterval');
    if (hasInterval && !hasClearInterval) {
      console.log(`[SETINTERVAL WITHOUT CLEAR] ${path.relative(srcDir, f)}`);
    }
  }
}
