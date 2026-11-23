const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const WebSocket = globalThis.WebSocket;

const CHROME_PORT = 9457;
const ARTIFACTS_DIR = 'C:\\Users\\erick\\.gemini\\antigravity\\brain\\e3cf2a49-afc6-439b-920d-3aae4d0e0bc7';
const TEMP_USER_DATA = path.join(ARTIFACTS_DIR, 'scratch', 'chrome-user-data-audit-' + Date.now());

function findChromePath() {
  const commonPaths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe',
  ];
  for (const p of commonPaths) {
    if (fs.existsSync(p)) return p;
  }
  return 'chrome';
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.id = 1;
    this.pending = new Map();
    this.consoleErrors = [];
  }

  async connect() {
    this.ws = new WebSocket(this.wsUrl);
    await new Promise((resolve, reject) => {
      this.ws.addEventListener('open', resolve, { once: true });
      this.ws.addEventListener('error', reject, { once: true });
    });

    this.ws.addEventListener('message', (event) => {
      const msg = JSON.parse(event.data);
      if (msg.method === 'Runtime.consoleAPICalled' && (msg.params.type === 'error' || msg.params.type === 'warning')) {
        this.consoleErrors.push({
          type: msg.params.type,
          args: msg.params.args.map(a => a.value || a.description),
        });
      }
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message));
        else resolve(msg.result);
      }
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    return res.result?.value;
  }

  async setViewport(width, height) {
    await this.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: width < 768,
    });
  }

  async navigate(url) {
    await this.send('Page.navigate', { url });
    await wait(1800);
  }

  close() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

async function main() {
  console.log('--- INICIANDO AUDITORÍA RESPONSIVA Y ERRORES DE CONSOLA ---');
  const chromePath = findChromePath();
  const chromeProcess = spawn(chromePath, [
    `--remote-debugging-port=${CHROME_PORT}`,
    `--user-data-dir=${TEMP_USER_DATA}`,
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    'about:blank',
  ]);

  let connected = false;
  let wsUrl = '';
  for (let i = 0; i < 30; i++) {
    await wait(400);
    try {
      const endpoints = await getJson(`http://127.0.0.1:${CHROME_PORT}/json`);
      if (endpoints && endpoints.length > 0 && endpoints[0].webSocketDebuggerUrl) {
        wsUrl = endpoints[0].webSocketDebuggerUrl;
        connected = true;
        break;
      }
    } catch (e) {}
  }

  if (!connected) {
    console.error('[ERROR] No se pudo conectar a Chrome Headless');
    chromeProcess.kill();
    process.exit(1);
  }

  const client = new CDPClient(wsUrl);
  await client.connect();
  await client.send('Page.enable');
  await client.send('Runtime.enable');

  try {
    // Configurar sesión demo
    await client.navigate('http://localhost:5173/');
    await client.evaluate(`
      localStorage.setItem('studenthub_demo_sesion', 'true');
      localStorage.setItem('studenthub_demo_rol', 'ambos');
    `);

    const routes = [
      '/',
      '/estudiante',
      '/estudiante?tab=carnet',
      '/estudiante?tab=notas',
      '/estudiante?tab=asistencias',
      '/horarios',
      '/horarios/12-1',
      '/comedor',
      '/agenda',
      '/avisos',
      '/entrar',
      '/expo',
    ];

    const viewports = [
      { name: 'Smartphone (375px)', width: 375, height: 812 },
      { name: 'Tablet (768px)', width: 768, height: 1024 },
      { name: 'Desktop (1440px)', width: 1440, height: 900 },
    ];

    const findings = [];

    for (const vp of viewports) {
      console.log(`\n=== PROBANDO VIEWPORT ${vp.name} ===`);
      await client.setViewport(vp.width, vp.height);

      for (const route of routes) {
        client.consoleErrors = [];
        await client.navigate(`http://localhost:5173${route}`);
        await wait(500);

        const metrics = await client.evaluate(`
          (() => {
            const scrollWidth = document.documentElement.scrollWidth;
            const clientWidth = document.documentElement.clientWidth;
            const innerWidth = window.innerWidth;
            const overflowElements = [];
            const all = document.querySelectorAll('*');
            for (const el of all) {
              const r = el.getBoundingClientRect();
              if (r.right > innerWidth + 1 && el.offsetWidth > 0) {
                overflowElements.push({
                  tag: el.tagName,
                  className: (el.className || '').toString().slice(0, 60),
                  right: Math.round(r.right),
                  width: Math.round(r.width),
                });
                if (overflowElements.length > 3) break;
              }
            }
            return {
              scrollWidth,
              clientWidth,
              innerWidth,
              hasHorizontalScroll: scrollWidth > innerWidth,
              overflowCount: overflowElements.length,
              overflowSample: overflowElements,
            };
          })()
        `);

        if (metrics.hasHorizontalScroll) {
          console.warn(`[OVERFLOW] ${route} @ ${vp.name}: scrollWidth ${metrics.scrollWidth} > ${metrics.innerWidth}`);
          findings.push({
            type: 'Horizontal Overflow',
            viewport: vp.name,
            route,
            details: metrics,
          });
        } else {
          console.log(`[PASS] ${route} @ ${vp.name}: scrollWidth=${metrics.scrollWidth} <= ${metrics.innerWidth}`);
        }

        const realErrors = client.consoleErrors.filter(e => {
          const str = JSON.stringify(e);
          return !str.includes('Download the React DevTools') && !str.includes('Fast Refresh');
        });
        if (realErrors.length > 0) {
          console.warn(`[CONSOLE ERROR] ${route}:`, realErrors);
          findings.push({
            type: 'Console Warning/Error',
            viewport: vp.name,
            route,
            errors: realErrors,
          });
        }
      }
    }

    console.log('\n--- RESUMEN DE HALLAZGOS RESPONSIVOS Y CONSOLA ---');
    console.log(JSON.stringify(findings, null, 2));

  } finally {
    client.close();
    chromeProcess.kill();
    try {
      fs.rmSync(TEMP_USER_DATA, { recursive: true, force: true });
    } catch (e) {}
  }
}

main().catch(err => {
  console.error('[ERROR FATAL]', err);
  process.exit(1);
});
