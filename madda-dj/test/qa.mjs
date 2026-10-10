// QA de la página de identidad de MADDA.
//   node madda-dj/test/qa.mjs           (desde /home/user/zibikolvap)
// Sirve madda-dj/pagina con un servidor mínimo, la abre en 4 anchos y revisa:
// errores de consola, scroll horizontal, textos "undefined/null/NaN", las elecciones
// (logo, paleta, estilo, visual, tap-tempo a ~130 BPM, resumen y link de WhatsApp) y movimiento reducido.
// Extras a 390 px: portada a pantalla completa, pausa fuera de pantalla, versión sin WebGL,
// localStorage bloqueado, tap con teclado, link de agenda, Spotify (embed solo en la web) y brillo del logo.
// Si existe dist/identidad-artifact.html, hace lo mismo con el cuerpo del Artifact.
// Capturas: madda-dj/output/capturas/{pagina,artifact}-{360,390,768,1440}.png
import { createServer } from 'node:http';
import { existsSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PAGINA = path.join(RAIZ, 'pagina');
const ARTIFACT = path.join(RAIZ, 'dist', 'identidad-artifact.html');
const CAPTURAS = path.join(RAIZ, 'output', 'capturas');
const ANCHOS = [[360, 740], [390, 844], [768, 1024], [1440, 900]];
const TIPOS = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8', '.json': 'application/json' };

const fallas = [];
const avisos = [];
const falla = (donde, msg) => { fallas.push(`[${donde}] ${msg}`); console.log(`  ✗ ${msg}`); };
const ok = (msg) => console.log(`  ✓ ${msg}`);

// ── servidor estático mínimo ──
function servir(dir) {
  const srv = createServer((req, res) => {
    let ruta = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (ruta.endsWith('/')) ruta += 'index.html';
    const archivo = path.join(dir, path.normalize(ruta));
    if (!archivo.startsWith(dir) || !existsSync(archivo) || !statSync(archivo).isFile()) { res.writeHead(404); res.end('no'); return; }
    res.writeHead(200, { 'Content-Type': TIPOS[path.extname(archivo)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(readFileSync(archivo));
  });
  return new Promise((ok2) => srv.listen(0, '127.0.0.1', () => ok2(srv)));
}

// ── revisiones dentro de la página ──
async function revisarBase(page, donde, errores) {
  const r = await page.evaluate(() => ({
    sw: document.documentElement.scrollWidth,
    iw: window.innerWidth,
    texto: document.body.innerText,
    h1: document.querySelectorAll('h1').length,
    hero: !!document.querySelector('#portada-svg svg'),
    logos: document.querySelectorAll('#logos .logo-dibujo svg').length,
    leds: document.querySelectorAll('#leds canvas').length,
    sinNombre: [...document.querySelectorAll('button')].filter((b) => !(b.textContent.trim() || b.getAttribute('aria-label'))).length,
    portada: Math.round(document.querySelector('.portada').getBoundingClientRect().height),
    torcidas: [...document.querySelectorAll('.led, .lab-escena')].map((e) => { const b = e.getBoundingClientRect(); return b.width / b.height; }).filter((x) => Math.abs(x - 2.1) > 0.03).map((x) => x.toFixed(2)),
    ih: window.innerHeight,
    attrMalos: [...document.querySelectorAll('body *')].flatMap((el) => [...el.attributes].filter((a) => /\b(undefined|NaN)\b/.test(a.value)).map((a) => `${el.tagName.toLowerCase()}[${a.name}]`)),
  }));
  if (r.portada < r.ih - 2) falla(donde, `la portada no llena la primera pantalla (${r.portada} < ${r.ih})`); else ok('la portada llena la primera pantalla');
  if (r.torcidas.length) falla(donde, 'pantallas LED que no quedan 2,1 : 1: ' + r.torcidas.join(', ')); else ok('pantallas LED en 2,1 : 1');
  if (r.attrMalos.length) falla(donde, 'atributos con "undefined"/"NaN": ' + r.attrMalos.slice(0, 4).join(', '));
  if (r.sw > r.iw) falla(donde, `scroll horizontal: scrollWidth ${r.sw} > innerWidth ${r.iw}`); else ok(`sin scroll horizontal (${r.sw} ≤ ${r.iw})`);
  const malo = r.texto.match(/\b(undefined|null|NaN)\b/);
  if (malo) falla(donde, `aparece el texto "${malo[0]}"`); else ok('sin "undefined", "null" ni "NaN"');
  if (r.h1 !== 1) falla(donde, `hay ${r.h1} h1`);
  if (!r.hero) falla(donde, 'la portada no tiene logo');
  if (r.logos < 6) falla(donde, `solo ${r.logos} logos en la grilla`); else ok(`${r.logos} logos dibujados`);
  if (r.leds < 4) falla(donde, `solo ${r.leds} visuales LED`);
  if (r.sinNombre) falla(donde, `${r.sinNombre} botones sin nombre accesible`);
  if (errores.length) errores.forEach((e) => falla(donde, e)); else ok('sin errores de consola');
}

async function interactuar(page, donde) {
  const resumen = () => page.$eval('#resumen', (el) => el.innerText);
  await page.click('[data-logo="doble-d"] [data-accion="gusta"]');
  const pres = await page.getAttribute('[data-logo="doble-d"] [data-accion="gusta"]', 'aria-pressed');
  const forma = await page.getAttribute('#portada-svg', 'data-forma');
  if (pres !== 'true' || forma !== 'doble-d') falla(donde, `"Me gusta" en Doble D no actualizó (aria-pressed ${pres}, portada ${forma})`);
  else ok('"Me gusta" en Doble D actualiza la portada');
  await page.click('[data-logo="doble-d"] [data-variante="blanco"]');
  await page.click('[data-paleta="rojo"] button');
  const acento = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--acento').trim().toUpperCase());
  if (acento !== '#E3123B') falla(donde, `la paleta Rojo no cambió el acento (${acento})`); else ok('la paleta Rojo y blanco cambia el acento');
  await page.click('[data-estilo="hypnotic"] button');
  const est = await page.getAttribute('[data-estilo="hypnotic"] button', 'aria-pressed');
  if (est !== 'true') falla(donde, 'el estilo Hypnotic no quedó marcado');
  await page.click('[data-led="laser"] .led-pie button');
  const led = await page.getAttribute('[data-led="laser"] .led-pie button', 'aria-pressed');
  if (led !== 'true') falla(donde, 'el visual Túnel de láser no quedó marcado');
  // tap-tempo: 8 golpes cada 462 ms (≈ 130 BPM), con temporizador dentro de la página
  await page.$eval('#tap', (b) => b.scrollIntoView({ block: 'center' }));
  await page.evaluate(async () => {
    const b = document.getElementById('tap');
    for (let i = 0; i < 8; i++) {
      b.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0, pointerType: 'mouse' }));
      if (i < 7) await new Promise((r) => setTimeout(r, 462));
    }
  });
  const bpm = Number(await page.textContent('#tap-bpm'));
  if (!(bpm >= 127 && bpm <= 133)) falla(donde, `tap-tempo dio ${bpm} BPM (se esperaba ~130)`); else ok(`tap-tempo: ${bpm} BPM`);
  const txt = await resumen();
  const esperado = ['Doble D', 'Blanco', 'Rojo y blanco', 'Hypnotic', 'Túnel de láser', String(bpm)];
  const faltan = esperado.filter((s) => !txt.includes(s));
  if (faltan.length) falla(donde, `el resumen no muestra: ${faltan.join(', ')}`); else ok('el resumen se actualiza');
  const href = await page.getAttribute('#whatsapp', 'href');
  const dec = decodeURIComponent((href || '').replace(/^https:\/\/wa\.me\/\?text=/, ''));
  const faltanWa = ['Logo: Doble D', 'versión Blanco', 'Paleta: Rojo y blanco', 'Hypnotic', 'Visuales: Túnel de láser', `Mis BPM: ${bpm}`].filter((s) => !dec.includes(s));
  if (!href || !href.startsWith('https://wa.me/?text=') || faltanWa.length) falla(donde, `el link de WhatsApp no trae: ${faltanWa.join(', ') || href}`); else ok('el link de WhatsApp lleva la elección');
  await page.click('#borde');
  const medida = await page.textContent('#lab .lab-medida');
  if (!/sin borde/.test(medida || '')) falla(donde, 'el botón de borde no cambia la medición'); else ok('el laboratorio mide sin borde');
  await page.click('#copiar');
  await page.waitForTimeout(150);
  const copia = await page.textContent('#estado-copia');
  if (!copia || !copia.trim()) falla(donde, 'copiar no dio ninguna respuesta'); else ok('copiar responde: ' + copia.trim().slice(0, 40));
}

async function revisarExternos(peticiones, donde, permitido) {
  const externas = peticiones.filter((u) => !permitido(u));
  if (externas.length) falla(donde, 'pidió recursos externos: ' + [...new Set(externas)].slice(0, 5).join(', ')); else ok('sin pedidos a otros sitios');
}

async function pasada(browser, nombre, abrir, permitido) {
  for (const [w, h] of ANCHOS) {
    const donde = `${nombre} ${w}`;
    console.log(`\n${donde}×${h}`);
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    const errores = [];
    const peticiones = [];
    page.on('console', (m) => { if (m.type() === 'error') errores.push('consola: ' + m.text()); });
    page.on('pageerror', (e) => errores.push('error: ' + e.message));
    page.on('request', (r) => peticiones.push(r.url()));
    await abrir(page);
    await page.evaluate(() => (document.fonts ? document.fonts.ready : null));
    await page.waitForTimeout(700);
    await revisarBase(page, donde, errores);
    mkdirSync(CAPTURAS, { recursive: true });
    await page.screenshot({ path: path.join(CAPTURAS, `${nombre}-${w}.png`), fullPage: true });
    errores.length = 0;
    await interactuar(page, donde);
    const sw = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (sw > 0) falla(donde, `scroll horizontal después de elegir (${sw}px de más)`);
    if (errores.length) errores.forEach((e) => falla(donde, e));
    await revisarExternos(peticiones, donde, permitido);
    await ctx.close();
  }
  // movimiento reducido
  const donde = `${nombre} movimiento reducido`;
  console.log(`\n${donde}`);
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  await ctx.addInitScript(CONTAR_RAF);
  const page = await ctx.newPage();
  const errores = [];
  page.on('console', (m) => { if (m.type() === 'error') errores.push('consola: ' + m.text()); });
  page.on('pageerror', (e) => errores.push('error: ' + e.message));
  await abrir(page);
  await page.waitForTimeout(600);
  await revisarBase(page, donde, errores);
  const quieto = await page.evaluate(() => window.MaddaVisuales && window.MaddaVisuales.pideQuieto());
  if (!quieto) falla(donde, 'la página no detecta prefers-reduced-motion'); else ok('detecta movimiento reducido');
  const r = await page.evaluate(async () => {
    const a = window.__raf || 0;
    await new Promise((ok3) => setTimeout(ok3, 800));
    return { raf: (window.__raf || 0) - a, copia: !!document.querySelector('#portada-svg .portada-brillo'), css: document.getAnimations().filter((x) => x.playState === 'running').length };
  });
  if (r.raf || r.css) falla(donde, `sigue animando con movimiento reducido (${r.raf} cuadros, ${r.css} animaciones CSS)`); else ok('quieto: ningún cuadro ni animación CSS');
  if (r.copia) falla(donde, 'la copia que se mueve del logo está aunque se pidió menos movimiento');
  await ctx.close();
  await extras(browser, nombre, abrir);
}

// ── más revisiones, a 390 px: pausa fuera de pantalla, sin WebGL, sin localStorage,
//    teclado en el tap, agenda, Spotify y el brillo del logo de la portada ──
const CONTAR_RAF = `(() => { window.__raf = 0; const o = window.requestAnimationFrame.bind(window); window.requestAnimationFrame = (f) => o((t) => { window.__raf++; f(t); }); })();`;
const SIN_WEBGL = `(() => { const o = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (t, ...r) { return /webgl/i.test(t) ? null : o.call(this, t, ...r); }; })();`;
const SIN_STORAGE = `(() => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('bloqueado'); } }); })();`;

async function contexto(browser, abrir, inits) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  for (const s of inits) await ctx.addInitScript(s);
  const page = await ctx.newPage();
  const errores = [];
  page.on('pageerror', (e) => errores.push('error: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errores.push('consola: ' + m.text()); });
  await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort()); // nada sale a internet
  await abrir(page);
  await page.waitForTimeout(500);
  return { ctx, page, errores };
}

async function extras(browser, nombre, abrir) {
  const donde = `${nombre} extras`;
  console.log(`\n${donde}`);
  // 1 · pausa fuera de pantalla + brillo de la portada + teclado + agenda + Spotify
  {
    const { ctx, page, errores } = await contexto(browser, abrir, [CONTAR_RAF]);
    const g = () => page.evaluate(() => { const e = document.querySelector('#portada-svg .portada-brillo linearGradient[id$="-g"]'); return e ? e.getAttribute('gradientTransform') : null; });
    const g1 = await g(); await page.waitForTimeout(500); const g2 = await g();
    if (!g1 || g1 === g2) falla(donde, `el brillo del logo de la portada no se mueve (${g1} → ${g2})`); else ok('el brillo tornasol de la portada se mueve');
    await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; document.querySelector('#eleccion').scrollIntoView(); });
    await page.waitForTimeout(400);
    const raf = await page.evaluate(async () => { const a = window.__raf; await new Promise((r) => setTimeout(r, 800)); return window.__raf - a; });
    if (raf > 2) falla(donde, `sigue dibujando con los visuales fuera de pantalla (${raf} cuadros en 0,8 s)`); else ok('fuera de pantalla no dibuja nada');
    await page.focus('#tap');
    for (let i = 0; i < 8; i++) { await page.keyboard.press('Space'); if (i < 7) await page.waitForTimeout(462); }
    // la precisión ya la mide el tap con puntero; acá importa que cada tecla cuente una sola vez
    const bpm = Number(await page.textContent('#tap-bpm'));
    const golpes = await page.textContent('#tap-estado');
    if (!/^8 golpes/.test(golpes || '') || !(bpm >= 110 && bpm <= 145)) falla(donde, `el tap con la barra espaciadora: "${golpes}", ${bpm} BPM`); else ok(`tap con teclado: 8 golpes, ${bpm} BPM`);
    const agenda = await page.getAttribute('.fecha a.boton', 'href');
    if (agenda && !/^https:\/\/calendar\.google\.com\/calendar\/render\?action=TEMPLATE&text=[^&]+&dates=\d{8}\/\d{8}(&details=[^&]+)?$/.test(agenda)) falla(donde, 'link de agenda con formato raro: ' + agenda);
    else ok(agenda ? 'link de Google Calendar bien armado' : 'sin fechas próximas (no hay link de agenda)');
    const esArtifact = await page.evaluate(() => !!window.__ARTIFACT__);
    const visible = await page.isVisible('#escuchar');
    if (esArtifact) {
      const n = await page.locator('iframe').count();
      const href = await page.getAttribute('#abrir-spotify', 'href');
      if (visible || n || !/^https:\/\/open\.spotify\.com\/playlist\//.test(href || '')) falla(donde, 'en el Artifact tiene que haber solo el link a Spotify');
      else ok('Artifact: solo el link a Spotify, sin embed');
    } else {
      if (visible) await page.click('#escuchar');
      const src = visible ? await page.getAttribute('#spotify-marco iframe', 'src') : null;
      if (!/^https:\/\/open\.spotify\.com\/embed\/playlist\//.test(src || '')) falla(donde, 'en la web el botón «Escucharla acá» no arma el embed de Spotify');
      else ok('web: «Escucharla acá» arma el embed de Spotify');
    }
    errores.forEach((e) => falla(donde, e));
    await ctx.close();
  }
  // 2 · sin WebGL: la versión 2D pinta la portada
  {
    const { ctx, page, errores } = await contexto(browser, abrir, [SIN_WEBGL]);
    const r = await page.evaluate(() => {
      const c = document.querySelector('.portada-lienzo');
      const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
      let s = 0; for (let i = 0; i < d.length; i += 4) s += d[i] + d[i + 1] + d[i + 2];
      return { modo: c.dataset.modo, brillo: s / (d.length / 4) / 3 };
    });
    if (r.modo !== '2d' || !(r.brillo > 12)) falla(donde, `sin WebGL la portada no pinta (${r.modo}, brillo ${r.brillo.toFixed(1)})`); else ok('sin WebGL: la versión 2D pinta la portada');
    errores.forEach((e) => falla(donde, e));
    await ctx.close();
  }
  // 3 · localStorage bloqueado: se arma igual y se puede elegir
  {
    const { ctx, page, errores } = await contexto(browser, abrir, [SIN_STORAGE]);
    await page.click('[data-logo="sello"] [data-accion="gusta"]');
    await page.fill('#resp-origen', 'prueba');
    await page.waitForTimeout(300);
    const n = await page.locator('#logos .logo-dibujo svg').count();
    const forma = await page.getAttribute('#portada-svg', 'data-forma');
    if (n < 6 || forma !== 'sello' || errores.length) falla(donde, `con localStorage bloqueado: ${n} logos, portada ${forma}, ${errores.join(' | ')}`);
    else ok('con localStorage bloqueado se arma y responde');
    await ctx.close();
  }
}

// ── revisión estática del cuerpo del Artifact ──
function revisarArtifactEstatico(html) {
  const donde = 'artifact estático';
  console.log(`\n${donde}`);
  const mb = Buffer.byteLength(html) / 1048576;
  if (mb >= 16) falla(donde, `pesa ${mb.toFixed(1)} MB (máximo 16)`); else ok(`pesa ${mb.toFixed(2)} MB`);
  if (!/^\s*<title>/i.test(html)) falla(donde, 'no empieza con <title>'); else ok('empieza con <title>');
  if (/<!doctype|<html[\s>]|<head[\s>]|<body[\s>]/i.test(html)) falla(donde, 'trae <!doctype>/<html>/<head>/<body>');
  if (/<iframe/i.test(html)) falla(donde, 'contiene <iframe'); else ok('sin <iframe');
  if (/\sdownload(\s|=|>)/i.test(html)) falla(donde, 'contiene un atributo download'); else ok('sin atributo download');
  if (/window\.open\s*\(|\balert\s*\(|\bconfirm\s*\(|\bprompt\s*\(/.test(html)) falla(donde, 'usa window.open/alert/confirm/prompt');
  const malos = [];
  const re = /(?<![.\w-])(src|href)\s*=\s*["']?\s*(https?:)/gi; // atributos HTML, no asignaciones JS (a.href = ...)
  let m;
  while ((m = re.exec(html))) {
    const inicio = html.lastIndexOf('<', m.index);
    const tag = html.slice(inicio, inicio + 3).toLowerCase();
    if (tag !== '<a ' && !html.slice(inicio, m.index).toLowerCase().startsWith('<a\n')) malos.push(html.slice(inicio, m.index + 40).replace(/\s+/g, ' '));
  }
  if (/url\(\s*["']?https?:/i.test(html) || /@import\s+["']?https?:/i.test(html)) malos.push('url()/@import externo en CSS');
  if (malos.length) falla(donde, 'URLs externas fuera de <a href>: ' + malos.slice(0, 3).join(' | ')); else ok('solo hay URLs externas en <a href>');
  if (!/window\.__ARTIFACT__\s*=\s*true/.test(html)) avisos.push('el artifact no fija window.__ARTIFACT__ = true');
}

async function main() {
  const srv = await servir(PAGINA);
  const base = `http://127.0.0.1:${srv.address().port}/`;
  const browser = await chromium.launch();
  try {
    await pasada(browser, 'pagina', (p) => p.goto(base, { waitUntil: 'load' }), (u) => u.startsWith(base) || u.startsWith('data:') || u.startsWith('blob:'));
    if (existsSync(ARTIFACT)) {
      const cuerpo = readFileSync(ARTIFACT, 'utf8');
      revisarArtifactEstatico(cuerpo);
      const envuelto = `<!doctype html><html><head><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>${cuerpo}</body></html>`;
      await pasada(browser, 'artifact', (p) => p.setContent(envuelto, { waitUntil: 'load' }), (u) => u.startsWith('data:') || u.startsWith('blob:') || u === 'about:blank');
    } else {
      console.log('\n(no existe dist/identidad-artifact.html todavía: se saltea la parte del Artifact)');
    }
  } finally {
    await browser.close();
    srv.close();
  }
  avisos.forEach((a) => console.log('aviso: ' + a));
  console.log(`\n${fallas.length ? '✗ ' + fallas.length + ' fallas' : '✓ todo bien'} · capturas en ${path.relative(process.cwd(), CAPTURAS) || CAPTURAS}`);
  if (fallas.length) { fallas.forEach((f) => console.log('  ' + f)); process.exit(1); }
}

main().catch((e) => { console.error(e); process.exit(1); });
