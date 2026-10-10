# 2 · Identidad

El sistema visual de MADDA, sacado de su pedido: **oscuro**, con un **brillo tornasol violeta → azul** como firma y el **blanco** para que su nombre se lea siempre, arriba de lo que el boliche ponga en la pantalla. El rojo queda como alternativa, porque ella lo nombró.

Esta guía sirve para generar las piezas con coherencia y para pasársela a cualquiera que diseñe para ella (una productora, un VJ, un amigo que arma un flyer).

## A · La idea

**Un brillo en la oscuridad.** El tornasol es la luz que aparece sobre algo negro cuando la toca un reflejo: aceite sobre agua de noche, un vinilo bajo una luz de cabina. Así entra MADDA: casi todo oscuro, y su nombre que brilla.

Tres pilares:

1. **Oscuro.** La base es casi negra, con un toque violeta. Ella lo dijo: «me gusta lo oscurito».
2. **Tornasol.** El violeta que se va al azul es su firma. Aparece en el logo principal, en los materiales y en los visuales, nunca en todo a la vez.
3. **Blanco que se lee.** Su nombre se tiene que leer arriba de cualquier visual. Por eso hay versión blanca con borde fino y sombra sutil.

El tono, en cuatro palabras (es el token `{{VIBE}}` de los prompts): **dark, iridescent, hypnotic, elegant**.

| Es | No es |
| --- | --- |
| Oscura, elegante, hipnótica | Cumbiera, tropical o colorinche |
| Un solo brillo protagonista | Arcoíris de neón |
| Formas del techno: vinilos, ondas, láseres, círculos que giran | Calaveras, pastillas, hojas o cualquier cliché de fiesta |
| Ella segura, con su estilo y su ropa | Nada sexualizado ni sugerente |
| Aire y orden | Flyers recargados de efectos |

## B · Paletas

Cuatro paletas. La primera es la de su pedido; las otras le dan opciones. En la página se prueban con un toque y en el estudio cada una es un preset que completa `{{C1}}`, `{{C2}}`, `{{C3}}` y `{{FONDO}}`.

| Paleta | Colores | Cuándo usarla |
| --- | --- | --- |
| **Tornasol** (la principal) | Fondo `#06050B` · Violeta `#7B4DFF` · Azul eléctrico `#3A6BFF` · Brillo lila `#C9B8FF` · Blanco `#FFFFFF` | Logo, flyers, visuales y perfil. La de todos los días. |
| **Violeta y blanco** | Fondo `#06050B` · Violeta `#7B4DFF` · Violeta profundo `#3F23A6` · Blanco `#FFFFFF` | Más limpia: el brillo queda en violeta y blanco, sin el azul. Para placas con mucho texto o cuando el flyer de la fiesta ya viene cargado. |
| **Rojo y blanco** | Fondo `#070406` · Rojo `#E3123B` · Rojo profundo `#7A0A22` · Blanco `#FFFFFF` | La alternativa que nombró ella. Para noches más duras (raw, industrial, hard) o para cambiar de aire. En el estudio: preset «Rojo y blanco», que pone `{{C1}}` en `#E3123B`. |
| **Noche** | Fondo `#030206` · Carbón `#15121F` · Gris lila `#8E89A6` · Resplandor `#7B4DFF` · Blanco `#FFFFFF` | Casi blanco y negro, el violeta solo como resplandor. Para prensa, press kit o cuando el resto del arte ya tiene mucho color. |

**Proporción:** más o menos 70 % fondo, 20 % color (violeta y azul, o rojo) y 10 % blanco (el nombre y los datos). El brillo lila es solo para reflejos.

**El tornasol, en una línea** (la receta de la página, para web o para Canva):

```css
background: linear-gradient(100deg, #E4DAFF 0%, #7B4DFF 25%, #3A6BFF 50%, #7B4DFF 75%, #C9B8FF 100%);
```

**Contraste.** Medido con la fórmula de accesibilidad web (WCAG). Texto chico: 4,5 : 1 o más. Títulos grandes: 3 : 1 o más.

| Combinación | Contraste | Uso |
| --- | --- | --- |
| Blanco sobre fondo `#06050B` | 20,3 : 1 | Todo |
| Brillo lila `#C9B8FF` sobre fondo | 11,4 : 1 | Textos secundarios, datos |
| Gris lila `#8E89A6` sobre `#030206` | 6,2 : 1 | Textos secundarios en Noche |
| Azul `#3A6BFF` sobre fondo | 4,6 : 1 | Títulos y acentos |
| Rojo `#E3123B` sobre `#070406` | 4,3 : 1 | Solo títulos grandes y acentos |
| Violeta `#7B4DFF` sobre fondo | 4,2 : 1 | Solo títulos grandes, líneas y brillos; nunca texto chico |
| Blanco sobre violeta o sobre rojo | 4,8 : 1 | Botones y etiquetas |
| Blanco sobre azul | 4,4 : 1 | Solo texto grande |
| Violeta profundo o rojo profundo sobre fondo | 1,9 : 1 | Nunca texto: solo sombras y degradés |
| Blanco sobre brillo lila | 1,8 : 1 | Nunca |

## C · Tipografías

Todas con licencia libre (SIL OFL). Los archivos están en `pagina/fonts/` y se bajan gratis de Google Fonts.

| Familia | Para qué | Cómo |
| --- | --- | --- |
| **Unbounded** (200 a 900) | La display principal: títulos, el logo Tornasol, la fecha grande de un flyer | Mayúsculas, peso 700 a 900, un poco de aire entre letras |
| **Hanken Grotesk** (100 a 900) | Texto corrido: bio, descripciones, captions | 400 para leer, 600 para destacar. Nada de párrafos en mayúscula |
| **JetBrains Mono** (100 a 800) | Datos: BPM, fechas, horarios, lugares, etiquetas | Mayúsculas chicas con bastante aire entre letras |

Las tipografías de los logos:

| Familia | Dónde |
| --- | --- |
| **Michroma** | Logo Láser |
| **Big Shoulders Display** (900) | Logo Pulso. También sirve para flyers verticales con mucho texto, porque es condensada |
| **Major Mono Display** | Logo Mono |
| **Syne** (400 a 800) | Alternativa editorial: títulos de prensa o del press kit |
| **Dela Gothic One** | Alternativa pesada para flyers de noches duras |

Reglas:

1. Como mucho dos familias por pieza, más JetBrains Mono para los datos.
2. El logo es un dibujo: su tipografía no se usa para escribir otros textos.
3. Los números de una fecha van todos en la misma familia (Unbounded o JetBrains Mono, no mezcladas).

## D · Seis logos

Los mismos nombres y el mismo orden en la página, en el estudio (NB-A1 a NB-A6 y sus loops KL-A10 a KL-A15) y en esta guía. Cada uno tiene tres versiones (tornasol, blanca y roja) y una **marca chica** para cuando no entra el nombre entero.

### 1 · Tornasol

- **Qué es:** MADDA en Unbounded 900, ancha y firme, con relleno tornasol violeta → azul.
- **Cuándo:** es la opción más fiel a su pedido. Logo principal para flyers, perfil, banners y la intro en pantalla sobre fondos oscuros y quietos.
- **Marca chica:** la M tornasol.
- **Ojo:** el relleno tornasol pide fondo oscuro y calmo. Sobre visuales cargados, va la versión blanca.

### 2 · Doble D

- **Qué es:** las dos D de MADDA dibujadas como un par de bandejas: dos platos vistos desde arriba, espejados uno frente al otro a cada lado del mixer.
- **Cuándo:** la idea más propia, la que nadie más tiene. Para perfil, merch, stickers y la intro animada (los platos giran en KL-C2).
- **Marca chica:** las dos D con el fader en el medio. Funciona sola como ícono.
- **Ojo:** las D se tienen que seguir leyendo como D. Probala a 110 px antes de aprobarla.

### 3 · Láser

- **Qué es:** Michroma ancha, con las letras hechas de líneas finas, como los láseres que cruzan la pista.
- **Cuándo:** pantallas LED (las líneas brillan), flyers minimalistas, noches de galpón.
- **Marca chica:** la M de líneas.
- **Ojo:** en tamaños chicos las líneas desaparecen. No va en la foto de perfil.

### 4 · Pulso

- **Qué es:** Big Shoulders Display 900, condensada, con una onda de sonido que corta las letras.
- **Cuándo:** reels, historias y flyers verticales, donde el espacio es angosto. Se lee «techno» a la primera.
- **Marca chica:** la M cortada por la onda.
- **Ojo:** la onda no puede tapar ninguna letra entera.

### 5 · Mono

- **Qué es:** «madda» en minúsculas con Major Mono Display. Mínimo y elegante.
- **Cuándo:** tamaños chicos, marca de agua en videos, merch discreto, piezas con mucho texto. En blanco funciona sobre casi cualquier fondo.
- **Marca chica:** la «m».
- **Ojo:** es la más sobria; si ella busca impacto, combinala con el Sello.

### 6 · Sello

- **Qué es:** un monograma: la M en el centro de la etiqueta de un vinilo, con «MADDA · TECHNO» girando alrededor.
- **Cuándo:** foto de perfil, stickers, merch, marca de agua, sello del press kit. Acompaña a cualquiera de los otros cinco como segunda marca.
- **Marca chica:** el sello entero.
- **Ojo:** el texto del borde se lee desde unos 110 px; más chico, el sello funciona como forma.

**La combinación ideal:** un logo principal (el que elija) + una marca chica o el Sello + la versión blanca para pantallas.

## E · Su nombre en la pantalla LED

En los boliches ponen el nombre de la DJ arriba de lo que esté pasando en la pantalla, y eso puede ser cualquier cosa: blancos, arcoíris, rojos, patrones. Ella lo pidió así: que el nombre «quede con lo que le ponen de fondo». La regla de Pk para cualquier nombre en pantalla: *«un pequeño trazo o sombra muy sutil, fino y profesional, para que no se mezcle con el fondo»*.

1. **Versión blanca** (`#FFFFFF`), nunca la tornasol.
2. **Borde muy fino y oscuro** (`#06050B` o negro) por fuera de las letras: alrededor del 1,5 % de la altura de las letras. Un logo de 300 px de alto lleva un borde de 4 a 5 px.
3. **Sombra sutil:** negra, al 35-50 %, sin desplazamiento, difusa (radio de un 6 % de la altura de las letras).
4. **Contraste mínimo:** el borde oscuro tiene que separar el blanco del fondo. Sin él, blanco sobre un amarillo fuerte da 1,1 : 1 y el nombre desaparece.
5. **La prueba:** mirá la pieza en blanco y negro y con los ojos entrecerrados. Si el nombre se pierde, subí un punto el borde; no engordes la letra.
6. **Nunca tornasol sobre visuales cargados o de colores:** el brillo se mezcla con el fondo y el nombre se pierde.

Para el VJ del lugar: el logo blanco con borde en PNG transparente de 3840 px de ancho y los loops sobre fondo negro en MP4. Sobre negro, el VJ los pone en modo de fusión «Add» o «Screen» y el negro desaparece.

## F · Medidas y zonas seguras

**Pantalla LED de la cabina** (2432 × 1152 px, 2,1 : 1). Pedile al lugar la medida exacta: cada pantalla es distinta.

```text
┌────────────────────────────────┐
│ arriba 20 %: margen libre      │
├────────────────────────────────┤
│                                │
│ FRANJA DEL MEDIO (20 a 75 %)   │
│ logo: hasta 55 % del ancho     │
│                                │
├────────────────────────────────┤
│ abajo 25 %: la tapan la        │
│ cabina y ella                  │
└────────────────────────────────┘
      2432 × 1152 px · 2,1 : 1
```

- El logo va en la franja del medio, centrado, entre el 30 % y el 55 % del ancho, para que se lea desde el fondo de la pista.
- Abajo no va nada importante: la tapan la cabina y la DJ.
- Un video 16:9 escalado para llenar el ancho pierde un 8 % arriba y otro 8 % abajo: ahí tampoco va nada.

**Foto de perfil** (se sube en 1080 × 1080; Instagram la muestra como un círculo de 110 px).

- Va la marca chica o el Sello, nunca el nombre entero con líneas finas.
- La marca entra en el círculo con un 12 % de aire alrededor: las esquinas se cortan.
- Probala también a 40 px, que es como se ve en comentarios y menciones.

**Post de feed 4:5** (1080 × 1350). En la grilla del perfil Instagram muestra el centro en 3:4: unos 34 px se cortan de cada costado. Nombre y fecha dentro de los 1012 px del centro y con 60 px de margen.

**Historias y reels 9:16** (1080 × 1920). Valores aproximados: Instagram los mueve cada tanto.

- Historias: libres los 250 px de arriba (nombre de la cuenta) y los 250 px de abajo (la barra para responder).
- Reels: libres los 220 px de arriba, los 420 px de abajo (texto y audio) y 120 px a la derecha (botones).

**Tamaños mínimos**

| Logo | Pantalla | Impreso |
| --- | --- | --- |
| Tornasol, Doble D, Pulso | 120 px de ancho | 30 mm |
| Láser | 240 px de ancho | 50 mm |
| Mono | 80 px de ancho | 20 mm |
| Sello | 48 px (el texto se lee desde unos 110 px) | 15 mm |

Más chico que eso, va la marca chica.

**Aire alrededor:** dejá alrededor del logo, como mínimo, la altura de la M.

| Sí | No |
| --- | --- |
| Nombre blanco con borde fino y sombra sutil sobre cualquier visual | Tornasol sobre visuales cargados o de colores |
| Tornasol sobre fondos oscuros y quietos | Estirar, inclinar o deformar el logo |
| Una sola versión de color por pieza | Cambiar la tipografía del logo |
| Fotos oscurecidas antes de poner el logo encima | Sombras pesadas, biseles o brillos fuertes |
| Revisar M-A-D-D-A letra por letra | Violeta sobre rojo o rojo sobre violeta |
| Videos sin flashes ni estrobos | Logos de marcas en equipos, auriculares o ropa |

## G · Qué se entrega

Logo

- [ ] El logo aprobado en sus tres versiones (tornasol, blanca y roja), en PNG transparente de 4K
- [ ] El logo en vector (SVG): se vectoriza o se parte de los dibujos de `pagina/logos.js`
- [ ] La versión blanca con borde y sombra para pantallas (NB-A7 y NB-A8)
- [ ] Marca chica y foto de perfil en 1080 × 1080
- [ ] El Sello para stickers y merch

Pantalla

- [ ] Dos o tres fondos LED en 2432 × 1152, con copia en 1920 × 1080 (NB-C)
- [ ] Loops del logo y de fondo en MP4 H.264, sin sonido (KL-A y KL-B)
- [ ] La intro del logo (KL-C)

Redes

- [ ] Plantillas de flyer para feed 4:5 e historia 9:16 (NB-E)
- [ ] Flyer y reel del domingo 11/10, cuando estén el lugar y la hora (NB-E7 y KL-E4)
- [ ] Íconos para las destacadas (NB-G)
- [ ] Portadas para sets y para su playlist (NB-F)

Ella

- [ ] Fotos de prensa, con su OK y desde sus fotos reales (NB-D), y clips (KL-D)
- [ ] Bio larga y corta, aprobadas por ella

Extras

- [ ] Merch y tapa del press kit (NB-H)
- [ ] Esta guía actualizada con el logo y la paleta que eligió
