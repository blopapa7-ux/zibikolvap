// Arma el estudio en un solo HTML con fuentes y scripts embebidos.
//   dist/estudio-legado.html  documento completo para abrir en cualquier navegador
//   dist/artifact.html        solo el contenido del <body>, para publicarlo como Artifact
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { ROOT, fontFaceCss, readSrc } from './lib.mjs';

const scripts = `<script>\n${readSrc('render.js')}\n</script>\n<script>\n${readSrc('app.js')}\n</script>`;
const body = readSrc('index.html')
  .replace('/*FONTS*/', () => fontFaceCss())
  .replace('<!--SCRIPTS-->', () => scripts);
const full = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<style>body{margin:0}</style>
</head>
<body>
${body}
</body>
</html>
`;

const dist = path.join(ROOT, 'dist');
mkdirSync(dist, { recursive: true });
writeFileSync(path.join(dist, 'estudio-legado.html'), full);
writeFileSync(path.join(dist, 'artifact.html'), body);
console.log('✓ dist/estudio-legado.html', (full.length / 1024).toFixed(0) + ' KB');
console.log('✓ dist/artifact.html', (body.length / 1024).toFixed(0) + ' KB');
