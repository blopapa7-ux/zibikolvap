# 5 · La página

Su página privada de identidad: la propuesta que ella recorre en el celular para elegir. Es estática (HTML, CSS y JavaScript, sin frameworks y sin build): lo que está en `pagina/` se publica tal cual. Tiene dos versiones: la web, en Netlify, y el Artifact, en claude.ai.

## A · Qué hace cada sección

| Sección | Qué muestra | Qué hace ella |
| --- | --- | --- |
| **Portada** | Su logo grande sobre un fondo tornasol animado, «Identidad visual · propuesta para vos», el link a su Instagram y la firma de Pk | Baja |
| **Lo que me pediste** | Sus frases del chat, cada una con la decisión de diseño que tomamos | Lee y ve que la escuchamos |
| **Tu logo · elegí** | Los seis logos dibujados, cada uno en tornasol, blanco o rojo. Abajo, cómo se ven en chiquito (110 y 40 px) | Toca «Me gusta» en uno y elige la versión. La portada, los visuales y las redes cambian con su elección |
| **Tus colores** | Las cuatro paletas: la página entera se pinta con la que toca. El laboratorio «Tu nombre arriba de cualquier visual»: su logo blanco sobre fondos difíciles, con y sin borde | Elige paleta y prende o apaga el borde |
| **Tu sonido** | Su playlist, diez estilos de techno con sus BPM, el medidor de tempo y cómo se arma un set de dos horas | Marca los estilos que le gustaría tocar y mide los BPM de sus temas |
| **Tus visuales** | Cuatro pantallas LED animadas con su logo, en la proporción de una pantalla de cabina (2432 × 1152) | Toca «Me gusta» en los que le gustan (puede marcar más de uno) |
| **En tus redes** | Maquetas de perfil, historia y post con su logo y su paleta. No son capturas reales | Se imagina su perfil |
| **Fechas** | La próxima, con cuenta regresiva y botón para agendarla. Las que ya pasaron bajan solas a «Pasadas» | Agenda |
| **Tu bio · borrador** | Un borrador hecho solo con lo que sabemos y cuatro preguntas | Responde; sus respuestas viajan con su elección |
| **Tu elección** | Un resumen en vivo de todo lo que marcó | Lo copia o te lo manda por WhatsApp |

## B · Cómo editar datos.js

Todo el contenido de la página vive en `pagina/datos.js`. Los demás archivos solo dibujan: si cambiás un texto, se cambia ahí. La regla es la de siempre: **solo datos confirmados**; lo que no sabemos queda «a confirmar».

El archivo tiene comentarios que explican cada bloque y qué formato espera. **Seguí esos comentarios**: mandan sobre esta guía si algo no coincide. Estos son los tipos de campos que vas a encontrar:

- **Quién es:** nombre, deletreo, usuario e Instagram, género, firma y versión de la propuesta.
- **Portada:** los textos de arriba de todo.
- **Lo que me pediste:** sus citas y la decisión para cada una.
- **Logos:** las seis opciones (id, nombre, tipografía y por qué) y las tres versiones. Los ids y el orden no se tocan: son los mismos de los prompts.
- **Paletas:** las cuatro, con sus colores en hex y los degradés del tornasol.
- **Legibilidad:** los fondos difíciles del laboratorio y la regla del borde.
- **Sonido y playlist:** el título, el link de Spotify, el link del reproductor y la nota.
- **Estilos de techno:** nombre, BPM aproximados, mood y cómo suena cada uno. También los textos del medidor de tempo y la curva del set de ejemplo.
- **Visuales:** las cuatro pantallas.
- **Redes:** los textos de las maquetas (bio del perfil, historia, post).
- **Fechas:** cada fecha en formato AAAA-MM-DD (hora de Buenos Aires), con texto, detalle y evento.
- **Bio:** el borrador, la versión corta y las preguntas.
- **Tu elección y pie:** el título del resumen y la firma de abajo.

Para editar:

1. Abrí `pagina/datos.js` en un editor de código (VS Code, por ejemplo).
2. Cambiá solo el texto que está entre comillas. Si un texto necesita comillas adentro, usá « ».
3. Respetá las comas del final de cada línea y las llaves.
4. Guardá y recargá la página en tu compu (sección E). Si queda en blanco, falta una coma o una comilla: abrí la consola del navegador (F12) y ahí dice en qué línea.
5. Corré `npm run madda:build` y `npm run madda:qa`.

Por ejemplo, cuando ella confirme el domingo, la fecha queda así (con los datos reales en lugar de LUGAR y HORA):

```js
{ fecha: '2026-10-11', texto: 'Domingo 11 de octubre de 2026', detalle: 'LUGAR · HORA', evento: '' },
```

## C · Cómo te llega su elección

1. Ella va marcando: el logo («Me gusta») y su versión, la paleta, los estilos, los visuales, sus BPM con el tap y las respuestas de la bio.
2. Todo queda guardado en su navegador: si cierra y vuelve, sigue ahí. No viaja a ningún servidor; la página no tiene base de datos.
3. En «Tu elección» tiene dos botones: **«Copiar mi elección»**, para pegarla en el chat con vos, y **«Mandársela a Pk por WhatsApp»**, que abre WhatsApp con el texto ya escrito. El link no lleva tu número: ella elige tu chat. Si el celular no deja copiar, el texto aparece seleccionado para copiarlo a mano.
4. Te llega un texto así (es un ejemplo):

```text
Identidad MADDA · mi elección
Logo: Doble D · versión Tornasol
Paleta: Tornasol
Estilos para tocar: Hypnotic, Peak time / driving
Visuales: Tornasol líquido, Túnel de láser
Mis BPM: 130 (medidos con el tap)

Para la bio:
¿De dónde sos? …
```

5. Qué hacés con cada cosa:

| Lo que eligió | Dónde se usa |
| --- | --- |
| Logo | NB-A1 a NB-A6, en el mismo orden que la página, y su loop KL-A10 a KL-A15 |
| Versión | Tornasol: la paleta Tornasol del estudio. Roja: el preset «Rojo y blanco». Blanca: NB-A7 y NB-A8 |
| Paleta | El preset con el mismo nombre en el estudio |
| Estilos | `{{GENERO}}` en el estudio, la bio y las portadas de sets (NB-F) |
| Visuales | Los fondos que se generan primero: Tornasol líquido → NB-C9 / KL-B9, Túnel de láser → NB-C3 / KL-B3, Humo y haz → NB-C4 o C8 / KL-B4 o B8, Onda → KL-A13 (Pulso) |
| Sus BPM | El tempo de los loops que laten, como KL-A13 (Pulso) |
| Respuestas de la bio | El bloque de la bio en `datos.js`, después de que ella apruebe el texto final |

## D · Fotos y loops (para más adelante)

Hoy la página no tiene fotos ni videos. Cuando los haya:

- **Carpetas:** `pagina/assets/fotos/` y `pagina/assets/loops/`.
- **Fotos:** JPG o WebP, 1600 px del lado largo, menos de 400 KB cada una. Nombres claros (`cabina-01.jpg`). Solo fotos de ella, y solo con su OK.
- **Loops:** MP4 H.264, 720p, sin sonido, menos de 4 MB, cada uno con su póster (un JPG del primer cuadro, en la misma medida). El póster es lo que se ve mientras carga y lo que ve quien tiene activado «reducir movimiento».
- **En el Artifact:** el build mete adentro las imágenes y los videos que están escritos en `index.html` (img, video, poster) y las `url()` del CSS. Una ruta que arma el JavaScript desde `datos.js` no se mete sola. Además, lo embebido pesa un 33 % más y el Artifact tiene que quedar por debajo de 16 MB: ahí conviene poner pósters y, como mucho, un loop.

## E · Verla en tu compu

Desde la raíz del repo, con cualquiera de los dos:

```bash
npx serve madda-dj/pagina                  # → http://localhost:3000
python -m http.server -d madda-dj/pagina   # → http://localhost:8000 (en Mac puede ser python3)
```

1. Usá siempre un servidor local en vez de abrir `index.html` con doble clic: así se ve igual que en Netlify.
2. Para verla en el celular: con la compu y el celu en la misma wifi, abrí `http://IP-de-tu-compu:3000`.
3. Para simular un celular en Chrome: F12, el ícono del teléfono y 360 px de ancho.

## F · La versión Artifact (claude.ai)

1. `npm run madda:build` arma `dist/identidad-artifact.html`: la misma página con todo adentro (estilos, scripts y tipografías) y sin pedidos a internet.
2. Publicala como Artifact desde una sesión de Claude: «publicá `madda-dj/dist/identidad-artifact.html` como Artifact».
3. Nace privada. Para que ella la vea, compartila desde claude.ai y mandale el link.

Diferencias con la versión web:

- **Spotify** se abre como link («Abrir en Spotify»): el Artifact no admite reproductores embebidos. En Netlify se escucha ahí mismo.
- **El link a las licencias** de las tipografías no está: queda solo el texto «Tipografías con licencia SIL OFL» (el link va marcado `data-solo-web` en `index.html`).
- **Lo que marca** se guarda en su navegador si se puede. En una ventana privada puede no guardarse, pero la página anda igual.

Cuándo usar cada una: el Artifact, para mandársela ya, sin deploy. Netlify, para la versión con el reproductor y una dirección linda.

## G · Netlify: borrador y producción

Desde la raíz del repo, en tu PC:

1. Iniciá sesión (una sola vez): `npx netlify login`
2. Creá el sitio (una sola vez): `npx netlify sites:create --name madda-identidad`
3. Subí un **borrador**: `npx netlify deploy --dir madda-dj/pagina --site madda-identidad`
4. Abrí el link del borrador en tu celular y revisala entera.
5. Cuando esté aprobada, a **producción**: `npx netlify deploy --dir madda-dj/pagina --site madda-identidad --prod`

- **Borrador** (sin `--prod`): cada deploy tiene su propia dirección, del estilo `https://…--madda-identidad.netlify.app`. Sirve para que ella revise cambios sin tocar lo publicado.
- **Producción** (con `--prod`): siempre `https://madda-identidad.netlify.app`. Es la versión aprobada.

Dos detalles:

- El archivo `pagina/_headers` viaja con la carpeta: pone el noindex y una política de seguridad que solo deja entrar el reproductor de Spotify como contenido externo. Si sumás algo de afuera (una tipografía de Google, un video de YouTube), se bloquea: bajalo a `pagina/`.
- Si al hacer deploy el CLI dice que va a correr un build, sumá `--no-build`: esta página no tiene build.

## H · Mientras sea privada: noindex

- `pagina/_headers` manda `X-Robots-Tag: noindex, nofollow` e `index.html` tiene `<meta name="robots" content="noindex,nofollow">`. Así Google no la muestra. Dejalo así mientras sea una propuesta privada.
- Noindex no es una contraseña: quien tenga el link la ve. Mandala solo a ella.
- Si un día pasa a ser su web pública, y ella lo aprueba, sacá las dos cosas juntas y volvé a publicar.

## I · Dominio propio

Si la página termina siendo su web de DJ:

1. Elegí un dominio corto con su nombre artístico: `.com.ar` en NIC Argentina o `.com` en cualquier registrador. Fijate antes que esté libre.
2. Registralo a nombre de ella: es su marca.
3. En Netlify: *Domain management* → *Add a domain* y seguí los pasos del DNS. El HTTPS se activa solo.

Hasta entonces, `madda-identidad.netlify.app` alcanza y sobra.

## J · Antes de mandársela

- [ ] `npm run madda:build` sin errores y `npm run madda:qa` sin fallas
- [ ] Capturas a 360 px revisadas en `output/capturas/`
- [ ] Ningún dato inventado y ningún apodo privado
- [ ] El domingo dice «lugar y hora a confirmar» si todavía no hay datos
- [ ] Probada en tu celular (borrador de Netlify o Artifact)

Un mensaje posible para mandarle el link:

> Te paso tu página: [link]. Es una propuesta, nada está cerrado. Recorrela tranqui, marcá lo que te guste y al final mandame tu elección. Lo vamos ajustando juntos.
