import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const FACES = [
  ['Anton', 400, 'normal', 'anton-400.woff2'],
  ['Kaushan Script', 400, 'normal', 'kaushan-script-400.woff2'],
  ['Playfair Display', 600, 'italic', 'playfair-display-600-italic.woff2'],
  ['Montserrat', 600, 'normal', 'montserrat-600.woff2'],
  ['Montserrat', 700, 'normal', 'montserrat-700.woff2'],
  ['Montserrat', 800, 'normal', 'montserrat-800.woff2'],
];

// @font-face con las fuentes embebidas en base64 (licencia OFL, ver fonts/).
export function fontFaceCss() {
  return FACES.map(([family, weight, style, file]) => {
    const b64 = readFileSync(path.join(ROOT, 'fonts', file)).toString('base64');
    return `@font-face{font-family:"${family}";font-style:${style};font-weight:${weight};font-display:block;src:url(data:font/woff2;base64,${b64}) format("woff2")}`;
  }).join('\n');
}

export function readSrc(name) {
  return readFileSync(path.join(ROOT, 'src', name), 'utf8');
}
