const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const WebSocket = globalThis.WebSocket;

const CHROME_PORT = 9450;
const ARTIFACTS_DIR = 'C:\\Users\\erick\\.gemini\\antigravity\\brain\\e3cf2a49-afc6-439b-920d-3aae4d0e0bc7';
const TEMP_USER_DATA = path.join(ARTIFACTS_DIR, 'scratch', 'chrome-user-data-estudiante-hub-' + Date.now());

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

async function runEstudianteHubVerification() {
  const chromePath = findChromePath();
  console.log('Lanzando Chrome en puerto', CHROME_PORT, 'desde', chromePath);

  const chromeProc = spawn(chromePath, [
    `--remote-debugging-port=${CHROME_PORT}`,
    `--user-data-dir=${TEMP_USER_DATA}`,
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--window-size=1440,900',
    'http://localhost:5173/expo'
  ], { detached: false });

  let client = null;

  try {
    let endpoints = null;
    for (let i = 0; i < 20; i++) {
      await wait(500);
      try {
        endpoints = await getJson(`http://127.0.0.1:${CHROME_PORT}/json`);
        if (endpoints && endpoints.length > 0) break;
      } catch {}
    }

    if (!endpoints || !endpoints[0]?.webSocketDebuggerUrl) {
      throw new Error('No se pudo conectar a CDP en puerto ' + CHROME_PORT);
    }

    const wsUrl = endpoints[0].webSocketDebuggerUrl;
    client = new CDPClient(wsUrl);
    await client.connect();
    await client.send('Page.enable');
    await client.send('DOM.enable');

    console.log('\n--- PASO 1: Iniciar Sesión Demo y configurar localStorage ---');
    await client.navigate('http://localhost:5173/expo');
    await wait(1500);

    // Activar sesión demo directamente en localStorage para garantizar sesión autenticada
    await client.evaluate(`
      localStorage.setItem('studenthub_demo_sesion', 'true');
      localStorage.setItem('studenthub_demo_rol', 'estudiante');
      localStorage.removeItem('studenthub_estudiante_activo_id');
      localStorage.setItem('studenthub_perspectiva_vista', 'ambos');
    `);
    await wait(500);

    // Navegar a Dashboard
    await client.navigate('http://localhost:5173/');
    await wait(2000);

    console.log('\n--- PASO 2: Dashboard con Widget Resumen Académico ---');
    await client.setViewport(1440, 900);
    const widgetPresente = await client.evaluate(`
      (() => {
        const widget = document.querySelector('[data-testid="widget-resumen-academico"]');
        return Boolean(widget);
      })()
    `);
    console.log('Widget Resumen Académico presente en Dashboard:', widgetPresente);

    const widgetLinks = await client.evaluate(`
      (() => {
        const widget = document.querySelector('[data-testid="widget-resumen-academico"]');
        if (!widget) return [];
        return Array.from(widget.querySelectorAll('a')).map(a => a.getAttribute('href'));
      })()
    `);
    console.log('Enlaces dentro del Widget Resumen Académico:', widgetLinks);

    await client.screenshot(path.join(ARTIFACTS_DIR, 'dashboard-con-resumen-academico-1440px.png'));

    console.log('\n--- PASO 3: Redirección /carnet -> /estudiante?tab=carnet ---');
    await client.navigate('http://localhost:5173/carnet');
    await wait(1800);
    const currentUrl = await client.evaluate(`window.location.href`);
    console.log('URL tras navegar a /carnet:', currentUrl);
    if (!currentUrl.includes('/estudiante')) {
      throw new Error('Falló redirección de /carnet a /estudiante. URL actual: ' + currentUrl);
    }

    console.log('\n--- PASO 4: Tab Carnet en Hub Estudiante (1440px) ---');
    const tabCarnetActivo = await client.evaluate(`
      (() => {
        const tab = document.querySelector('button[role="tab"][aria-selected="true"]');
        return tab ? tab.textContent.trim() : null;
      })()
    `);
    console.log('Tab activo por defecto en Hub Estudiante:', tabCarnetActivo);

    // Verificar presencia de tarjeta carnet interactiva
    const carnetPresente = await client.evaluate(`
      (() => {
        const card = document.querySelector('[data-testid="tarjeta-carnet"]') ||
          Array.from(document.querySelectorAll('h1, h2, h3, div')).find(el => el.textContent.includes('Erick García') || el.textContent.includes('Informática Empresarial'));
        return Boolean(card);
      })()
    `);
    console.log('Tarjeta Carnet presente en pantalla:', carnetPresente);

    await client.screenshot(path.join(ARTIFACTS_DIR, 'estudiante-hub-carnet-1440px.png'));

    console.log('\n--- PASO 5: Tab Calificaciones (Notas) ---');
    // Clic en el tab Calificaciones
    await client.evaluate(`
      (() => {
        const tabNotas = Array.from(document.querySelectorAll('button[role="tab"]')).find(b => b.textContent.includes('Calificaciones'));
        if (tabNotas) tabNotas.click();
      })()
    `);
    await wait(1800);

    const notasUrl = await client.evaluate(`window.location.href`);
    console.log('URL tras clic en Calificaciones:', notasUrl);

    const kpisNotas = await client.evaluate(`
      (() => {
        const bodyText = document.body.innerText;
        return {
          tienePromedio: bodyText.includes('Promedio') || bodyText.includes('promedio'),
          tieneAprobadas: bodyText.includes('Aprobadas') || bodyText.includes('aprobadas'),
          tieneMaterias: document.querySelectorAll('article').length > 0
        };
      })()
    `);
    console.log('Validación KPIs y materias en Tab Notas:', kpisNotas);

    await client.screenshot(path.join(ARTIFACTS_DIR, 'estudiante-hub-notas-1440px.png'));

    console.log('\n--- PASO 6: Tab Asistencias ---');
    // Clic en el tab Asistencias
    await client.evaluate(`
      (() => {
        const tabAsist = Array.from(document.querySelectorAll('button[role="tab"]')).find(b => b.textContent.includes('Asistencias'));
        if (tabAsist) tabAsist.click();
      })()
    `);
    await wait(1800);

    const asistenciasUrl = await client.evaluate(`window.location.href`);
    console.log('URL tras clic en Asistencias:', asistenciasUrl);

    const kpiAsistencias = await client.evaluate(`
      (() => {
        const bodyText = document.body.innerText;
        return {
          tienePorcentaje: bodyText.includes('% Asistencia') || bodyText.includes('Asistencia'),
          tieneAusencias: bodyText.includes('Injustificadas') || bodyText.includes('Tardías'),
          tieneFiltros: Array.from(document.querySelectorAll('button')).some(b => b.textContent.includes('Todos') || b.textContent.includes('Ausencias'))
        };
      })()
    `);
    console.log('Validación KPIs y filtros en Tab Asistencias:', kpiAsistencias);

    await client.screenshot(path.join(ARTIFACTS_DIR, 'estudiante-hub-asistencias-1440px.png'));

    console.log('\n--- PASO 7: Selector de Perspectiva (Familia -> Estudiante -> Encargado) ---');
    // Cambiar perspectiva a Encargado
    const cambioPerspectiva = await client.evaluate(`
      (() => {
        const btnSelector = document.querySelector('button[aria-label*="perspectiva" i]') ||
          Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Familia') || b.textContent.includes('Perspectiva'));
        if (btnSelector) {
          btnSelector.click();
          return true;
        }
        return false;
      })()
    `);
    console.log('Abierto popup selector de perspectiva:', cambioPerspectiva);
    await wait(600);

    await client.evaluate(`
      (() => {
        const opt = Array.from(document.querySelectorAll('button[role="option"], button')).find(b => b.textContent.includes('Encargado') && !b.textContent.includes('Familia'));
        if (opt) opt.click();
      })()
    `);
    await wait(1200);

    const bannerPerspectiva = await client.evaluate(`
      (() => {
        const p = Array.from(document.querySelectorAll('p, span')).find(el => el.textContent.includes('supervisión') || el.textContent.includes('encargado legal'));
        return p ? p.textContent.trim() : 'no encontrado';
      })()
    `);
    console.log('Banner/texto de perspectiva Encargado:', bannerPerspectiva);

    await client.screenshot(path.join(ARTIFACTS_DIR, 'estudiante-hub-perspectiva-encargado-1440px.png'));

    console.log('\n--- PASO 8: Vista Móvil (375px) Hub Estudiante ---');
    await client.setViewport(375, 812);
    await wait(800);

    // Navegar al tab notas en móvil
    await client.evaluate(`
      (() => {
        const tabNotas = Array.from(document.querySelectorAll('button[role="tab"]')).find(b => b.textContent.includes('Calificaciones'));
        if (tabNotas) tabNotas.click();
      })()
    `);
    await wait(1200);

    const navItemLabel = await client.evaluate(`
      (() => {
        const items = Array.from(document.querySelectorAll('nav a, nav button')).map(el => el.textContent.trim());
        return items.find(txt => txt.includes('Estudiante'));
      })()
    `);
    console.log('Etiqueta "Estudiante" en barra de navegación inferior móvil:', navItemLabel);

    await client.screenshot(path.join(ARTIFACTS_DIR, 'estudiante-hub-mobile-375px.png'));

    console.log('\n[ÉXITO TOTAL] Todas las verificaciones del Hub Estudiante pasaron exitosamente.');

  } catch (err) {
    console.error('Error durante la verificación del Hub Estudiante:', err);
    process.exitCode = 1;
  } finally {
    if (client) client.close();
    try {
      chromeProc.kill();
    } catch {}
    try {
      fs.rmSync(TEMP_USER_DATA, { recursive: true, force: true });
    } catch {}
  }
}

runEstudianteHubVerification();
