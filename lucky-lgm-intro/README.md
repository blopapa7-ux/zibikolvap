# Misión Corrientes · Lucky LGM

Intro tipo battle royale para **Lucky LGM** en el **Festival Cultura D**: domingo 11 de octubre, Teatro Astros, Av. Corrientes 746.

Buenos Aires, 2077. Lucky es el técnico multitask de la Ugi's frente al Obelisco. Está destapando un baño cuando le suena la alarma: unos cyber-motochorros quieren llevarse a su novia en el Puente de la Mujer. Baja por Corrientes looteando, la rescata y, cuando suena la segunda alarma, se cambia la skin y se va a cantar al Astros.

## Qué hay acá

| Archivo | Qué es |
| --- | --- |
| `biblia/01-historia.md` | La historia en 5 actos, el recorrido real, las reglas del mundo y el loot |
| `biblia/02-referencias.md` | Qué fotos buscar (con links) para que se parezca a Buenos Aires |
| `biblia/03-personajes.md` | Lucky (2 looks), la novia y los villanos, y cómo guardarlos como Elements |
| `biblia/04-escenarios-y-loot.md` | Prompts de los 10 escenarios y de los 10 props |
| `biblia/05-storyboard.md` | Las 20 tomas: prompt del frame (Nano Banana Pro) y del video (Kling, 7 s) |
| `biblia/06-edicion.md` | Armado en CapCut: HUD, sonido, música, exportación y calendario |
| `biblia/07-lxlx-zzz.md` | La idea para la intro de LXLX ZZZ (modo conejita) en el mismo universo |
| `output/hud/*.png` | El HUD: 25 PNG transparentes de 1080×1920 para arrastrar en CapCut |
| `dist/estudio-hud.html` | Estudio para cambiar los textos del HUD y bajar los PNG (abrilo con Chrome) |
| `dist/mision-corrientes.html` | La biblia completa con botones para copiar cada prompt, más el estudio |
| `caption.txt` | Texto sugerido para el posteo |

## Orden de trabajo

1. Juntá las fotos de los lugares y de Lucky (`02-referencias`).
2. Hojas de personaje en Nano Banana Pro y guardalas como Elements: `LUCKY-LABURO`, `LUCKY-SHOW`, `NOVIA`, `MOTOCHORROS` (`03-personajes`).
3. Escenarios y props, también como Elements (`04-escenarios-y-loot`).
4. Los frames de las 20 tomas en Nano Banana Pro y los videos en Kling (`05-storyboard`).
5. Edición en CapCut con la música y el HUD (`06-edicion`).

## Regenerar el HUD y las páginas

Desde la raíz del repo:

```bash
npm install
npm run lucky:render                 # output/hud/*.png
npm run lucky:render -- --preset lxlx  # borrador del HUD de LXLX ZZZ
npm run lucky:build                  # dist/*.html
```

El dibujo del HUD vive en `hud/hud.js` y lo comparten el estudio (`hud/app.js`) y el exportador (`scripts/render.mjs`), así que lo que ves en el navegador es lo que se exporta. Las páginas se arman con `scripts/build.mjs` a partir de los Markdown de `biblia/`.

## Datos usados

- Ugi's nació en 1980 (primer local en Rivadavia y Suipacha) y la de Carlos Pellegrini, frente al Obelisco, aparece en *Pizza, birra, faso*: [El Cronista](https://www.cronista.com/apertura/empresas/la-historia-de-ugis-la-mitica-pizza-mas-barata-de-buenos-aires-un-guino-a-eeuu-y-herederos-en-disputa/), [Wikipedia](https://es.wikipedia.org/wiki/Ugi%27s).
- Teatro Astros: nació como cine Astor; Soda Stereo presentó su primer disco ahí el 14/12/1984 con 26 televisores en escena y Virus presentó *Relax* en 1985: [La Nación](https://www.lanacion.com.ar/espectaculos/teatro/los-90-anos-del-astros-de-susana-a-raphael-de-tita-merello-a-soda-stereo-de-virus-a-gardel-nid29042022/), [Centro de Buenos Aires](https://www.centrodebuenosaires.com/teatro-astros/), [Obras de teatro cortas](https://obrasdeteatrocortas.org/teatro-astros/).
- El Palacio de la Pizza, Corrientes 751 (1956): [Turismo Buenos Aires](https://turismo.buenosaires.gob.ar/es/gastronomico/el-palacio-de-la-pizza).
- Puente de la Mujer, Dique 3, Calatrava: [Buenos Aires Ciudad](https://buenosaires.gob.ar/noticias/redescubriendo-el-puente-de-la-mujer), [Wikipedia](https://en.wikipedia.org/wiki/Puente_de_la_Mujer).
- Edificio Comega, Corrientes 222: [Wikipedia](https://en.wikipedia.org/wiki/Comega_Building).

## Créditos

Tipografías Anton y Montserrat, con licencia SIL Open Font License (ver `../fonts/`). Todo el HUD está dibujado con código: no usa logos, gráficos ni sonidos de Fortnite.
