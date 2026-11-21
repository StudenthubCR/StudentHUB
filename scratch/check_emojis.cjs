const fs = require('fs');
const path = require('path');

const targets = [
  path.resolve(__dirname, '../../apps/web/src/features/notas'),
  path.resolve(__dirname, '../../apps/web/src/features/asistencias'),
  path.resolve(__dirname, '../../apps/web/src/features/estudiante'),
  path.resolve(__dirname, '../../apps/web/src/components/SelectorPerspectiva.tsx'),
  path.resolve(__dirname, '../../apps/web/src/components/BadgeRol.tsx'),
  path.resolve(__dirname, '../../apps/web/src/features/dashboard/components/WidgetResumenAcademico.tsx'),
  path.resolve(__dirname, '../../apps/web/src/features/auth/LoginPage.tsx'),
  path.resolve(__dirname, '../../apps/web/src/app/router.tsx'),
  path.resolve(__dirname, '../../apps/web/src/app/layout/AppHeader.tsx'),
  path.resolve(__dirname, '../../apps/web/src/app/layout/AppNav.tsx'),
  path.resolve(__dirname, '../../apps/web/src/app/layout/AppLayout.tsx'),
  path.resolve(__dirname, '../../supabase/crear_tablas_notas_asistencias.sql'),
  path.resolve(__dirname, '../../BASES_DE_DATOS.md')
];

const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E0}-\u{1F1FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/u;

let found = 0;
function scan(target) {
  if (!fs.existsSync(target)) return;
  const stat = fs.statSync(target);
  if (stat.isDirectory()) {
    fs.readdirSync(target).forEach(f => scan(path.join(target, f)));
  } else if (target.endsWith('.ts') || target.endsWith('.tsx') || target.endsWith('.sql') || target.endsWith('.md')) {
    const content = fs.readFileSync(target, 'utf8');
    const lines = content.split('\n');
    lines.forEach((line, idx) => {
      if (emojiRegex.test(line)) {
        console.log(`[EMOJI] ${target}:${idx + 1} -> ${line.trim()}`);
        found++;
      }
    });
  }
}

targets.forEach(scan);
if (found === 0) {
  console.log('PASS: Zero emojis detected across all checked files and directories!');
} else {
  console.log(`FAIL: Total emojis found: ${found}`);
  process.exit(1);
}
