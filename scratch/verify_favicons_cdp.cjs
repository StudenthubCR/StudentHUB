const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const WebSocket = globalThis.WebSocket;

const CHROME_PORT = 9456;
const ARTIFACTS_DIR = 'C:\\Users\\erick\\.gemini\\antigravity\\brain\\e3cf2a49-afc6-439b-920d-3aae4d0e0bc7';
const TEMP_USER_DATA = path.join(ARTIFACTS_DIR, 'scratch', 'chrome-user-data-favicons-' + Date.now());

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
    this.responses = [];
  }

  async connect() {
    this.ws = new WebSocket(this.wsUrl);
    await new Promise((resolve, reject) => {
      this.ws.addEventListener('open', resolve, { once: true });
      this.ws.addEventListener('error', reject, { once: true });
    });

    this.ws.addEventListener('message', (event) => {
      const msg = JSON.parse(event.data);
      if (msg.method === 'Network.responseReceived') {
        this.responses.push({
          url: msg.params.response.url,
          status: msg.params.response.status,
          mimeType: msg.params.response.mimeType,
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

  async screenshot(filePath) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(filePath, Buffer.from(res.data, 'base64'));
    console.log('[OK] Captura guardada en:', path.basename(filePath));
  }

  async navigate(url) {
    await this.send('Page.navigate', { url });
    await wait(2000);
  }

  close() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

async function main() {
  console.log('--- VERIFICACIÓN DE RED Y CARGA DE FAVICONS / PWA ICONS ---');
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
  await client.send('Network.enable');

  try {
    console.log('\n--- NAVEGANDO A LA APLICACIÓN http://localhost:5173/ ---');
    await client.navigate('http://localhost:5173/');

    // Verificar en el DOM los elementos <link rel="icon"> y apple-touch-icon
    const domIcons = await client.evaluate(`
      (() => {
        const links = Array.from(document.querySelectorAll('link[rel*="icon"]')).map(l => ({
          rel: l.rel,
          href: l.href,
          sizes: l.sizes ? l.sizes.value : '',
          type: l.type,
        }));
        return links;
      })()
    `);
    console.log('\nIconos detectados en el DOM:', JSON.stringify(domIcons, null, 2));

    // Validar solicitudes fetch directas de todos los activos de favicon y PWA
    const iconUrls = [
      'http://localhost:5173/favicon.ico?v=2',
      'http://localhost:5173/favicon-32x32.png?v=2',
      'http://localhost:5173/favicon-16x16.png?v=2',
      'http://localhost:5173/apple-touch-icon.png?v=2',
      'http://localhost:5173/pwa-192x192.png',
      'http://localhost:5173/pwa-512x512.png',
      'http://localhost:5173/pwa-maskable-512x512.png',
      'http://localhost:5173/icon-192.png',
      'http://localhost:5173/icon-512.png',
      'http://localhost:5173/icon-maskable-512.png',
    ];

    console.log('\n--- COMPROBANDO CÓDIGOS DE ESTADO HTTP Y 0 ERRORES 404 ---');
    let allOk = true;
    for (const url of iconUrls) {
      const check = await client.evaluate(`
        fetch('${url}')
          .then(res => ({ url: '${url}', status: res.status, ok: res.ok, type: res.headers.get('content-type') }))
          .catch(err => ({ url: '${url}', error: err.message, ok: false }))
      `);

      if (check.ok && check.status === 200) {
        console.log(`[PASS 200 OK] ${url.replace('http://localhost:5173', '')} (${check.type})`);
      } else {
        console.error(`[FAIL] ${url}: Status ${check.status || check.error}`);
        allOk = false;
      }
    }

    if (!allOk) {
      throw new Error('Uno o más activos retornaron error o 404');
    }

    console.log('\n[ÉXITO] Cero errores 404. Todos los activos de favicon y PWA cargan con HTTP 200 OK.');

    // Captura de pantalla de la página renderizada
    await client.screenshot(path.join(ARTIFACTS_DIR, 'favicon-verification-page.png'));
  } finally {
    client.close();
    chromeProcess.kill();
    try {
      fs.rmSync(TEMP_USER_DATA, { recursive: true, force: true });
    } catch (e) {}
  }
}

main().catch((err) => {
  console.error('[ERROR FATAL]', err);
  process.exit(1);
});
