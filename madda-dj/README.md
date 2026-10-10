# MADDA · Identidad visual

Pack de identidad visual para **MADDA** ([@madda_dj](https://www.instagram.com/madda_dj/)), DJ de techno que recién arranca. Lo arma Pk como regalo profesional: ella vio la página que hicimos para Valen Ricca, escribió «me encantó», y Pk le ofreció una igual: «te puedo hacer una así para vos, y vos elegí el diseño que quieras».

El corazón del pack es **su página privada de identidad**: una propuesta que se recorre en el celular, donde ve opciones de logo y de color, cómo se lee su nombre arriba de los visuales del boliche, maquetas de redes, su playlist, su próxima fecha y una parte para descubrir su sonido. Marca lo que le gusta y le manda su elección a Pk por WhatsApp. Con esa elección se generan las piezas finales usando los prompts del estudio.

Todo sale de lo que ella pidió por WhatsApp el 9/10/2026: **oscuro**, **tornasolado violeta → azul**, **violeta (o rojo) y blanco** para que el nombre se lea sobre cualquier visual. Las citas y qué significa cada una están en `biblia/01-estudio.md`.

> En el WhatsApp de Pk está agendada como «Niky». Es un apodo privado: no va en la página ni en los prompts.

## Qué hay en cada carpeta

| Carpeta | Qué hay |
| --- | --- |
| `pagina/` | La página de identidad, estática y sin build: `index.html`, `estilo.css`, `datos.js` (todo el contenido), `logos.js` (los seis logos dibujados en SVG), `visuales.js` (las pantallas LED animadas), `app.js`, `fonts/`, `_headers` (noindex y seguridad) y `netlify.toml`. Se publica tal cual en Netlify. |
| `estudio/` | El estudio de prompts: plantilla, estilos, lógica y `tokens.json` (los datos `{{NOMBRE}}`, `{{C1}}`, `{{FECHA}}`… y las cuatro paletas). |
| `biblia/` | La biblia del proyecto: `01-estudio.md` (ella), `02-identidad.md` (el sistema visual), `03-prompts-nb2.md` (imágenes en Nano Banana 2), `04-prompts-kling.md` (videos en Kling 3.0) y `05-pagina-y-deploy.md` (la página y cómo publicarla). El build mete todo esto adentro del estudio. |
| `scripts/` | `build.mjs` y `lib.mjs`: arman `dist/`. |
| `test/` | `qa.mjs`: revisa la página web y el Artifact en cuatro anchos, con movimiento reducido, sin WebGL y sin localStorage. |
| `dist/` | Lo que genera el build: `identidad-artifact.html`, `madda-estudio.html` y `estudio-artifact.html`. No se edita a mano: se vuelve a armar. |
| `referencias/` | No existe todavía: ahí van las fotos de referencia de ella, **solo en tu PC**. Está en `madda-dj/.gitignore` y fuera de `pagina/`, así que no se commitea ni se publica. |
| `output/capturas/` | Las capturas del QA: `pagina-*.png` y `artifact-*.png` en 360, 390, 768 y 1440 px (más `estudio-*.png`, del estudio). Se regeneran con el QA y no van a git. |

Para cambiar un texto de la página: `pagina/datos.js`. Para cambiar un prompt: `biblia/03` o `biblia/04`, y volver a armar.

**El estudio de prompts** (`dist/madda-estudio.html`) se abre en cualquier navegador, sin internet. En el panel «Datos de MADDA» completás los datos una vez (nombre, paleta, fecha, lugar) y cada prompt se arma solo: tocás *Copiar*, lo pegás en Higgsfield con el modelo y el formato que dice la ficha, y lo marcás *Hecho*. La versión `dist/estudio-artifact.html` es la misma, para publicarla como Artifact. Adentro están también las guías de la biblia.

## Orden de trabajo

1. **Mandarle la página de identidad y que elija.** Corré `npm run madda:build` y `npm run madda:qa`, mirá las capturas a 360 px y mandale el link: el Artifact privado o un borrador de Netlify (los dos están explicados en `biblia/05-pagina-y-deploy.md`). Ella marca logo, versión, paleta, estilos, visuales y BPM, y te manda su elección por WhatsApp. Hasta que elija no se genera nada final.
2. **Logo en NB2 con la opción elegida.** En el estudio, fichas NB-A1 a NB-A6: mismo orden y mismos nombres que en la página (Tornasol, Doble D, Láser, Pulso, Mono, Sello). Elegí arriba la paleta que eligió ella, generá 3 o 4 por prompt y revisá M-A-D-D-A letra por letra. El ganador es el **logo aprobado**: mandáselo antes de seguir.
3. **Versión blanca y materiales.** NB-A7 y NB-A8 (la blanca para pantallas, con borde fino y sombra sutil) y la sección B de NB2 (tornasolado, cromo, holográfico…). Guardalo como Element **MADDA-LOGO** en Higgsfield.
4. **Fondos LED.** Sección C de NB2: la pantalla de atrás de la cabina (2432×1152). El centro queda oscuro y limpio para el logo blanco. Que ella elija dos o tres.
5. **Loops en Kling.** Secciones A, B y C de Kling: el logo vivo, los fondos en movimiento y la intro. Inicio = final, sonido apagado, sin flashes ni estrobos. Exportá al tamaño de la pantalla del lugar.
6. **Fotos con ella, con su OK.** Pedile las fotos originales (la lista está en `biblia/01-estudio.md`) y, recién con su OK por escrito, hacé la sección D de NB2 y después la D de Kling. La cara, el pelo, la piel, los tatuajes y los piercings salen solo de sus fotos.
7. **Flyer del domingo 11/10.** NB-E7 (historia) y KL-E4 (reel). El lugar y la hora están a confirmar: dejá `[LUGAR]` y `[HORA]` hasta que te los pase y no publiques nada con corchetes.
8. **Sumar bio, fotos y fechas reales.** Con sus respuestas a las preguntas de la bio y lo que salga del estudio de su Instagram, actualizá `pagina/datos.js` (solo datos confirmados), volvé a armar y corré el QA.
9. **Publicar en Netlify.** Borrador primero, para que ella lo revise; producción cuando lo apruebe.

## Comandos

Desde la raíz del repo (`/home/user/zibikolvap` en la sesión de la nube). En tu PC, la primera vez: `npm install` y `npx playwright install chromium` (el QA usa Chromium).

```bash
npm run madda:build   # arma dist/identidad-artifact.html, dist/madda-estudio.html y dist/estudio-artifact.html
npm run madda:qa      # abre la página en 360, 390, 768 y 1440 px, prueba las elecciones y guarda capturas en madda-dj/output/capturas/
```

Ver la página en tu compu (cualquiera de los dos):

```bash
npx serve madda-dj/pagina                  # → http://localhost:3000
python -m http.server -d madda-dj/pagina   # → http://localhost:8000 (en Mac puede ser python3)
```

Publicar en Netlify desde tu PC:

```bash
npx netlify login                                                         # una sola vez
npx netlify sites:create --name madda-identidad                           # una sola vez
npx netlify deploy --dir madda-dj/pagina --site madda-identidad           # borrador: link único para revisar
npx netlify deploy --dir madda-dj/pagina --site madda-identidad --prod    # producción: https://madda-identidad.netlify.app
```

El detalle (borrador o producción, noindex, dominio propio) está en `biblia/05-pagina-y-deploy.md`.

## Créditos

- Tipografías con licencia SIL Open Font License 1.1: Unbounded, Michroma, Syne, Big Shoulders Display, Major Mono Display, Dela Gothic One, Hanken Grotesk y JetBrains Mono. Autores y texto de la licencia en `pagina/fonts/LICENCIAS.txt`.
- Los logos y los visuales de la página están dibujados con código (SVG y canvas): no hay fotos ni imágenes de terceros.
- La playlist «Todo tipo de techno» es de ella, en Spotify.
- Los prompts están pensados para Nano Banana 2 y Kling 3.0 en Higgsfield. Sin logos de marcas en ninguna pieza.

## Qué falta

- **Sus fotos.** No tenemos ninguna. Hay que pedirle originales y su OK para usarlas con IA.
- **Su bio real.** De dónde es, desde cuándo toca, qué la hizo arrancar. Las preguntas están en la página y sus respuestas viajan con su elección.
- **El domingo 11/10.** Falta el lugar y la hora.
- **Más fechas.** Por ahora hay una sola.
- **La estética de su Instagram.** Desde la sesión en la nube Instagram está bloqueado, así que todavía no lo vimos. Se hace desde tu PC con el prompt de `biblia/01-estudio.md`.
- **Detalles a confirmar.** Su ciudad (probablemente Buenos Aires) y cómo se escriben los DJs que nombró.
- **El logo final en vector.** Cuando elija, se vectoriza o se redibuja: los SVG de `pagina/logos.js` sirven de base.
