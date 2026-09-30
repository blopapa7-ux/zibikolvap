// Exporta el HUD a PNG transparentes de 1080×1920, con el mismo motor que el estudio.
//
//   npm run lucky:render                          → lucky-lgm-intro/output/hud/*.png
//   npm run lucky:render -- --hoja                → además, hoja de contacto sobre fondo de ciudad
//   npm run lucky:render -- --preset lxlx         → lucky-lgm-intro/output/hud-lxlx/*.png
//   npm run lucky:render -- [--preset id] carpeta → a otra carpeta
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { DIR, fontFaceCss, leer } from './lib.mjs';

const args = process.argv.slice(2);
const hoja = args.includes('--hoja');
const k = args.indexOf('--preset');
const preset = k >= 0 ? args[k + 1] : 'lucky';
const carpeta = args.find((a, i) => !a.startsWith('--') && i !== k + 1);
const outDir = path.resolve(carpeta || path.join(DIR, 'output', preset === 'lucky' ? 'hud' : 'hud-' + preset));
mkdirSync(outDir, { recursive: true });

const html = `<!doctype html><html><head><meta charset="utf-8"><style>${fontFaceCss()}</style></head>
<body><script>${leer('hud', 'hud.js')}</script></body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent(html);
await page.evaluate(() => window.LuckyHUD.fontsReady());

const b64 = (dataUrl) => Buffer.from(dataUrl.slice(dataUrl.indexOf(',') + 1), 'base64');
const save = (name, dataUrl) => {
  writeFileSync(path.join(outDir, name), b64(dataUrl));
  console.log('✓', path.join(outDir, name));
};

const archivos = await page.evaluate((id) => window.LuckyHUD.PRESETS[id].piezas.map((p) => p.archivo), preset);
for (let i = 0; i < archivos.length; i++) {
  const png = await page.evaluate(
    ([id, i]) => {
      const { W, H, PRESETS, dibujar } = window.LuckyHUD;
      const c = document.createElement('canvas');
      c.width = W;
      c.height = H;
      dibujar(c.getContext('2d'), PRESETS[id].piezas[i], PRESETS[id].datos);
      return c.toDataURL('image/png');
    },
    [preset, i],
  );
  save(archivos[i] + '.png', png);
}

if (hoja) {
  // hoja de contacto: cada pieza sobre el fondo de ciudad, para revisar de un vistazo
  const sheet = await page.evaluate((id) => {
    const { W, H, PRESETS, dibujar, fondoCiudad } = window.LuckyHUD;
    const piezas = PRESETS[id].piezas;
    const cols = 5;
    const tw = 270;
    const th = 480;
    const rows = Math.ceil(piezas.length / cols);
    const out = document.createElement('canvas');
    out.width = cols * tw;
    out.height = rows * (th + 30);
    const g = out.getContext('2d');
    g.fillStyle = '#05061a';
    g.fillRect(0, 0, out.width, out.height);
    const fondo = document.createElement('canvas');
    fondo.width = W;
    fondo.height = H;
    const fg = fondo.getContext('2d');
    fondoCiudad(fg);
    fg.fillStyle = 'rgba(0,0,0,.35)';
    fg.fillRect(0, 0, W, H);
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    piezas.forEach((p, i) => {
      const x = (i % cols) * tw;
      const y = Math.floor(i / cols) * (th + 30);
      dibujar(c.getContext('2d'), p, PRESETS[id].datos);
      g.drawImage(fondo, x, y, tw, th);
      g.drawImage(c, x, y, tw, th);
      g.fillStyle = '#fff';
      g.font = '600 15px sans-serif';
      g.fillText(p.archivo, x + 6, y + th + 20);
    });
    return out.toDataURL('image/png');
  }, preset);
  save('hoja-de-contacto.png', sheet);
}

await browser.close();
