/*
 * Legado · Jah Fabio — motor de dibujo en <canvas>.
 *
 * Todas las piezas son funciones puras de (ctx, opciones, fotos[, tiempo]):
 * el estudio web y el script de render (scripts/render.mjs) usan este mismo
 * código, así que lo que se ve en el navegador es exactamente lo que se exporta.
 *
 *   Legado.drawCard(ctx, opts, photos)            1080×1350  tarjeta con frase
 *   Legado.drawCollage(ctx, opts, photos)         1080×1350  collage de homenaje
 *   Legado.drawReelFrame(ctx, t, opts, photos)    1080×1920  un cuadro del reel
 *   Legado.reelDuration(opts)                     duración del reel en segundos
 */
(function (global) {
  'use strict';

  const SIZES = {
    card: { w: 1080, h: 1350 },
    collage: { w: 1080, h: 1350 },
    reel: { w: 1080, h: 1920 },
  };

  const C = {
    ink: '#0d0a07',
    night: '#15100b',
    red: '#d8342a',
    gold: '#f4b927',
    green: '#1f9a50',
    cream: '#f5ecd7',
    paper: '#efe4cc',
    wood: '#2b1d12',
  };

  const F = {
    display: '"Anton", Impact, "Arial Narrow", sans-serif',
    script: '"Kaushan Script", "Brush Script MT", cursive',
    serif: '"Playfair Display", Georgia, serif',
    sans: '"Montserrat", "Helvetica Neue", Arial, sans-serif',
  };

  // Datos públicos verificados (ver README): se usan como texto fijo del homenaje.
  const FACTS = {
    countries: ['Cuba', 'EE. UU.', 'Venezuela', 'Colombia', 'Chile', 'Argentina', 'España', 'Jamaica'],
  };

  const DEFAULTS = {
    name: 'JAH FABIO',
    dates: '1981 — 2025',
    origin: 'Guadalajara, Jalisco',
    phrase: 'Hay voces que no se apagan. Siguen sonando en cada sound system, en cada barrio y en cada corazón que vibra con el reggae.',
    reelPhrase: '',
    song: '',
    hashtag: '#LegadoJahFabio',
    cta: 'Comparte para que su música siga sonando',
    cardPhotoBg: false,
  };

  // ───────────────────────── utilidades ─────────────────────────

  const TAU = Math.PI * 2;
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const lerp = (a, b, t) => a + (b - a) * t;
  const prog = (t, a, b) => clamp((t - a) / (b - a));
  const ease = {
    outCubic: (t) => 1 - Math.pow(1 - t, 3),
    inCubic: (t) => t * t * t,
    inOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    outBack: (t) => {
      const c1 = 1.70158, c3 = c1 + 1;
      return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    },
    outExpo: (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  };

  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function makeCanvas(w, h) {
    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(w));
    c.height = Math.max(1, Math.round(h));
    return c;
  }

  function font(size, family, weight = 400, style = 'normal') {
    return `${style} ${weight} ${Math.round(size)}px ${family}`;
  }

  function roundRectPath(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function circlePath(ctx, x, y, r) {
    ctx.moveTo(x + r, y);
    ctx.arc(x, y, r, 0, TAU);
  }

  // Distancia del centro de las mayúsculas a la línea base, para centrar texto en "y".
  function capOffset(ctx) {
    const m = ctx.measureText('H');
    return (m.actualBoundingBoxAscent || parseFloat(ctx.font.match(/(\d+)px/)[1]) * 0.7) / 2;
  }

  function trackedWidth(ctx, text, tracking) {
    let w = 0;
    for (const ch of text) w += ctx.measureText(ch).width + tracking;
    return w - (text.length ? tracking : 0);
  }

  function fillTracked(ctx, text, x, y, tracking, align = 'left') {
    const w = trackedWidth(ctx, text, tracking);
    let cx = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
    const prev = ctx.textAlign;
    ctx.textAlign = 'left';
    for (const ch of text) {
      ctx.fillText(ch, cx, y);
      cx += ctx.measureText(ch).width + tracking;
    }
    ctx.textAlign = prev;
    return w;
  }

  // Texto centrado verticalmente en "y" (centro de las mayúsculas) con efectos opcionales.
  function text(ctx, str, x, y, o) {
    const alpha = o.alpha == null ? 1 : o.alpha;
    if (!str || alpha <= 0) return 0;
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.font = o.font;
    const off = capOffset(ctx);
    ctx.translate(x, y + (o.dy || 0));
    if (o.rotate) ctx.rotate(o.rotate);
    if (o.scale && o.scale !== 1) ctx.scale(o.scale, o.scale);
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = o.align || 'center';
    if (o.shadow !== false) {
      ctx.shadowColor = o.shadowColor || 'rgba(0,0,0,0.55)';
      ctx.shadowBlur = o.shadowBlur == null ? 28 : o.shadowBlur;
      ctx.shadowOffsetY = o.shadowY == null ? 8 : o.shadowY;
    }
    if (o.stroke) {
      ctx.lineJoin = 'round';
      ctx.lineWidth = o.strokeWidth || 8;
      ctx.strokeStyle = o.stroke;
      if (o.tracking) {
        // el contorno con tracking se dibuja carácter por carácter
        const w = trackedWidth(ctx, str, o.tracking);
        let cx = ctx.textAlign === 'center' ? -w / 2 : ctx.textAlign === 'right' ? -w : 0;
        const a = ctx.textAlign;
        ctx.textAlign = 'left';
        for (const ch of str) {
          ctx.strokeText(ch, cx, off);
          cx += ctx.measureText(ch).width + o.tracking;
        }
        ctx.textAlign = a;
      } else ctx.strokeText(str, 0, off);
      if (!o.keepShadowOnFill) ctx.shadowColor = 'transparent';
    }
    ctx.fillStyle = o.color || C.cream;
    let w;
    if (o.tracking) w = fillTracked(ctx, str, 0, off, o.tracking, ctx.textAlign);
    else {
      ctx.fillText(str, 0, off);
      w = ctx.measureText(str).width;
    }
    ctx.restore();
    return w;
  }

  // Tamaño de fuente para que "str" entre en maxW (sin pasar de maxSize).
  function fitSize(ctx, str, family, weight, maxSize, maxW, style = 'normal', tracking = 0) {
    ctx.save();
    ctx.font = font(maxSize, family, weight, style);
    const w = tracking ? trackedWidth(ctx, str, tracking) : ctx.measureText(str).width;
    ctx.restore();
    return w > maxW ? Math.floor((maxSize * maxW) / w) : maxSize;
  }

  function wrap(ctx, str, maxW) {
    const words = String(str).trim().split(/\s+/).filter(Boolean);
    const lines = [];
    let line = '';
    for (const word of words) {
      const test = line ? line + ' ' + word : word;
      if (ctx.measureText(test).width <= maxW || !line) line = test;
      else {
        lines.push(line);
        line = word;
      }
    }
    if (line) lines.push(line);
    return lines;
  }

  // Busca el tamaño más grande con el que el texto entra en la caja.
  function fitWrap(ctx, str, family, weight, style, maxW, maxH, maxSize, minSize, lh) {
    for (let size = maxSize; size >= minSize; size -= 2) {
      ctx.font = font(size, family, weight, style);
      const lines = wrap(ctx, str, maxW);
      const widest = Math.max(0, ...lines.map((l) => ctx.measureText(l).width));
      if (lines.length * size * lh <= maxH && widest <= maxW) return { size, lines };
    }
    ctx.font = font(minSize, family, weight, style);
    return { size: minSize, lines: wrap(ctx, str, maxW) };
  }

  function drawImageCover(ctx, img, x, y, w, h, focusY = 0.35) {
    const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
    if (!iw || !ih) return;
    const s = Math.max(w / iw, h / ih);
    const sw = w / s, sh = h / s;
    const sx = (iw - sw) / 2, sy = clamp((ih - sh) * focusY, 0, ih - sh);
    ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
  }

  // ───────────────────────── texturas ─────────────────────────

  let grainTile = null;
  function grain() {
    if (grainTile) return grainTile;
    const s = 220;
    const c = makeCanvas(s, s);
    const g = c.getContext('2d');
    const img = g.createImageData(s, s);
    const r = rng(1981);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = (r() * 255) | 0;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    grainTile = c;
    return c;
  }

  function drawGrain(ctx, w, h, alpha, ox = 0, oy = 0, mode = 'overlay') {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.globalCompositeOperation = mode;
    const pat = ctx.createPattern(grain(), 'repeat');
    ctx.translate(ox, oy);
    ctx.fillStyle = pat;
    ctx.fillRect(-ox, -oy, w, h);
    ctx.restore();
  }

  function drawVignette(ctx, w, h, strength = 0.6, cy = 0.45) {
    const g = ctx.createRadialGradient(w / 2, h * cy, Math.min(w, h) * 0.3, w / 2, h * cy, Math.hypot(w, h) * 0.62);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, `rgba(0,0,0,${strength})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }

  function glow(ctx, x, y, r, color, alpha) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
    ctx.restore();
  }

  function sunburst(ctx, cx, cy, r, rays, rot, color, alpha) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    const step = TAU / rays;
    ctx.beginPath();
    for (let i = 0; i < rays; i++) {
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, r, i * step, i * step + step * 0.5);
      ctx.closePath();
    }
    ctx.fill();
    ctx.restore();
  }

  function triStripe(ctx, x, y, w, h, vertical = false) {
    const cols = [C.red, C.gold, C.green];
    cols.forEach((col, i) => {
      ctx.fillStyle = col;
      if (vertical) ctx.fillRect(x + (w / 3) * i, y, w / 3 + 0.5, h);
      else ctx.fillRect(x, y + (h / 3) * i, w, h / 3 + 0.5);
    });
  }

  // ───────────────────────── ilustraciones ─────────────────────────

  // León original: melena de mechones en rojo, oro y verde y cara de trazo dorado.
  function drawLion(ctx, cx, cy, size, o = {}) {
    const rot = o.rot || 0;
    const faceFill = o.faceFill || C.ink;
    const line = o.line || C.gold;
    ctx.save();
    ctx.translate(cx, cy);
    if (o.scale != null) ctx.scale(o.scale, o.scale);

    const layers = [
      { color: C.red, r0: 0.5, r1: 1.0, n: 16, w: 0.2, twist: 0.2, off: 0 },
      { color: C.gold, r0: 0.46, r1: 0.84, n: 16, w: 0.2, twist: 0.2, off: 0.5 },
      { color: C.green, r0: 0.42, r1: 0.68, n: 16, w: 0.2, twist: 0.2, off: 0 },
    ];
    layers.forEach((L, li) => {
      ctx.save();
      ctx.rotate(rot * (li === 1 ? -0.6 : 1));
      ctx.beginPath();
      for (let i = 0; i < L.n; i++) {
        const a = ((i + L.off) / L.n) * TAU - Math.PI / 2;
        const p = (ang, r) => [Math.cos(ang) * r * size, Math.sin(ang) * r * size];
        const [x0, y0] = p(a - L.w, L.r0);
        const [xt, yt] = p(a + L.twist, L.r1);
        const [x1, y1] = p(a + L.w, L.r0);
        const [c0x, c0y] = p(a - L.w * 0.9 + L.twist * 0.25, (L.r0 + L.r1) * 0.6);
        const [c1x, c1y] = p(a + L.w * 1.5 + L.twist * 0.55, (L.r0 + L.r1) * 0.54);
        ctx.moveTo(x0, y0);
        ctx.quadraticCurveTo(c0x, c0y, xt, yt);
        ctx.quadraticCurveTo(c1x, c1y, x1, y1);
        ctx.closePath();
      }
      ctx.fillStyle = L.color;
      ctx.fill();
      // cuerpo de la melena para que no queden huecos
      ctx.beginPath();
      circlePath(ctx, 0, 0, L.r0 * size * 1.04);
      ctx.fill();
      ctx.restore();
    });

    const f = size * 0.44; // media anchura de la cara
    const P = (x, y) => [x * f, y * f];
    const lw = Math.max(1.5, f * 0.05);

    // orejas
    [-1, 1].forEach((sx) => {
      ctx.beginPath();
      circlePath(ctx, ...P(0.74 * sx, -0.86), f * 0.25);
      ctx.fillStyle = faceFill;
      ctx.fill();
      ctx.lineWidth = lw;
      ctx.strokeStyle = line;
      ctx.stroke();
      ctx.beginPath();
      circlePath(ctx, ...P(0.74 * sx, -0.86), f * 0.12);
      ctx.fillStyle = line;
      ctx.globalAlpha = 0.55;
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    // cara
    ctx.beginPath();
    ctx.moveTo(...P(0, -1.05));
    ctx.bezierCurveTo(...P(0.56, -1.05), ...P(0.96, -0.74), ...P(0.96, -0.24));
    ctx.bezierCurveTo(...P(0.96, 0.22), ...P(0.8, 0.58), ...P(0.5, 0.86));
    ctx.bezierCurveTo(...P(0.3, 1.03), ...P(0.12, 1.1), ...P(0, 1.1));
    ctx.bezierCurveTo(...P(-0.12, 1.1), ...P(-0.3, 1.03), ...P(-0.5, 0.86));
    ctx.bezierCurveTo(...P(-0.8, 0.58), ...P(-0.96, 0.22), ...P(-0.96, -0.24));
    ctx.bezierCurveTo(...P(-0.96, -0.74), ...P(-0.56, -1.05), ...P(0, -1.05));
    ctx.closePath();
    ctx.fillStyle = faceFill;
    ctx.fill();
    ctx.lineWidth = lw * 1.1;
    ctx.strokeStyle = line;
    ctx.stroke();

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = line;
    ctx.fillStyle = line;

    // mechón de la frente
    ctx.beginPath();
    ctx.moveTo(...P(-0.22, -0.78));
    ctx.quadraticCurveTo(...P(0, -0.6), ...P(0.22, -0.78));
    ctx.moveTo(...P(-0.12, -0.9));
    ctx.quadraticCurveTo(...P(0, -0.78), ...P(0.12, -0.9));
    ctx.lineWidth = lw * 0.8;
    ctx.stroke();

    [-1, 1].forEach((sx) => {
      // ceja
      ctx.beginPath();
      ctx.moveTo(...P(0.12 * sx, -0.34));
      ctx.quadraticCurveTo(...P(0.36 * sx, -0.52), ...P(0.62 * sx, -0.4));
      ctx.lineWidth = lw;
      ctx.stroke();
      // ojo
      ctx.beginPath();
      ctx.moveTo(...P(0.17 * sx, -0.16));
      ctx.quadraticCurveTo(...P(0.36 * sx, -0.36), ...P(0.56 * sx, -0.26));
      ctx.quadraticCurveTo(...P(0.4 * sx, -0.08), ...P(0.17 * sx, -0.16));
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      circlePath(ctx, ...P(0.37 * sx, -0.21), f * 0.06);
      ctx.fillStyle = faceFill;
      ctx.fill();
      ctx.fillStyle = line;
      // puente de la nariz
      ctx.beginPath();
      ctx.moveTo(...P(0.1 * sx, -0.12));
      ctx.quadraticCurveTo(...P(0.1 * sx, 0.1), ...P(0.17 * sx, 0.3));
      ctx.lineWidth = lw * 0.75;
      ctx.stroke();
      // mejilla
      ctx.beginPath();
      ctx.moveTo(...P(0.66 * sx, 0.02));
      ctx.quadraticCurveTo(...P(0.6 * sx, 0.34), ...P(0.44 * sx, 0.52));
      ctx.lineWidth = lw * 0.7;
      ctx.stroke();
      // bigotes (puntos)
      [[0.2, 0.64], [0.3, 0.58], [0.27, 0.72]].forEach(([x, y]) => {
        ctx.beginPath();
        circlePath(ctx, ...P(x * sx, y), f * 0.028);
        ctx.fill();
      });
    });

    // nariz
    ctx.beginPath();
    ctx.moveTo(...P(-0.25, 0.3));
    ctx.quadraticCurveTo(...P(0, 0.22), ...P(0.25, 0.3));
    ctx.quadraticCurveTo(...P(0.2, 0.44), ...P(0, 0.53));
    ctx.quadraticCurveTo(...P(-0.2, 0.44), ...P(-0.25, 0.3));
    ctx.closePath();
    ctx.fill();

    // boca
    ctx.beginPath();
    ctx.moveTo(...P(0, 0.53));
    ctx.lineTo(...P(0, 0.63));
    ctx.moveTo(...P(0, 0.63));
    ctx.quadraticCurveTo(...P(-0.12, 0.77), ...P(-0.31, 0.68));
    ctx.moveTo(...P(0, 0.63));
    ctx.quadraticCurveTo(...P(0.12, 0.77), ...P(0.31, 0.68));
    ctx.moveTo(...P(-0.12, 0.9));
    ctx.quadraticCurveTo(...P(0, 0.98), ...P(0.12, 0.9));
    ctx.lineWidth = lw * 0.85;
    ctx.stroke();

    ctx.restore();
  }

  function drawVinyl(ctx, cx, cy, r, rot = 0, o = {}) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = r * 0.12;
    ctx.shadowOffsetY = r * 0.04;
    ctx.beginPath();
    circlePath(ctx, 0, 0, r);
    ctx.fillStyle = '#0b0b0c';
    ctx.fill();
    ctx.shadowColor = 'transparent';

    // surcos
    ctx.lineWidth = Math.max(1, r * 0.004);
    for (let rr = r * 0.4; rr < r * 0.97; rr += r * 0.018) {
      ctx.beginPath();
      circlePath(ctx, 0, 0, rr);
      ctx.strokeStyle = `rgba(255,255,255,${0.035 + ((rr / r) % 0.07) * 0.5})`;
      ctx.stroke();
    }
    // brillo
    ctx.save();
    ctx.rotate(-0.6);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, r * 0.98, -0.28, 0.28);
    ctx.closePath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, r * 0.98, Math.PI - 0.28, Math.PI + 0.28);
    ctx.closePath();
    const sheen = ctx.createRadialGradient(0, 0, r * 0.4, 0, 0, r);
    sheen.addColorStop(0, 'rgba(255,255,255,0)');
    sheen.addColorStop(0.7, 'rgba(255,255,255,0.10)');
    sheen.addColorStop(1, 'rgba(255,255,255,0.02)');
    ctx.fillStyle = sheen;
    ctx.fill();
    ctx.restore();

    // etiqueta (gira)
    ctx.rotate(rot);
    const lr = r * 0.36;
    ctx.save();
    ctx.beginPath();
    circlePath(ctx, 0, 0, lr);
    ctx.clip();
    triStripe(ctx, -lr, -lr, lr * 2, lr * 2);
    ctx.restore();
    ctx.fillStyle = C.ink;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = font(lr * 0.3, F.display);
    ctx.fillText(o.title || 'JAH FABIO', 0, -lr * 0.46);
    ctx.font = font(lr * 0.19, F.sans, 800);
    fillTracked(ctx, o.subtitle || 'LEGADO', 0, lr * 0.5, lr * 0.04, 'center');
    ctx.beginPath();
    circlePath(ctx, 0, 0, lr * 0.09);
    ctx.fillStyle = '#0b0b0c';
    ctx.fill();
    ctx.restore();
  }

  function drawMic(ctx, cx, cy, h, o = {}) {
    const body = o.body || C.cream;
    const lineC = o.line || C.ink;
    ctx.save();
    ctx.translate(cx, cy);
    const u = h / 10;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    // pie
    ctx.strokeStyle = body;
    ctx.lineWidth = u * 0.55;
    ctx.beginPath();
    ctx.moveTo(0, u * 1.6);
    ctx.lineTo(0, u * 4.6);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(0, u * 4.8, u * 1.9, u * 0.42, 0, 0, TAU);
    ctx.fillStyle = body;
    ctx.fill();
    // horquilla
    ctx.lineWidth = u * 0.45;
    ctx.beginPath();
    ctx.moveTo(-u * 1.75, -u * 1.4);
    ctx.quadraticCurveTo(-u * 1.75, u * 1.7, 0, u * 1.7);
    ctx.quadraticCurveTo(u * 1.75, u * 1.7, u * 1.75, -u * 1.4);
    ctx.stroke();
    // cápsula
    ctx.beginPath();
    roundRectPath(ctx, -u * 1.35, -u * 4.8, u * 2.7, u * 5.2, u * 1.35);
    ctx.fillStyle = body;
    ctx.fill();
    ctx.save();
    ctx.clip();
    ctx.strokeStyle = lineC;
    ctx.globalAlpha = 0.55;
    ctx.lineWidth = u * 0.12;
    for (let y = -u * 4.6; y < u * 0.4; y += u * 0.42) {
      ctx.beginPath();
      ctx.moveTo(-u * 1.4, y);
      ctx.lineTo(u * 1.4, y);
      ctx.stroke();
    }
    ctx.restore();
    // banda central
    triStripe(ctx, -u * 1.38, -u * 2.5, u * 2.76, u * 0.66);
    ctx.lineWidth = u * 0.14;
    ctx.strokeStyle = lineC;
    ctx.beginPath();
    roundRectPath(ctx, -u * 1.35, -u * 4.8, u * 2.7, u * 5.2, u * 1.35);
    ctx.stroke();
    ctx.restore();
  }

  function drawSpeaker(ctx, x, y, w, h, pulse = 0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.shadowColor = 'rgba(0,0,0,0.45)';
    ctx.shadowBlur = w * 0.06;
    ctx.shadowOffsetY = w * 0.03;
    ctx.beginPath();
    roundRectPath(ctx, 0, 0, w, h, w * 0.04);
    ctx.fillStyle = C.wood;
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.lineWidth = w * 0.02;
    ctx.strokeStyle = '#4a3322';
    ctx.stroke();
    const woofR = Math.min(w, h * 0.72) * 0.34;
    const wx = w / 2, wy = h * 0.6;
    const cone = (cx, cy, r) => {
      const g = ctx.createRadialGradient(cx, cy - r * 0.2, r * 0.1, cx, cy, r);
      g.addColorStop(0, '#3a3a3a');
      g.addColorStop(0.55, '#141414');
      g.addColorStop(1, '#050505');
      ctx.beginPath();
      circlePath(ctx, cx, cy, r);
      ctx.fillStyle = g;
      ctx.fill();
      ctx.lineWidth = r * 0.08;
      ctx.strokeStyle = C.gold;
      ctx.stroke();
      ctx.beginPath();
      circlePath(ctx, cx, cy, r * (0.32 + pulse * 0.06));
      ctx.fillStyle = '#222';
      ctx.fill();
      ctx.lineWidth = r * 0.03;
      ctx.strokeStyle = 'rgba(255,255,255,0.18)';
      ctx.stroke();
    };
    cone(wx, wy, woofR * (1 + pulse * 0.05));
    cone(wx, h * 0.19, woofR * 0.36);
    triStripe(ctx, w * 0.08, h * 0.9, w * 0.84, h * 0.045, true);
    ctx.restore();
  }

  function drawSpeakerStack(ctx, cx, bottom, unit, pulse = 0) {
    const w = unit, h = unit * 1.25;
    drawSpeaker(ctx, cx - w * 1.04, bottom - h, w, h, pulse);
    drawSpeaker(ctx, cx + w * 0.04, bottom - h, w, h, pulse);
    drawSpeaker(ctx, cx - w * 0.5, bottom - h * 2.04, w, h, pulse);
  }

  // Papel picado con recortes (flor, rombos y flecos) en los colores del reggae.
  function drawPapelPicado(ctx, x0, x1, y, n, fw, fh, t = 0, colors) {
    colors = colors || [C.red, C.gold, C.green];
    const sag = fh * 0.22;
    ctx.save();
    ctx.strokeStyle = 'rgba(20,14,8,0.8)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x0, y);
    ctx.quadraticCurveTo((x0 + x1) / 2, y + sag * 2, x1, y);
    ctx.stroke();
    for (let i = 0; i < n; i++) {
      const u = (i + 0.5) / n;
      const x = lerp(x0, x1, u);
      const yy = y + 4 * sag * u * (1 - u);
      const sway = Math.sin(t * 1.7 + i * 1.3) * 0.035 + (u - 0.5) * 0.05;
      ctx.save();
      ctx.translate(x, yy);
      ctx.rotate(sway);
      ctx.shadowColor = 'rgba(0,0,0,0.25)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 6;
      ctx.beginPath();
      const hw = fw / 2;
      ctx.moveTo(-hw, 0);
      ctx.lineTo(hw, 0);
      ctx.lineTo(hw, fh * 0.9);
      const teeth = 7;
      for (let k = 0; k < teeth; k++) {
        const xa = hw - (fw / teeth) * (k + 0.5);
        const xb = hw - (fw / teeth) * (k + 1);
        ctx.lineTo(xa, fh);
        ctx.lineTo(xb, fh * 0.9);
      }
      ctx.closePath();
      // recortes
      circlePath(ctx, 0, fh * 0.47, fw * 0.1);
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * TAU;
        circlePath(ctx, Math.cos(a) * fw * 0.24, fh * 0.47 + Math.sin(a) * fw * 0.24, fw * 0.055);
      }
      [0.17, 0.78].forEach((fy) => {
        for (let k = 0; k < 5; k++) {
          const dx = -hw + fw * (0.14 + k * 0.18);
          const d = fw * 0.045;
          ctx.moveTo(dx, fh * fy - d);
          ctx.lineTo(dx + d, fh * fy);
          ctx.lineTo(dx, fh * fy + d);
          ctx.lineTo(dx - d, fh * fy);
          ctx.closePath();
        }
      });
      [-1, 1].forEach((sx) => {
        ctx.moveTo(sx * fw * 0.4 + fw * 0.03, fh * 0.47);
        ctx.ellipse(sx * fw * 0.4, fh * 0.47, fw * 0.03, fh * 0.1, 0, 0, TAU);
      });
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill('evenodd');
      ctx.shadowColor = 'transparent';
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      ctx.fillRect(-hw, 0, fw, fh * 0.05);
      ctx.restore();
    }
    ctx.restore();
  }

  function drawTape(ctx, x, y, w, h, angle, color = 'rgba(236,224,186,0.78)') {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.beginPath();
    const z = h / 6;
    ctx.moveTo(-w / 2, -h / 2);
    ctx.lineTo(w / 2, -h / 2);
    for (let k = 0; k <= 6; k++) ctx.lineTo(w / 2 + (k % 2 ? z : 0), -h / 2 + (h / 6) * k);
    ctx.lineTo(-w / 2, h / 2);
    for (let k = 6; k >= 0; k--) ctx.lineTo(-w / 2 - (k % 2 ? z : 0), -h / 2 + (h / 6) * k);
    ctx.closePath();
    ctx.shadowColor = 'rgba(0,0,0,0.15)';
    ctx.shadowBlur = 6;
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  }

  function tornPath(ctx, x, y, w, h, r, jag = 6) {
    ctx.moveTo(x, y + (r() - 0.5) * jag);
    for (let px = x; px <= x + w; px += 14) ctx.lineTo(px, y + (r() - 0.5) * jag);
    ctx.lineTo(x + w, y + h);
    for (let px = x + w; px >= x; px -= 14) ctx.lineTo(px, y + h + (r() - 0.5) * jag);
    ctx.closePath();
  }

  function drawTornStrip(ctx, cx, cy, w, h, angle, color, seed) {
    const r = rng(seed);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.shadowColor = 'rgba(0,0,0,0.22)';
    ctx.shadowBlur = 14;
    ctx.shadowOffsetY = 6;
    ctx.beginPath();
    tornPath(ctx, -w / 2, -h / 2, w, h, r, 10);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  }

  function drawPolaroid(ctx, cx, cy, w, h, angle, content, caption) {
    const pad = w * 0.055, bottom = h * 0.2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 26;
    ctx.shadowOffsetY = 12;
    ctx.fillStyle = '#faf6ec';
    ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.shadowColor = 'transparent';
    const px = -w / 2 + pad, py = -h / 2 + pad, pw = w - pad * 2, ph = h - pad - bottom;
    ctx.save();
    ctx.beginPath();
    ctx.rect(px, py, pw, ph);
    ctx.clip();
    content(ctx, px, py, pw, ph);
    const g = ctx.createRadialGradient(px + pw / 2, py + ph / 2, Math.min(pw, ph) * 0.3, px + pw / 2, py + ph / 2, Math.hypot(pw, ph) * 0.62);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(0,0,0,0.35)');
    ctx.fillStyle = g;
    ctx.fillRect(px, py, pw, ph);
    ctx.restore();
    if (caption) {
      ctx.fillStyle = '#231a12';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const size = fitSize(ctx, caption, F.script, 400, bottom * 0.46, pw);
      ctx.font = font(size, F.script);
      ctx.fillText(caption, 0, h / 2 - bottom / 2 + 2);
    }
    ctx.restore();
  }

  function drawStamp(ctx, cx, cy, r, angle, color, ringText, lines) {
    const s = Math.ceil(r * 2.3);
    const c = makeCanvas(s, s);
    const g = c.getContext('2d');
    g.translate(s / 2, s / 2);
    g.strokeStyle = color;
    g.fillStyle = color;
    g.lineWidth = r * 0.07;
    g.beginPath();
    circlePath(g, 0, 0, r);
    g.stroke();
    g.lineWidth = r * 0.03;
    g.beginPath();
    circlePath(g, 0, 0, r * 0.74);
    g.stroke();
    g.font = font(r * 0.16, F.sans, 800);
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    const chars = [...ringText];
    chars.forEach((ch, i) => {
      g.save();
      g.rotate((i / chars.length) * TAU);
      g.fillText(ch, 0, -r * 0.87);
      g.restore();
    });
    lines.forEach((ln, i) => {
      g.font = font(ln.size * r, ln.family || F.display, ln.weight || 400);
      g.fillText(ln.text, 0, (i - (lines.length - 1) / 2) * r * 0.3);
    });
    // desgaste de sello de goma
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalCompositeOperation = 'destination-out';
    const rr = rng(24);
    for (let k = 0; k < 420; k++) {
      g.globalAlpha = 0.25 + rr() * 0.6;
      g.beginPath();
      circlePath(g, rr() * s, rr() * s, 0.6 + rr() * 2.4);
      g.fill();
    }
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.globalAlpha = 0.88;
    ctx.drawImage(c, -s / 2, -s / 2);
    ctx.restore();
  }

  function drawStar(ctx, cx, cy, r, color, fill = false, rot = 0) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * TAU - Math.PI / 2;
      const rr = i % 2 ? r * 0.45 : r;
      i ? ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : ctx.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
    }
    ctx.closePath();
    ctx.lineJoin = 'round';
    if (fill) {
      ctx.fillStyle = color;
      ctx.fill();
    } else {
      ctx.lineWidth = r * 0.14;
      ctx.strokeStyle = color;
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawHalftone(ctx, x, y, w, h, color, step = 18, maxR = 5) {
    ctx.save();
    ctx.fillStyle = color;
    for (let yy = y; yy < y + h + step; yy += step) {
      for (let xx = x + ((yy / step) % 2 ? step / 2 : 0); xx < x + w + step; xx += step) {
        const k = clamp((yy - y) / h);
        ctx.beginPath();
        circlePath(ctx, xx, yy, maxR * (0.25 + k * 0.75));
        ctx.fill();
      }
    }
    ctx.restore();
  }

  // Ícono de parlante con ondas (para el llamado a compartir).
  function drawVolumeIcon(ctx, cx, cy, s, t, color) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-s * 0.9, -s * 0.28);
    ctx.lineTo(-s * 0.5, -s * 0.28);
    ctx.lineTo(-s * 0.05, -s * 0.7);
    ctx.lineTo(-s * 0.05, s * 0.7);
    ctx.lineTo(-s * 0.5, s * 0.28);
    ctx.lineTo(-s * 0.9, s * 0.28);
    ctx.closePath();
    ctx.fill();
    for (let k = 0; k < 3; k++) {
      const ph = (t * 1.25 - k * 0.22) % 1;
      const a = clamp(1 - Math.abs(ph - 0.5) * 1.6, 0.25, 1);
      ctx.globalAlpha = a;
      ctx.lineWidth = s * 0.12;
      ctx.beginPath();
      ctx.arc(0, 0, s * (0.42 + k * 0.3), -0.75, 0.75);
      ctx.stroke();
    }
    ctx.restore();
  }

  // ───────────────────────── pieza 1: tarjeta ─────────────────────────

  function drawCard(ctx, opts, photos = []) {
    const o = Object.assign({}, DEFAULTS, opts);
    const { w: W, h: H } = SIZES.card;
    const M = 84;
    ctx.save();
    ctx.clearRect(0, 0, W, H);

    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#1d150d');
    bg.addColorStop(0.5, '#120d09');
    bg.addColorStop(1, '#0a0705');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    const photo = o.cardPhotoBg && photos[0];
    if (photo) {
      ctx.save();
      ctx.globalAlpha = 0.55;
      drawImageCover(ctx, photo, 0, 0, W, H, 0.3);
      ctx.restore();
      const shade = ctx.createLinearGradient(0, 0, 0, H);
      shade.addColorStop(0, 'rgba(13,10,7,0.35)');
      shade.addColorStop(0.45, 'rgba(13,10,7,0.72)');
      shade.addColorStop(1, 'rgba(13,10,7,0.94)');
      ctx.fillStyle = shade;
      ctx.fillRect(0, 0, W, H);
    }

    // sol-león saliendo por la esquina superior derecha
    const lx = 842, ly = 282;
    glow(ctx, lx, ly, 640, 'rgba(244,185,39,0.55)', photo ? 0.28 : 0.42);
    sunburst(ctx, lx, ly, 1500, 40, 0.05, C.gold, photo ? 0.035 : 0.055);
    drawLion(ctx, lx, ly, 292, { rot: 0.04 });

    // encabezado
    ctx.fillStyle = C.gold;
    ctx.font = font(24, F.sans, 800);
    ctx.textBaseline = 'alphabetic';
    fillTracked(ctx, 'EN MEMORIA', M, 118, 7);
    ctx.fillStyle = 'rgba(245,236,215,0.78)';
    ctx.font = font(34, F.sans, 600);
    fillTracked(ctx, o.dates, M, 170, 3);
    ctx.font = font(24, F.sans, 600);
    ctx.fillStyle = 'rgba(245,236,215,0.55)';
    fillTracked(ctx, o.origin.toUpperCase(), M, 212, 3);

    // frase: bloque centrado entre el león y la firma, con la comilla pegada a la primera línea
    const boxTop = 700, boxBottom = 1040;
    const qm = fitWrap(ctx, o.phrase, F.serif, 600, 'italic', W - M * 2, boxBottom - boxTop, 72, 34, 1.2);
    const lh = qm.size * 1.2;
    const blockH = qm.lines.length * lh;
    const firstBase = boxTop + (boxBottom - boxTop - blockH) / 2 + qm.size * 0.95;
    ctx.save();
    ctx.fillStyle = C.gold;
    ctx.font = font(220, F.serif, 600, 'italic');
    const qMetrics = ctx.measureText('“');
    const qBottom = firstBase - qm.size * 0.78 - 22;
    ctx.fillText('“', M - 12, qBottom - (qMetrics.actualBoundingBoxDescent || -90));
    ctx.restore();
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 18;
    ctx.fillStyle = C.cream;
    ctx.font = font(qm.size, F.serif, 600, 'italic');
    ctx.textAlign = 'left';
    qm.lines.forEach((ln, i) => ctx.fillText(ln, M, firstBase + i * lh));
    ctx.restore();

    // firma
    const nameY = 1188;
    ctx.fillStyle = C.cream;
    const nameSize = fitSize(ctx, o.name, F.display, 400, 118, 560, 'normal', 4);
    ctx.font = font(nameSize, F.display);
    const nameW = fillTracked(ctx, o.name, M, nameY, 4);
    ctx.save();
    ctx.translate(M + nameW + 26, nameY - 18);
    ctx.rotate(-0.1);
    ctx.fillStyle = C.gold;
    ctx.font = font(78, F.script);
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 16;
    ctx.fillText('Legado', 0, 0);
    ctx.restore();
    triStripe(ctx, M, nameY + 26, 210, 12, true);

    // pie
    ctx.font = font(26, F.sans, 700);
    ctx.fillStyle = 'rgba(245,236,215,0.7)';
    if (o.song && o.song.trim()) fillTracked(ctx, '♪  ' + o.song.trim(), M, 1290, 1.5);
    ctx.fillStyle = C.gold;
    ctx.textAlign = 'right';
    ctx.fillText(o.hashtag, W - M, 1290);
    ctx.textAlign = 'left';
    triStripe(ctx, 0, H - 18, W, 18, true);

    drawGrain(ctx, W, H, 0.09);
    drawVignette(ctx, W, H, 0.45, 0.35);
    ctx.restore();
  }

  // ───────────────────────── pieza 2: collage ─────────────────────────

  function polaroidLion(ctx, x, y, w, h) {
    const bg = ctx.createLinearGradient(x, y, x, y + h);
    bg.addColorStop(0, '#22170e');
    bg.addColorStop(1, '#0c0906');
    ctx.fillStyle = bg;
    ctx.fillRect(x, y, w, h);
    glow(ctx, x + w / 2, y + h * 0.48, w * 0.8, 'rgba(244,185,39,0.6)', 0.45);
    sunburst(ctx, x + w / 2, y + h * 0.48, w * 1.4, 28, 0, C.gold, 0.08);
    drawLion(ctx, x + w / 2, y + h * 0.5, Math.min(w, h) * 0.4);
  }

  function polaroidVinyl(ctx, x, y, w, h) {
    ctx.fillStyle = '#17633a';
    ctx.fillRect(x, y, w, h);
    drawHalftone(ctx, x, y, w, h, 'rgba(0,0,0,0.18)', 22, 7);
    drawVinyl(ctx, x + w * 0.5, y + h * 0.52, Math.min(w, h) * 0.42, 0.3, { subtitle: 'ROOTS' });
  }

  function polaroidMic(ctx, x, y, w, h) {
    ctx.fillStyle = '#b72a21';
    ctx.fillRect(x, y, w, h);
    sunburst(ctx, x + w / 2, y + h * 0.55, w * 1.3, 24, 0.1, '#e0463a', 0.55);
    drawMic(ctx, x + w / 2, y + h * 0.5, h * 0.8, { body: C.cream, line: C.ink });
  }

  function drawCollage(ctx, opts, photos = []) {
    const o = Object.assign({}, DEFAULTS, opts);
    const { w: W, h: H } = SIZES.collage;
    ctx.save();
    ctx.clearRect(0, 0, W, H);

    // papel
    ctx.fillStyle = C.paper;
    ctx.fillRect(0, 0, W, H);
    const r = rng(2005);
    for (let k = 0; k < 16; k++) {
      glow(ctx, r() * W, r() * H, 140 + r() * 260, 'rgba(190,140,60,0.55)', 0.07 + r() * 0.07);
    }
    drawGrain(ctx, W, H, 0.09, 0, 0, 'multiply');

    const photoOr = (i, fallback) => (ctx2, x, y, w, h) => {
      if (photos[i]) {
        ctx2.fillStyle = '#111';
        ctx2.fillRect(x, y, w, h);
        drawImageCover(ctx2, photos[i], x, y, w, h, 0.3);
      } else fallback(ctx2, x, y, w, h);
    };

    // título sobre papel dorado rasgado
    drawTornStrip(ctx, 470, 300, 860, 180, -0.035, C.gold, 7);
    const titleSize = fitSize(ctx, o.name, F.display, 400, 170, 760);
    text(ctx, o.name, 470, 290, { font: font(titleSize, F.display), color: C.ink, rotate: -0.035, shadow: false });

    // polaroids
    drawPolaroid(ctx, 290, 672, 430, 500, -0.06, photoOr(0, polaroidLion), 'Guadalajara, Jal.');
    drawPolaroid(ctx, 795, 664, 380, 440, 0.06, photoOr(1, polaroidVinyl), 'Sound System Culture');
    drawTape(ctx, 190, 428, 150, 40, -0.5);
    drawTape(ctx, 400, 420, 150, 40, 0.42);
    drawTape(ctx, 800, 446, 160, 40, -0.08);

    drawPolaroid(ctx, 250, 1112, 330, 296, 0.05, photoOr(2, polaroidMic), 'Roots desde 2005');
    drawTape(ctx, 250, 966, 150, 38, 0.06);

    text(ctx, 'Legado', 812, 388, { font: font(108, F.script), color: C.red, rotate: -0.12, shadowColor: 'rgba(0,0,0,0.25)', shadowBlur: 6, shadowY: 3 });

    // nota con los países
    const nx = 762, ny = 1136, nw = 440, nh = 292, na = -0.03;
    ctx.save();
    ctx.translate(nx, ny);
    ctx.rotate(na);
    ctx.shadowColor = 'rgba(0,0,0,0.22)';
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 8;
    ctx.fillStyle = '#fbf7ee';
    ctx.fillRect(-nw / 2, -nh / 2, nw, nh);
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = 'rgba(40,90,160,0.18)';
    ctx.lineWidth = 2;
    for (let yy = -nh / 2 + 92; yy < nh / 2 - 10; yy += 44) {
      ctx.beginPath();
      ctx.moveTo(-nw / 2 + 14, yy);
      ctx.lineTo(nw / 2 - 14, yy);
      ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(216,52,42,0.45)';
    ctx.beginPath();
    ctx.moveTo(-nw / 2 + 52, -nh / 2);
    ctx.lineTo(-nw / 2 + 52, nh / 2);
    ctx.stroke();
    ctx.fillStyle = C.ink;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.font = font(34, F.script);
    ctx.fillText('Llevó el reggae mexicano a:', -nw / 2 + 66, -nh / 2 + 66);
    ctx.font = font(33, F.script);
    const cs = FACTS.countries;
    cs.forEach((c, i) => {
      const col = i < 4 ? 0 : 1;
      const row = i % 4;
      ctx.fillStyle = c === 'Jamaica' ? C.red : '#2a1f16';
      ctx.fillText(c + (c === 'Jamaica' ? ' ★' : ''), -nw / 2 + 70 + col * 190, -nh / 2 + 130 + row * 44);
    });
    ctx.restore();

    // cinta rojinegra del himno del Atlas
    ctx.save();
    ctx.translate(760, 962);
    ctx.rotate(0.03);
    ctx.shadowColor = 'rgba(0,0,0,0.25)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 5;
    ctx.beginPath();
    tornPath(ctx, -250, -46, 500, 92, rng(19), 8);
    ctx.fillStyle = '#151010';
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = C.red;
    ctx.fillRect(-250, -46, 18, 92);
    ctx.fillRect(232, -46, 18, 92);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(245,236,215,0.8)';
    ctx.font = font(19, F.sans, 700);
    fillTracked(ctx, 'AUTOR DEL HIMNO', 0, -18, 4, 'center');
    ctx.fillStyle = '#ff5a4d';
    ctx.font = font(36, F.display);
    ctx.fillText('«SOMOS LOS DEL ATLAS»', 0, 17);
    ctx.restore();

    // sello
    drawStamp(ctx, 548, 748, 76, -0.2, C.red, 'EN MEMORIA • EN MEMORIA • ', [
      { text: o.dates.replace(/\s*[—–-]\s*/, ' · '), size: 0.24, family: F.display },
    ]);

    // garabatos
    drawStar(ctx, 70, 232, 26, C.red, false, 0.2);
    drawStar(ctx, 1012, 236, 18, C.green, true, -0.3);
    drawStar(ctx, 1040, 548, 14, C.gold, true, 0.4);

    // papel picado arriba
    drawPapelPicado(ctx, -30, W + 30, 20, 8, 122, 150, 0.6);

    // pie
    ctx.fillStyle = C.ink;
    ctx.font = font(30, F.sans, 800);
    ctx.textAlign = 'right';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(o.hashtag, W - 48, H - 34);
    ctx.textAlign = 'left';
    ctx.font = font(22, F.sans, 700);
    ctx.fillStyle = 'rgba(13,10,7,0.65)';
    fillTracked(ctx, 'HOMENAJE · ' + o.dates.replace(/\s+/g, ' '), 48, H - 36, 3);
    triStripe(ctx, 0, H - 14, W, 14, true);

    drawVignette(ctx, W, H, 0.28, 0.5);
    ctx.restore();
  }

  // ───────────────────────── pieza 3: reel ─────────────────────────

  const BEAT = 0.8; // ~75 BPM, pulso típico de one drop

  function pop(t, t0, dur = 0.26) {
    const p = prog(t, t0, t0 + dur);
    return { alpha: clamp(p * 1.8), scale: lerp(1.32, 1, ease.outBack(p)), p };
  }

  function rise(t, t0, dur = 0.45, dist = 70) {
    const p = prog(t, t0, t0 + dur);
    return { alpha: p, dy: (1 - ease.outCubic(p)) * dist, p };
  }

  function beatPulse(t) {
    return Math.exp(-(((t % BEAT) + BEAT) % BEAT) / 0.16);
  }

  const RW = SIZES.reel.w, RH = SIZES.reel.h, RCX = RW / 2, SAFE = 900;

  function big(ctx, str, y, t, t0, o = {}) {
    const size = fitSize(ctx, str, F.display, 400, o.size || 180, o.maxW || SAFE);
    const a = o.anim === 'rise' ? rise(t, t0) : pop(t, t0);
    text(ctx, str, RCX, y, {
      font: font(size, F.display),
      color: o.color || C.cream,
      alpha: a.alpha * (o.alpha == null ? 1 : o.alpha),
      scale: a.scale || 1,
      dy: a.dy || 0,
      shadowBlur: 34,
    });
    return size;
  }

  function label(ctx, str, y, t, t0, o = {}) {
    const a = rise(t, t0, 0.5, 40);
    const size = fitSize(ctx, str, F.sans, 800, o.size || 44, SAFE, 'normal', o.tracking || 9);
    text(ctx, str, RCX, y, {
      font: font(size, F.sans, 800),
      color: o.color || 'rgba(245,236,215,0.85)',
      alpha: a.alpha,
      dy: a.dy,
      tracking: o.tracking || 9,
      shadowBlur: 20,
    });
  }

  function sceneHook(ctx, lt) {
    big(ctx, 'HAY VOCES', 740, lt, 0.05, { size: 200 });
    big(ctx, 'QUE NO', 950, lt, BEAT, { size: 200 });
    big(ctx, 'SE APAGAN', 1160, lt, BEAT * 2, { size: 200, color: C.gold });
    const fl = 1 - prog(lt, 0, 0.35);
    if (fl > 0) {
      ctx.fillStyle = `rgba(255,236,190,${fl * 0.55})`;
      ctx.fillRect(0, 0, RW, RH);
    }
  }

  function sceneName(ctx, lt, sc, o, photos) {
    const p = ease.outBack(prog(lt, 0, 0.7));
    if (photos[0]) {
      const k = prog(lt, 0, sc.dur);
      ctx.save();
      ctx.globalAlpha = 0.32 * prog(lt, 0, 0.6);
      const zoom = 1.08 + k * 0.08;
      drawImageCover(ctx, photos[0], RCX - (RW * zoom) / 2, 180 - 80 * k, RW * zoom, 1300 * zoom, 0.3);
      ctx.restore();
    }
    glow(ctx, RCX, 800, 700, 'rgba(244,185,39,0.6)', 0.35 + beatPulse(lt) * 0.18);
    drawLion(ctx, RCX, 800, 330, { scale: Math.max(0.001, p), rot: lt * 0.12 });
    const name = o.name;
    const size = fitSize(ctx, name, F.display, 400, 210, SAFE, 'normal', 6);
    ctx.save();
    ctx.font = font(size, F.display);
    const total = trackedWidth(ctx, name, 6);
    let x = RCX - total / 2;
    const off = capOffset(ctx);
    [...name].forEach((ch, i) => {
      const a = rise(lt, 0.55 + i * 0.06, 0.4, 60);
      const cw = ctx.measureText(ch).width;
      text(ctx, ch, x + cw / 2, 1325, { font: font(size, F.display), color: C.cream, alpha: a.alpha, dy: a.dy, shadowBlur: 30 });
      x += cw + 6;
    });
    void off;
    ctx.restore();
    label(ctx, o.dates, 1450, lt, 1.3, { color: C.gold, size: 50, tracking: 10 });
  }

  function phraseDuration(str) {
    const words = String(str).trim().split(/\s+/).filter(Boolean).length;
    return clamp(1.6 + words * 0.32, 3.2, 8);
  }

  function scenePhrase(ctx, lt, sc, o) {
    const str = o.reelPhrase.trim();
    const words = str.split(/\s+/);
    const fit = fitWrap(ctx, str, F.serif, 600, 'italic', 860, 820, 92, 44, 1.22);
    const lh = fit.size * 1.22;
    const top = 960 - (fit.lines.length * lh) / 2 + fit.size * 0.8;
    text(ctx, '“', RCX, top - fit.size * 0.6 - 60, { font: font(220, F.serif, 600, 'italic'), color: C.gold, alpha: prog(lt, 0, 0.3), shadow: false });
    const per = (sc.dur - 1.1) / words.length;
    let wi = 0;
    ctx.save();
    ctx.font = font(fit.size, F.serif, 600, 'italic');
    const space = ctx.measureText(' ').width;
    fit.lines.forEach((ln, li) => {
      const ws = ln.split(' ');
      const lw = ctx.measureText(ln).width;
      let x = RCX - lw / 2;
      ws.forEach((wd) => {
        const a = rise(lt, 0.25 + wi * per, 0.35, 26);
        const ww = ctx.measureText(wd).width;
        text(ctx, wd, x, top + li * lh, { font: font(fit.size, F.serif, 600, 'italic'), color: C.cream, align: 'left', alpha: a.alpha, dy: a.dy, shadowBlur: 22 });
        x += ww + space;
        wi++;
      });
    });
    ctx.restore();
    label(ctx, '— ' + o.name, top + fit.lines.length * lh + 40, lt, sc.dur - 1.1, { color: C.gold, size: 40 });
  }

  function sceneWorld(ctx, lt, sc, o, photos, t) {
    const pp = ease.outCubic(prog(lt, 0, 0.7));
    drawPapelPicado(ctx, -40, RW + 40, 150 - (1 - pp) * 420, 9, 112, 138, t);
    big(ctx, 'DE GUADALAJARA', 600, lt, 0.1, { size: 150 });
    big(ctx, 'PARA EL MUNDO', 770, lt, 0.7, { size: 150, color: C.gold });
    const cs = FACTS.countries;
    cs.forEach((c, i) => {
      const t0 = 1.25 + i * 0.22;
      const p = prog(lt, t0, t0 + 0.35);
      const e = ease.outCubic(p);
      const dir = i % 2 ? 1 : -1;
      const isJam = c === 'Jamaica';
      text(ctx, c.toUpperCase(), RCX + dir * (1 - e) * 160, 925 + i * 68, {
        font: font(isJam ? 62 : 52, F.sans, 800),
        color: isJam ? C.gold : 'rgba(245,236,215,0.88)',
        alpha: p,
        tracking: 8,
        shadowBlur: 16,
      });
    });
  }

  function sceneSumfest(ctx, lt) {
    glow(ctx, RCX, 1500, 900, 'rgba(31,154,80,0.7)', 0.28);
    label(ctx, 'REPRESENTÓ A', 560, lt, 0.05, { size: 48, tracking: 12 });
    big(ctx, 'LATINOAMÉRICA', 720, lt, 0.4, { size: 170 });
    big(ctx, 'EN REGGAE SUMFEST', 890, lt, 1.0, { size: 120, color: C.gold });
    const jp = prog(lt, 1.6, 2.2);
    text(ctx, 'Jamaica', RCX, 1040, { font: font(120, F.script), color: C.cream, alpha: jp, dy: (1 - ease.outCubic(jp)) * 40, rotate: -0.06 });
    const pulse = beatPulse(lt + 0.05);
    const up = ease.outCubic(prog(lt, 0.2, 0.9));
    drawSpeakerStack(ctx, RCX, 1790 + (1 - up) * 500, 220, pulse);
  }

  function sceneAtlas(ctx, lt) {
    // destello rojinegro
    const st = prog(lt, 0, 0.5);
    ctx.save();
    ctx.globalAlpha = 0.16 * (1 - st * 0.6);
    ctx.fillStyle = C.red;
    for (let k = -6; k < 14; k++) {
      ctx.beginPath();
      const x = k * 160 + st * 120;
      ctx.moveTo(x, 0);
      ctx.lineTo(x + 80, 0);
      ctx.lineTo(x + 80 - 600, RH);
      ctx.lineTo(x - 600, RH);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
    glow(ctx, RCX, 950, 800, 'rgba(216,52,42,0.7)', 0.3 + beatPulse(lt) * 0.12);
    label(ctx, 'Y LE PUSO VOZ', 590, lt, 0.05, { size: 48, tracking: 12 });
    big(ctx, 'A LA PASIÓN', 760, lt, 0.4, { size: 170 });
    big(ctx, 'ROJINEGRA', 960, lt, 1.0, { size: 210, color: '#ff4a3d' });
    const p = rise(lt, 1.7, 0.5, 30);
    text(ctx, 'autor de «Somos los del Atlas»', RCX, 1130, { font: font(60, F.serif, 600, 'italic'), color: C.cream, alpha: p.alpha, dy: p.dy });
  }

  function sceneLegado(ctx, lt) {
    const up = ease.outCubic(prog(lt, 0, 0.8));
    glow(ctx, RCX, 760, 700, 'rgba(244,185,39,0.6)', 0.3 + beatPulse(lt) * 0.15);
    drawVinyl(ctx, RCX, 760 + (1 - up) * 900, 340, lt * 2.2);
    big(ctx, 'SU MÚSICA ES SU', 1250, lt, 0.7, { size: 120, anim: 'rise' });
    const wp = ease.inOutCubic(prog(lt, 1.2, 2.0));
    if (wp > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 1280, RW * wp + 40, 420);
      ctx.clip();
      text(ctx, 'Legado', RCX, 1450, { font: font(250, F.script), color: C.gold, rotate: -0.05, shadowBlur: 40 });
      ctx.restore();
    }
  }

  function sceneCta(ctx, lt, sc, o) {
    const str = (o.cta || DEFAULTS.cta).trim();
    ctx.save();
    const fit = fitWrap(ctx, str.toUpperCase(), F.display, 400, 'normal', SAFE, 620, 170, 70, 1.08);
    ctx.restore();
    const lh = fit.size * 1.08;
    const top = 900 - (fit.lines.length * lh) / 2 + lh / 2;
    fit.lines.forEach((ln, i) => {
      big(ctx, ln, top + i * lh, lt, 0.05 + i * 0.4, { size: fit.size, color: i === 0 ? C.gold : C.cream });
    });
    const y2 = top + fit.lines.length * lh + 30;
    const ip = prog(lt, 1.2, 1.6);
    ctx.save();
    ctx.globalAlpha = ip;
    drawVolumeIcon(ctx, RCX, y2 + 70, 70, lt, C.gold);
    ctx.restore();
    const hp = pop(lt, 1.6);
    ctx.save();
    ctx.font = font(60, F.sans, 800);
    const hw = ctx.measureText(o.hashtag).width + 70;
    ctx.restore();
    ctx.save();
    ctx.globalAlpha = hp.alpha;
    ctx.translate(RCX, y2 + 230);
    ctx.scale(hp.scale, hp.scale);
    ctx.beginPath();
    roundRectPath(ctx, -hw / 2, -52, hw, 104, 52);
    ctx.fillStyle = C.gold;
    ctx.fill();
    ctx.restore();
    text(ctx, o.hashtag, RCX, y2 + 230, { font: font(60, F.sans, 800), color: C.ink, alpha: hp.alpha, scale: hp.scale, shadow: false });
    label(ctx, o.name + '  ·  ' + o.dates, y2 + 350, lt, 2.0, { size: 34, tracking: 6, color: 'rgba(245,236,215,0.7)' });
    if (o.song && o.song.trim()) label(ctx, '♪ ' + o.song.trim(), y2 + 410, lt, 2.2, { size: 34, tracking: 3, color: 'rgba(245,236,215,0.7)' });
  }

  function timeline(o) {
    const scenes = [
      { id: 'hook', dur: 3.2, draw: sceneHook },
      { id: 'name', dur: 3.2, draw: sceneName },
    ];
    if (o.reelPhrase && o.reelPhrase.trim()) scenes.push({ id: 'phrase', dur: phraseDuration(o.reelPhrase), draw: scenePhrase });
    scenes.push(
      { id: 'world', dur: 3.6, draw: sceneWorld },
      { id: 'sumfest', dur: 3.2, draw: sceneSumfest },
      { id: 'atlas', dur: 3.2, draw: sceneAtlas },
      { id: 'legado', dur: 3.2, draw: sceneLegado },
      { id: 'cta', dur: 4.0, draw: sceneCta },
    );
    let acc = 0;
    scenes.forEach((s) => {
      s.start = acc;
      acc += s.dur;
      s.end = acc;
    });
    return { scenes, duration: acc };
  }

  function reelDuration(opts) {
    return timeline(Object.assign({}, DEFAULTS, opts)).duration;
  }

  function reelBackground(ctx, t) {
    const bg = ctx.createLinearGradient(0, 0, 0, RH);
    bg.addColorStop(0, '#171109');
    bg.addColorStop(0.5, '#0f0b07');
    bg.addColorStop(1, '#070504');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, RW, RH);
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    glow(ctx, RCX + Math.sin(t * 0.4) * 260, 380 + Math.cos(t * 0.3) * 120, 700, 'rgba(216,52,42,0.8)', 0.1);
    glow(ctx, RCX + Math.cos(t * 0.35) * 300, 1500 + Math.sin(t * 0.25) * 160, 760, 'rgba(31,154,80,0.8)', 0.1);
    ctx.restore();
    sunburst(ctx, RCX, 860, 1700, 36, t * 0.05, C.gold, 0.035 + beatPulse(t) * 0.015);
  }

  // Cortina de tres franjas (rojo, oro, verde) que tapa el cambio de escena.
  function wipe(ctx, t, T) {
    const d = 0.55;
    const p0 = (t - (T - d / 2)) / d;
    if (p0 <= 0 || p0 >= 1.3) return;
    const cols = [C.red, C.gold, C.green];
    cols.forEach((col, i) => {
      const p = clamp(p0 - i * 0.1);
      if (p <= 0 || p >= 1) return;
      const e = ease.inOutCubic(p);
      const band = RH * 1.25;
      const y = lerp(RH + 200, -band - 200, e);
      ctx.save();
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.moveTo(0, y + 180);
      ctx.lineTo(RW, y);
      ctx.lineTo(RW, y + band);
      ctx.lineTo(0, y + band + 180);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    });
  }

  const tlCache = { key: '', value: null };
  function cachedTimeline(o) {
    const key = (o.reelPhrase || '').trim();
    if (tlCache.key !== key || !tlCache.value) {
      tlCache.key = key;
      tlCache.value = timeline(o);
    }
    return tlCache.value;
  }

  function drawReelFrame(ctx, t, opts, photos = []) {
    const o = Object.assign({}, DEFAULTS, opts);
    const tl = cachedTimeline(o);
    t = clamp(t, 0, tl.duration - 1e-4);
    ctx.save();
    ctx.clearRect(0, 0, RW, RH);
    reelBackground(ctx, t);
    const sc = tl.scenes.find((s) => t >= s.start && t < s.end) || tl.scenes[tl.scenes.length - 1];
    ctx.save();
    sc.draw(ctx, t - sc.start, sc, o, photos, t);
    ctx.restore();
    tl.scenes.forEach((s, i) => {
      if (i === 0) return;
      if (s.id === 'legado') {
        // fundido a negro antes del vinilo
        const k = 1 - Math.abs(t - s.start) / 0.3;
        if (k > 0) {
          ctx.fillStyle = `rgba(0,0,0,${clamp(k)})`;
          ctx.fillRect(0, 0, RW, RH);
        }
      } else wipe(ctx, t, s.start);
    });
    // borde tricolor
    triStripe(ctx, 0, 0, RW, 10, true);
    drawGrain(ctx, RW, RH, 0.07);
    drawVignette(ctx, RW, RH, 0.55, 0.47);
    // cierre en negro para que el loop empalme con el inicio
    const end = prog(t, tl.duration - 0.5, tl.duration);
    if (end > 0) {
      ctx.fillStyle = `rgba(0,0,0,${ease.inCubic(end)})`;
      ctx.fillRect(0, 0, RW, RH);
    }
    ctx.restore();
  }

  // ───────────────────────── fuentes ─────────────────────────

  function fontsReady() {
    if (!document.fonts || !document.fonts.load) return Promise.resolve();
    return Promise.all([
      document.fonts.load(font(100, F.display)),
      document.fonts.load(font(100, F.script)),
      document.fonts.load(font(100, F.serif, 600, 'italic')),
      document.fonts.load(font(100, F.sans, 600)),
      document.fonts.load(font(100, F.sans, 700)),
      document.fonts.load(font(100, F.sans, 800)),
    ]).then(() => document.fonts.ready);
  }

  global.Legado = {
    SIZES,
    DEFAULTS,
    FACTS,
    drawCard,
    drawCollage,
    drawReelFrame,
    reelDuration,
    fontsReady,
  };
})(typeof window !== 'undefined' ? window : globalThis);
