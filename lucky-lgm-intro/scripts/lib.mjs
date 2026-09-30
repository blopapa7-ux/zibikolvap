import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FONTS = path.resolve(DIR, '..', 'fonts');

// El HUD usa Anton y Montserrat, las mismas fuentes OFL del resto del repo.
const FACES = [
  ['Anton', 400, 'anton-400.woff2'],
  ['Montserrat', 600, 'montserrat-600.woff2'],
  ['Montserrat', 700, 'montserrat-700.woff2'],
  ['Montserrat', 800, 'montserrat-800.woff2'],
];

export function fontFaceCss() {
  return FACES.map(([family, weight, file]) => {
    const b64 = readFileSync(path.join(FONTS, file)).toString('base64');
    return `@font-face{font-family:"${family}";font-style:normal;font-weight:${weight};font-display:block;src:url(data:font/woff2;base64,${b64}) format("woff2")}`;
  }).join('\n');
}

export function leer(...partes) {
  return readFileSync(path.join(DIR, ...partes), 'utf8');
}
