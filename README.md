# Legado · Jah Fabio

Piezas de homenaje a Jah Fabio (Guadalajara, 1981 – 2025), el cantante de reggae mexicano: una tarjeta con frase, un collage y un reel vertical, más un estudio web para editarlos.

## Piezas listas

| Archivo | Formato | Uso |
| --- | --- | --- |
| `output/01-tarjeta-frase.png` | 1080×1350 | Post de feed (4:5) |
| `output/02-collage.png` | 1080×1350 | Post de feed o segunda imagen de un carrusel |
| `output/03-reel.mp4` | 1080×1920, 30 fps, 23,6 s, sin audio | Reel / TikTok / Shorts |
| `output/03-reel-portada.png` | 1080×1920 | Portada del reel |
| `output/caption.txt` | texto | Descripción y hashtags sugeridos |

Todo el arte es original: el león, el vinilo, el micrófono, los parlantes y el papel picado están dibujados con código. No incluye fotos de terceros ni letras de canciones.

### Música

El reel no trae audio a propósito. Al publicarlo, agregá la canción desde la biblioteca de música de Instagram o TikTok: así queda con licencia y el reel aparece en la página del tema. El ritmo de las animaciones sigue un pulso de ~75 BPM, típico del one drop.

## Estudio web

`dist/estudio-legado.html` es una sola página, sin dependencias, que se abre en cualquier navegador:

- Cambiá la frase de la tarjeta, el nombre del tema, el hashtag y el llamado a compartir.
- Agregá una frase animada al reel: aparece palabra por palabra después del nombre.
- Subí hasta 3 fotos: reemplazan las ilustraciones del collage y pueden ir de fondo en la tarjeta y en el reel.
- Descargá la tarjeta y el collage en PNG, y grabá el reel en video (en tiempo real, desde el navegador).

## Regenerar

```bash
npm install                 # instala Playwright (usa el Chromium que ya tengas)
npm run build               # arma dist/ a partir de src/
npm run preview [carpeta]   # PNG + hoja de contacto del reel, sin video
FFMPEG=/ruta/a/ffmpeg npm run render   # output/*.png + output/03-reel.mp4 (ffmpeg con libx264)
```

El dibujo vive en `src/render.js` y lo comparten el estudio (`src/app.js`, `src/index.html`) y el script de exportación (`scripts/render.mjs`), así que lo que ves en el navegador es lo mismo que se exporta.

## Datos usados en las piezas

- Nació en Guadalajara, Jalisco, en 1981 y murió el 24 de mayo de 2025, a los 43 años.
- Referente del roots reggae y el dancehall en México desde 2005.
- Se presentó en Cuba, EE. UU., Venezuela, Colombia, Chile, Argentina, España y Jamaica, donde representó a Latinoamérica en Reggae Sumfest.
- Autor de «Somos los del Atlas» (2019) y «Atlas campeón» (2022).

Fuentes: [Infobae](https://www.infobae.com/mexico/2025/05/26/de-que-murio-jah-fabio-cantante-de-reggae-y-autor-del-himno-del-atlas/), [El Universal](https://www.eluniversal.com.mx/espectaculos/jah-fabio-musico-de-reggae-muere-a-los-43-anos-tenia-planes-de-presentarse-en-junio/), [El Financiero](https://www.elfinanciero.com.mx/entretenimiento/2025/05/25/jah-fabio-muere-cantante-de-reggae-y-creador-de-cancion-del-atlas/), [Reggae Chalice](https://www.reggaechalice.cl/jah-fabio-represento-a-latinoamerica-en-el-reggae-sumfest-247/?lang=en), [Wikipedia](https://en.wikipedia.org/wiki/Jah_Fabio).

## Créditos

Tipografías con licencia SIL Open Font License (ver `fonts/`): Anton, Kaushan Script, Playfair Display y Montserrat.

Homenaje hecho por fans, sin fines comerciales.

## Otros proyectos en este repo

- [`lucky-lgm-intro/`](lucky-lgm-intro/): *Misión Corrientes*, la intro tipo battle royale de Lucky LGM para el Festival Cultura D (biblia de producción, prompts y HUD para CapCut).
