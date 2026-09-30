// Arma las páginas de "Misión Corrientes" a partir de la biblia (Markdown) y del HUD.
//   dist/artifact.html           biblia + estudio del HUD, solo el contenido, para publicarlo como Artifact
//   dist/mision-corrientes.html  lo mismo como documento completo, para abrir sin internet (con descargas)
//   dist/estudio-hud.html        solo el estudio del HUD, con descargas y .zip
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { marked } from 'marked';
import { DIR, fontFaceCss, leer } from './lib.mjs';

const SECCIONES = [
  ['historia', '01-historia.md'],
  ['referencias', '02-referencias.md'],
  ['personajes', '03-personajes.md'],
  ['escenarios', '04-escenarios-y-loot.md'],
  ['storyboard', '05-storyboard.md'],
  ['edicion', '06-edicion.md'],
  ['lxlx', '07-lxlx-zzz.md'],
];

const ETIQUETAS = { frame: 'Frame · Nano Banana Pro', video: 'Video · Kling · 7 s' };

function seccion(id, md, extra = '') {
  let html = marked.parse(md);
  // la página ya tiene su h1: cada archivo baja un nivel
  html = html.replace(/<(\/?)h([1-5])(?=[\s>])/g, (m, cierre, n) => `<${cierre}h${Number(n) + 1}`);
  html = html.replace(/<h2>(\d+) · ([^<]+)<\/h2>/, '<h2><span class="num">$1</span> $2</h2>');
  html = html.replace(
    /<pre><code class="language-(frame|video)">([\s\S]*?)<\/code><\/pre>/g,
    (m, tipo, codigo) =>
      `<div class="prompt" data-tipo="${tipo}"><div class="prompt-cab"><span>${ETIQUETAS[tipo]}</span>` +
      `<button type="button" class="copiar">Copiar</button></div><pre><code>${codigo.trimEnd()}</code></pre></div>`,
  );
  html = html.replace(/<table>/g, '<div class="tabla"><table>').replace(/<\/table>/g, '</table></div>');
  html = html.replace(/<a href="(https?:[^"]+)"/g, '<a href="$1" target="_blank" rel="noopener"');
  // cada ### del Markdown (ahora h4), con lo que sigue hasta el próximo título, es una ficha
  html = html
    .split(/(?=<h[234][\s>])/)
    .map((t) => {
      if (!t.startsWith('<h4')) return t;
      const toma = t.match(/^<h4>(T\d\d) · (.*?)( ★)?<\/h4>/);
      if (!toma) return `<article class="ficha">${t}</article>`;
      const [cab, num, nombre, corta] = toma;
      const titulo = `<h4><span class="t-num">${num}</span> ${nombre}${corta ? ' <span class="t-corta">★ Versión corta</span>' : ''}</h4>`;
      return `<article class="ficha toma" id="${num.toLowerCase()}">${titulo}${t.slice(cab.length)}</article>`;
    })
    .join('');
  return `<section id="${id}" class="seccion">\n${html}${extra}</section>`;
}

const estudio = leer('hud', 'estudio.html');
const bloqueHud = `<div id="hud" class="bloque-hud">
<h3>El HUD, para ver y editar acá</h3>
<p>Son 25 PNG transparentes de 1080×1920, uno por cada momento del video, ya ubicados para arrastrarlos a pantalla completa en CapCut. Cambiá el nombre, los textos o los números y mirá cómo queda. El pack original está en la carpeta <code>lucky-lgm-intro/output/hud</code> del repo.</p>
${estudio}</div>
`;

const biblia = SECCIONES.map(([id, archivo]) => seccion(id, leer('biblia', archivo), id === 'edicion' ? bloqueHud : '')).join('\n');
const estilos = [fontFaceCss(), leer('pagina', 'base.css'), leer('pagina', 'pagina.css'), leer('hud', 'estudio.css')].join('\n');
const scripts = (partes) => partes.map((s) => `<script>\n${s}\n</script>`).join('\n');

function pagina(modo) {
  const [cabeza, cuerpo] = leer('pagina', 'pagina.html')
    .replace('/*ESTILOS*/', () => estilos)
    .split('<!--CUERPO-->');
  const js = scripts([leer('hud', 'hud.js'), `window.HUD_MODO = '${modo}';`, leer('hud', 'app.js'), leer('pagina', 'pagina.js')]);
  return { cabeza, cuerpo: cuerpo.replace('<!--BIBLIA-->', () => biblia).replace('<!--SCRIPTS-->', () => js) };
}

function documento({ cabeza, cuerpo }) {
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
${cabeza}</head>
<body>
${cuerpo}</body>
</html>
`;
}

const soloEstudio = {
  cabeza: `<title>Estudio del HUD · Misión Corrientes</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap">
<style>
${estilos}
.portada-estudio { grid-template-columns: minmax(0, 1fr); padding-block: 40px 24px; }
.portada-estudio h1 { font-size: clamp(44px, 8vw, 80px); }
</style>
`,
  cuerpo: `<main class="pagina">
<header class="portada portada-estudio"><div>
<p class="volanta">Misión Corrientes · Lucky LGM</p>
<h1>Estudio del HUD</h1>
<p class="bajada">Cambiá los textos y bajá los PNG transparentes de 1080×1920 para CapCut, uno por uno o todos juntos.</p>
</div></header>
<div class="bloque-hud">
${estudio}</div>
</main>
${scripts([leer('hud', 'hud.js'), "window.HUD_MODO = 'local';", leer('hud', 'app.js')])}
`,
};

const dist = path.join(DIR, 'dist');
mkdirSync(dist, { recursive: true });
const escribir = (nombre, contenido) => {
  writeFileSync(path.join(dist, nombre), contenido);
  console.log('✓ dist/' + nombre, (contenido.length / 1024).toFixed(0) + ' KB');
};
const art = pagina('artifact');
escribir('artifact.html', art.cabeza + art.cuerpo);
escribir('mision-corrientes.html', documento(pagina('local')));
escribir('estudio-hud.html', documento(soloEstudio));
