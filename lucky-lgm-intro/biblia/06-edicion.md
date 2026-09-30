# 6 · Edición en CapCut

## El proyecto

- Formato 9:16, 1080×1920, 30 fps.
- Importá los clips T01 a T19, la canción y los PNG de `output/hud/`.
- Los PNG del HUD ya vienen del tamaño de la pantalla y ubicados: se ponen a pantalla completa en una pista de superposición y listo. Están pensados para que no los tapen los botones de Instagram.

## Paso a paso

1. **Música primero.** Usá el tema que Lucky va a cantar el 11. Buscá el pedazo de unos 50 segundos (o 30 para la corta) que tenga un drop o un cambio fuerte, y marcá los golpes (en CapCut: Beats / marcadores automáticos).
2. **Corte grueso.** Poné los clips en orden y de cada uno dejá los 2 o 3 segundos buenos (la tabla del storyboard dice cuánto dura cada toma). Cortá sobre los golpes.
3. **El drop.** El sopapazo (T12) va justo antes del drop y el cambio de skin (T16) cae en un golpe fuerte.
4. **Velocidad.** En T08, T10, T12 y T16 usá curva de velocidad (Montaje o Héroe): rápido, lento en el momento clave, rápido otra vez. Es lo que da el look de tráiler de juego.
5. **HUD.** Cada PNG en su pista, según la tabla de abajo. Entrada: zoom o rebote de 0,2 s. Salida: desvanecer de 0,2 s. Los avisos duran 1 a 1,5 s y cada tarjeta de loot 1 s. El HUD de base queda fijo de la T05 a la T17 (cambiando de versión).
6. **Sonido.** La música más una pista de efectos. En la biblioteca de CapCut buscá "alarm", "level up", "coin", "power up", "whoosh", "notification", "splash", "crowd cheer" y "glitch" (o bajalos gratis de Pixabay). No uses sonidos sacados de Fortnite: tienen copyright y Instagram te puede silenciar el video.
7. **Color.** Si un clip quedó más amarillo o más verde que el resto, bajale la temperatura y subile un poco el magenta para que todo combine con el flyer. Un poco de viñeta y de grano a todo el video lo unifica.
8. **Placa final y exportar.** 1080×1920, 30 fps, calidad alta. Nombre sugerido: `lucky-lgm-intro-cultura-d.mp4`.

## Qué PNG va en cada toma

El HUD de base (minimapa, vida, escudo e inventario) tiene 4 versiones que van cambiando con la historia: primero solo tiene la llave, después se llena el inventario, después se llena el escudo con el mate y al final suben las eliminaciones.

| Toma | PNG | Cuándo |
| --- | --- | --- |
| T01 | `05-lugar-buenos-aires-2077` | desde la mitad de la toma |
| T02 | `06-jugador-lucky` | toda la toma |
| T03 | `07-mision-bano` | cuando para el chorro |
| T04 | `08-alerta-emergencia` | con el primer destello de la pulsera |
| T05 | `01-hud-1-inicio` y `09-marcador-puente` | el HUD fijo; el marcador 1 s, apenas sale |
| T06 a T08 | `02-hud-2-loot` | fijo (ya abrió el cofre) |
| T06 | `10-lugar-av-corrientes`, `11-loot-lanzasopapas`, `12-loot-mate` | el lugar al principio, el loot cuando sale del cofre |
| T07 | `13-loot-entrada` | cuando la agarra |
| T09 a T12 | `03-hud-3-escudo` | fijo (ya tomó el mate) |
| T10 | `14-lugar-luna-park`, `15-loot-muzza` | la muzza cuando llueve el loot |
| T11 | `16-lugar-puente-de-la-mujer` | al principio |
| T13 a T17 | `04-hud-4-eliminaciones` | fijo (2 eliminaciones, ruta al Astros) |
| T13 | `17-rescate-completado` | después del abrazo |
| T15 | `18-alerta-show` | con el ping de la pulsera |
| T16 | `19-skin-equipada` | cuando termina el giro |
| T17 | `20-loot-paraguas`, `21-lugar-teatro-astros` | paraguas al principio, el lugar cuando baja la cámara |
| T19 | `22-loot-microfono`, `23-victoria` | el micrófono cuando lo agarra, la victoria en el golpe final |
| T20 | `24-placa-final` o `25-placa-final-fondo` | 3 s |

## Cambiar los textos del HUD

Abrí `dist/estudio-hud.html` con Chrome (doble clic, funciona sin internet): cambiás el nombre, los textos y los números, y bajás los PNG uno por uno o todos juntos en un .zip. Tiene cargado el preset de LXLX ZZZ para la próxima intro.

## Si la pasan en la pantalla del teatro

Pedí la resolución de la pantalla del Astros. Si es horizontal (16:9), regenerá los frames clave en 16:9 con los mismos prompts (solo cambiás el formato) y mandalos a Kling otra vez en 16:9.

## Publicación

- Posteo en colaboración con [@lucky.lgm](https://www.instagram.com/lucky.lgm/) y [@culturadtv](https://www.instagram.com/culturadtv/): sale en las dos cuentas.
- Portada: un frame de la T16 o de la T19.
- Texto sugerido en `caption.txt`.
- Una story el mismo día del show con la placa final y la cuenta regresiva.

## Calendario hasta el domingo 11

| Día | Qué |
| --- | --- |
| Mié 30/9 y jue 1/10 | Fotos de referencia, hojas de personaje y escenarios (Elements) |
| Vie 2 y sáb 3 | Frames de las 20 tomas |
| Dom 4 y lun 5 | Videos en Kling |
| Mar 6 | Edición, HUD y sonido |
| Mié 7 o jue 8 | Publicar (así circula unos días antes del show) |
