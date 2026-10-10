// Arma las páginas de MADDA en dist/:
//   identidad-artifact.html  la página de identidad (pagina/index.html) con todo adentro, para publicarla como Artifact
//                            (lo marcado con data-solo-web queda solo en la versión web)
//   madda-estudio.html       el estudio de prompts (biblia/*.md) como documento completo, para abrir sin internet
//   estudio-artifact.html    el mismo estudio, solo el contenido, para publicarlo como Artifact
// Uso: node madda-dj/scripts/build.mjs
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { Marked } from 'marked';
import {
  DIR, PAGINA, atributos, dataUri, embeberUrlsCss, escaparEstilo, escaparHtml, escaparScript,
  esRemoto, existe, fuentesCss, leer, rutaLocal, slug, tamano,
} from './lib.mjs';

const LIMITE = 16 * 1024 * 1024;
const avisos = [];
const errores = [];
const aviso = (m) => avisos.push(m);

/* ───────────── página de identidad → Artifact ───────────── */

// rel de <link> que cargan algo (los demás son metadatos y se descartan)
const REL_RECURSO = /\b(stylesheet|icon|preload|prefetch|preconnect|dns-prefetch|modulepreload|manifest|apple-touch-icon)\b/i;
const TIPO_JS = /^(|text\/javascript|application\/javascript|module)$/i;
const ETIQUETAS = /<!--[\s\S]*?-->|<link\b[^>]*>|<style\b[^>]*>[\s\S]*?<\/style\s*>|<script\b[^>]*>[\s\S]*?<\/script\s*>|<meta\b[^>]*>|<base\b[^>]*>/gi;

function identidad() {
  if (!existe('pagina', 'index.html')) {
    aviso('pagina/index.html todavía no existe: no armo identidad-artifact.html');
    return null;
  }
  const html = leer('pagina', 'index.html');
  const cabeza = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1] ?? '';
  const cuerpo = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? html.replace(/^[\s\S]*<\/head>/i, '');
  const titulo = (cabeza || html).match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1].trim() || 'MADDA · Identidad';
  const estilos = [];
  const scripts = [];
  const err = (m) => errores.push('index.html: ' + m);

  const recorrer = (zona, enCuerpo) =>
    zona.replace(ETIQUETAS, (tag) => {
      if (tag.startsWith('<!--')) return enCuerpo ? tag : '';
      const nombre = tag.match(/^<(\w+)/)[1].toLowerCase();
      const a = atributos(tag.match(/^<[^>]*>/)[0]);
      if (nombre === 'base') err('tiene <base>: sacalo');
      if (nombre === 'meta') return enCuerpo && !/robots/i.test(a.name || '') ? tag : '';
      if (nombre === 'link') return linkDe(a, estilos, err);
      if (nombre === 'style') {
        const css = tag.replace(/^<style\b[^>]*>|<\/style\s*>$/gi, '');
        estilos.push(embeberUrlsCss(css, PAGINA, errores, 'index.html <style>'));
        return '';
      }
      if (/ld\+json/i.test(a.type || '')) return '';
      return scriptDe(tag, a, scripts, err) ? '' : enCuerpo ? tag : '';
    });

  recorrer(cabeza, false);
  let marcado = quitarSoloWeb(recorrer(cuerpo, true));
  marcado = revisarMarcado(marcado, err);
  revisarJs(scripts);

  const partes = [
    `<title>${titulo}</title>`,
    `<style>\n${escaparEstilo(estilos.join('\n'))}\n</style>`,
    marcado.trim(),
    '<script>window.__ARTIFACT__=true</script>',
    ...scripts.map(({ tipo, codigo }) => `<script${tipo ? ` type="${tipo}"` : ''}>\n${escaparScript(codigo)}\n</script>`),
  ];
  return partes.join('\n') + '\n';
}

function linkDe(a, estilos, err) {
  const href = a.href || '';
  const rel = a.rel || '';
  if (/\bstylesheet\b/i.test(rel)) {
    if (esRemoto(href) || !href) return err(`hoja de estilos externa o vacía: ${href}`), '';
    const archivo = rutaLocal(PAGINA, href);
    try {
      estilos.push(embeberUrlsCss(readFileSync(archivo, 'utf8'), path.dirname(archivo), errores, href));
    } catch (e) {
      err(`no pude leer ${href}: ${e.message}`);
    }
    return '';
  }
  if (REL_RECURSO.test(rel) && esRemoto(href)) err(`recurso externo <link rel="${rel}" href="${href}">`);
  return '';
}

// Devuelve true si el <script> se embebió (y hay que sacarlo del marcado).
function scriptDe(tag, a, scripts, err) {
  const tipo = (a.type || '').trim();
  if (!TIPO_JS.test(tipo)) return false;
  let codigo = tag.replace(/^<script\b[^>]*>|<\/script\s*>$/gi, '');
  if ('src' in a) {
    if (esRemoto(a.src)) return err(`script externo: ${a.src}`), true;
    try {
      codigo = readFileSync(rutaLocal(PAGINA, a.src), 'utf8');
    } catch (e) {
      return err(`no pude leer ${a.src}: ${e.message}`), true;
    }
  }
  if (/module/i.test(tipo) && /^\s*(import|export)\b/m.test(codigo)) err(`${a.src || 'script'} usa import/export: no se puede embeber`);
  scripts.push({ tipo: /module/i.test(tipo) ? 'module' : '', codigo, origen: a.src || 'inline' });
  return true;
}

// Embebe imágenes locales y frena todo lo que el Artifact no puede cargar.
function revisarMarcado(html, err) {
  for (const [re, que] of [
    [/<(iframe|embed|object|frame)\b/i, 'tiene iframe/embed/object: usá un link'],
    [/<a\b[^>]*\sdownload\b/i, 'tiene <a download>'],
    [/\s(?:src|srcset|poster|data-src)\s*=\s*["']?\s*(?:https?:)?\/\//i, 'carga un recurso externo (src/srcset/poster)'],
    [/@import\b/i, 'usa @import'],
  ]) {
    if (re.test(html)) err(que);
  }
  html = html.replace(/(<(?:img|source|video|audio|image|use)\b[^>]*?\s(?:src|poster|href|xlink:href)\s*=\s*)(["'])([^"']+)\2/gi, (todo, antes, q, url) => {
    if (/^(data:|#|https?:|blob:)/i.test(url)) return todo;
    try {
      return `${antes}${q}${dataUri(rutaLocal(PAGINA, url))}${q}`;
    } catch (e) {
      err(e.message);
      return todo;
    }
  });
  html = html.replace(/\ssrcset\s*=\s*(["'])([^"']+)\1/gi, (todo, q, lista) => {
    const nueva = lista.split(',').map((c) => {
      const [url, ...desc] = c.trim().split(/\s+/);
      if (/^(data:|https?:)/i.test(url)) return c.trim();
      try {
        return [dataUri(rutaLocal(PAGINA, url)), ...desc].join(' ');
      } catch (e) {
        err(e.message);
        return c.trim();
      }
    });
    return ` srcset=${q}${nueva.join(', ')}${q}`;
  });
  html = html.replace(/\sstyle\s*=\s*"([^"]*url\([^"]*)"/gi, (todo, css) => ` style="${embeberUrlsCss(css, PAGINA, errores, 'style=""')}"`);
  // un link a un archivo local no anda en el Artifact: queda el texto, sin link
  html = html.replace(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi, (todo, attrs, texto) => {
    const a = atributos(`<a${attrs}>`);
    const href = a.href ?? '';
    if (!href || /^(#|mailto:|tel:|sms:)/i.test(href)) return todo;
    if (/^https?:\/\//i.test(href)) {
      if (a.target !== '_blank') aviso(`index.html: el link ${href} no tiene target="_blank"`);
      return todo;
    }
    if (esRemoto(href) || /^[a-z]+:/i.test(href)) return err(`link raro: ${href}`), todo;
    aviso(`index.html: el link a ${href} no anda en el Artifact; queda solo el texto (marcalo con data-solo-web para sacarlo)`);
    return `<span class="link-local">${texto}</span>`;
  });
  return html;
}

// Saca del Artifact cada elemento marcado con data-solo-web (y todo lo que tiene adentro).
function quitarSoloWeb(html) {
  const re = /<([a-z][\w-]*)\b[^>]*\sdata-solo-web\b[^>]*>/i;
  for (let m = html.match(re); m; m = html.match(re)) {
    const tag = m[1].toLowerCase();
    const inicio = m.index;
    let fin = inicio + m[0].length;
    if (!/\/>$/.test(m[0]) && !/^(img|br|hr|input|meta|link|source)$/.test(tag)) {
      const par = new RegExp(`<(/?)${tag}\\b[^>]*>`, 'gi');
      par.lastIndex = fin;
      let nivel = 1;
      for (let t = par.exec(html); t && nivel; t = par.exec(html)) {
        nivel += t[1] ? -1 : 1;
        fin = par.lastIndex;
      }
    }
    html = html.slice(0, inicio) + html.slice(fin);
  }
  return html;
}

function revisarJs(scripts) {
  const reglas = [
    [/window\.open\s*\(/, 'window.open (usá <a target=_blank>)'],
    [/(^|[^.\w$])(alert|confirm|prompt)\s*\(/m, 'alert/confirm/prompt'],
    [/\bfetch\s*\(|XMLHttpRequest|new\s+WebSocket|new\s+EventSource/, 'pedidos de red'],
    [/\.download\s*=|setAttribute\(\s*['"]download/, 'descargas por script'],
    [/createElement\(\s*['"](iframe|embed|object)/i, 'crea iframes: que no corra con window.__ARTIFACT__', true],
  ];
  for (const { codigo, origen } of scripts) {
    const cuida = codigo.includes('__ARTIFACT__');
    for (const [re, que, conGuarda] of reglas) if (re.test(codigo) && !(conGuarda && cuida)) aviso(`${origen}: ${que}`);
  }
}

/* ───────────── estudio de prompts ───────────── */

const MOTORES = { nb2: 'Nano Banana 2 · 2K', kling: 'Kling 3.0' };
// chips que ya dice la etiqueta del motor
const CHIP_REPETIDO = /^(nb2|nano banana 2|kling(\s*3(\.0)?)?|2k)$/i;
const SECCIONES = [
  ['01', 'Guía'],
  ['02', 'Identidad'],
  ['03', 'Nano Banana 2'],
  ['04', 'Kling'],
  ['05', 'Página'],
];
const FUENTES_ESTUDIO = ['Unbounded', 'Hanken Grotesk', 'JetBrains Mono'];
const BIBLIA_VACIA = `<section class="seccion seccion-vacia"><h2>Todavía no hay prompts</h2>
<p>Los prompts salen de <code>madda-dj/biblia/03-prompts-nb2.md</code> y <code>04-prompts-kling.md</code>. Cuando estén, volvé a correr <code>node madda-dj/scripts/build.mjs</code>.</p></section>`;

const tokens = JSON.parse(leer('estudio', 'tokens.json'));
const CAMPOS = Object.fromEntries(tokens.campos.map((c) => [c.token, c]));

function archivosBiblia() {
  const hay = existe('biblia') ? readdirSync(path.join(DIR, 'biblia')) : [];
  return SECCIONES.flatMap(([pre, corto]) => {
    const archivo = hay.filter((f) => f.startsWith(pre + '-') && f.endsWith('.md')).sort()[0];
    if (!archivo) {
      aviso(`falta biblia/${pre}-*.md: la sección "${corto}" no va`);
      return [];
    }
    return [{ archivo: 'biblia/' + archivo, id: slug(archivo.replace(/^\d+-|\.md$/g, '')), corto }];
  });
}

// {{TOKEN}} → <span> con el valor por defecto; el estudio lo cambia en vivo.
function tokenizar(codigoHtml, estado) {
  return codigoHtml.replace(/\{\{\s*([A-Z0-9_]+)\s*\}\}/g, (todo, tk) => {
    estado.usados.add(tk);
    const campo = CAMPOS[tk];
    if (!campo) {
      estado.desconocidos.add(tk);
      return `<span class="tk tk-x" data-tk="${tk}">{{${tk}}}</span>`;
    }
    const color = campo.tipo === 'color' ? ` tk-color" style="--sw:${campo.valor}` : '';
    return `<span class="tk${color}" data-tk="${tk}">${escaparHtml(campo.valor)}</span>`;
  });
}

function crearMarked(estado) {
  const md = new Marked({ gfm: true });
  md.use({
    renderer: {
      // cada archivo baja un nivel: la página ya tiene su h1
      heading({ tokens: t, depth }) {
        const n = Math.min(depth + 1, 6);
        return `<h${n}>${this.parser.parseInline(t)}</h${n}>\n`;
      },
      code({ text, lang }) {
        const tipo = (lang || '').trim().split(/\s+/)[0].toLowerCase();
        if (!MOTORES[tipo]) return false;
        const k = estado.bloques++;
        // los rótulos en mayúscula al principio de línea (SCENE:, CAMERA:…) se ven más fuertes; el texto copiado no cambia
        const codigo = tokenizar(escaparHtml(text.trim()), estado).replace(/^([A-Z][A-Z0-9 /&'-]{1,30}:)/gm, '<span class="rotulo">$1</span>');
        return `<div class="prompt" data-tipo="${tipo}" data-id="__P${k}__">
<div class="prompt-cab"><span class="motor">${MOTORES[tipo]}</span><button type="button" class="copiar" aria-label="Copiar el prompt __P${k}__">Copiar</button></div>
<!--CHIPS-->
<pre class="prompt-texto"><code>${codigo}</code></pre>
<div class="prompt-pie"><label class="hecho"><input type="checkbox" data-hecho="__P${k}__"><span>Hecho</span></label><span class="prompt-nota">Marcalo cuando lo tengas</span></div>
</div>\n`;
      },
    },
  });
  return md;
}

function chipsHtml(linea) {
  const chips = linea.split(/\s+·\s+/).map((c) => c.trim()).filter((c) => c && !CHIP_REPETIDO.test(c));
  if (!chips.length) return '';
  const clase = (c) =>
    /^referencias?\b/i.test(c) ? (/ninguna/i.test(c) ? 'chip chip-ref' : 'chip chip-ref chip-ref-si') : /^\d+:\d+$/.test(c) ? 'chip chip-formato' : 'chip';
  return `<ul class="chips" aria-label="Ajustes">${chips.map((c) => `<li class="${clase(c)}">${c}</li>`).join('')}</ul>\n`;
}

const REF = /^([A-Z]{1,4}-[A-Z0-9]{1,6})\s*·\s*(.+)$/;

// ids de la página sin repetir (dos ## iguales en un archivo, por ejemplo)
function unico(id, estado) {
  let final = id || 'x';
  for (let n = 2; estado.ids.has(final); n++) final = `${id}-${n}`;
  estado.ids.add(final);
  return final;
}

// Un ### con id de prompt (ahora h4) y todo lo que sigue hasta el próximo título: una ficha.
function ficha(trozo, estado) {
  const cab = trozo.match(/^<h4>([\s\S]*?)<\/h4>\n?/);
  const m = cab && cab[1].match(REF);
  if (!m) return null;
  let [, ref, nombre] = m;
  if (estado.refs.has(ref)) {
    errores.push(`id de prompt repetido: ${ref}`);
    ref = `${ref}-${estado.refs.size}`;
  }
  estado.refs.add(ref);
  let resto = trozo.slice(cab[0].length);
  let chips = '';
  resto = resto.replace(/<p><strong>((?:(?!<\/strong>)[\s\S])+)<\/strong><\/p>\n?/, (todo, linea) => {
    if (/^tip:?$/i.test(linea.trim())) return todo;
    chips = chipsHtml(linea);
    return '';
  });
  resto = resto.replace(/<p><strong>Tip:?<\/strong>:?/gi, '<p class="tip"><strong>Tip</strong>');
  const placeholders = [...new Set(resto.match(/__P\d+__/g) || [])];
  placeholders.forEach((p, i) => {
    resto = resto.split(p).join(i ? `${ref}-${i + 1}` : ref);
  });
  if (placeholders.length > 1) aviso(`${ref} tiene ${placeholders.length} prompts (el formato pide uno)`);
  if (!placeholders.length) aviso(`${ref} no tiene bloque nb2/kling`);
  resto = placeholders.length ? resto.replace('<!--CHIPS-->', () => chips) : chips + resto;
  resto = resto.replace(/<!--CHIPS-->\n?/g, '');
  const tipo = resto.match(/class="prompt" data-tipo="(\w+)"/)?.[1] || 'nota';
  const item = { ref, id: unico(slug(ref), estado), nombre: nombre.replace(/<[^>]+>/g, ''), tipo, prompts: placeholders.length };
  const html = `<article class="ficha" id="${item.id}" data-ref="${ref}" data-tipo="${tipo}">
<header class="ficha-cab"><h4><span class="ficha-id">${ref}</span> <span class="ficha-nombre">${nombre}</span></h4><span class="ficha-estado">Hecho</span></header>
${resto.trim()}
</article>\n`;
  return { html, item };
}

function seccion({ archivo, id, corto }, estado) {
  let html = crearMarked(estado).parse(readFileSync(path.join(DIR, archivo), 'utf8'));
  const info = { id, corto, num: '', titulo: corto, grupos: [] };
  html = html.replace(/<h2>(?:(\d+) · )?([\s\S]*?)<\/h2>/, (todo, num, titulo) => {
    info.num = num || '';
    info.titulo = titulo.replace(/<[^>]+>/g, '');
    return `<h2>${num ? `<span class="num">${num}</span> ` : ''}${titulo}</h2>`;
  });
  html = html.replace(/<table>/g, '<div class="tabla"><table>').replace(/<\/table>/g, '</table></div>');
  html = html.replace(/<a href="(https?:[^"]+)"/g, '<a href="$1" target="_blank" rel="noopener"');

  let salida = '';
  let grupo = null;
  const cerrarGrupo = () => {
    if (grupo) salida += '</div>\n';
    grupo = null;
  };
  for (const t of html.split(/(?=<h[234][\s>])/)) {
    if (/^<h[23]/.test(t)) cerrarGrupo();
    if (t.startsWith('<h3')) {
      const texto = t.match(/^<h3>([\s\S]*?)<\/h3>/)[1];
      const m = texto.match(/^([A-Z0-9]{1,3}) · ([\s\S]+)$/);
      grupo = { id: unico(`${id}-${slug(texto)}`, estado), letra: m ? m[1] : '', titulo: (m ? m[2] : texto).replace(/<[^>]+>/g, ''), fichas: [] };
      info.grupos.push(grupo);
      const h3 = m ? `<h3><span class="letra">${m[1]}</span> ${m[2]}</h3>` : `<h3>${texto}</h3>`;
      salida += `<div class="grupo" id="${grupo.id}">\n` + t.replace(/^<h3>[\s\S]*?<\/h3>/, h3);
      continue;
    }
    const f = t.startsWith('<h4') && ficha(t, estado);
    if (!f) {
      salida += t;
      continue;
    }
    if (!grupo) {
      grupo = { id: unico(`${id}-prompts`, estado), letra: '', titulo: '', fichas: [], suelto: true };
      info.grupos.push(grupo);
      salida += `<div class="grupo" id="${grupo.id}">\n`;
    }
    grupo.fichas.push(f.item);
    salida += f.html;
  }
  cerrarGrupo();
  // prompts fuera de una ficha: igual se pueden copiar y marcar
  salida = salida.replace(/__P(\d+)__/g, (t, k) => `P${Number(k) + 1}`).replace(/<!--CHIPS-->\n?/g, '');
  info.grupos = info.grupos.filter((g) => g.fichas.length || !g.suelto);
  return { html: `<section class="seccion" id="${id}" aria-labelledby="${id}-titulo">\n${salida.replace('<h2>', `<h2 id="${id}-titulo">`)}</section>\n`, info };
}

function indiceHtml(infos) {
  const fila = (s) => {
    const fichas = s.grupos.flatMap((g) => g.fichas).filter((f) => f.prompts);
    const cuenta = fichas.length ? `<span class="indice-cuenta" data-cuenta-sec="${s.id}">0/${fichas.length}</span>` : '';
    const grupos = s.grupos
      .filter((g) => g.fichas.length)
      .map((g) => {
        const pild = g.fichas
          .map((f) => `<a class="pildora" href="#${f.id}" data-ref="${f.ref}" data-tipo="${f.tipo}" title="${escaparHtml(f.ref + ' · ' + f.nombre)}">${f.ref.replace(/^[A-Z]+-/, '')}</a>`)
          .join('');
        const nombre = g.titulo ? `<a class="indice-grupo" href="#${g.id}">${g.letra ? g.letra + ' · ' : ''}${g.titulo}</a>` : '';
        return `<li>${nombre}<span class="pildoras">${pild}</span></li>`;
      })
      .join('');
    return `<li class="indice-sec" data-sec="${s.id}"><div class="indice-fila"><a href="#${s.id}">${s.num ? `<span class="num">${s.num}</span>` : ''}${s.titulo}</a>${cuenta}</div>${grupos ? `<ul class="indice-grupos">${grupos}</ul>` : ''}</li>`;
  };
  return `<nav class="indice" aria-labelledby="indice-titulo">
<div class="indice-cab"><h2 id="indice-titulo" class="titulo-chico">Índice</h2><button type="button" class="indice-abrir" aria-expanded="false">Ver todas las fichas</button></div>
<ol class="indice-lista">${infos.map(fila).join('')}</ol>
</nav>`;
}

function datosHtml() {
  const paletas = tokens.paletas
    .map((p, i) => {
      const vars = `--a:${p.C1};--b:${p.C2};--c:${p.C3};--f:${p.FONDO}`;
      return `<button type="button" class="paleta" data-paleta="${i}" aria-pressed="${i === 0}"><span class="paleta-muestra" style="${vars}"></span><span class="paleta-nombre">${p.nombre}</span><span class="paleta-nota">${p.nota}</span></button>`;
    })
    .join('');
  const grupos = [...new Set(tokens.campos.map((c) => c.grupo))];
  const campo = (c) => {
    const ayuda = c.ayuda ? `<p class="campo-ayuda" id="ay-${c.token}">${c.ayuda}</p>` : '';
    const describe = c.ayuda ? ` aria-describedby="ay-${c.token}"` : '';
    const etiqueta = `<div class="campo-cab"><label for="f-${c.token}">${c.etiqueta}</label><code class="campo-token">{{${c.token}}}</code></div>`;
    const texto = `<input id="f-${c.token}" type="text" data-token="${c.token}" value="${escaparHtml(c.valor)}" autocomplete="off" spellcheck="false"${describe}${c.tipo === 'color' ? ' maxlength="7" class="hex"' : ''}>`;
    if (c.tipo === 'color') {
      return `<div class="campo campo-color">${etiqueta}<div class="color-fila"><input type="color" data-color="${c.token}" value="${c.valor.toLowerCase()}" aria-label="Elegir ${c.etiqueta.toLowerCase()}">${texto}</div>${ayuda}</div>`;
    }
    if (c.token === 'DELETREO') {
      return `<div class="campo">${etiqueta}<div class="deletreo-fila">${texto}<button type="button" class="auto" data-auto aria-pressed="true" title="Armar el deletreo con el nombre">Auto</button></div>${ayuda}</div>`;
    }
    return `<div class="campo">${etiqueta}${texto}${ayuda}</div>`;
  };
  const v = Object.fromEntries(tokens.campos.map((c) => [c.token, c.valor]));
  const muestra = `<div class="muestra" aria-hidden="true" style="--m1:${v.C1};--m2:${v.C2};--m3:${v.C3};--mf:${v.FONDO}">
<span class="muestra-nombre" data-muestra="NOMBRE">${escaparHtml(v.NOMBRE)}</span>
<span class="muestra-linea"><span data-muestra="FECHA">${escaparHtml(v.FECHA)}</span> · <span data-muestra="LUGAR">${escaparHtml(v.LUGAR)}</span></span>
</div>`;
  return `<section class="datos" id="datos" aria-labelledby="datos-titulo">
<div class="datos-cab"><h2 id="datos-titulo">Datos de <span data-muestra="NOMBRE">${escaparHtml(v.NOMBRE)}</span></h2><button type="button" class="datos-abrir" aria-expanded="false" aria-controls="datos-cuerpo">Editar</button></div>
${muestra}
<div class="datos-cuerpo" id="datos-cuerpo">
<fieldset class="grupo-campos"><legend>Paleta</legend><div class="paletas">${paletas}</div></fieldset>
${grupos.map((g) => `<fieldset class="grupo-campos"><legend>${g}</legend>${tokens.campos.filter((c) => c.grupo === g).map(campo).join('')}</fieldset>`).join('\n')}
<div class="datos-acciones"><button type="button" class="restablecer" data-restablecer>Restablecer</button><p class="datos-nota">Se guarda solo en este navegador.</p></div>
</div>
</section>`;
}

function estudio() {
  const estado = { bloques: 0, refs: new Set(), ids: new Set(), usados: new Set(), desconocidos: new Set() };
  const partes = archivosBiblia().map((a) => seccion(a, estado));
  const infos = partes.map((p) => p.info);
  const fichas = infos.flatMap((s) => s.grupos.flatMap((g) => g.fichas));
  const total = fichas.reduce((n, f) => n + f.prompts, 0);
  const sueltos = estado.bloques - total;
  if (sueltos) aviso(`${sueltos} prompt(s) fuera de una ficha ### con id`);
  if (estado.desconocidos.size) aviso(`tokens sin campo en el estudio: ${[...estado.desconocidos].join(', ')}`);
  const cuenta = (tipo) => fichas.filter((f) => !tipo || f.tipo === tipo).reduce((n, f) => n + f.prompts, 0) + (tipo ? 0 : sueltos);

  const nav = infos.map((s) => `<a href="#${s.id}">${s.corto}</a>`).join('');
  const estilos = [fuentesCss(FUENTES_ESTUDIO), leer('estudio', 'estudio.css')].join('\n');
  const datosJs = `window.MADDA_ESTUDIO=${JSON.stringify({ campos: tokens.campos, paletas: tokens.paletas })};`;
  const js = [datosJs, leer('estudio', 'estudio.js')].map((s) => `<script>\n${escaparScript(s)}\n</script>`).join('\n');
  const [cabeza, cuerpo] = leer('estudio', 'estudio.html').split('<!--CUERPO-->');
  const relleno = {
    '/*ESTILOS*/': escaparEstilo(estilos),
    '<!--NAV-->': nav,
    '<!--DATOS-->': datosHtml(),
    '<!--INDICE-->': infos.length ? indiceHtml(infos) : '',
    '<!--BIBLIA-->': partes.length ? partes.map((p) => p.html).join('\n') : BIBLIA_VACIA,
    '<!--SCRIPTS-->': js,
    '<!--TOTAL-->': String(estado.bloques),
    '<!--N-NB2-->': String(cuenta('nb2')),
    '<!--N-KLING-->': String(cuenta('kling')),
  };
  const llenar = (s) => Object.entries(relleno).reduce((acc, [marca, valor]) => acc.split(marca).join(valor), s);
  console.log(`  estudio: ${partes.length} sección(es), ${estado.bloques} prompts (${cuenta('nb2')} NB2 · ${cuenta('kling')} Kling), tokens: ${[...estado.usados].join(' ') || 'ninguno'}`);
  return { cabeza: llenar(cabeza).trim(), cuerpo: llenar(cuerpo).trim() };
}

function documento(cabeza, cuerpo) {
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="noindex">
${cabeza}
</head>
<body>
${cuerpo}
</body>
</html>
`;
}

/* ───────────── salida ───────────── */

const dist = path.join(DIR, 'dist');
mkdirSync(dist, { recursive: true });
console.log('MADDA · build');
// cada salida se escribe si no tuvo errores; si alguna falló, el build termina con código 1
function armar(nombres, fn) {
  const antes = errores.length;
  let res = null;
  try {
    res = fn();
  } catch (e) {
    errores.push(e.stack || e.message);
  }
  if (!res) return;
  const mal = errores.length > antes;
  nombres.forEach((nombre, i) => {
    const contenido = res[i];
    if (Buffer.byteLength(contenido) > LIMITE) errores.push(`${nombre} pesa más de 16 MB`);
    if (mal || errores.length > antes) {
      // mejor sin archivo que con uno viejo que alguien publique por error
      rmSync(path.join(dist, nombre), { force: true });
      return console.error(`✗ dist/${nombre} no se escribió (y borré la versión anterior)`);
    }
    writeFileSync(path.join(dist, nombre), contenido);
    console.log(`✓ dist/${nombre}`, tamano(contenido));
  });
}

armar(['identidad-artifact.html'], () => {
  const html = identidad();
  return html && [html];
});
armar(['madda-estudio.html', 'estudio-artifact.html'], () => {
  const { cabeza, cuerpo } = estudio();
  return [documento(cabeza, cuerpo), `${cabeza}\n${cuerpo}\n`];
});
avisos.forEach((m) => console.warn('  ! ' + m));
if (errores.length) {
  errores.forEach((m) => console.error('  ✗ ' + m));
  process.exit(1);
}
