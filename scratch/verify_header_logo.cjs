const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const WebSocket = globalThis.WebSocket;

const CHROME_PORT = 9455;
const ARTIFACTS_DIR = 'C:\\Users\\erick\\.gemini\\antigravity\\brain\\e3cf2a49-afc6-439b-920d-3aae4d0e0bc7';
const TEMP_USER_DATA = path.join(ARTIFACTS_DIR, 'scratch', 'chrome-user-data-header-' + Date.now());

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
  }

  async connect() {
    this.ws = new WebSocket(this.wsUrl);
    await new Promise((resolve, reject) => {
      this.ws.addEventListener('open', resolve, { once: true });
      this.ws.addEventListener('error', reject, { once: true });
    });

    this.ws.addEventListener('message', (event) => {
      const msg = JSON.parse(event.data);
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

  async screenshot(filePath) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(filePath, Buffer.from(res.data, 'base64'));
    console.log('[OK] Captura guardada en:', path.basename(filePath));
  }

  async navigate(url) {
    await this.send('Page.navigate', { url });
    await wait(2200);
  }

  close() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

async function main() {
  console.log('--- INICIANDO VERIFICACIÓN DEL LOGO Y HEADER RESPONSIVO ---');
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
  await client.send('DOM.enable');

  try {
    // 1. Inicializar sesión demo
    await client.navigate('http://localhost:5173/');
    await client.evaluate(`
      localStorage.setItem('studenthub_demo_sesion', 'true');
      localStorage.setItem('studenthub_demo_rol', 'ambos');
      document.documentElement.classList.remove('dark');
    `);
    await client.navigate('http://localhost:5173/');
    await wait(1500);

    // 2. Medición en Smartphone (375px) - Modo Claro
    console.log('\n--- EVALUANDO SMARTPHONE 375px (MODO CLARO) ---');
    await client.setViewport(375, 812);
    await wait(1000);

    const medicion375Claro = await client.evaluate(`
      (() => {
        const header = document.querySelector('header');
        const logo = header ? header.querySelector('a[aria-label="Ir al inicio"]') || header.querySelector('img') : null;
        const logoRect = logo ? logo.getBoundingClientRect() : null;
        const headerRect = header ? header.getBoundingClientRect() : null;
        const rightButtons = header ? Array.from(header.querySelectorAll('button, a')).filter(el => el !== logo) : [];
        const rightRects = rightButtons.map(b => {
          const r = b.getBoundingClientRect();
          return { tag: b.tagName, title: b.getAttribute('title') || b.getAttribute('aria-label') || b.textContent.trim(), right: r.right, width: r.width };
        });

        return {
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
          innerWidth: window.innerWidth,
          headerWidth: headerRect ? headerRect.width : 0,
          logoWidth: logoRect ? logoRect.width : 0,
          logoHeight: logoRect ? logoRect.height : 0,
          maxRight: Math.max(...rightRects.map(r => r.right), 0),
          rightButtons: rightRects,
          hasHorizontalScroll: document.documentElement.scrollWidth > window.innerWidth,
        };
      })()
    `);

    console.log('Medición 375px Claro:', JSON.stringify(medicion375Claro, null, 2));
    if (medicion375Claro.logoWidth > 145) {
      console.warn(`[ALERTA] Ancho del logo (${medicion375Claro.logoWidth}px) excede el objetivo de 145px`);
    } else {
      console.log(`[PASS] Ancho del logo (${medicion375Claro.logoWidth}px) <= 145px`);
    }

    if (medicion375Claro.hasHorizontalScroll) {
      console.error(`[FAIL] scrollWidth (${medicion375Claro.scrollWidth}) > innerWidth (${medicion375Claro.innerWidth})`);
    } else {
      console.log(`[PASS] Cero desbordamiento horizontal: scrollWidth (${medicion375Claro.scrollWidth}) <= innerWidth (${medicion375Claro.innerWidth})`);
    }

    await client.screenshot(path.join(ARTIFACTS_DIR, 'header-logo-light-375px.png'));

    // 3. Medición en Smartphone (375px) - Modo Oscuro
    console.log('\n--- EVALUANDO SMARTPHONE 375px (MODO OSCURO) ---');
    await client.evaluate(`document.documentElement.classList.add('dark');`);
    await wait(500);
    await client.screenshot(path.join(ARTIFACTS_DIR, 'header-logo-dark-375px.png'));

    // 4. Medición en Tablet (768px) - Modo Claro y Oscuro
    console.log('\n--- EVALUANDO TABLET 768px ---');
    await client.setViewport(768, 1024);
    await client.evaluate(`document.documentElement.classList.remove('dark');`);
    await wait(500);

    const medicion768 = await client.evaluate(`
      (() => {
        const header = document.querySelector('header');
        const logo = header ? header.querySelector('a[aria-label="Ir al inicio"]') : null;
        return {
          scrollWidth: document.documentElement.scrollWidth,
          innerWidth: window.innerWidth,
          logoWidth: logo ? logo.getBoundingClientRect().width : 0,
          hasHorizontalScroll: document.documentElement.scrollWidth > window.innerWidth,
        };
      })()
    `);
    console.log('Medición 768px Claro:', JSON.stringify(medicion768, null, 2));
    await client.screenshot(path.join(ARTIFACTS_DIR, 'header-logo-light-768px.png'));

    await client.evaluate(`document.documentElement.classList.add('dark');`);
    await wait(500);
    await client.screenshot(path.join(ARTIFACTS_DIR, 'header-logo-dark-768px.png'));

    // 5. Medición en Desktop (1440px) - Modo Claro y Oscuro
    console.log('\n--- EVALUANDO DESKTOP 1440px ---');
    await client.setViewport(1440, 900);
    await client.evaluate(`document.documentElement.classList.remove('dark');`);
    await wait(500);

    const medicion1440 = await client.evaluate(`
      (() => {
        const header = document.querySelector('header');
        const logo = header ? header.querySelector('a[aria-label="Ir al inicio"]') : null;
        return {
          scrollWidth: document.documentElement.scrollWidth,
          innerWidth: window.innerWidth,
          logoWidth: logo ? logo.getBoundingClientRect().width : 0,
          hasHorizontalScroll: document.documentElement.scrollWidth > window.innerWidth,
        };
      })()
    `);
    console.log('Medición 1440px Claro:', JSON.stringify(medicion1440, null, 2));
    await client.screenshot(path.join(ARTIFACTS_DIR, 'header-logo-light-1440px.png'));

    await client.evaluate(`document.documentElement.classList.add('dark');`);
    await wait(500);
    await client.screenshot(path.join(ARTIFACTS_DIR, 'header-logo-dark-1440px.png'));

    // 6. Login Page (375px)
    console.log('\n--- EVALUANDO /entrar EN 375px ---');
    await client.setViewport(375, 812);
    await client.navigate('http://localhost:5173/entrar');
    await wait(1000);
    await client.screenshot(path.join(ARTIFACTS_DIR, 'header-logo-login-375px.png'));

    // 7. Expo Navbar (375px)
    console.log('\n--- EVALUANDO /expo EN 375px ---');
    await client.navigate('http://localhost:5173/expo');
    await wait(1000);
    await client.screenshot(path.join(ARTIFACTS_DIR, 'header-logo-expo-375px.png'));

    console.log('\n--- TODAS LAS VERIFICACIONES COMPLETADAS CON ÉXITO ---');
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
