// Utilidades del build de MADDA: leer archivos, embeber fuentes e imágenes y escapar.
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const PAGINA = path.join(DIR, 'pagina');
export const FUENTES = path.join(PAGINA, 'fonts');

const MIME = {
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mp3': 'audio/mpeg',
  '.m4a': 'audio/mp4',
};

export function leer(...partes) {
  return readFileSync(path.join(DIR, ...partes), 'utf8');
}

export function existe(...partes) {
  return existsSync(path.join(DIR, ...partes));
}

export const esRemoto = (url) => /^(?:[a-z]+:)?\/\//i.test(url);
const esEspecial = (url) => /^(?:data:|#|about:|blob:|javascript:|mailto:|tel:)/i.test(url);

// Archivo local → data URI (base64). Tira error si no existe o si el tipo no es conocido.
export function dataUri(archivo) {
  const tipo = MIME[path.extname(archivo).toLowerCase()];
  if (!tipo) throw new Error(`tipo de archivo desconocido: ${archivo}`);
  if (!existsSync(archivo)) throw new Error(`no existe: ${archivo}`);
  return `data:${tipo};base64,${readFileSync(archivo).toString('base64')}`;
}

// Saca ?query y #hash de una ruta local antes de buscar el archivo.
const rutaLocal = (base, url) => path.resolve(base, decodeURI(url.replace(/[?#].*$/, '')));

// Reescribe cada url(...) local del CSS como data URI. Lo remoto es un error.
export function embeberUrlsCss(css, base, errores, origen) {
  if (/@import\b/i.test(css)) errores.push(`${origen}: usa @import (pasalo a un <link> local)`);
  return css.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g, (todo, comilla, url) => {
    if (esEspecial(url)) return todo;
    if (esRemoto(url)) {
      errores.push(`${origen}: recurso externo en el CSS: ${url}`);
      return todo;
    }
    try {
      return `url(${dataUri(rutaLocal(base, url))})`;
    } catch (e) {
      errores.push(`${origen}: ${e.message}`);
      return todo;
    }
  });
}

// fonts.css de la página con cada woff2 embebido. Con `familias`, solo esas.
export function fuentesCss(familias) {
  const errores = [];
  let css = readFileSync(path.join(FUENTES, 'fonts.css'), 'utf8');
  if (familias) {
    const reglas = css.match(/@font-face\s*\{[^}]*\}/g) || [];
    css = reglas.filter((r) => familias.includes(familiaDe(r))).join('\n');
    const faltan = familias.filter((f) => !reglas.some((r) => familiaDe(r) === f));
    faltan.forEach((f) => errores.push(`fonts.css no tiene la familia "${f}"`));
  }
  css = embeberUrlsCss(css, FUENTES, errores, 'fonts.css');
  if (errores.length) throw new Error(errores.join('\n'));
  return css;
}

function familiaDe(regla) {
  const m = regla.match(/font-family\s*:\s*["']?([^"';]+?)["']?\s*;/);
  return m ? m[1] : '';
}

export function escaparHtml(texto) {
  return String(texto).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Para meter JS o JSON dentro de <script>: que nada cierre la etiqueta antes de tiempo.
export function escaparScript(js) {
  return js.replace(/<\/(script)/gi, '<\\/$1').replace(/<!--/g, '<\\!--');
}

export function escaparEstilo(css) {
  return css.replace(/<\/(style)/gi, '<\\/$1');
}

// "A · Logos y marcas" → "a-logos-y-marcas"
export function slug(texto) {
  return String(texto)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/&[a-z]+;/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function tamano(texto) {
  const bytes = Buffer.byteLength(texto);
  return bytes > 1024 * 1024 ? (bytes / 1024 / 1024).toFixed(2) + ' MB' : (bytes / 1024).toFixed(0) + ' KB';
}

// Atributos de una etiqueta HTML: <link rel="x" href=y defer> → { rel: 'x', href: 'y', defer: '' }
export function atributos(etiqueta) {
  const attrs = {};
  const cuerpo = etiqueta.replace(/^<\w+/, '').replace(/\/?>$/, '');
  for (const m of cuerpo.matchAll(/([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) {
    attrs[m[1].toLowerCase()] = m[2] ?? m[3] ?? m[4] ?? '';
  }
  return attrs;
}

export { MIME, rutaLocal };
