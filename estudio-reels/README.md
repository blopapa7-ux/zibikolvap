# Estudio de Reels SZ

Una página para pasar de la carpeta `01_MODELOS` a reels de 7 segundos en Kling 3.0: elige 20 fotos de cada modelo, guarda el inventario en la nube, escribe un prompt realista para cada foto y lleva la cuenta de qué reel está generado, editado o publicado.

La página se publica como Artifact en claude.ai (privado). Las fichas, los 140 reels, las fotos subidas y los estados viven en la base de datos de ese Artifact, **no en este repo**: el repo es público y acá solo está el código.

## Qué hace cada pestaña

| Pestaña | Para qué |
| --- | --- |
| Modelos | Una tarjeta por modelo con su cara, su ficha y el avance de sus 20 reels. Adentro, cada reel es una «toma» con la foto de inicio, el prompt para copiar, el texto en pantalla, el caption, el audio sugerido y el estado. |
| Escanear disco | Desde la compu (Chrome o Edge): elegís `01_MODELOS`, cuenta carpetas, fotos y videos, marca las modelos con ficha o foto de cara, elige 20 fotos distintas de cada una, las sube a la nube y le pide a Claude un prompt a medida por foto. |
| Guía Kling 3.0 | Ajustes (imagen a video, 7 s, 9:16, sonido apagado), la fórmula de los prompts, cómo evitar que se muevan rápido o hablen, bailes con Motion Control, problemas comunes y el negative prompt. |
| Viralizar | Lógica de los reels de 7 s en loop, edición en CapCut, ganchos, calendario de 3 semanas, métricas y qué hunde el alcance. |

## Cómo elige las 20 fotos

1. Descarta fotos de menos de 40 KB, de menos de 600 px del lado corto, formatos que el navegador no abre (HEIC, TIFF) y la foto de cara.
2. Reparte entre subcarpetas (por ejemplo `CASUALES` y `BAILES`) y a lo largo del tiempo, para que no salgan 20 fotos de la misma sesión.
3. Compara cada foto con las ya elegidas con un hash perceptual (dHash de 64 bits) y saltea las casi iguales.
4. Prefiere fotos verticales o cuadradas; las horizontales quedan al final.

Con ↻ cambiás cualquier foto por la siguiente candidata.

## Datos (base del Artifact)

| Colección | Documento | Contenido |
| --- | --- | --- |
| `modelos` | `<slug>` | nombre, edad sugerida (21+), look, lookEN, estética, pilares, serie, `cara` (id de asset) |
| `reels` | `<slug>-NN` | categoría (sexy, baile, normal), título, idea, foto ideal, prompt, texto en pantalla, caption, audio, loop, estado, vistas; si se escribió mirando una foto: `foto`, `fotoAsset`, `origen: "foto"` y la idea original en `base` |
| `fotos` | `<slug>-NN` | id del asset (JPEG de 1440 px), ruta original en el disco, tamaño y el reel asignado |
| `inventario` | `<slug>` y `_resumen` | fotos, videos, peso, subcarpetas y hasta 1500 nombres de archivo por carpeta |

## Probar sin claude.ai

`test/mock-claude.js` simula `window.claude` (base, assets, Claude y descargas) y `test/run.mjs` recorre toda la página con Playwright: tarjetas, copiar prompt, estados, filtros, ficha, escaneo, selección, subida, prompts con fotos, celular y modo oscuro.

```bash
npm install
python3 estudio-reels/test/make_fixture.py estudio-reels/test/fixture   # fotos sintéticas, requiere Pillow
node estudio-reels/test/run.mjs estudio-reels/test/fixture              # capturas en estudio-reels/test/shots
```
