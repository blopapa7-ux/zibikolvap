# 4 · Prompts para Kling 3.0

Todo lo que se mueve: loops del logo y de los fondos para la pantalla de atrás de la cabina, intros para cuando ella sube, clips cortos con ella para redes, reels de fechas y golpes de luz para los drops. Los prompts van en inglés; las explicaciones, en castellano. Casi todo arranca de una imagen ya aprobada de Nano Banana 2 (sección 3): acá no se diseña nada nuevo, se le da vida a lo que ya eligió.

## Cómo usar

- **Dónde:** Kling 3.0 en [higgsfield.ai](https://higgsfield.ai). Usá el «Kling 3.0» común, no el Turbo: el Turbo no acepta último cuadro. Modo **Pro** para todo lo que va a la pantalla; **4K** si querés máxima definición y te dan los créditos.
- **Sonido apagado:** en Higgsfield, Kling arranca con el sonido prendido. Ponelo en **Off** en todos los clips: lo de la pantalla va debajo de su set y en redes la música se pone después. Además gasta menos créditos.
- **Duración:** loops de 5 s (KL-A13 Pulso va de 6 s, por el tempo); clips con ella de 5 a 10 s; golpes para los drops de 3 s. Kling 3.0 acepta de 3 a 15 s.
- **Formato:** 16:9 para la pantalla LED y 9:16 para reels e historias. Hoy Kling 3.0 en Higgsfield ofrece solo 16:9, 9:16 y 1:1: no tiene 21:9. Los fondos de NB2 que salieron en 21:9 (C2, C5, C6 y C9) recortalos a 16:9 desde el centro antes de subirlos (el centro limpio queda igual) o generalos de nuevo en 16:9. Si Higgsfield suma el 21:9 más adelante, usalo para esos cuatro.
- **El primer cuadro, en el mismo formato que el video:** si no coincide, Kling recorta o inventa bordes. Los logos de NB2 son cuadrados: para la pantalla, ponelos antes en un lienzo negro de 1920×1080 (Canva, fondo #000000, logo centrado, alrededor del 45% del ancho) y guardá cada uno como Element: el principal, NB-B1, como **MADDA-LOGO-16x9**. Las fotos de ella que salieron en 4:5 o 3:2, pedilas de nuevo en NB2 en el formato del clip (mismo prompt, otro formato) o extendelas con Reframe en Higgsfield. Cada ficha dice qué imagen va.
- **Loops (inicio = final):** subí la **misma imagen** como primer cuadro (start frame) y como último cuadro (end frame). Así el video termina exactamente donde empezó y se repite sin corte.
- **Probar el loop:** en CapCut poné el clip, duplicalo dos o tres veces seguidas y miralo en pantalla completa. Si en la unión hay un salto, un cambio de luz o una letra que se mueve, regenerá.
- **Regenerá antes de tocar el prompt:** sacá 2 o 3 por prompt y quedate con el mejor. Si después de tres intentos falla siempre en lo mismo, cambiá una sola frase y probá de nuevo.
- **Las letras:** Kling a veces deforma el texto cuando algo se mueve. Revisá M-A-D-D-A al principio, en el medio y al final de cada clip: si una letra se dobla, cambia o aparece otra, se descarta.
- **Sin estroboscópicas ni flashes blancos:** puede haber gente fotosensible en la pista. Nada titila más de tres veces por segundo y nada se pone blanco de golpe. Si un clip sale con un destello, se descarta: no se emparcha en edición.
- **Exportar al tamaño de la pantalla:** pedile al lugar la medida exacta de la pantalla (por ejemplo 2432×1152). En CapCut armá un proyecto con esa medida, escalá el clip hasta llenar el ancho (un 16:9 pierde un 8% arriba y otro 8% abajo: ahí no hay nada importante) y exportá en MP4 (H.264) a la mayor calidad. Llevá también una copia en 1920×1080, por las dudas.
- **Nombres:** guardá cada video con su id (KL-A1.mp4, KL-B3.mp4…): la tabla de la sección F usa esos nombres.
- **Datos:** lo que está entre llaves (`{{NOMBRE}}`, `{{C1}}`…) lo completa el estudio. En Kling el color lo pone sobre todo la imagen; los datos solo lo refuerzan, así que elegí en el estudio la misma paleta con la que hiciste la imagen.
- **Clips con ella (D):** solo a partir de las fotos aprobadas de la sección D de NB2, hechas con sus fotos reales y con su OK. La cara, el pelo, la piel, los tatuajes y la ropa no cambian, y nunca nada sugerente. Si en algún momento la cara se parece menos a ella o una mano sale rara, se descarta.

| Sección | Para qué | Primer cuadro (y último) |
| --- | --- | --- |
| A · Loops del logo | el logo vivo, para la pantalla y las redes | logo aprobado (NB-A o NB-B) en 16:9 · inicio = final |
| B · Loops de fondo | lo que corre atrás durante todo el set | fondos de NB-C · inicio = final |
| C · Intros del logo | el momento en que sube ella | inicio: negro · final: logo |
| D · Clips con ella | reels y aftermovie | fotos aprobadas de NB-D |
| E · Reels de fechas | anunciar cada fecha | flyers de historia de NB-E · inicio = final |
| F · Secuencia | qué poner en cada momento del set, más tres golpes para los drops | el cuadro del loop que esté sonando |

## A · Loops del logo

El logo aprobado en loop: la cámara no se mueve y las letras tampoco; solo cambian la luz y el material. Primero los ocho materiales de NB2 (sección B), con los mismos nombres; después la versión blanca y un loop propio para cada una de las seis opciones de logo. Cada imagen va antes en el lienzo negro de 16:9 (ver «Cómo usar»).

### KL-A1 · Tornasolado

**Kling 3.0 · 5 s · 16:9 · inicio = final · sonido apagado**

El principal: el brillo tornasol se desliza por el cromo, del violeta al azul y de vuelta. Primer y último cuadro: NB-B1.

```kling
SEAMLESS LOOP · LOGO · TORNASOLADO — 5 seconds, 16:9. The attached image is both the start frame and the end frame: the clip ends exactly on it, so it loops with no visible cut.
CAMERA: locked off, no movement, no zoom.
MOTION: only the LIGHT on the metal moves, slow and smooth. A wide band of thin-film sheen drifts across the polished letters from left to right, shifting their color from {{C1}} through a pale, almost-white tint to {{C2}}, then flows back; the crisp highlight line along the top edges glides with it; the thin {{C2}} rim light on the lower edges breathes softly once. By the last frame every reflection is back exactly where it started.
LOGO LOCK: the "{{NOMBRE}}" logo (spelled {{DELETREO}}) keeps its exact letters, shapes, thickness and position in every frame: no warping, no melting, no new letters, nothing appears or disappears.
BACKGROUND: the pure black background stays pure black.
STYLE LOCK: same logo, material, colors and lighting as the start frame; no green, no gold, no new colors.
AVOID: strobe, flicker, flashes to full white, camera shake, particles, extra text.
Sound off.
```

**Tip:** es el loop que más se va a usar: hacelo primero y probalo en CapCut antes de seguir con los demás.

### KL-A2 · Cromo negro con borde violeta

**Kling 3.0 · 5 s · 16:9 · inicio = final · sonido apagado**

Un pulso de luz recorre el filo de cada letra, como corriente por una tira de LED. Primer y último cuadro: NB-B2.

```kling
SEAMLESS LOOP · LOGO · CROMO NEGRO — 5 seconds, 16:9. The attached image is both the start frame and the end frame: the clip ends exactly on it, so it loops with no visible cut.
CAMERA: locked off, no movement, no zoom.
MOTION: only the LIGHT moves. A slow pulse of brighter {{C1}} light runs along the glowing edge of every letter, from the first letter to the last, like current flowing through an LED strip, and fades back to the start glow by the end; two soft grey reflections glide slowly down the glossy black faces and return to their start positions. The edge glow stays tight and clean the whole time.
LOGO LOCK: the "{{NOMBRE}}" logo (spelled {{DELETREO}}) keeps its exact letters, shapes, thickness and position in every frame: no warping, no new letters, nothing appears or disappears.
BACKGROUND: the pure black background stays pure black; the glow never spreads into a haze.
STYLE LOCK: same logo, material, colors and lighting as the start frame.
AVOID: strobe, flicker, flashes to full white, blooming glow that merges letters, smoke, sparks, camera shake, extra text.
Sound off.
```

### KL-A3 · Metal líquido violeta

**Kling 3.0 · 5 s · 16:9 · inicio = final · sonido apagado**

El mercurio violeta fluye y las gotitas de abajo se estiran y vuelven; las letras nunca se derriten. Primer y último cuadro: NB-B3.

```kling
SEAMLESS LOOP · LOGO · METAL LÍQUIDO — 5 seconds, 16:9. The attached image is both the start frame and the end frame: the clip ends exactly on it, so it loops with no visible cut.
CAMERA: locked off, no movement, no zoom.
MOTION: only the MATERIAL moves. The molten chrome flows like mercury: bright mirror reflections slide continuously along the letters from left to right, slow ripples travel across the surfaces, the small drips at the bottom edges wobble, stretch a little and pull back to their original size; the thin {{C1}} rim light breathes softly.
LOGO LOCK: the "{{NOMBRE}}" logo (spelled {{DELETREO}}) keeps its exact letters, shapes, thickness and position the whole time: the letters never melt, sag or drip away; no warping, no new letters, nothing appears or disappears.
BACKGROUND: the pure black background stays pure black.
STYLE LOCK: exactly the same logo, colors and lighting as the start frame.
AVOID: puddles, splashes, drops flying in the air, strobe, flashes to full white, camera shake, extra text.
Sound off.
```

### KL-A4 · Holográfico

**Kling 3.0 · 5 s · 16:9 · inicio = final · sonido apagado**

La banda prismática cruza el foil como si el reflector diera la vuelta, con destellos chiquitos en los bordes. Primer y último cuadro: NB-B4.

```kling
SEAMLESS LOOP · LOGO · HOLOGRÁFICO — 5 seconds, 16:9. The attached image is both the start frame and the end frame: the clip ends exactly on it, so it loops with no visible cut.
CAMERA: locked off, no movement, no zoom.
MOTION: only the LIGHT moves, as if the spotlight slowly circled above the foil. The diagonal prismatic band slides across the logo from the top right to the bottom left while an identical band follows in from the top right, so at the end a band sits exactly where it started; the fine diffraction micro-lines shimmer as the band passes; small pinpoint glints appear gently on the silver edges one at a time, each fading in and out over about half a second.
LOGO LOCK: the "{{NOMBRE}}" logo (spelled {{DELETREO}}) keeps its exact letters, shapes, thickness and position in every frame: no warping, no new letters, nothing appears or disappears.
BACKGROUND: the pure black background stays pure black.
STYLE LOCK: same logo, foil, colors and lighting as the start frame; no green, yellow or orange bands.
AVOID: sparkle bursts, strobe, flashes to full white, camera shake, extra text.
Sound off.
```

### KL-A5 · Vidrio esmerilado

**Kling 3.0 · 5 s · 16:9 · inicio = final · sonido apagado**

El más tranquilo: la luz de atrás del acrílico se corre despacio de un color al otro. Primer y último cuadro: NB-B5.

```kling
SEAMLESS LOOP · LOGO · VIDRIO ESMERILADO — 5 seconds, 16:9. The attached image is both the start frame and the end frame: the clip ends exactly on it, so it loops with no visible cut.
CAMERA: locked off, no movement, no zoom.
MOTION: calm; only the LIGHT moves. The backlight behind the frosted glass drifts slowly, its gradient sliding from {{C1}} on the left to {{C2}} on the right and back; thin bright lines of light travel along the polished clear edges of the letters; the milky faces glow a little brighter and back once, very softly.
LOGO LOCK: the "{{NOMBRE}}" logo (spelled {{DELETREO}}) keeps its exact letters, shapes, thickness and position in every frame: no warping, no new letters, nothing appears or disappears.
BACKGROUND: the pure black background stays pure black.
STYLE LOCK: same logo, glass, colors and lighting as the start frame.
AVOID: bubbles, cracks, condensation, reflections of a room, strobe, flashes to full white, camera shake, extra text.
Sound off.
```

### KL-A6 · Neón violeta y blanco

**Kling 3.0 · 5 s · 16:9 · inicio = final · sonido apagado**

Tubos de neón de verdad, como una instalación de luz en un club oscuro: zumban, respiran y tienen un solo bajón de luz, nunca un parpadeo. Primer y último cuadro: NB-B6.

```kling
SEAMLESS LOOP · LOGO · NEÓN — 5 seconds, 16:9. The attached image is both the start frame and the end frame: the clip ends exactly on it, so it loops with no visible cut.
CAMERA: locked off, no movement, no zoom.
MOTION: real glass neon tubes glowing in a dark, empty club, minimal like a light installation. The {{C1}} outer tubes and the white inner tubes hum with a soft, steady glow that breathes gently twice (a little brighter, a little dimmer, back); at 2.5 s the white tube of one letter dips to half brightness for a moment and comes back steady: one authentic neon hiccup, never fully off and never a flash; the glass highlights shimmer softly.
LOGO LOCK: the tube lettering "{{NOMBRE}}" (spelled {{DELETREO}}) keeps its exact letters, shapes and position in every frame: no warping, no new letters, no new tubes, nothing appears or disappears.
BACKGROUND: pure black; the glow stays contained, the spaces inside and between the letters stay dark.
STYLE LOCK: same sign, colors and lighting as the start frame.
AVOID: repeated flicker, strobe, flashes to full white, a wall, smoke, camera shake, extra text.
Sound off.
```

### KL-A7 · Cristal grabado con láser

**Kling 3.0 · 5 s · 16:9 · inicio = final · sonido apagado**

La luz de abajo se mueve y las líneas grabadas se prenden en secuencia, como un escaneo suave. Primer y último cuadro: NB-B7.

```kling
SEAMLESS LOOP · LOGO · CRISTAL GRABADO — 5 seconds, 16:9. The attached image is both the start frame and the end frame: the clip ends exactly on it, so it loops with no visible cut.
CAMERA: locked off, no movement, no zoom.
MOTION: only the LIGHT moves. The low colored light below the frame drifts slowly from left to right and back, so the laser-etched lines on the front faces light up in sequence like a gentle scan, shifting between {{C1}} and {{C2}}; refractions sparkle softly along the beveled edges; faint caustics drift and return to their start positions.
LOGO LOCK: the "{{NOMBRE}}" logo (spelled {{DELETREO}}) keeps its exact letters, shapes, thickness and position in every frame: no warping, no new letters, nothing appears or disappears.
BACKGROUND: the pure black background stays pure black.
STYLE LOCK: same logo, crystal, colors and lighting as the start frame.
AVOID: rainbow caustics, cracks, a base or stand, sparkle bursts, strobe, flashes to full white, camera shake, extra text.
Sound off.
```

### KL-A8 · Cromo rojo

**Kling 3.0 · 5 s · 16:9 · inicio = final · sonido apagado**

La alternativa roja, como un comercial de autos de lujo. Ya trae el rojo puesto: no depende de la paleta. Primer y último cuadro: NB-B8.

```kling
SEAMLESS LOOP · LOGO · CROMO ROJO — 5 seconds, 16:9. The attached image is both the start frame and the end frame: the clip ends exactly on it, so it loops with no visible cut.
CAMERA: locked off, no movement, no zoom.
MOTION: only the LIGHT moves, like a luxury car commercial. A slow sweep of light glides across the polished red chrome from left to right; the crisp white highlight line along the top edges slides with it; the thin white rim light breathes softly; the deep red shadows shift gently and return.
LOGO LOCK: the "{{NOMBRE}}" logo (spelled {{DELETREO}}) keeps its exact letters, shapes, thickness and position in every frame: no warping, no new letters, nothing appears or disappears.
BACKGROUND: the pure black background stays pure black.
STYLE LOCK: same logo, material and lighting as the start frame. COLOR LOCK: only lacquered red (#E3123B), deep blood red, near-black and white: no violet, no blue, no orange, no pink.
AVOID: strobe, flashes to full white, camera shake, extra text.
Sound off.
```

### KL-A9 · Versión blanca para pantallas

**Kling 3.0 · 5 s · 16:9 · inicio = final · sonido apagado**

Lo que ella pidió: el nombre blanco que se lee arriba de cualquier visual, casi quieto, con una sola pasada de brillo. Primer y último cuadro: NB-A8 (blanco sobre negro) en 16:9; en el software de visuales el negro se va con el modo «Screen».

```kling
SEAMLESS LOOP · LOGO · BLANCO PARA PANTALLAS — 5 seconds, 16:9. The attached image is both the start frame and the end frame: the clip ends exactly on it, so it loops with no visible cut.
CAMERA: locked off, no movement, no zoom.
MOTION: almost still, on purpose. Once, between 1.5 s and 3.5 s, a soft sheen passes across the letters from left to right: the white dims very slightly to a pale grey just around a narrow bright band, then returns to flat pure white. The rest of the time the logo is completely still.
LOGO LOCK: the white "{{NOMBRE}}" logo (spelled {{DELETREO}}) keeps its exact letters, shapes, thickness and position in every frame, and its dark cut-out details stay exactly as they are: no warping, no new letters, nothing appears or disappears.
BACKGROUND: pure black (#000000) edge to edge, perfectly flat: no glow, no haze, no grain spilling around the letters, so the black can be removed with a Screen or Add blend in VJ software.
STYLE LOCK: flat pure white (#FFFFFF) letters, exactly as in the start frame: no color, no gradient, no outline appears.
AVOID: glow halos, strobe, flashes, the black background brightening, camera shake, extra text.
Sound off.
```

**Tip:** si preferís que no se mueva nada, usá directamente la imagen NB-A8: un logo blanco quieto arriba de las visuales también funciona.

### KL-A10 · Tornasol

**Kling 3.0 · 5 s · 16:9 · inicio = final · sonido apagado**

La opción 1 tal cual la dibujó NB2, plana, con el degradé moviéndose adentro de las letras como aceite sobre agua. Primer y último cuadro: NB-A1.

```kling
SEAMLESS LOOP · LOGO · TORNASOL — 5 seconds, 16:9. The attached image is both the start frame and the end frame: the clip ends exactly on it, so it loops with no visible cut.
CAMERA: locked off, no movement, no zoom.
MOTION: only the COLOR inside the letters moves. The iridescent gradient drifts slowly sideways inside the letters like oil on water, from {{C1}} through the pale tint to {{C2}}, sliding from left to right and wrapping around, so at the end it sits exactly where it started; a small bright glint runs along the thin horizontal highlight line from left to right and fades out.
LOGO LOCK: the "{{NOMBRE}}" logo (spelled {{DELETREO}}) keeps its exact letters, shapes, thickness and position in every frame: no warping, no new letters, nothing appears or disappears.
BACKGROUND: the pure black background stays pure black.
STYLE LOCK: the same flat vector look as the start frame: no 3D, no bevel, no shadow appears; no green, no yellow, no full rainbow.
AVOID: strobe, flashes to full white, camera shake, particles, extra text.
Sound off.
```

### KL-A11 · Doble D

**Kling 3.0 · 5 s · 16:9 · inicio = final · sonido apagado**

Su firma en movimiento: los dos platos giran para lados opuestos, como un par de bandejas, y terminan donde empezaron. Primer y último cuadro: NB-A2 (o su versión en el material aprobado).

```kling
SEAMLESS LOOP · LOGO · DOBLE D — 5 seconds, 16:9. The attached image is both the start frame and the end frame: the clip ends exactly on it, so it loops with no visible cut.
CAMERA: locked off, no movement, no zoom.
MOTION: the two vinyl platters inside the two D's spin slowly in opposite directions, like a pair of decks: the platter in the first D turns counter-clockwise, the platter in the second D turns clockwise, each exactly one full turn in five seconds at a constant speed, so they end exactly where they started. A faint highlight in the grooves turns with each platter, making the spin visible, while the soft curved reflection on each platter stays fixed in place, like real light on a spinning record. The small cap of the crossfader glides a little to the left, back through the middle, a little to the right and back to the middle.
LOGO LOCK: the letters of "{{NOMBRE}}" (spelled {{DELETREO}}), the stems and outlines of the two D's, the size and position of the platters and the crossfader line stay fixed; the platters only rotate in place. No warping, no new letters, nothing appears or disappears.
BACKGROUND: the pure black background stays pure black.
STYLE LOCK: same logo, colors and flat style as the start frame.
AVOID: tonearms, extra knobs, strobe, flashes to full white, camera shake, extra text.
Sound off.
```

**Tip:** si los dos platos giran para el mismo lado, regenerá. Si la D se deforma, sacá la frase del crossfader y probá de nuevo.

### KL-A12 · Láser

**Kling 3.0 · 5 s · 16:9 · inicio = final · sonido apagado**

Se mueve la luz del láser, no las letras: un punto recorre el haz y un escaneo baja por las líneas. Primer y último cuadro: NB-A3.

```kling
SEAMLESS LOOP · LOGO · LÁSER — 5 seconds, 16:9. The attached image is both the start frame and the end frame: the clip ends exactly on it, so it loops with no visible cut.
CAMERA: locked off, no movement, no zoom.
MOTION: only the laser light moves. A bright point of light travels along the crossing beam from left to right; a soft scan of brighter light passes down through the thin horizontal lines inside the letters, from top to bottom, and the lines settle back to their start brightness; the {{C2}} halo of the beam breathes once.
LOGO LOCK: the "{{NOMBRE}}" logo (spelled {{DELETREO}}), its outlines, its line pattern and the single crossing beam keep their exact shapes and positions in every frame: no warping, no new letters, no extra beams, nothing appears or disappears.
BACKGROUND: the pure black background stays pure black.
STYLE LOCK: same logo, colors and glow as the start frame; the glow stays tight, the letters never blur or merge.
AVOID: smoke, sparks, beams pointing at the camera, strobe, flashes to full white, camera shake, extra text.
Sound off.
```

### KL-A13 · Pulso

**Kling 3.0 · 6 s · 16:9 · inicio = final · sonido apagado**

La onda que corta las letras respira al ritmo del techno. Va de 6 s porque a 130 BPM son 13 pulsos justos y el loop no se corre. Primer y último cuadro: NB-A4.

```kling
SEAMLESS LOOP · LOGO · PULSO — 6 seconds, 16:9. The attached image is both the start frame and the end frame: the clip ends exactly on it, so it loops with no visible cut.
CAMERA: locked off, no movement, no zoom.
MOTION: the white waveform line inside the cut breathes to a techno pulse of about 130 BPM: thirteen even pulses in six seconds, one every 0.46 seconds. On each pulse the central peaks rise a little taller and settle back, while the flat ends stay flat; the waveform always stays inside the gap. The brightness stays steady: the pulse is in the height of the wave, not in the light.
LOGO LOCK: the "{{NOMBRE}}" logo (spelled {{DELETREO}}), its letters and the gap that cuts them never move or change: no warping, no new letters, no second wave, nothing appears or disappears.
BACKGROUND: the pure black background stays pure black.
STYLE LOCK: same logo, colors and flat style as the start frame.
AVOID: equalizer bars, strobe, flicker, flashes to full white, camera shake, extra text.
Sound off.
```

**Tip:** Kling no clava un tempo exacto: es una respiración al ritmo, no una sincronía (si el VJ quiere que vaya al bombo, lo ajusta en su programa). Si ella midió otro tempo con el tap de la página, cambiá BPM, pulsos, segundos y duración para que den justo: 120 BPM → 5 s y 10 pulsos (0.5 s), 128 → 15 s y 32 (0.47 s), 132 → 5 s y 11 (0.45 s), 135 → 4 s y 9 (0.44 s), 140 → 6 s y 14 (0.43 s).

### KL-A14 · Mono

**Kling 3.0 · 5 s · 16:9 · inicio = final · sonido apagado**

Mínimo: las letras quietas y el punto final que titila suave, como el cursor de un texto. Primer y último cuadro: NB-A5.

```kling
SEAMLESS LOOP · LOGO · MONO — 5 seconds, 16:9. The attached image is both the start frame and the end frame: the clip ends exactly on it, so it loops with no visible cut.
CAMERA: locked off, no movement, no zoom.
MOTION: only the small {{C1}} dot after the name moves. It blinks softly like a text cursor: it fades out and back in once per second, five smooth blinks in five seconds, ending fully visible as in the start frame. Each fade takes about a quarter of a second: smooth, never a hard flash.
LOGO LOCK: the lowercase letters of "{{NOMBRE}}" (spelled {{DELETREO}}) stay completely still and keep their exact shapes and positions: every letter stays lowercase, no warping, no new letters, nothing appears or disappears.
BACKGROUND: the pure black background stays pure black.
STYLE LOCK: same flat white letters and colors as the start frame: no glow, no gradient appears.
AVOID: strobe, flashes to full white, camera shake, underline, cursor bar, extra text.
Sound off.
```

### KL-A15 · Sello

**Kling 3.0 · 5 s · 16:9 · inicio = final · sonido apagado**

El vinilo da una vuelta entera, lento, como en la bandeja, y termina derecho. Primer y último cuadro: NB-A6.

```kling
SEAMLESS LOOP · LOGO · SELLO — 5 seconds, 16:9. The attached image is both the start frame and the end frame: the clip ends exactly on it, so it loops with no visible cut.
CAMERA: locked off, no movement, no zoom.
MOTION: the record turns like on a turntable: the disc, the {{C1}} center label, the "M" and the ring text rotate together clockwise exactly one full turn in five seconds, smoothly and at a constant speed, ending perfectly upright exactly as in the start frame. The two soft diagonal reflections on the grooves stay fixed in place while the record turns under them; the thin {{C2}} outer line stays a perfect circle.
LOGO LOCK: the "M" and the ring text "{{NOMBRE}} · TECHNO" keep exactly the same letters, spelling ({{DELETREO}}) and spacing while they rotate: no letter blurs, changes or appears; the disc stays perfectly round and centered.
BACKGROUND: the pure black background stays pure black.
STYLE LOCK: same badge, colors and flat style as the start frame.
AVOID: wobble, tonearm, strobe, flashes to full white, camera shake, extra text.
Sound off.
```

**Tip:** si las letras del anillo se ensucian al girar, cambiá la frase de MOTION por «only the black grooved disc spins; the center label, the M and the ring text stay perfectly still and upright».

## B · Loops de fondo

Los fondos aprobados de NB2 (sección C), con los mismos nombres, como primer y último cuadro. Solo se mueve el ambiente: luz, humo, agua. El centro oscuro sigue limpio todo el tiempo, porque ahí va el logo blanco. Los de 21:9 (C2, C5, C6 y C9), recortalos a 16:9 desde el centro antes de subirlos.

### KL-B1 · Galpón con láseres

**Kling 3.0 · 5 s · 16:9 · inicio = final · sonido apagado**

Los láseres de las esquinas se abren un poco y vuelven; el humo pasa entre ellos. Primer y último cuadro: NB-C1.

```kling
SEAMLESS LOOP · BACKGROUND · GALPÓN CON LÁSERES — 5 seconds, 16:9. Use the attached image as both the start frame and the end frame: the clip must end exactly on the start frame so it loops without a cut.
CAMERA: locked off: no zoom, no pan, no camera movement at all.
MOTION: ambient motion only, slow and smooth, like a live show. The laser beams from the upper left and upper right corners sweep a few degrees outward and back to their exact start positions, always staying at the sides; the haze drifts slowly through them, thickening and thinning; the reflections on the wet concrete floor shimmer gently.
CENTER: the dark middle third stays dark, calm and clean the whole time: no beam crosses it, nothing bright passes through it.
Nothing new enters the frame: no people, no text, no logos, no strobe, no flashes to full white, no camera shake.
STYLE LOCK: exactly the same look, colors and lighting as the start frame. Sound off.
```

### KL-B2 · Búnker de hormigón

**Kling 3.0 · 5 s · 16:9 · inicio = final · sonido apagado**

Una franja de luz recorre la grilla de las paredes hacia el fondo y se apaga antes de llegar. Primer y último cuadro: NB-C2, recortado a 16:9.

```kling
SEAMLESS LOOP · BACKGROUND · BÚNKER DE HORMIGÓN — 5 seconds, 16:9. Use the attached image as both the start frame and the end frame: the clip must end exactly on the start frame so it loops without a cut.
CAMERA: locked off: no zoom, no pan, no camera movement at all.
MOTION: ambient motion only, slow and smooth. Once, from 0.5 s to 4.5 s, a soft band of brighter {{C1}} light travels along the perspective grid on the side walls and floor edges, from the near edges of the frame toward the far end of the corridor, and fades out before reaching the dark end wall; the light haze drifts slowly. The grid lines themselves never move.
CENTER: the far end of the corridor in the middle third stays in deep, calm shadow the whole time: no light reaches it.
Nothing new enters the frame: no people, no doors opening, no text, no logos, no strobe, no flashes to full white, no camera shake.
STYLE LOCK: exactly the same look, colors and lighting as the start frame. Sound off.
```

### KL-B3 · Túnel de láser

**Kling 3.0 · 5 s · 16:9 · inicio = final · sonido apagado**

Un viaje sin fin: los cuadros de luz del túnel avanzan hacia la cámara y cada uno ocupa el lugar del siguiente. Primer y último cuadro: NB-C3.

```kling
SEAMLESS LOOP · BACKGROUND · TÚNEL DE LÁSER — 5 seconds, 16:9. Use the attached image as both the start frame and the end frame: the clip must end exactly on the start frame so it loops without a cut.
CAMERA: locked off: no zoom, no pan, no camera movement at all; the motion is in the light, not the camera.
MOTION: slow, endless forward motion. The thin square frames of light glide toward the viewer along the tunnel at a constant speed, each one moving exactly to the position of the next one in five seconds, so the last frame matches the first; new frames fade in softly from the dark depth, already dim, and the nearest ones slide out past the edges of the frame. The long lines of the tunnel walls stay fixed; the color stays {{C1}} near the edges and {{C2}} deeper in.
CENTER: the black void in the middle stays empty: the lines and frames fade out before reaching it.
Nothing new enters the frame: no people, no text, no logos, no strobe, no flashes to full white, no camera shake.
STYLE LOCK: exactly the same look, colors and lighting as the start frame. Sound off.
```

### KL-B4 · Humo tornasolado

**Kling 3.0 · 5 s · 16:9 · inicio = final · sonido apagado**

El humo de los costados se enrolla despacio y el brillo tornasol le corre por encima. Primer y último cuadro: NB-C4.

```kling
SEAMLESS LOOP · BACKGROUND · HUMO TORNASOLADO — 5 seconds, 16:9. Use the attached image as both the start frame and the end frame: the clip must end exactly on the start frame so it loops without a cut.
CAMERA: locked off: no zoom, no pan, no camera movement at all.
MOTION: ambient motion only, slow and silky. The smoke clouds in the left and right thirds roll and curl slowly, their folds drifting a little and settling back into their starting shapes; the thin-film sheen on the smoke shifts gently from {{C1}} to {{C2}} and back; the faint wisp in the middle drifts but never brightens.
CENTER: the middle third stays calm and nearly black the whole time.
Nothing new enters the frame: no people, no faces or shapes in the smoke, no fire, no text, no logos, nothing appears or disappears suddenly, no strobe, no flashes to full white, no camera shake.
STYLE LOCK: exactly the same look, colors and lighting as the start frame. Sound off.
```

### KL-B5 · Anillos hipnóticos

**Kling 3.0 · 5 s · 16:9 · inicio = final · sonido apagado**

Los anillos se expanden lentísimo desde el centro; el contraste queda bajo para no cansar la vista. Primer y último cuadro: NB-C5, recortado a 16:9.

```kling
SEAMLESS LOOP · BACKGROUND · ANILLOS HIPNÓTICOS — 5 seconds, 16:9. Use the attached image as both the start frame and the end frame: the clip must end exactly on the start frame so it loops without a cut.
CAMERA: locked off: no zoom, no pan, no rotation, no camera movement at all.
MOTION: very slow and even. The dim {{C1}} concentric rings expand outward from the center at a constant speed, each ring moving exactly to the position of the next one in five seconds, so the last frame matches the first; the offset {{C2}} set of rings drifts slowly the opposite way, so the soft moiré shifts gently. The contrast stays soft and dim the whole time: no flicker, no fast shimmering, no pulsing.
CENTER: the calm black disc in the center stays empty and still.
Nothing new enters the frame: no spirals, no text, no logos, no strobe, no flashes to full white, no camera shake.
STYLE LOCK: exactly the same look, colors and lighting as the start frame. Sound off.
```

**Tip:** si el moiré vibra o titila, descartalo: es lo que más cansa la vista y lo más riesgoso para alguien fotosensible.

### KL-B6 · Agua negra

**Kling 3.0 · 5 s · 16:9 · inicio = final · sonido apagado**

Ondas mínimas sobre el agua negra; los reflejos de luz se quiebran y se vuelven a armar. Primer y último cuadro: NB-C6, recortado a 16:9.

```kling
SEAMLESS LOOP · BACKGROUND · AGUA NEGRA — 5 seconds, 16:9. Use the attached image as both the start frame and the end frame: the clip must end exactly on the start frame so it loops without a cut.
CAMERA: locked off: no zoom, no pan, no camera movement at all.
MOTION: ambient motion only, minimal and silent. Tiny ripples cross the black water slowly from left to right; the long vertical reflections of {{C1}} and {{C2}} light break into soft wavering lines and re-form, always in their own places; a few white glints shimmer softly; the dark horizon stays still.
CENTER: the middle third stays dark water with only a faint, slow shimmer.
Nothing new enters the frame: no people, no boats, no birds, no text, no logos, no strobe, no flashes to full white, no camera shake.
STYLE LOCK: exactly the same look, colors and lighting as the start frame. Sound off.
```

### KL-B7 · Monolito en la niebla

**Kling 3.0 · 5 s · 16:9 · inicio = final · sonido apagado**

La niebla corre por el piso y la luz de atrás respira una vez; el monolito no se mueve. Primer y último cuadro: NB-C7.

```kling
SEAMLESS LOOP · BACKGROUND · MONOLITO EN LA NIEBLA — 5 seconds, 16:9. Use the attached image as both the start frame and the end frame: the clip must end exactly on the start frame so it loops without a cut.
CAMERA: locked off: no zoom, no pan, no camera movement at all.
MOTION: ambient motion only, quiet and monumental. The low fog on the ground drifts slowly from left to right across the plain; the wide {{C1}} glow behind the monolith breathes softly once, a little brighter and back; the thin {{C2}} rim along its edges shimmers gently. The monolith itself is perfectly still.
CENTER: the flat front face of the monolith stays matte black, empty and still the whole time: no reflections, marks or light cross it.
Nothing new enters the frame: no people, no symbols, no text, no logos, no strobe, no flashes to full white, no camera shake.
STYLE LOCK: exactly the same look, colors and lighting as the start frame. Sound off.
```

### KL-B8 · Abanico de haces

**Kling 3.0 · 5 s · 16:9 · inicio = final · sonido apagado**

El abanico se abre un poco y se cierra, parejo de los dos lados. Haces fijos, nunca se prenden y apagan. Primer y último cuadro: NB-C8.

```kling
SEAMLESS LOOP · BACKGROUND · ABANICO DE HACES — 5 seconds, 16:9. Use the attached image as both the start frame and the end frame: the clip must end exactly on the start frame so it loops without a cut.
CAMERA: locked off: no zoom, no pan, no camera movement at all.
MOTION: ambient motion only, powerful but slow. The fan of steady beams sways slowly and symmetrically: it opens a few degrees wider, closes back and ends exactly at its start positions; the haze rolls slowly through the beams. The beams stay solid and steady the whole time: no switching on and off, no pulsing.
CENTER: the dark V-shaped space in the middle stays dark: no beam crosses into it.
Nothing new enters the frame: no people, no crowd, no light fixtures, no text, no logos, no strobe, no flashes to full white, no camera shake.
STYLE LOCK: exactly the same look, colors and lighting as the start frame. Sound off.
```

### KL-B9 · Película tornasol

**Kling 3.0 · 5 s · 16:9 · inicio = final · sonido apagado**

Las vetas de los costados se arremolinan como una burbuja de jabón viva. Primer y último cuadro: NB-C9, recortado a 16:9.

```kling
SEAMLESS LOOP · BACKGROUND · PELÍCULA TORNASOL — 5 seconds, 16:9. Use the attached image as both the start frame and the end frame: the clip must end exactly on the start frame so it loops without a cut.
CAMERA: locked off: no zoom, no pan, no camera movement at all.
MOTION: ambient motion only, silky and hypnotic. The marbled bands of {{C1}} and {{C2}} at the left and right edges swirl slowly like a living soap film, flowing in slow circles and returning to their starting pattern; the pale tints shimmer as they pass. The colors stay inside the palette: no green, no yellow, no orange, no full rainbow.
CENTER: the deep near-black void in the middle keeps only its faint sheen the whole time.
Nothing new enters the frame: no bubbles with reflections, no text, no logos, nothing appears or disappears suddenly, no strobe, no flashes to full white, no camera shake.
STYLE LOCK: exactly the same look, colors and lighting as the start frame. Sound off.
```

### KL-B10 · Vacío con aurora

**Kling 3.0 · 5 s · 16:9 · inicio = final · sonido apagado**

Las cortinas de aurora ondulan como tela con una brisa suave. Primer y último cuadro: NB-C10.

```kling
SEAMLESS LOOP · BACKGROUND · VACÍO CON AURORA — 5 seconds, 16:9. Use the attached image as both the start frame and the end frame: the clip must end exactly on the start frame so it loops without a cut.
CAMERA: locked off: no zoom, no pan, no camera movement at all.
MOTION: ambient motion only, soft and silent. The aurora curtains in the left and right thirds wave slowly like fabric in a gentle breeze, soft ripples travel upward along them, their brightness breathes gently and returns; the thin {{C2}} edges shimmer.
CENTER: the dark gap between the curtains stays calm and dark the whole time.
Nothing new enters the frame: no stars, no planets, no land, no people, no text, no logos, no strobe, no flashes to full white, no camera shake.
STYLE LOCK: exactly the same look, colors and lighting as the start frame. Sound off.
```

### KL-B11 · Fondo + logo (cuadro para la pantalla)

**Kling 3.0 · 5 s · 16:9 · inicio = final · sonido apagado**

El loop que va en la pantalla toda la noche: el fondo se mueve y el logo blanco queda clavado. Primer y último cuadro: NB-C11 (el fondo elegido con el logo blanco).

```kling
SEAMLESS LOOP · BACKGROUND + LOGO — 5 seconds, 16:9. Use the attached image as both the start frame and the end frame: the clip must end exactly on the start frame so it loops without a cut.
CAMERA: locked off: no zoom, no pan, no camera movement at all.
MOTION: only the background moves, slow and ambient, like a live show, and only with the elements already visible in the start frame: if there are beams, they sway a few degrees and come back; if there is haze or smoke, it drifts; if there is water, it ripples; if there is a glow, it breathes softly once. Nothing is added that is not already in the start frame, and every element is back at its exact start position by the last frame. The dark area around the logo stays dark.
LOGO LOCK: the white "{{NOMBRE}}" logo in the center (spelled {{DELETREO}}) stays perfectly still, flat, sharp and identical in every frame: same letters, shapes, size, position, thin dark outline and soft shadow. It never fades, moves or changes, and no glow grows around it; only the faint reflection of the background light on its edges, as in the start frame.
Nothing new enters the frame: no people, no extra text, no other logos, no strobe, no flashes to full white, no camera shake.
STYLE LOCK: exactly the same look, colors and lighting as the start frame. Sound off.
```

**Tip:** para que el fondo se mueva igual que en su propio loop, copiá la línea MOTION de ese fondo (KL-B1 a KL-B10) y pegala en lugar de la de acá, dejando el LOGO LOCK.

## C · Intros del logo

Para el momento en que sube ella: 5 segundos que terminan en el logo. Primer cuadro: una imagen negra lisa de 1920×1080 (hacela en Canva y guardala como Element **MADDA-NEGRO**). Último cuadro: el logo en 16:9. Como ese último cuadro es el mismo con el que arranca el loop del logo, del intro se pasa al loop sin corte.

### KL-C1 · Revelado tornasol

**Kling 3.0 · 5 s · 16:9 · inicio = negro · final = logo · sonido apagado**

Una película tornasol se abre en la oscuridad y descubre el nombre. Sirve para cualquier logo. Último cuadro: NB-B1 en 16:9.

```kling
LOGO INTRO · REVELADO TORNASOL — 5 seconds, 16:9. Start frame: the attached pure black image. End frame: the attached "{{NOMBRE}}" logo; the clip ends exactly on it, perfectly still for the last half second.
ACTION:
0–2 s: in the darkness, a thin film of iridescent light, like oil spreading on black water, blooms softly from the center and spreads outward, shimmering from {{C1}} to {{C2}}.
2–4 s: as the film spreads across the frame, it reveals the letters of the logo underneath, from the center outward, like a sheen sliding over polished metal.
4–5 s: the film gathers into the letters and becomes their exact finish; everything outside the letters returns to pure black and the frame holds on the end frame.
CAMERA: locked off, no movement.
LOGO LOCK: the logo builds only toward the exact letters of the end frame ({{DELETREO}}): no other letters, no wrong letters at any moment; once a letter is revealed, it never changes shape.
CONSTRAINTS: the background ends pure black; the light rises smoothly, never a flash; no strobe, no flashes to full white, no camera shake, no extra text. Sound off.
```

### KL-C2 · Doble D

**Kling 3.0 · 5 s · 16:9 · inicio = negro · final = logo · sonido apagado**

Solo si eligió Doble D: dos platos entran girando desde los costados y encajan como las dos D. Último cuadro: NB-A2 (o su versión en el material aprobado) en 16:9.

```kling
LOGO INTRO · DOBLE D — 5 seconds, 16:9. Start frame: the attached pure black image. End frame: the attached "{{NOMBRE}}" logo, whose two D's are drawn as a pair of vinyl platters; the clip ends exactly on it, perfectly still for the last half second.
ACTION:
0–2 s: two black vinyl platters slide in smoothly from the left and right edges of the frame toward the center, spinning in opposite directions, their fine grooves catching {{C1}} light.
2–4 s: they slow down and settle exactly into the bowls of the two D's, back to back; the straight stems of the D's and the slim crossfader between them draw in as clean lines; the "M" and the first "A" fade in smoothly on the left and the last "A" on the right.
4–5 s: the platters stop in exactly the orientation of the end frame and the whole logo holds, completely still.
CAMERA: locked off, no movement.
LOGO LOCK: the logo builds only toward the exact letters of the end frame ({{DELETREO}}): five letters, no other letters, no wrong letters at any moment; once a letter appears, it never changes shape.
CONSTRAINTS: the background stays pure black; letters fade in smoothly, never a flash; no tonearms, no strobe, no flashes to full white, no camera shake, no extra text. Sound off.
```

### KL-C3 · Láser

**Kling 3.0 · 5 s · 16:9 · inicio = negro · final = logo · sonido apagado**

Haces de láser barren la pantalla y dibujan las letras línea por línea. Último cuadro: el logo aprobado en 16:9 (queda mejor con Láser, NB-A3, o con la versión blanca, NB-A8).

```kling
LOGO INTRO · LÁSER — 5 seconds, 16:9. Start frame: the attached pure black image. End frame: the attached "{{NOMBRE}}" logo; the clip ends exactly on it, perfectly still for the last half second.
ACTION:
0–1.5 s: a single razor-thin laser beam appears at the left edge and sweeps horizontally across the black frame to the right, through a whisper of haze.
1.5–4 s: a row of thin beams scans down the frame from top to bottom and traces the letters line by line, like a laser projector drawing them; every traced line stays lit.
4–5 s: the scan finishes, the extra beams retract and fade, and the drawn letters become exactly the end frame, holding still.
CAMERA: locked off, no movement.
LOGO LOCK: the drawing builds only toward the exact letters of the end frame ({{DELETREO}}): no other letters, no wrong letters at any moment; once a line is drawn, it never moves.
CONSTRAINTS: the beams are thin and steady, in {{C1}} with a white core; no beam points at the camera, no lens flare, no strobe, no flashes to full white, no camera shake, no extra text. Sound off.
```

### KL-C4 · Pulso

**Kling 3.0 · 5 s · 16:9 · inicio = negro · final = logo · sonido apagado**

Una línea plana se vuelve onda de sonido y en el pico más alto se congela en el logo. Último cuadro: NB-A4 (Pulso) en 16:9; anda también con otro logo.

```kling
LOGO INTRO · PULSO — 5 seconds, 16:9. Start frame: the attached pure black image. End frame: the attached "{{NOMBRE}}" logo; the clip ends exactly on it, perfectly still for the last half second.
ACTION:
0–1.5 s: a thin, flat white line draws itself across the middle of the black frame, from left to right.
1.5–3.5 s: the line comes alive as an audio waveform: four even pulses, each one a little taller in the center than the last, the ends always flat.
3.5–5 s: on the tallest peak, the letters rise out of the waveform, growing up and down from the line, and everything freezes exactly into the end frame; hold.
CAMERA: locked off, no movement.
LOGO LOCK: the letters build only toward the exact letters of the end frame ({{DELETREO}}): no other letters, no wrong letters at any moment; once a letter is formed, it never changes shape.
CONSTRAINTS: the background stays pure black; brightness stays steady, the pulses are in the height of the wave, not in the light; no equalizer bars, no strobe, no flashes to full white, no camera shake, no extra text. Sound off.
```

### KL-C5 · Entrada en abanico

**Kling 3.0 · 5 s · 16:9 · inicio = negro · final = logo · sonido apagado**

Los haces se abren en abanico desde abajo y el logo blanco aparece en el humo. Último cuadro: NB-C11 hecho con el fondo NB-C8 (Abanico de haces).

```kling
LOGO INTRO · ENTRADA EN ABANICO — 5 seconds, 16:9. Start frame: the attached pure black image. End frame: the attached frame of a fan of light beams in haze with the white "{{NOMBRE}}" logo in its dark center; the clip ends exactly on it, perfectly still for the last half second.
ACTION:
0–1.5 s: out of the black, faint haze becomes visible, softly lit from below the frame.
1.5–3.5 s: steady beams of {{C1}} and white light rise from below the frame one pair at a time, from the center outward, each one fading up smoothly over half a second, and open into the symmetrical fan of the end frame.
3.5–5 s: in the dark center of the fan, the white logo emerges from the haze, fading up smoothly from black over about one second, and the frame settles exactly on the end frame.
CAMERA: locked off, no movement.
LOGO LOCK: the logo appears only as the exact letters of the end frame ({{DELETREO}}): no other letters, no wrong letters at any moment; once visible, it never changes shape.
CONSTRAINTS: beams fade up smoothly, never switch on in a flash; no strobe, no flashes to full white, no people, no camera shake, no extra text. Sound off.
```

**Tip:** después de este intro, poné KL-B11 hecho con el mismo cuadro C11: enganchan sin corte.

## D · Clips con ella

Solo con las fotos aprobadas de la sección D de NB2, hechas con sus fotos reales y con su OK. Primer cuadro: esa foto, en el formato del clip (pedila de nuevo en NB2 en 9:16 o 16:9, o extendela con Reframe). Salvo KL-D7, que es un loop, no hay último cuadro: el clip termina donde lo lleva la acción. Son para redes y para un aftermovie; en la pantalla, mientras toca, ya está ella en vivo. Si la cara cambia, si una mano sale rara o algo se ve sugerente, se descarta sin vueltas.

### KL-D1 · Filtro y sonrisa

**Kling 3.0 · 5 s · 9:16 · inicio = NB-D1 · sonido apagado**

En la cabina: abre el filtro, levanta la vista y le sonríe a la pista. Primer cuadro: NB-D1 en 9:16.

```kling
CLIP · {{NOMBRE}} · FILTER SWEEP — 5 seconds, 9:16. The attached image is the start frame: the DJ {{NOMBRE}} playing at the decks in a dark techno club. She is an adult professional DJ.
FACE LOCK: she stays exactly the same person as in the start frame in every frame: same face, features, skin tone and skin texture, hair, tattoos and piercings. No beautifying, no reshaping of face or body, no change of age, no lighter or darker skin. Never another person.
OUTFIT LOCK: exactly the same clothes as in the start frame, fully clothed; nothing changes, opens or slips.
HANDS: natural hands with five fingers each, moving with real weight on real controls; fingers never merge, stretch or bend unnaturally.
LOGO/TEXT LOCK: no text, letters or logos appear anywhere; the equipment stays unbranded.
MOUTH: natural, relaxed or closed; she does not sing, talk or lip-sync.
ACTION:
0–2 s: focused on the mix, she slowly turns the large filter knob on the mixer with one hand, her head nodding gently to the beat.
2–4 s: as the filter opens, she lifts her eyes from the mixer toward the crowd beyond the camera and gives a small, warm, genuine smile.
4–5 s: she looks back down at the decks and keeps mixing, still with a slight smile.
CAMERA: a slow, steady push-in from deck height toward her, about 10% closer by the end; no shake.
LIGHT: the {{C1}} and {{C2}} beams behind her sweep slowly through the haze; her face stays clearly lit; no strobe, no flashes to full white.
TONE: confident, professional, in the zone; never sexualized, no suggestive movement, the camera never lingers on her body.
Sound off.
```

**Tip:** para un clip de 10 s, pedí 10 s y estirá los tiempos al doble (0–4 s, 4–8 s, 8–10 s). Vale para toda esta sección.

### KL-D2 · La mano arriba en el drop

**Kling 3.0 · 5 s · 16:9 · inicio = NB-D4 · sonido apagado**

Desde atrás de la cabina: entra el drop, levanta una mano, la pista la acompaña y los haces se abren. Primer cuadro: NB-D4.

```kling
CLIP · {{NOMBRE}} · HAND UP ON THE DROP — 5 seconds, 16:9. The attached image is the start frame: the DJ {{NOMBRE}} seen from inside the booth, over her shoulder, facing a packed dance floor. She is an adult professional DJ.
FACE LOCK: she stays exactly the same person as in the start frame in every frame: same face and profile, skin tone and skin texture, hair, tattoos and piercings. No beautifying, no reshaping of face or body, no change of age, no lighter or darker skin. Never another person.
OUTFIT LOCK: exactly the same clothes as in the start frame, fully clothed; nothing changes, opens or slips.
HANDS: natural hands with five fingers each; the raised hand is open and relaxed; fingers never merge, stretch or bend unnaturally.
LOGO/TEXT LOCK: no text, letters, banners or logos appear anywhere; the equipment stays unbranded.
MOUTH: natural, relaxed or closed; she does not sing, talk or shout.
ACTION:
0–2 s: she leans into the mixer, one hand on an EQ knob, the crowd moving softly in the haze beyond her.
2–4 s: the drop hits: she raises one hand high in the air and the crowd raises their hands with her; the {{C1}} and {{C2}} beams open wider and brighter through the haze in one smooth swell, never a flash.
4–5 s: she brings her hand back down to the mixer, glances at the crowd and keeps playing; the beams settle back.
CAMERA: over her shoulder, then a slow drift to the right of about 5%, revealing a little more of the crowd; no shake.
CROWD: anonymous soft silhouettes, out of focus, no recognizable faces, no phones with bright screens.
LIGHT: backlit beams and haze; her profile softly lit in {{C1}}; no strobe, no flashes to full white.
TONE: the feeling of being in charge of the night; professional, never sexualized.
Sound off.
```

### KL-D3 · Con un auricular

**Kling 3.0 · 5 s · 9:16 · inicio = NB-D7 · sonido apagado**

Escucha el próximo tema con un auricular, sube el fader y mira a la pista. Para historias. Primer cuadro: NB-D7.

```kling
CLIP · {{NOMBRE}} · CUEING THE NEXT TRACK — 5 seconds, 9:16. The attached image is the start frame: the DJ {{NOMBRE}} at the side of the booth, holding one ear cup of her headphones to her ear. She is an adult professional DJ.
FACE LOCK: she stays exactly the same person as in the start frame in every frame: same face, features, skin tone and skin texture, hair, tattoos and piercings. No beautifying, no reshaping of face or body, no change of age, no lighter or darker skin. Never another person.
OUTFIT LOCK: exactly the same clothes as in the start frame, fully clothed; nothing changes, opens or slips. The headphones stay plain and unbranded.
HANDS: natural hands with five fingers each, one holding the ear cup, the other on the mixer; fingers never merge, stretch or bend unnaturally.
LOGO/TEXT LOCK: no text, letters or logos appear anywhere; the equipment stays unbranded.
MOUTH: natural, relaxed or closed; she does not sing, talk or lip-sync.
ACTION:
0–2 s: with one ear cup against her ear and the other off, she listens to the next track, eyes on the mixer, nodding slightly to the beat.
2–4 s: with her free hand she slowly pushes a channel fader up, her head still tilted toward the headphone.
4–5 s: she lowers the headphones to rest around her neck and glances up toward the dance floor with a calm, satisfied look.
CAMERA: a slow, smooth arc of a few degrees around her from the side of the booth, documentary feel; no shake.
LIGHT: the mixer's glow from below and blurred {{C1}} beams behind her; true-to-life skin tone; no strobe, no flashes to full white.
TONE: real, relaxed, professional; never sexualized, no suggestive movement.
Sound off.
```

**Tip:** en una historia, Instagram tapa el 14% de arriba y el 20% de abajo: fijate que la cara quede en el medio durante todo el clip.

### KL-D4 · Entrando a la cabina

**Kling 3.0 · 5 s · 16:9 · inicio = NB-D3 · sonido apagado**

De backstage a la cabina, en blanco y negro, tipo documental: se despega de la pared y camina hacia la luz del club. Primer cuadro: NB-D3 pedida en 16:9 (o recortada un poco arriba y abajo).

```kling
CLIP · {{NOMBRE}} · WALKING IN FROM BACKSTAGE — 5 seconds, 16:9, black and white. The attached image is the start frame: the DJ {{NOMBRE}} leaning against a raw concrete wall backstage, headphones around her neck. She is an adult professional DJ.
FACE LOCK: she stays exactly the same person as in the start frame while her face is visible: same face, features, skin tonality, hair, tattoos and piercings. No beautifying, no reshaping of face or body, no change of age. Never another person.
OUTFIT LOCK: exactly the same clothes as in the start frame, fully clothed; nothing changes, opens or slips.
HANDS: natural hands with five fingers each; fingers never merge, stretch or bend unnaturally.
LOGO/TEXT LOCK: no text, signs, letters or logos appear anywhere.
MOUTH: natural, relaxed or closed; she does not sing or talk.
ACTION:
0–2 s: she pushes off the wall, settles the headphones around her neck and turns toward the right of the frame.
2–4 s: she walks to the right along a dark concrete corridor; the camera follows her from slightly behind at shoulder height, like a steadicam.
4–5 s: ahead of her, at the end of the corridor, an open doorway glows softly with haze and the light of the club; she walks toward it, seen from behind, a confident silhouette.
CAMERA: smooth steadicam follow at shoulder height, framing her head and shoulders the whole time; it never tilts down; no shake.
LOOK: black and white for the whole clip, fine grain like Tri-X, high contrast with detail in the skin and hair; the doorway brightens gradually as she approaches but is never blown out to full white; no strobe, no flashes; it never turns to color.
TONE: focused, calm before the set; professional, never sexualized, the camera never lingers on her body.
Sound off.
```

**Tip:** si tenés una foto real de ella en un pasillo o en backstage (con su OK), usala de primer cuadro: borrá «black and white» del encabezado y la línea LOOK.

### KL-D5 · Cámara lenta en el drop

**Kling 3.0 · 5 s · 9:16 · inicio = NB-D8 · sonido apagado**

En el humo tornasol: entra el drop, el humo se abre en cámara lenta y ella sostiene la mirada a cámara, firme. Primer cuadro: NB-D8 en 9:16.

```kling
CLIP · {{NOMBRE}} · SLOW MOTION DROP — 5 seconds, 9:16, slow motion. The attached image is the start frame: the DJ {{NOMBRE}} standing still inside thick iridescent haze. She is an adult professional DJ.
FACE LOCK: she stays exactly the same person as in the start frame in every frame: same face, features, skin tone and skin texture, hair color, length and texture, tattoos and piercings. No beautifying, no reshaping of face or body, no change of age, no lighter or darker skin. Never another person.
OUTFIT LOCK: exactly the same clothes as in the start frame, fully clothed; nothing changes, opens or slips; only a few strands of her hair move with the breeze.
HANDS: if her hands are visible, natural hands with five fingers each, relaxed.
LOGO/TEXT LOCK: no text, letters or logos appear anywhere.
MOUTH: natural, closed or relaxed; she does not sing or talk.
ACTION:
0–2 s: she stands still and calm, looking into the camera; the haze drifts around her in slow motion, {{C1}} on one side and {{C2}} on the other.
2–4 s: the drop hits: the haze billows around her in slow motion and a light breeze from the stage stirs a few strands of her hair; she gives one small, confident nod to the beat, eyes open.
4–5 s: she holds her gaze straight into the camera, steady and strong, as the haze settles slowly.
CAMERA: a very slow push-in of about 5%, as if shot at 120 frames per second, framing her from the waist up the whole time; it never tilts down; no shake.
LIGHT: backlit haze, a soft white key on her face so her features stay clear and her skin true to life; a few thin beams pass behind her; no strobe, no flashes to full white.
TONE: hypnotic, cinematic, quiet strength; never sexualized, no suggestive movement or pose.
Sound off.
```

### KL-D6 · Manos en el jog

**Kling 3.0 · 5 s · 9:16 · inicio = NB-D5 · sonido apagado**

Primer plano de sus manos: empareja con el jog, gira la EQ, y su logo prendido en el frente de la cabina. Primer cuadro: NB-D5 extendida a 9:16 (que el logo de abajo no se corte).

```kling
CLIP · {{NOMBRE}} · HANDS ON THE JOG WHEEL — 5 seconds, 9:16. The attached image is the start frame: a close-up of the DJ {{NOMBRE}}'s hands on a jog wheel and a mixer, her backlit logo on the front edge of the booth.
HANDS: exactly two hands, five fingers each, the same as in the start frame: same skin tone and texture, nails, rings, bracelets and tattoos, nothing added. They move with real weight and precision on real controls; fingers never merge, stretch or bend unnaturally.
OUTFIT LOCK: sleeves and jewelry exactly as in the start frame.
FACE AND MOUTH: her face stays out of the frame the whole time.
LOGO/TEXT LOCK: the backlit "{{NOMBRE}}" logo on the front edge of the booth (spelled {{DELETREO}}) stays identical, sharp and readable in every frame: same letters, shapes and position; no other text or logos appear; the equipment stays unbranded.
ACTION:
0–2 s: her left hand rests on the large jog wheel and nudges it gently forward to bring two tracks into time; the fingertips move with precision.
2–4 s: her right hand slowly turns an EQ knob on the mixer a quarter turn; the knob's ring of LEDs glows {{C1}}.
4–5 s: both hands pause for a beat, then the left hand lifts slightly off the jog wheel.
CAMERA: a slow sideways slide from left to right of about 5% of the frame, focus locked on her fingertips, shallow depth of field; no shake.
LIGHT: low and moody, the {{C1}} glow of the mixer, a thin {{C2}} edge light on the knobs, deep blacks; no strobe, no flashes to full white.
Sound off.
```

**Tip:** contá los dedos cuadro por cuadro, sobre todo cuando la mano se levanta del jog.

### KL-D7 · Retrato vivo

**Kling 3.0 · 5 s · 9:16 · inicio = final · sonido apagado**

Un retrato que respira: parpadea, mira a cámara y el halo tornasol se mueve atrás. Para la portada de su página o una historia fija. Primer y último cuadro: NB-D6 en 9:16.

```kling
SEAMLESS LOOP · PORTRAIT · {{NOMBRE}} — 5 seconds, 9:16. The attached image is both the start frame and the end frame: the clip ends exactly on it, so it loops with no visible cut. It shows the DJ {{NOMBRE}} in an editorial portrait. She is an adult professional DJ.
FACE LOCK: she stays exactly the same person as in the start frame in every frame: same face, features, skin tone and skin texture, hair, tattoos and piercings. No beautifying, no reshaping of face or body, no change of age, no lighter or darker skin. Never another person.
OUTFIT LOCK: exactly the same clothes as in the start frame, fully clothed; nothing changes.
LOGO/TEXT LOCK: no text, letters or logos appear anywhere; the dark upper area stays empty.
MOUTH: closed and relaxed the whole time; she does not talk, sing or smile widely.
MOTION: a living portrait, very subtle: she breathes calmly, blinks naturally once or twice, turns her head a few degrees toward the camera and back to the exact start position; strands of her hair move very slightly; the iridescent halo behind her drifts slowly from {{C1}} to {{C2}} and back.
CAMERA: locked off, no movement.
STYLE LOCK: same light, colors and grade as the start frame; no strobe, no flashes to full white.
TONE: calm, focused, sure of herself; never sexualized.
Sound off.
```

## E · Reels de fechas

Los flyers de historia de NB2 (9:16) con vida: profundidad, una pasada de luz por las letras y un poco de brillo en el humo. Primer y último cuadro: el flyer aprobado, con el texto ya revisado letra por letra. Si un texto se mueve, cambia o se borronea en algún cuadro, se descarta: el flyer manda. La música se le pone en Instagram.

### KL-E1 · Tornasol oscuro · reel

**Kling 3.0 · 5 s · 9:16 · inicio = final · sonido apagado**

La cinta tornasol de atrás se mueve con profundidad y una luz cruza el logo. Primer y último cuadro: NB-E2.

```kling
SEAMLESS LOOP · REEL · TORNASOL OSCURO — 5 seconds, 9:16. The attached flyer is both the start frame and the end frame: the clip ends exactly on it, so it loops with no visible cut.
DEPTH: treat the flyer as layers. The iridescent ribbon of light and the haze behind the logo drift very slightly sideways and back, the far haze moving less than the ribbon, for a gentle parallax depth; the logo and all the text stay flat and fixed in place, like a sharp print on glass in front of the scene.
LIGHT: between 1.5 s and 3.5 s, one soft band of light sweeps diagonally across the letters of the logo from left to right, brightening them slightly while they keep their own colors, and leaves; a few tiny glints sparkle slowly in the haze, each fading in and out.
CAMERA: locked off: the depth comes from the layers, not from a camera move.
TEXT LOCK: every letter of the logo ({{DELETREO}}) and of the text stays identical, sharp and readable in every frame: same words, spelling, font, size, color and position; no letter wobbles, melts, changes or appears; no new text.
CONSTRAINTS: same colors and style as the flyer; no strobe, no flashes to full white, no camera shake. Sound off.
```

### KL-E2 · Láser minimal · reel

**Kling 3.0 · 5 s · 9:16 · inicio = final · sonido apagado**

La luz viaja por las líneas láser hacia el logo y una línea fina lo cruza. Primer y último cuadro: NB-E4.

```kling
SEAMLESS LOOP · REEL · LÁSER MINIMAL — 5 seconds, 9:16. The attached flyer is both the start frame and the end frame: the clip ends exactly on it, so it loops with no visible cut.
DEPTH: treat the flyer as layers. The whisper of haze drifts slowly behind the laser lines and moves a little less than them, for a gentle parallax depth; the laser lines stay in place; the logo, the text and the hairline rules stay flat and fixed, like a sharp print on glass in front of the scene.
LIGHT: small bright points travel along the laser lines toward the convergence point behind the logo, one line after another; at about 3 s one thin line of light glides across the logo from left to right and leaves; the haze glimmers softly.
CAMERA: locked off: the depth comes from the layers, not from a camera move.
TEXT LOCK: every letter of the logo ({{DELETREO}}) and of the text stays identical, sharp and readable in every frame: same words, spelling, font, size, color and position; no letter wobbles, melts, changes or appears; no new text, no grid numbers.
CONSTRAINTS: same colors and style as the flyer; no extra laser lines, no strobe, no flashes to full white, no camera shake. Sound off.
```

### KL-E3 · Búnker industrial · reel

**Kling 3.0 · 5 s · 9:16 · inicio = final · sonido apagado**

El polvo flota en el haz de luz sobre el hormigón y una pasada de luz cruza el logo. Primer y último cuadro: NB-E6.

```kling
SEAMLESS LOOP · REEL · BÚNKER INDUSTRIAL — 5 seconds, 9:16. The attached flyer is both the start frame and the end frame: the clip ends exactly on it, so it loops with no visible cut.
DEPTH: treat the flyer as layers. The dust in the cone of {{C1}} light floats slowly and drifts, the near specks moving more than the far ones, in front of the still concrete wall, for a gentle parallax depth; the cone of light breathes very softly once. The logo and all the text stay flat and fixed in place, like a sharp print on glass in front of the scene.
LIGHT: between 1.5 s and 3.5 s, one soft band of light sweeps across the letters of the logo from left to right and leaves; a few dust specks catch the light and sparkle softly.
CAMERA: locked off: the depth comes from the layers, not from a camera move.
TEXT LOCK: every letter of the logo ({{DELETREO}}) and of the text stays identical, sharp and readable in every frame: same words, spelling, font, size, color and position; no letter wobbles, melts, changes or appears; no new text.
CONSTRAINTS: same colors, grain and style as the flyer; no strobe, no flashes to full white, no camera shake. Sound off.
```

### KL-E4 · Domingo 11.10 · reel

**Kling 3.0 · 5 s · 9:16 · inicio = final · sonido apagado**

Para subir ya: el brillo tornasol se mueve detrás del nombre y la fecha queda firme. Primer y último cuadro: NB-E7.

```kling
SEAMLESS LOOP · REEL · DOMINGO — 5 seconds, 9:16. The attached teaser is both the start frame and the end frame: the clip ends exactly on it, so it loops with no visible cut.
DEPTH: treat the image as layers. The soft iridescent glow behind the logo drifts slowly like oil on water, from {{C1}} to {{C2}} and back, and the faint haze moves a little less than the glow, for a gentle parallax depth; the logo, the thin line and the date stay flat and fixed in place, like a sharp print on glass in front of the scene.
LIGHT: between 1.5 s and 3.5 s, one soft band of light sweeps across the letters of the logo from left to right, brightening them slightly while they keep their own colors, and leaves; then a soft glint runs along the thin {{C1}} line under the logo, from left to right; a few tiny glints sparkle slowly in the haze.
CAMERA: locked off: the depth comes from the layers, not from a camera move.
TEXT LOCK: the logo ({{DELETREO}}) and the date "{{FECHA}}" stay identical, sharp and readable in every frame: same spelling, punctuation, font, size, color and position; no letter or number wobbles, melts, changes or appears; no new text.
CONSTRAINTS: same colors and style as the image; the empty lower area stays empty; no strobe, no flashes to full white, no camera shake. Sound off.
```

**Tip:** cuando haya lugar y hora, sumalos en Instagram con un texto encima del video: no hace falta regenerar.

## F · Secuencia para la pantalla en vivo

Una guía para armar la carpeta de la noche, o para pasársela al VJ del lugar. Los tiempos son para un set de techno de 60 y de 90 minutos. Si el lugar ya tiene sus visuales, llevá al menos KL-A9 (logo blanco) y KL-B11 (fondo + logo), que se apoyan arriba de cualquier cosa. Regla de oro: en la pantalla nunca hay estroboscópicas ni flashes blancos, ni siquiera en el pico.

| Momento | Set de 60 min | Set de 90 min | Qué poner | Cada cuánto cambiar |
| --- | --- | --- | --- | --- |
| Entrada | 0:00 | 0:00 | un intro: KL-C1 Revelado tornasol, o el de su logo (KL-C2 Doble D, KL-C3 Láser, KL-C4 Pulso), o KL-C5 si el fondo es el abanico; termina en el loop de su logo | una vez |
| Warm-up | 0 a 15 | 0 a 25 | fondos KL-B6 Agua negra, KL-B10 Vacío con aurora, KL-B7 Monolito; arriba, KL-A9 (logo blanco). De vez en cuando KL-A5 Vidrio esmerilado o el loop de su logo (KL-A10 a KL-A15) | cada 4 o 5 min, con fundidos lentos |
| Build | 15 a 35 | 25 a 55 | fondos KL-B4 Humo tornasolado, KL-B9 Película tornasol, KL-B5 Anillos hipnóticos, KL-B2 Búnker; logo KL-A1 Tornasolado, KL-A6 Neón | cada 2 o 3 min, en un cambio de frase |
| Peak | 35 a 52 | 55 a 80 | fondos KL-B1 Galpón con láseres, KL-B3 Túnel de láser, KL-B8 Abanico de haces, KL-B11 Fondo + logo; logo KL-A2 Cromo negro, KL-A3 Metal líquido (KL-A8 Cromo rojo si quiere un golpe de color). En los drops, KL-F1, KL-F2 o KL-F3 | cada 1 o 2 min; un golpe por drop, como mucho |
| Cierre | 52 a 60 | 80 a 90 | KL-B10 Vacío con aurora, KL-A4 Holográfico, KL-A7 Cristal grabado; el último tema termina con KL-A1 o KL-A9 en loop | cada 3 o 4 min, y al final queda el logo |

- **Solo los de su logo:** de KL-A10 a KL-A15 va uno solo, el del logo que eligió (KL-A11 si es Doble D, KL-A13 si es Pulso, etcétera). Ese es también el mejor para el build y el peak.
- **Cómo pasar de un clip a otro:** fundido de 1 o 2 segundos. Nunca un corte seco de un fondo oscuro a uno muy claro: en una pantalla grande eso funciona como un flash.
- **Los golpes (KL-F):** empiezan y terminan en el mismo cuadro con el que arranca el loop que está sonando. Metelos justo cuando el loop completa una vuelta (cada 5 s, o cada 6 s con KL-A13) y entran y salen sin que se note la unión. Uno por drop y nunca dos seguidos.
- **Los clips con ella (D) y los reels (E):** son para redes, no para la pantalla mientras toca.
- **Si hay VJ:** pasale la carpeta con los archivos nombrados por id, esta tabla y KL-A9 sobre negro, para que lo use en modo «Screen» arriba de sus visuales. Pedile también que en el warm-up la pantalla no esté al máximo de brillo.

### KL-F1 · Abanico que se abre

**Kling 3.0 · 3 s · 16:9 · inicio = final · sonido apagado**

Para el drop: un abanico de haces se abre detrás del logo y vuelve a cerrarse. Primer y último cuadro: el mismo cuadro del loop que esté sonando (lo ideal, NB-C11).

```kling
DROP BURST · BEAM FAN FLARE — 3 seconds, 16:9. The attached image is both the start frame and the end frame: the clip starts and ends exactly on it, so it cuts into the loop and back without a visible join.
ACTION:
0–1 s: the scene exactly as in the start frame, calm.
1–2 s: on the drop, a symmetrical fan of steady light beams in {{C1}} and white opens from below the frame behind the logo and sweeps outward through the haze; the light swells smoothly to a strong level in one single rise.
2–3 s: the beams fold back down and fade smoothly, and the frame settles exactly on the start frame.
CAMERA: locked off, no movement.
LOGO LOCK: the "{{NOMBRE}}" logo (spelled {{DELETREO}}) stays perfectly still, sharp and readable in front of the beams in every frame; no new letters, nothing else changes.
SAFETY: one smooth swell only; the overall brightness never jumps and nothing goes full white; no strobe, no flicker, no beam points straight at the camera, no camera shake.
Sound off.
```

### KL-F2 · Ola tornasol

**Kling 3.0 · 3 s · 16:9 · inicio = final · sonido apagado**

Una sola ola de luz tornasol cruza toda la pantalla por detrás del logo. Primer y último cuadro: el mismo cuadro del loop que esté sonando.

```kling
DROP BURST · IRIDESCENT WAVE — 3 seconds, 16:9. The attached image is both the start frame and the end frame: the clip starts and ends exactly on it, so it cuts into the loop and back without a visible join.
ACTION:
0–0.8 s: the scene exactly as in the start frame, calm.
0.8–2.2 s: on the drop, one wide wave of iridescent thin-film light rolls across the whole frame from left to right in a single smooth pass, behind the logo, tinting the haze and the background {{C1}} and then {{C2}}; as it passes behind the logo, the edges of the letters catch its sheen.
2.2–3 s: the wave leaves the frame on the right and everything settles exactly on the start frame.
CAMERA: locked off, no movement.
LOGO LOCK: the "{{NOMBRE}}" logo (spelled {{DELETREO}}) stays perfectly still, sharp and readable in every frame; no new letters, nothing else changes.
SAFETY: one smooth pass only; the overall brightness never jumps and nothing goes full white; no green, no yellow, no full rainbow; no strobe, no flicker, no camera shake.
Sound off.
```

### KL-F3 · Chasquido láser

**Kling 3.0 · 3 s · 16:9 · inicio = final · sonido apagado**

Líneas láser se dibujan de golpe desde las esquinas, enmarcan el logo y se retiran. Se dibujan rápido, no destellan. Primer y último cuadro: el mismo cuadro del loop que esté sonando.

```kling
DROP BURST · LASER SNAP — 3 seconds, 16:9. The attached image is both the start frame and the end frame: the clip starts and ends exactly on it, so it cuts into the loop and back without a visible join.
ACTION:
0–1 s: the scene exactly as in the start frame, calm.
1–1.3 s: on the drop, six razor-thin laser lines in {{C1}} and {{C2}} snap in from the four corners of the frame toward the logo, drawing themselves quickly from the corners inward; they draw, they never flash.
1.3–1.8 s: they hold as a sharp geometric frame around the logo, with a faint glow in the haze.
1.8–2.5 s: the lines retract back to the corners and fade smoothly.
2.5–3 s: the frame settles exactly on the start frame.
CAMERA: locked off, no movement.
LOGO LOCK: the "{{NOMBRE}}" logo (spelled {{DELETREO}}) stays perfectly still, sharp and readable in every frame; the lines never cross the letters; no new letters, nothing else changes.
SAFETY: the lines appear by drawing, not by switching on; the overall brightness never jumps and nothing goes full white; no strobe, no flicker, no beam points at the camera, no camera shake.
Sound off.
```

**Tip:** si el chasquido sale como un parpadeo de toda la pantalla, descartalo: en este clip la diferencia entre «dibujarse» y «destellar» es lo único que importa.
