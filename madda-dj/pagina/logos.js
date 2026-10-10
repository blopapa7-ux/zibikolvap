/* Logos de MADDA dibujados con código. Cada opción devuelve un <svg> como texto.
   MaddaLogos.svg(id, { nombre, variante, paleta, borde, forma: 'completo' | 'marca' })
   Las medidas están pensadas a 100 px de cuerpo con las fuentes locales (fonts/). */
(function () {
  'use strict';

  const FONDO = '#06050B';
  const BLANCO = '#FFFFFF';
  const ROJO = '#E3123B';
  const GRAD_BASE = ['#E4DAFF', '#7B4DFF', '#3A6BFF', '#7B4DFF', '#C9B8FF'];

  const FUENTE = {
    unbounded: "Unbounded, 'Arial Black', sans-serif",
    michroma: "Michroma, Arial, sans-serif",
    shoulders: "'Big Shoulders Display', 'Arial Narrow', sans-serif",
    mono: "'Major Mono Display', 'Courier New', monospace",
  };

  // Avance de cada letra a 100 px (medido en Chromium con las fuentes locales).
  const AVANCE = {
    unbounded: { MADDA: 511, MA: 227.1, M: 127.5, A: 99.6, D: 94.6, _: 100 },
    michroma: { MADDA: 565.14, M: 137.11, A: 106.25, D: 107.76, _: 110 },
    shoulders: { MADDA: 268.1, M: 74.5, A: 47.8, D: 49.5, _: 50 },
    mono: { _: 74 },
  };

  let cuenta = 0;
  const nuevoId = () => 'mlg' + (++cuenta).toString(36);

  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const n = (v) => (Math.round(v * 100) / 100).toString();

  function ancho(fuente, texto) {
    const t = AVANCE[fuente] || {};
    if (t[texto]) return t[texto];
    let w = 0;
    for (const ch of texto) w += t[ch] || t._ || 80;
    return w;
  }

  // <text> con ancho fijo: la palabra ocupa lo mismo antes y después de que cargue la fuente.
  function texto(fuente, peso, cuerpo, x, y, contenido, extra) {
    const w = ancho(fuente, contenido) * cuerpo / 100 + (extra || 0);
    const ajuste = extra ? 'spacing' : 'spacingAndGlyphs';
    return `<text x="${n(x)}" y="${n(y)}" font-family="${FUENTE[fuente]}" font-weight="${peso}" font-size="${cuerpo}" textLength="${n(w)}" lengthAdjust="${ajuste}">${esc(contenido)}</text>`;
  }

  // ── pintura según la versión de color ──
  function pintura(id, variante, paleta, caja) {
    if (variante === 'blanco') return { defs: '', fill: BLANCO, brillo: false, linea: BLANCO, tinta: FONDO };
    if (variante === 'rojo') return { defs: '', fill: ROJO, brillo: true, linea: BLANCO, tinta: BLANCO };
    const grad = paleta && Array.isArray(paleta.grad) && paleta.grad.length > 1 ? paleta.grad : GRAD_BASE;
    const stops = grad.map((c, i) => `<stop offset="${n(i / (grad.length - 1))}" stop-color="${esc(c)}"/>`).join('');
    const defs = `<linearGradient id="${id}-g" gradientUnits="userSpaceOnUse" spreadMethod="reflect" x1="${n(caja.x)}" y1="${n(caja.y)}" x2="${n(caja.x + caja.w)}" y2="${n(caja.y + caja.h * 2.2)}">${stops}</linearGradient>`;
    const brillo = (paleta && paleta.tokens && paleta.tokens.brillo) || '#C9B8FF';
    return { defs, fill: `url(#${id}-g)`, brillo: true, linea: brillo, tinta: BLANCO };
  }

  // Línea especular blanca + brillo superior, recortados a la forma.
  function especular(id, caja, alto, arriba) {
    const y = arriba + alto * 0.3;
    return {
      defs: `<linearGradient id="${id}-s" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".3" stop-color="#fff" stop-opacity=".8"/><stop offset=".55" stop-color="#fff" stop-opacity=".2"/><stop offset=".8" stop-color="#fff" stop-opacity=".7"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>` +
        `<linearGradient id="${id}-t" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".34"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`,
      capa: `<g clip-path="url(#${id}-c)"><rect x="${n(caja.x)}" y="${n(arriba)}" width="${n(caja.w)}" height="${n(alto * 0.44)}" fill="url(#${id}-t)"/><rect x="${n(caja.x)}" y="${n(y)}" width="${n(caja.w)}" height="${n(alto * 0.024)}" fill="url(#${id}-s)"/></g>`,
    };
  }

  // Borde fino oscuro debajo de la forma (la regla para que se lea sobre cualquier visual).
  // El trazo no escala: mide lo mismo en pantalla con el logo grande o chico.
  const GROSOR_BORDE = 3.2;
  function capaBorde(forma, relleno) {
    const f = relleno ? `fill="${FONDO}" fill-opacity=".5"` : 'fill="none"';
    const fija = forma.replace(/<(text|path|circle|rect)\b/g, '<$1 vector-effect="non-scaling-stroke"');
    return `<g ${f} stroke="${FONDO}" stroke-opacity=".85" stroke-width="${GROSOR_BORDE}" stroke-linejoin="round" stroke-linecap="round">${fija}</g>`;
  }

  function envolver(o) {
    const clase = 'logo-svg' + (o.borde ? ' con-borde' : '');
    return `<svg class="${clase}" viewBox="${o.vb}" role="img" aria-label="${esc(o.titulo)}" focusable="false" preserveAspectRatio="xMidYMid meet"><defs>${o.defs}</defs>${o.cuerpo}</svg>`;
  }

  // ── 1 · Tornasol: Unbounded 900 ancho con relleno iridiscente ──
  function tornasol(o) {
    const id = nuevoId();
    const marca = o.forma === 'marca';
    const letras = marca ? o.nombre.charAt(0) : o.nombre;
    const w0 = ancho('unbounded', letras);
    const caja = { x: 0, y: 12.5, w: w0 + 12, h: 75 };
    const forma = texto('unbounded', 900, 100, 0, 87.5, letras);
    const p = pintura(id, o.variante, o.paleta, caja);
    const e = p.brillo ? especular(id, caja, 75, 12.5) : { defs: '', capa: '' };
    const vb = marca ? `-2 4 ${n(w0 + 6)} 92` : `0 0 ${n(w0 + 12)} 100`;
    return envolver({
      vb, titulo: o.titulo, borde: o.borde,
      defs: p.defs + e.defs + `<clipPath id="${id}-c">${forma}</clipPath>`,
      cuerpo: (o.borde ? capaBorde(forma) : '') + `<g fill="${p.fill}">${forma}</g>` + e.capa,
    });
  }

  // ── 2 · Doble D: las dos D como bandejas espalda con espalda, el mixer en el medio ──
  // D con lado recto y cuenco redondo; adentro, un plato con surcos, etiqueta y brillo.
  function caminoD(x0, espejo) {
    const H = 75, R = 37.5, W = 86, y0 = 12.5;
    if (!espejo) return `M${x0} ${y0}H${x0 + W - R}A${R} ${R} 0 0 1 ${x0 + W - R} ${y0 + H}H${x0}Z`;
    return `M${x0 + W} ${y0}H${x0 + R}A${R} ${R} 0 0 0 ${x0 + R} ${y0 + H}H${x0 + W}Z`;
  }

  function plato(cx, cy, r, p) {
    let surcos = '';
    for (let k = r - 2.6; k > 8.5; k -= 2.3) surcos += `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(k)}"/>`;
    const a0 = (205 * Math.PI) / 180, a1 = (255 * Math.PI) / 180, rr = r * 0.66;
    const arco = `M${n(cx + rr * Math.cos(a0))} ${n(cy + rr * Math.sin(a0))}A${n(rr)} ${n(rr)} 0 0 1 ${n(cx + rr * Math.cos(a1))} ${n(cy + rr * Math.sin(a1))}`;
    const b0 = (25 * Math.PI) / 180, b1 = (60 * Math.PI) / 180;
    const arco2 = `M${n(cx + rr * Math.cos(b0))} ${n(cy + rr * Math.sin(b0))}A${n(rr)} ${n(rr)} 0 0 1 ${n(cx + rr * Math.cos(b1))} ${n(cy + rr * Math.sin(b1))}`;
    const etiqueta = p.fill === BLANCO ? '#E9E4F7' : p.fill;
    return `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}" fill="#08070E"/>` +
      `<g fill="none" stroke="${p.linea}" stroke-opacity=".2" stroke-width=".5">${surcos}</g>` +
      `<path d="${arco}" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="3.2" stroke-linecap="round"/>` +
      `<path d="${arco2}" fill="none" stroke="#fff" stroke-opacity=".18" stroke-width="3.2" stroke-linecap="round"/>` +
      `<g class="giro" style="transform-origin:${n(cx)}px ${n(cy)}px">` +
      `<circle cx="${n(cx)}" cy="${n(cy)}" r="7" fill="${etiqueta}"/>` +
      `<circle cx="${n(cx)}" cy="${n(cy - 4.6)}" r="1.1" fill="${FONDO}" fill-opacity=".7"/></g>` +
      `<circle cx="${n(cx)}" cy="${n(cy)}" r="1.4" fill="${FONDO}"/>`;
  }

  function dobleD(o) {
    const nombre = o.nombre;
    const pos = nombre.indexOf('DD');
    if (pos < 0) return tornasol(o); // sin doble D en el nombre, vuelve al wordmark
    const id = nuevoId();
    const marca = o.forma === 'marca';
    const antes = nombre.slice(0, pos);
    const despues = nombre.slice(pos + 2);
    const wAntes = ancho('unbounded', antes);
    const x1 = antes ? wAntes + 6 : 6;  // primera D (espejada)
    const x2 = x1 + 86 + 13;            // segunda D
    const xF = x1 + 86 + 6.5;           // fader en el medio
    const xDesp = x2 + 86 + 7;
    const wTotal = despues ? xDesp + ancho('unbounded', despues) + 4 : x2 + 92;
    const caja = { x: 0, y: 12.5, w: wTotal, h: 75 };
    const p = pintura(id, o.variante, o.paleta, caja);
    const formaD = `<path d="${caminoD(x1, true)}"/><path d="${caminoD(x2, false)}"/>`;
    const formaTexto = (antes && !marca ? texto('unbounded', 900, 100, 0, 87.5, antes) : '') +
      (despues && !marca ? texto('unbounded', 900, 100, xDesp, 87.5, despues) : '');
    const forma = formaTexto + formaD;
    const e = p.brillo ? especular(id, caja, 75, 12.5) : { defs: '', capa: '' };
    const fader = `<rect x="${n(xF - 0.7)}" y="22" width="1.4" height="56" fill="${p.linea}" fill-opacity=".55"/>` +
      `<rect x="${n(xF - 3.6)}" y="44" width="7.2" height="11" rx="1" fill="${p.fill === BLANCO ? BLANCO : p.linea}"/>` +
      `<rect x="${n(xF - 3.6)}" y="49" width="7.2" height="1" fill="${FONDO}"/>`;
    const platos = plato(x1 + 37.5, 50, 22.5, p) + plato(x2 + 86 - 37.5, 50, 22.5, p);
    const vb = marca ? `${n(x1 - 5)} 4 ${n(x2 + 86 - x1 + 10)} 92` : `0 0 ${n(wTotal + 6)} 100`;
    return envolver({
      vb, titulo: o.titulo, borde: o.borde,
      defs: p.defs + e.defs + `<clipPath id="${id}-c">${forma}</clipPath>`,
      cuerpo: (o.borde ? capaBorde(forma) + `<rect x="${n(xF - 5)}" y="20" width="10" height="60" rx="2" fill="${FONDO}" fill-opacity=".55"/>` : '') +
        `<g fill="${p.fill}">${forma}</g>` + e.capa + platos + fader,
    });
  }

  // ── 3 · Láser: Michroma ancho, letras hechas de líneas finas ──
  function laser(o) {
    const id = nuevoId();
    const marca = o.forma === 'marca';
    const letras = marca ? o.nombre.charAt(0) : o.nombre;
    const w0 = ancho('michroma', letras);
    const W = w0 + (marca ? 6 : 8);
    const forma = texto('michroma', 400, 100, 0, 87.5, letras);
    const caja = { x: 0, y: 12.5, w: W, h: 75 };
    const p = pintura(id, o.variante, o.paleta, caja);
    const haz = p.fill === BLANCO ? BLANCO : p.linea;
    const defs = p.defs +
      `<pattern id="${id}-p" patternUnits="userSpaceOnUse" width="10" height="4.4"><rect width="10" height="2" fill="#fff"/></pattern>` +
      `<mask id="${id}-m" maskUnits="userSpaceOnUse" x="-10" y="0" width="${n(W + 20)}" height="100"><g fill="url(#${id}-p)">${forma}</g></mask>` +
      `<linearGradient id="${id}-b" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="${haz}" stop-opacity="0"/><stop offset=".18" stop-color="${haz}" stop-opacity=".9"/><stop offset=".82" stop-color="${haz}" stop-opacity=".9"/><stop offset="1" stop-color="${haz}" stop-opacity="0"/></linearGradient>`;
    const vb = marca ? `4 4 ${n(w0 + 2)} 92` : `0 0 ${n(W)} 100`;
    const haces = marca ? '' :
      `<rect x="0" y="47" width="${n(W)}" height="6" fill="url(#${id}-b)" opacity=".16"/>` +
      `<rect x="0" y="49.5" width="${n(W)}" height="1" fill="url(#${id}-b)"/>`;
    return envolver({
      vb, titulo: o.titulo, borde: o.borde, defs,
      cuerpo: (o.borde ? capaBorde(forma, true) : '') +
        `<rect x="-10" y="0" width="${n(W + 20)}" height="100" fill="${p.fill}" mask="url(#${id}-m)"/>` +
        `<g fill="none" stroke="${p.fill}" stroke-width="1.6" stroke-linejoin="round">${forma}</g>` + haces,
    });
  }

  // ── 4 · Pulso: Big Shoulders condensada, una onda de sonido corta las letras ──
  // Señal suave: una portadora con la envolvente de un golpe de bombo en el centro.
  function caminoOnda(x0, x1, cy, amp, paso) {
    let d = '';
    let i = 0;
    for (let x = x0; x <= x1 + 0.01; x += paso, i++) {
      const u = (x - x0) / (x1 - x0);
      const env = Math.pow(Math.sin(Math.PI * u), 2.2);
      const mod = 0.55 + 0.45 * Math.sin(u * Math.PI * 6 - 0.8);
      const y = cy + amp * env * mod * Math.sin((x - x0) * 0.42);
      d += (i ? 'L' : 'M') + n(x) + ' ' + n(y);
    }
    return d;
  }

  function pulso(o) {
    const id = nuevoId();
    const marca = o.forma === 'marca';
    const letras = marca ? o.nombre.charAt(0) : o.nombre;
    const extra = marca ? 0 : (letras.length - 1) * 8;
    const w0 = ancho('shoulders', letras) + extra;
    const margen = marca ? 8 : 46;
    const W = w0 + margen * 2;
    const forma = texto('shoulders', 900, 100, margen, 90, letras, extra || 0);
    const caja = { x: margen, y: 10, w: w0, h: 80 };
    const p = pintura(id, o.variante, o.paleta, caja);
    const d = caminoOnda(marca ? 2 : 6, W - (marca ? 2 : 6), 50, marca ? 11 : 12, 1.5);
    const e = p.brillo ? especular(id, caja, 80, 10) : { defs: '', capa: '' };
    const linea = p.fill === BLANCO ? BLANCO : (o.variante === 'rojo' ? BLANCO : p.linea);
    const defs = p.defs + e.defs + `<clipPath id="${id}-c">${forma}</clipPath>` +
      `<mask id="${id}-m" maskUnits="userSpaceOnUse" x="0" y="0" width="${n(W)}" height="100"><rect width="${n(W)}" height="100" fill="#fff"/><path d="${d}" fill="none" stroke="#000" stroke-width="5" stroke-linejoin="round"/></mask>`;
    const vb = marca ? `0 4 ${n(W)} 92` : `0 0 ${n(W)} 100`;
    return envolver({
      vb, titulo: o.titulo, borde: o.borde, defs,
      cuerpo: `<g mask="url(#${id}-m)">` + (o.borde ? capaBorde(forma) : '') + `<g fill="${p.fill}">${forma}</g>` + e.capa + '</g>' +
        (o.borde ? `<path d="${d}" fill="none" stroke="${FONDO}" stroke-opacity=".6" stroke-width="3.4" stroke-linejoin="round"/>` : '') +
        `<path d="${d}" fill="none" stroke="${linea}" stroke-width="1.5" stroke-linejoin="round"/>`,
    });
  }

  // ── 5 · Mono: Major Mono Display en minúsculas, mínimo ──
  function mono(o) {
    const id = nuevoId();
    const marca = o.forma === 'marca';
    const letras = (marca ? o.nombre.charAt(0) : o.nombre).toLowerCase();
    const extra = marca ? 0 : (letras.length - 1) * 10;
    const w0 = ancho('mono', letras) + extra;
    const punto = marca ? '' : `<circle cx="${n(w0 + 12)}" cy="79" r="6"/>`;
    const forma = texto('mono', 400, 100, 0, 85, letras, extra || 0) + punto;
    const W = marca ? w0 : w0 + 26;
    const caja = { x: 0, y: 15, w: W, h: 70 };
    const p = pintura(id, o.variante, o.paleta, caja);
    const vb = marca ? `4 6 ${n(w0 - 2)} 88` : `0 0 ${n(W)} 100`;
    return envolver({
      vb, titulo: o.titulo, borde: o.borde, defs: p.defs,
      cuerpo: (o.borde ? capaBorde(forma) : '') + `<g fill="${p.fill}">${forma}</g>`,
    });
  }

  // ── 6 · Sello: una M en la etiqueta de un vinilo, con el nombre girando alrededor ──
  function sello(o) {
    const id = nuevoId();
    const caja = { x: 40, y: 40, w: 120, h: 60 };
    const p = pintura(id, o.variante, o.paleta, caja);
    const r = 48;
    let surcos = '';
    for (let k = 64; k <= 94; k += 2.6) surcos += `<circle cx="100" cy="100" r="${n(k)}"/>`;
    const vuelta = `${o.nombre} · ${o.genero || 'TECHNO'} · `.toUpperCase();
    const largo = 2 * Math.PI * r - 3;
    const tinta = o.variante === 'blanco' ? FONDO : BLANCO;
    const inicial = o.nombre.charAt(0);
    const wM = ancho('unbounded', inicial) * 0.46;
    return envolver({
      vb: '0 0 200 200', titulo: o.titulo, borde: o.borde,
      defs: p.defs + `<path id="${id}-r" d="M100 ${100 - r}a${r} ${r} 0 1 1 -.01 0"/>`,
      cuerpo: (o.borde ? `<circle cx="100" cy="100" r="97" fill="none" stroke="${FONDO}" stroke-opacity=".85" stroke-width="${GROSOR_BORDE}" vector-effect="non-scaling-stroke"/>` : '') +
        `<circle cx="100" cy="100" r="97" fill="#0A0911"/>` +
        `<g fill="none" stroke="${p.linea}" stroke-opacity=".16" stroke-width=".6">${surcos}</g>` +
        `<circle cx="100" cy="100" r="79" fill="none" stroke="#fff" stroke-opacity=".09" stroke-width="28" stroke-dasharray="46 450" transform="rotate(196 100 100)"/>` +
        `<circle cx="100" cy="100" r="79" fill="none" stroke="#fff" stroke-opacity=".05" stroke-width="28" stroke-dasharray="40 456" transform="rotate(16 100 100)"/>` +
        `<circle cx="100" cy="100" r="97" fill="none" stroke="${p.linea}" stroke-opacity=".5" stroke-width="1"/>` +
        `<circle cx="100" cy="100" r="60" fill="${p.fill}"/>` +
        `<text font-family="${FUENTE.unbounded}" font-weight="700" font-size="10" fill="${tinta}" letter-spacing="1"><textPath href="#${id}-r" textLength="${n(largo)}" lengthAdjust="spacing">${esc(vuelta + vuelta)}</textPath></text>` +
        `<text x="100" y="117.25" text-anchor="middle" font-family="${FUENTE.unbounded}" font-weight="900" font-size="46" fill="${tinta}" textLength="${n(wM)}" lengthAdjust="spacingAndGlyphs">${esc(inicial)}</text>` +
        `<circle cx="100" cy="100" r="2.6" fill="${FONDO}" fill-opacity=".85"/>`,
    });
  }

  const DIBUJOS = { tornasol, 'doble-d': dobleD, laser, pulso, mono, sello };

  // Punto de entrada: nunca tira error; si falta algo usa valores por defecto.
  function svg(id, opciones) {
    const o = Object.assign({ nombre: 'MADDA', variante: 'tornasol', paleta: null, borde: false, forma: 'completo', genero: 'TECHNO' }, opciones || {});
    o.nombre = String(o.nombre || 'MADDA').trim() || 'MADDA';
    if (!o.titulo) o.titulo = o.nombre;
    const fn = DIBUJOS[id] || tornasol;
    let s;
    try { s = fn(o); } catch (e) { s = tornasol(o); }
    // clase extra (por ejemplo la copia que se mueve en la portada)
    return o.clase ? s.replace('class="logo-svg', `class="logo-svg ${esc(o.clase)}`) : s;
  }

  window.MaddaLogos = { svg, ids: Object.keys(DIBUJOS), FONDO, BLANCO, ROJO };
})();
