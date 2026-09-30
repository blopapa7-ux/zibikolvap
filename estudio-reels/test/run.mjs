// Prueba de punta a punta de estudio.html con un window.claude simulado.
// Uso: node estudio-reels/test/run.mjs <carpeta-fixture> [seed.json] [carpeta-capturas]
//   carpeta-fixture: la que arma make_fixture.py (contiene 01_MODELOS)
//   seed.json: opcional, { modelos: [[id, doc]], reels: [[id, doc]] }; si falta usa dos modelos de ejemplo
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const here = path.dirname(fileURLToPath(import.meta.url));
const [fixtureDir, seedPath, shotsDir = path.join(here, 'shots')] = process.argv.slice(2);
if (!fixtureDir) { console.error('Falta la carpeta fixture'); process.exit(2); }
fs.mkdirSync(shotsDir, { recursive: true });

const page = fs.readFileSync(path.join(here, '..', 'estudio.html'), 'utf8');
const skeleton = `<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{color-scheme:light;padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom)}body{margin:0;font:14px system-ui;background:#fafaf7}img{max-width:100%}[hidden]{display:none!important}</style></head><body>${page}</body></html>`;

let seed;
if (seedPath) seed = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
else {
  const mk = (id, n, cat) => [`${id}-${String(n).padStart(2, '0')}`, { modelo: id, n, cat, titulo: 'Idea ' + n, idea: 'Idea de ejemplo ' + n, fotoIdeal: 'Plano medio', fotoEN: 'medium shot', prompt: 'She slowly smiles. Everything moves at natural real-time speed.', hook: 'gancho', caption: 'caption #a', audio: 'tema', loop: n % 3 === 0, origen: 'base', estado: 'pendiente', vistas: null }];
  const cats = n => (n % 3 === 1 ? 'sexy' : n % 3 === 2 ? 'normal' : 'baile');
  seed = {
    modelos: [['camila-wang', { nombre: 'Camila Wang', orden: 1, edad: 22, look: 'Ejemplo', lookEN: 'example', estetica: 'Ejemplo', pilares: ['a', 'b'], serie: 'Ejemplo' }],
              ['naomi-tanaka', { nombre: 'Naomi Tanaka', orden: 2, edad: 23, look: 'Ejemplo', lookEN: 'example', estetica: 'Ejemplo', pilares: ['c'], serie: 'Ejemplo' }]],
    reels: ['camila-wang', 'naomi-tanaka'].flatMap(id => Array.from({ length: 20 }, (_, i) => mk(id, i + 1, cats(i + 1))))
  };
}
const docs = {};
for (const [id, d] of seed.modelos) docs['modelos/' + id] = d;
for (const [id, d] of seed.reels) docs['reels/' + id] = d;

// caras de prueba servidas en /_blob/<id>, como en claude.ai
const blobs = new Map();
const carasDir = process.env.CARAS;
if (carasDir && fs.existsSync(carasDir)) {
  for (const [id] of seed.modelos) {
    const f = path.join(carasDir, `cara-${id}.jpg`);
    if (fs.existsSync(f)) {
      const blobId = Buffer.from(id).toString('hex').padEnd(32, '0').slice(0, 32);
      blobs.set(blobId, fs.readFileSync(f));
      docs['modelos/' + id].cara = blobId;
    }
  }
}

const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url.startsWith('/?')) { res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); res.end(skeleton); return; }
  const m = req.url.match(/^\/_blob\/([0-9a-f]{32})$/);
  if (m && blobs.has(m[1])) { res.writeHead(200, { 'content-type': 'image/jpeg' }); res.end(blobs.get(m[1])); return; }
  res.writeHead(404); res.end('no');
}).listen(0);
const base = `http://127.0.0.1:${server.address().port}/`;

const mock = fs.readFileSync(path.join(here, 'mock-claude.js'), 'utf8');
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined });
const errors = [];
const fontFails = [];
let failures = 0;
const check = (ok, msg) => { console.log((ok ? '  ✓ ' : '  ✗ ') + msg); if (!ok) failures++; };

async function open(opts = {}) {
  const ctx = await browser.newContext({ viewport: opts.viewport || { width: 1280, height: 900 }, colorScheme: opts.dark ? 'dark' : 'light', deviceScaleFactor: 1, ignoreHTTPSErrors: true });
  await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: base });
  await ctx.addInitScript(`window.__SEED__ = ${JSON.stringify({ docs })};`);
  await ctx.addInitScript(mock);
  const p = await ctx.newPage();
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('console', msg => { if (msg.type() === 'error' && !/Failed to load resource/.test(msg.text())) errors.push('console: ' + msg.text()); });
  // las fuentes de Google pueden fallar detrás del proxy de pruebas: se avisan aparte, no son errores de la página
  p.on('requestfailed', r => (/fonts\.(googleapis|gstatic)\.com/.test(r.url()) ? fontFails : errors).push(r.url().slice(0, 100) + ' ' + (r.failure()?.errorText || '')));
  return { ctx, p };
}

// ---------- 1. Modelos ----------
console.log('Modelos');
{
  const { ctx, p } = await open();
  await p.goto(base);
  await p.waitForSelector('.mcard');
  const cards = await p.$$('.mcard');
  check(cards.length === seed.modelos.length, `muestra ${seed.modelos.length} tarjetas de modelo (${cards.length})`);
  const sum = await p.textContent('.sum');
  check(sum.includes(String(seed.reels.length)), 'el resumen cuenta todos los reels');
  check((await p.textContent('#sync')).includes('en la nube'), 'la píldora dice «en la nube»');
  await p.screenshot({ path: path.join(shotsDir, '01-modelos.png'), fullPage: true });

  // ---------- 2. Una modelo ----------
  console.log('Ficha y tomas');
  await cards[0].click();
  await p.waitForSelector('.toma');
  const first = seed.modelos[0][0];
  const tomas = await p.$$('.toma');
  check(tomas.length === 20, `20 tomas para ${first} (${tomas.length})`);
  const btn = await p.$('.toma [data-field="prompt"]');
  await btn.click();
  await p.waitForTimeout(150);
  const clip = await p.evaluate(() => navigator.clipboard.readText());
  const want = seed.reels.find(([id]) => id === `${first}-01`)[1].prompt;
  check(clip === want, '«Copiar prompt» copia el prompt exacto');
  await p.click(`.toma [data-estado="generado"][data-reel="${first}-01"]`);
  await p.waitForTimeout(100);
  const est = await p.evaluate(id => window.__dbLog.some(([op, pth]) => op === 'update' && pth === 'reels/' + id), `${first}-01`);
  check(est, 'marcar «Generado» escribe en la base');
  await p.waitForSelector(`.toma [data-estado="generado"][data-reel="${first}-01"].on`);
  check(true, 'el botón «Generado» queda marcado');
  await p.click('[data-fcat="baile"]');
  const nb = (await p.$$('.toma')).length;
  const wantB = seed.reels.filter(([, r]) => r.modelo === first && r.cat === 'baile').length;
  check(nb === wantB, `filtro Baile muestra ${wantB} (${nb})`);
  await p.click('[data-fcat="todas"]');
  await p.click(`.toma [data-estado="publicado"][data-reel="${first}-01"]`);
  await p.waitForSelector(`#v-${first}-01`);
  await p.fill(`#v-${first}-01`, '15300');
  await p.press(`#v-${first}-01`, 'Tab');
  await p.waitForTimeout(150);
  const vistas = await p.evaluate(id => window.__dbLog.filter(([op, pth]) => pth === 'reels/' + id).length, `${first}-01`);
  check(vistas >= 3, 'las vistas se guardan al salir del campo');
  await p.click('[data-act="edit-ficha"]');
  await p.fill('#f-edad', '19');
  await p.click('[data-act="save-ficha"]');
  await p.waitForTimeout(100);
  check((await p.textContent('#toast')).includes('21'), 'no deja guardar una edad menor a 21');
  await p.fill('#f-edad', '24');
  await p.click('[data-act="save-ficha"]');
  await p.waitForSelector('.dl');
  check((await p.textContent('.f-meta')).includes('24 años'), 'la ficha editada se guarda');
  await p.click('[data-act="txt-all"]');
  await p.waitForTimeout(100);
  const dl = await p.evaluate(() => window.__downloads || []);
  check(dl.some(d => d.filename === `${first}-reels.txt`), 'descarga el .txt de los 20 reels');
  await p.screenshot({ path: path.join(shotsDir, '02-modelo.png'), fullPage: false });
  await ctx.close();
}

// ---------- 3. Escanear, elegir, subir y analizar ----------
console.log('Escáner');
{
  const { ctx, p } = await open();
  await p.goto(base + '#escanear');
  await p.waitForSelector('#pick-dir', { state: 'attached' });
  await p.setInputFiles('#pick-dir', path.join(fixtureDir, '01_MODELOS'));
  await p.waitForSelector('#st-2 table');
  const rows = await p.$$eval('#st-2 tbody tr', trs => trs.map(t => t.innerText));
  check(rows.length === 5, `inventario con 5 carpetas (${rows.length})`);
  const status = await p.textContent('#scan-status');
  check(/fotos/.test(status) && /videos/.test(status), 'muestra totales de fotos y videos: ' + status);
  const checked = await p.$$eval('#st-2 input[type=checkbox]:checked', xs => xs.map(x => x.dataset.chk));
  check(checked.includes('camila-wang'), 'marca a Camila (tiene ficha y cara)');
  check(!checked.includes('marisa-kim'), 'no marca a Marisa (sin ficha ni cara)');
  check(!checked.includes('armado-calendario-instagram'), 'no marca carpetas de trabajo');
  await p.check('#chk-marisa-kim');
  await p.click('[data-act="pick"]');
  await p.waitForFunction(() => !document.querySelector('#sync').textContent.includes('eligiendo'), null, { timeout: 120000 });
  const counts = await p.$$eval('.selm', els => els.map(e => [e.querySelector('h4').textContent, e.querySelectorAll('.th').length]));
  console.log('    selección:', JSON.stringify(counts));
  const cam = counts.find(([n]) => n === 'Camila Wang');
  check(cam && cam[1] === 20, 'Camila: 20 fotos elegidas');
  const mar = counts.find(([n]) => n === 'Marisa Kim');
  check(mar && mar[1] === 8, 'Marisa: solo 8 (tiene 8)');
  const alts = await p.$$eval('.selm .th img', imgs => imgs.map(i => i.getAttribute('alt')));
  check(!alts.includes('CASUALES/chiquita.jpg'), 'saltea la foto chica');
  const camAlts = await p.$$eval('.selm', els => [...els.find(e => e.querySelector('h4').textContent === 'Camila Wang').querySelectorAll('.th img')].map(i => i.alt));
  check(!(camAlts.includes('CASUALES/IMG_1000.jpg') && camAlts.includes('CASUALES/IMG_1000 (copia).jpg')), 'no elige la misma foto dos veces');
  check(!camAlts.includes('cara.jpg'), 'la foto de cara no se usa como toma');
  const before = camAlts[0];
  await p.click('[data-swap="camila-wang"][data-idx="0"]');
  await p.waitForTimeout(400);
  const after = await p.$$eval('.selm', els => els.find(e => e.querySelector('h4').textContent === 'Camila Wang').querySelector('.th img').alt);
  check(before !== after, `↻ cambia la foto 01 (${before} → ${after})`);
  await p.screenshot({ path: path.join(shotsDir, '03-escanear.png'), fullPage: true });

  await p.click('[data-act="save-inv"]');
  await p.waitForFunction(() => window.__dbLog.some(([, pth]) => pth === 'inventario/_resumen'), null, { timeout: 20000 });
  check(true, 'guarda el inventario en la nube');

  await p.click('[data-act="upload"]');
  await p.waitForFunction(() => !document.querySelector('#sync').textContent.includes('subiendo'), null, { timeout: 120000 });
  const nf = await p.evaluate(() => window.__dbLog.filter(([op, pth]) => op === 'set' && pth.startsWith('fotos/camila-wang-')).length);
  check(nf === 20, `sube 20 fotos de Camila (${nf})`);
  const created = await p.evaluate(() => window.__dbLog.some(([op, pth]) => op === 'set' && pth === 'modelos/marisa-kim'));
  check(created, 'crea la ficha vacía de Marisa');
  const caraSet = await p.evaluate(() => window.__dbLog.some(([op, pth]) => op === 'update' && pth === 'modelos/camila-wang'));
  check(caraSet, 'sube la foto de cara de Camila');
  const nube = await p.$$eval('.selm .th .ok', xs => xs.length);
  check(nube >= 28, `marca NUBE en las fotos subidas (${nube})`);

  await p.click('[data-act="analyze"]');
  await p.waitForFunction(() => !document.querySelector('#sync').textContent.includes('escribiendo'), null, { timeout: 120000 });
  const calls = await p.evaluate(() => window.__sampleCalls.map(c => c.images));
  check(calls.length > 0 && calls.every(n => n > 0 && n <= 5), `llama a Claude con fotos de a 5 como máximo (${calls.join(',')})`);
  const reels = await p.evaluate(() => window.__dbLog.filter(([op, pth]) => op === 'set' && pth.startsWith('reels/camila-wang-')).map(([, pth]) => pth));
  check(new Set(reels).size === 20, `escribe 20 reels a medida para Camila (${new Set(reels).size})`);
  const marReels = await p.evaluate(() => window.__dbLog.filter(([op, pth]) => op === 'set' && pth.startsWith('reels/marisa-kim-')).length);
  check(marReels === 8, `Marisa sin ideas previas: 8 reels nuevos (${marReels})`);

  await p.goto(base + '#m-camila-wang');
  await p.waitForSelector('.toma .ph img');
  const withPhoto = await p.$$eval('.toma .ph img', xs => xs.length);
  check(withPhoto === 20, `las 20 tomas muestran su foto (${withPhoto})`);
  const alerta = await p.$$eval('.alerta', xs => xs.length);
  check(alerta >= 1, 'muestra la alerta de la foto con dos personas');
  const baseIdea = await p.$$eval('details.more summary', xs => xs.some(x => x.textContent.includes('Idea original')));
  check(baseIdea, 'guarda la idea original de la toma');
  await p.screenshot({ path: path.join(shotsDir, '04-modelo-con-fotos.png'), fullPage: false });
  await ctx.close();
}

// ---------- 4. Capturas en celular y modo oscuro ----------
console.log('Capturas');
for (const [name, opts, hash] of [
  ['05-movil-modelos', { viewport: { width: 390, height: 844 } }, ''],
  ['06-movil-modelo-oscuro', { viewport: { width: 390, height: 844 }, dark: true }, '#m-' + seed.modelos[0][0]],
  ['07-guia-oscuro', { dark: true }, '#guia'],
  ['08-movil-viral', { viewport: { width: 390, height: 844 } }, '#viral'],
  ['09-movil-escanear', { viewport: { width: 390, height: 844 } }, '#escanear']
]) {
  const { ctx, p } = await open(opts);
  await p.goto(base + hash);
  await p.waitForTimeout(600);
  const overflow = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  check(overflow <= 0, `${name}: sin scroll horizontal (${overflow}px)`);
  await p.screenshot({ path: path.join(shotsDir, name + '.png'), fullPage: name.includes('guia') });
  await ctx.close();
}

// ---------- 5. Sin claude.ai ----------
console.log('Fuera de claude.ai');
{
  const ctx = await browser.newContext();
  const p = await ctx.newPage();
  p.on('pageerror', e => errors.push('pageerror (sin claude): ' + e.message));
  await p.goto(base);
  await p.waitForSelector('.empty');
  check((await p.textContent('.empty h3')).includes('claude.ai'), 'explica que hay que abrirla desde claude.ai');
  check((await p.textContent('#sync')).includes('sin nube'), 'la píldora dice «sin nube»');
  await ctx.close();
}

await browser.close();
server.close();
if (fontFails.length) console.log(`(${fontFails.length} pedidos de fuentes de Google fallaron en el proxy de pruebas)`);
if (errors.length) { console.log('Errores de la página:'); for (const e of errors) console.log('  ' + e); }
console.log(failures || errors.length ? `\n${failures} fallas, ${errors.length} errores` : '\nTodo bien');
process.exit(failures || errors.length ? 1 : 0);
