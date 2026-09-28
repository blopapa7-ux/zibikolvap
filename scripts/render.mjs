// Exporta las tres piezas con el mismo motor que usa el estudio web.
//
//   npm run render             → output/*.png + output/03-reel.mp4
//   npm run preview [carpeta]  → PNG de la tarjeta, el collage y una hoja de
//                                 contacto del reel (sin video)
//
// Opcional: FFMPEG=/ruta/a/ffmpeg (con libx264). Por defecto usa "ffmpeg".
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { ROOT, fontFaceCss, readSrc } from './lib.mjs';

const args = process.argv.slice(2);
const preview = args.includes('--preview');
const outDir = path.resolve(args.find((a) => !a.startsWith('--')) || path.join(ROOT, 'output'));
const FPS = 30;
mkdirSync(outDir, { recursive: true });

const html = `<!doctype html><html><head><meta charset="utf-8"><style>${fontFaceCss()}</style></head>
<body><script>${readSrc('render.js')}</script></body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent(html);
await page.evaluate(() => window.Legado.fontsReady());
await page.evaluate(() => {
  window.__canvas = (w, h) => {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    return c;
  };
  window.__still = (kind) => {
    const { w, h } = Legado.SIZES[kind];
    const c = __canvas(w, h);
    const draw = kind === 'card' ? Legado.drawCard : Legado.drawCollage;
    draw(c.getContext('2d'), {}, []);
    return c.toDataURL('image/png');
  };
  window.__reel = null;
  window.__frame = (t, type = 'image/jpeg', q = 0.94) => {
    if (!window.__reel) window.__reel = __canvas(1080, 1920);
    Legado.drawReelFrame(window.__reel.getContext('2d'), t, {}, []);
    return window.__reel.toDataURL(type, q);
  };
});

const b64 = (dataUrl) => Buffer.from(dataUrl.slice(dataUrl.indexOf(',') + 1), 'base64');
const save = (name, dataUrl) => {
  writeFileSync(path.join(outDir, name), b64(dataUrl));
  console.log('✓', path.join(outDir, name));
};

save('01-tarjeta-frase.png', await page.evaluate(() => __still('card')));
save('02-collage.png', await page.evaluate(() => __still('collage')));

const duration = await page.evaluate(() => Legado.reelDuration({}));
save('03-reel-portada.png', await page.evaluate(() => __frame(5.6, 'image/png')));

if (preview) {
  // hoja de contacto: 16 cuadros repartidos en el reel
  const sheet = await page.evaluate(async (dur) => {
    const cols = 8, rows = 2, tw = 270, th = 480;
    const out = __canvas(cols * tw, rows * th);
    const g = out.getContext('2d');
    const c = __canvas(1080, 1920);
    for (let i = 0; i < cols * rows; i++) {
      const t = (i + 0.5) * (dur / (cols * rows));
      Legado.drawReelFrame(c.getContext('2d'), t, {}, []);
      g.drawImage(c, (i % cols) * tw, Math.floor(i / cols) * th, tw, th);
      g.fillStyle = '#fff';
      g.font = '600 20px sans-serif';
      g.fillText(t.toFixed(1) + 's', (i % cols) * tw + 8, Math.floor(i / cols) * th + 26);
    }
    return out.toDataURL('image/png');
  }, duration);
  save('reel-hoja-de-contacto.png', sheet);
} else {
  const ffmpeg = process.env.FFMPEG || 'ffmpeg';
  const target = path.join(outDir, '03-reel.mp4');
  const ff = spawn(ffmpeg, [
    '-y', '-loglevel', 'error',
    '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '19', '-pix_fmt', 'yuv420p',
    '-profile:v', 'high', '-level', '4.2', '-r', String(FPS), '-movflags', '+faststart',
    target,
  ], { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((res, rej) => ff.on('close', (code) => (code === 0 ? res() : rej(new Error('ffmpeg salió con código ' + code)))));
  const frames = Math.round(duration * FPS);
  for (let i = 0; i < frames; i++) {
    const buf = b64(await page.evaluate((t) => __frame(t), i / FPS));
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    if (i % 60 === 0) process.stdout.write(`  cuadro ${i}/${frames}\r`);
  }
  ff.stdin.end();
  await done;
  console.log('✓', target, `(${duration.toFixed(1)} s, ${frames} cuadros)`);
}

await browser.close();
