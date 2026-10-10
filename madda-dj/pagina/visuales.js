/* Visuales en canvas: la película tornasol de la portada, las 4 vistas LED,
   los fondos de prueba de legibilidad y la medición de contraste.
   Todo a 30 fps como máximo, pausado fuera de pantalla o con la pestaña oculta,
   y un cuadro fijo si el sistema pide menos movimiento. */
(function () {
  'use strict';

  const FPS = 30;
  const T_FIJO = 14.2; // cuadro elegido para movimiento reducido
  const pideQuieto = () => !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  // ── color ──
  function rgb(hex) {
    const h = String(hex || '#000000').replace('#', '');
    const v = h.length === 3 ? h.split('').map((c) => c + c).join('') : h.padEnd(6, '0').slice(0, 6);
    const num = parseInt(v, 16);
    if (Number.isNaN(num)) return [0, 0, 0];
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
  }
  const rgba = (hex, a) => { const c = rgb(hex); return `rgba(${c[0]},${c[1]},${c[2]},${a})`; };
  const mezclar = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

  // Paleta mínima por si no llega ninguna.
  const BASE = {
    tokens: { fondo: '#06050B', acento: '#7B4DFF', acento2: '#3A6BFF', brillo: '#C9B8FF' },
    pelicula: ['#C9B8FF', '#7B4DFF', '#3A6BFF', '#5B3BE0'],
  };
  function datosPaleta(p) {
    const t = Object.assign({}, BASE.tokens, (p && p.tokens) || {});
    const pel = p && Array.isArray(p.pelicula) && p.pelicula.length >= 4 ? p.pelicula : BASE.pelicula;
    return { t, pel, intensidad: p && p.id === 'noche' ? 0.7 : 1 };
  }

  // ── ruido para la versión 2D (value noise + fbm) ──
  const PERM = new Uint8Array(512);
  (function () {
    const p = [];
    for (let i = 0; i < 256; i++) p[i] = i;
    let s = 1234567;
    for (let i = 255; i > 0; i--) { s = (s * 16807) % 2147483647; const j = s % (i + 1); [p[i], p[j]] = [p[j], p[i]]; }
    for (let i = 0; i < 512; i++) PERM[i] = p[i & 255];
  })();
  function ruido(x, y) {
    const xi = Math.floor(x), yi = Math.floor(y);
    const xf = x - xi, yf = y - yi;
    const X = xi & 255, Y = yi & 255;
    const a = PERM[PERM[X] + Y] / 255, b = PERM[PERM[X + 1] + Y] / 255;
    const c = PERM[PERM[X] + Y + 1] / 255, d = PERM[PERM[X + 1] + Y + 1] / 255;
    const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    return (a + (b - a) * u) * (1 - v) + (c + (d - c) * u) * v;
  }
  function fbm(x, y) {
    let v = 0, a = 0.5;
    for (let i = 0; i < 3; i++) { v += a * ruido(x, y); x = x * 2.02 + 3.1; y = y * 2.02 + 1.7; a *= 0.5; }
    return v / 0.875;
  }
  function colorCiclico(pel, x) {
    const f = (x - Math.floor(x)) * 4;
    const i = Math.floor(f);
    return mezclar(pel[i % 4], pel[(i + 1) % 4], f - i);
  }

  // ── película tornasol (thin-film) ──
  const VERT = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.0,1.0);}';
  const FRAG = [
    'precision mediump float;',
    'uniform vec2 uRes;uniform float uT;uniform vec3 uC0;uniform vec3 uC1;uniform vec3 uC2;uniform vec3 uC3;uniform vec3 uFondo;uniform vec2 uCentro;uniform float uFuerza;',
    'float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}',
    'float ruido(vec2 p){vec2 i=floor(p);vec2 f=fract(p);vec2 u=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1.0,0.0)),u.x),mix(hash(i+vec2(0.0,1.0)),hash(i+vec2(1.0,1.0)),u.x),u.y);}',
    'float fbm(vec2 p){float v=0.0;float a=0.5;for(int i=0;i<4;i++){v+=a*ruido(p);p=p*2.02+vec2(3.1,1.7);a*=0.5;}return v/0.9375;}',
    'vec3 pal(float x){x=fract(x)*4.0;if(x<1.0)return mix(uC0,uC1,x);if(x<2.0)return mix(uC1,uC2,x-1.0);if(x<3.0)return mix(uC2,uC3,x-2.0);return mix(uC3,uC0,x-3.0);}',
    'void main(){',
    ' vec2 uv=gl_FragCoord.xy/uRes;vec2 p=(gl_FragCoord.xy-0.5*uRes)/uRes.y;float t=uT*0.045;',
    ' vec2 q=vec2(fbm(p*1.3+vec2(0.0,t)),fbm(p*1.3+vec2(5.2,1.3)-t));',
    ' vec2 r=vec2(fbm(p*1.1+2.4*q+vec2(1.7,9.2)+t*1.3),fbm(p*1.1+2.4*q+vec2(8.3,2.8)-t*0.9));',
    ' float e=fbm(p*0.9+2.2*r);',
    ' float b=0.5+0.5*cos(6.2831*(e*3.0-uT*0.012));',
    ' float f=0.5+0.5*cos(6.2831*(e*11.0+r.y*1.5));',
    ' vec3 col=pal(e*3.4+q.x*0.6+uT*0.01);',
    ' vec2 d=(uv-uCentro)*vec2(0.85,1.45);float m=smoothstep(1.05,0.0,length(d));',
    ' float k=pow(b,1.8)*(0.55+0.45*f)*(0.18+0.82*m)*uFuerza;',
    ' vec3 c=uFondo+col*k*0.95+vec3(1.0)*pow(b*f,14.0)*m*0.16*uFuerza;',
    ' gl_FragColor=vec4(c,1.0);',
    '}',
  ].join('\n');

  function crearGL(canvas) {
    let gl = null;
    try { gl = canvas.getContext('webgl', { antialias: false, alpha: false, premultipliedAlpha: false, preserveDrawingBuffer: false }); } catch (e) { gl = null; }
    if (!gl) return null;
    const sh = (tipo, src) => { const s = gl.createShader(tipo); gl.shaderSource(s, src); gl.compileShader(s); return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null; };
    const vs = sh(gl.VERTEX_SHADER, VERT), fs = sh(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return null;
    const pr = gl.createProgram();
    gl.attachShader(pr, vs); gl.attachShader(pr, fs); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return null;
    gl.useProgram(pr);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const u = {};
    ['uRes', 'uT', 'uC0', 'uC1', 'uC2', 'uC3', 'uFondo', 'uCentro', 'uFuerza'].forEach((k) => { u[k] = gl.getUniformLocation(pr, k); });
    const v3 = (loc2, hex) => { const c = rgb(hex); gl.uniform3f(loc2, c[0] / 255, c[1] / 255, c[2] / 255); };
    return {
      dibujar(t, pal, centro) {
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.uniform2f(u.uRes, canvas.width, canvas.height);
        gl.uniform1f(u.uT, t);
        v3(u.uC0, pal.pel[0]); v3(u.uC1, pal.pel[1]); v3(u.uC2, pal.pel[2]); v3(u.uC3, pal.pel[3]);
        v3(u.uFondo, pal.t.fondo);
        gl.uniform2f(u.uCentro, centro[0], centro[1]);
        gl.uniform1f(u.uFuerza, pal.intensidad);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      },
    };
  }

  // Versión 2D: el mismo campo calculado píxel por píxel en baja resolución.
  function pelicula2D(ctx, w, h, t, pal, centro) {
    const img = ctx.createImageData(w, h);
    const px = img.data;
    const pel = pal.pel.map(rgb);
    const fondo = rgb(pal.t.fondo);
    const tt = t * 0.045;
    for (let j = 0; j < h; j++) {
      for (let i = 0; i < w; i++) {
        const x = (i - w / 2) / h, y = ((h - j) - h / 2) / h;
        const qx = fbm(x * 1.3, y * 1.3 + tt), qy = fbm(x * 1.3 + 5.2 - tt, y * 1.3 + 1.3);
        const rx = fbm(x * 1.1 + 2.4 * qx + 1.7 + tt * 1.3, y * 1.1 + 2.4 * qy + 9.2);
        const ry = fbm(x * 1.1 + 2.4 * qx + 8.3 - tt * 0.9, y * 1.1 + 2.4 * qy + 2.8);
        const e = fbm(x * 0.9 + 2.2 * rx, y * 0.9 + 2.2 * ry);
        const b = 0.5 + 0.5 * Math.cos(6.2831 * (e * 3.0 - t * 0.012));
        const f = 0.5 + 0.5 * Math.cos(6.2831 * (e * 11 + ry * 1.5));
        const col = colorCiclico(pel, e * 3.4 + qx * 0.6 + t * 0.01);
        const dx = (i / w - centro[0]) * 0.85, dy = ((h - j) / h - centro[1]) * 1.45;
        const dist = Math.min(1, Math.sqrt(dx * dx + dy * dy) / 1.05);
        const m = 1 - dist * dist * (3 - 2 * dist);
        const k = Math.pow(b, 1.8) * (0.55 + 0.45 * f) * (0.18 + 0.82 * m) * pal.intensidad;
        const s = Math.pow(b * f, 14) * m * 0.16 * pal.intensidad * 255;
        const o = (j * w + i) * 4;
        px[o] = fondo[0] + col[0] * k * 0.95 + s;
        px[o + 1] = fondo[1] + col[1] * k * 0.95 + s;
        px[o + 2] = fondo[2] + col[2] * k * 0.95 + s;
        px[o + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  }

  // Crea una película en un canvas. escala: fracción de los píxeles CSS (baja resolución, el navegador la suaviza).
  function crearPelicula(canvas, opciones) {
    const o = Object.assign({ escala: 0.34, centro: [0.42, 0.55], modo: 'auto', paleta: () => null, max2d: 120, tope: 150000 }, opciones || {});
    const gl = o.modo === '2d' ? null : crearGL(canvas);
    let ctx = null;
    if (!gl) { try { ctx = canvas.getContext('2d'); } catch (e) { ctx = null; } }
    canvas.dataset.modo = gl ? 'webgl' : '2d';
    return {
      canvas,
      tipo: gl ? 'webgl' : (ctx ? '2d' : 'ninguno'),
      medir() {
        const r = canvas.getBoundingClientRect();
        const cw = Math.max(1, r.width), ch = Math.max(1, r.height);
        let w, h;
        if (gl) {
          w = cw * o.escala; h = ch * o.escala;
          // tope de píxeles: la película es suave, en pantallas grandes no hace falta más
          const f = Math.min(1, Math.sqrt(o.tope / (w * h)));
          w = Math.round(w * f); h = Math.round(h * f);
        }
        else { const f = Math.min(1, o.max2d / cw); w = Math.round(cw * f); h = Math.round(ch * f); }
        w = Math.max(8, w); h = Math.max(4, h);
        if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
      },
      dibujar(t) {
        const pal = datosPaleta(o.paleta());
        if (gl) gl.dibujar(t, pal, o.centro);
        else if (ctx) pelicula2D(ctx, canvas.width, canvas.height, t, pal, o.centro);
      },
    };
  }

  // ── vistas LED (2,1 : 1) ──
  function ledBase(canvas, pintar, opciones) {
    let ctx = null;
    try { ctx = canvas.getContext('2d'); } catch (e) { ctx = null; }
    const o = Object.assign({ maxAncho: 900, paleta: () => null }, opciones || {});
    const estado = {};
    return {
      canvas,
      tipo: ctx ? '2d' : 'ninguno',
      medir() {
        const r = canvas.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = Math.max(16, Math.min(o.maxAncho, Math.round(r.width * dpr)));
        const h = Math.max(8, Math.round(w / 2.1));
        if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
      },
      dibujar(t) {
        if (!ctx) return;
        ctx.save();
        pintar(ctx, canvas.width, canvas.height, t, datosPaleta(o.paleta()), estado);
        ctx.restore();
      },
    };
  }

  function pintarTunel(ctx, w, h, t, pal) {
    const c = pal.t;
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = c.fondo;
    ctx.fillRect(0, 0, w, h);
    const cx = w / 2, cy = h / 2;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, h * 0.75);
    g.addColorStop(0, rgba(c.acento, 0.32));
    g.addColorStop(1, rgba(c.acento, 0));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'lighter';
    // rayos que convergen al centro
    const rayos = 40;
    const rot = t * 0.035;
    const gr = ctx.createRadialGradient(cx, cy, h * 0.05, cx, cy, w * 0.62);
    gr.addColorStop(0, rgba(c.brillo, 0));
    gr.addColorStop(0.35, rgba(c.brillo, 0.16));
    gr.addColorStop(1, rgba(c.acento2, 0.42));
    ctx.strokeStyle = gr;
    ctx.lineWidth = Math.max(1, w / 900);
    ctx.beginPath();
    for (let i = 0; i < rayos; i++) {
      const a = rot + (i / rayos) * Math.PI * 2;
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a) * w, cy + Math.sin(a) * w);
    }
    ctx.stroke();
    // marcos que avanzan hacia la cámara
    const N = 16;
    for (let i = 0; i < N; i++) {
      const z = ((i / N) + t * 0.06) % 1;
      const s = Math.pow(z, 2.4);
      const rw = w * 1.2 * s, rh = h * 1.2 * s;
      const a = Math.sin(Math.PI * z) * 0.75;
      ctx.strokeStyle = rgba(i % 2 ? c.acento : c.acento2 === c.fondo ? c.brillo : c.acento2, a);
      ctx.lineWidth = Math.max(0.6, (0.4 + 2.2 * s) * (w / 900));
      ctx.strokeRect(cx - rw / 2, cy - rh / 2, rw, rh);
    }
  }

  function pintarOnda(ctx, w, h, t, pal) {
    const c = pal.t;
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = c.fondo;
    ctx.fillRect(0, 0, w, h);
    const golpe = 60 / 130;                      // 130 BPM
    const fase = (t % golpe) / golpe;
    const env = Math.exp(-fase * 4.2);
    const cy = h / 2;
    const glow = ctx.createRadialGradient(w / 2, cy, 0, w / 2, cy, w * 0.5);
    glow.addColorStop(0, rgba(c.acento, 0.12 + 0.08 * env));
    glow.addColorStop(1, rgba(c.acento, 0));
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);
    const N = Math.max(24, Math.round(w / 15));
    const paso = w / N, bw = paso * 0.5;
    const gv = ctx.createLinearGradient(0, cy - h * 0.46, 0, cy + h * 0.46);
    gv.addColorStop(0, rgba(c.acento2 === c.fondo ? c.acento : c.acento2, 0.9));
    gv.addColorStop(0.5, rgba(c.brillo, 1));
    gv.addColorStop(1, rgba(c.acento2 === c.fondo ? c.acento : c.acento2, 0.9));
    ctx.fillStyle = gv;
    for (let i = 0; i < N; i++) {
      const u = i / (N - 1);
      const base = 0.18 + 0.82 * Math.pow(Math.sin(Math.PI * u), 1.3);
      const v = 0.5 + 0.5 * Math.sin(i * 0.55 + t * 2.1) * (0.6 + 0.4 * Math.sin(i * 0.17 - t * 1.3));
      const amp = h * 0.4 * base * (0.28 + 0.4 * v + 0.32 * env * base);
      const x = i * paso + (paso - bw) / 2;
      ctx.globalAlpha = 0.55 + 0.45 * base;
      ctx.fillRect(x, cy - amp, bw, amp * 2);
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = rgba(c.brillo, 0.35);
    ctx.fillRect(0, cy - 0.5, w, 1);
  }

  function texturaHumo() {
    const w = 160, h = 76;
    const cv = document.createElement('canvas');
    cv.width = w; cv.height = h;
    const x = cv.getContext('2d');
    const img = x.createImageData(w, h);
    for (let j = 0; j < h; j++) {
      for (let i = 0; i < w; i++) {
        const v = fbm(i / 26, j / 22);
        const a = 0.22 + 0.78 * Math.max(0, Math.min(1, (v - 0.22) * 1.7));
        const o = (j * w + i) * 4;
        img.data[o] = img.data[o + 1] = img.data[o + 2] = 255;
        img.data[o + 3] = Math.round(a * 255);
      }
    }
    x.putImageData(img, 0, 0);
    return cv;
  }

  function lienzo(estado, clave, w, h) {
    if (!estado[clave] || estado[clave].width !== w || estado[clave].height !== h) {
      estado[clave] = document.createElement('canvas');
      estado[clave].width = w; estado[clave].height = h;
    }
    return estado[clave];
  }

  function pintarHumo(ctx, w, h, t, pal, estado) {
    const c = pal.t;
    if (!estado.humo) estado.humo = texturaHumo();
    const capa = lienzo(estado, 'capa', w, h);
    const mascara = lienzo(estado, 'mascara', w, h);
    const k = capa.getContext('2d');
    const mk = mascara.getContext('2d');
    // humo que se desplaza: dos copias de la textura, una al lado de la otra
    const ancho = w * 1.6;
    const dx = (t * 7) % ancho;
    mk.clearRect(0, 0, w, h);
    mk.drawImage(estado.humo, -dx, 0, ancho, h);
    mk.drawImage(estado.humo, ancho - dx, 0, ancho, h);
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = c.fondo;
    ctx.fillRect(0, 0, w, h);
    // haces desde arriba, abanicando lento
    k.globalCompositeOperation = 'source-over';
    k.clearRect(0, 0, w, h);
    k.globalCompositeOperation = 'lighter';
    const segundo = c.acento2 === c.fondo || c.acento2 === '#15121F' ? c.brillo : c.acento2;
    const colores = [c.acento, c.brillo, segundo, c.brillo, c.acento];
    for (let i = 0; i < 5; i++) {
      const ox = w * (0.12 + 0.19 * i), oy = -h * 0.08;
      const ang = Math.PI / 2 + Math.sin(t * 0.22 + i * 1.7) * 0.42;
      const largo = h * 1.5, abre = h * (0.17 + 0.04 * Math.sin(t * 0.3 + i));
      const ex = ox + Math.cos(ang) * largo, ey = oy + Math.sin(ang) * largo;
      const px = -Math.sin(ang) * abre, py = Math.cos(ang) * abre;
      const g = k.createLinearGradient(ox, oy, ex, ey);
      g.addColorStop(0, rgba(colores[i], 0.85));
      g.addColorStop(0.55, rgba(colores[i], 0.3));
      g.addColorStop(1, rgba(colores[i], 0));
      k.fillStyle = g;
      k.beginPath();
      k.moveTo(ox - px * 0.06, oy - py * 0.06);
      k.lineTo(ex - px, ey - py);
      k.lineTo(ex + px, ey + py);
      k.lineTo(ox + px * 0.06, oy + py * 0.06);
      k.closePath();
      k.fill();
    }
    // el humo recorta los haces: la luz se ve donde hay humo
    k.globalCompositeOperation = 'destination-in';
    k.drawImage(mascara, 0, 0);
    k.globalCompositeOperation = 'source-over';
    ctx.globalCompositeOperation = 'lighter';
    ctx.drawImage(capa, 0, 0);
    // velo general de humo, muy suave
    ctx.globalAlpha = 0.05;
    ctx.drawImage(mascara, 0, 0);
    ctx.globalAlpha = 1;
  }

  function crearLed(canvas, tipo, opciones) {
    if (tipo === 'tornasol') {
      return crearPelicula(canvas, Object.assign({ escala: 0.6, centro: [0.5, 0.5] }, opciones || {}));
    }
    const pintores = { laser: pintarTunel, onda: pintarOnda, humo: pintarHumo };
    return ledBase(canvas, pintores[tipo] || pintarOnda, opciones);
  }

  // ── fondos de prueba para la legibilidad (fijos, a propósito difíciles) ──
  function fondoPrueba(canvas, tipo) {
    let ctx = null;
    try { ctx = canvas.getContext('2d', { willReadFrequently: true }); } catch (e) { ctx = null; }
    if (!ctx) return false;
    const w = canvas.width = 630, h = canvas.height = 300;
    ctx.save();
    if (tipo === 'brillante') {
      ctx.fillStyle = '#EEEAFE';
      ctx.fillRect(0, 0, w, h);
      [[0.3, 0.5, 0.6, '#FFFFFF'], [0.75, 0.35, 0.45, '#FFF7DE'], [0.55, 0.85, 0.4, '#E3F0FF'], [0.1, 0.1, 0.3, '#FFFFFF']].forEach(([x, y, r, col]) => {
        const g = ctx.createRadialGradient(x * w, y * h, 0, x * w, y * h, r * w);
        g.addColorStop(0, col); g.addColorStop(1, rgba(col, 0));
        ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      });
    } else if (tipo === 'arcoiris') {
      const g = ctx.createLinearGradient(0, 0, w, h * 0.4);
      for (let i = 0; i <= 6; i++) g.addColorStop(i / 6, `hsl(${i * 55}, 100%, 55%)`);
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 0.28;
      for (let i = -4; i < 14; i++) {
        ctx.fillStyle = i % 2 ? '#FFFFFF' : `hsl(${(i * 47) % 360}, 100%, 60%)`;
        ctx.beginPath();
        ctx.moveTo(i * 60, 0); ctx.lineTo(i * 60 + 30, 0); ctx.lineTo(i * 60 + 130, h); ctx.lineTo(i * 60 + 100, h);
        ctx.fill();
      }
    } else if (tipo === 'rojo') {
      ctx.fillStyle = '#C80F30';
      ctx.fillRect(0, 0, w, h);
      [[0.25, 0.4, 0.4, '#FF5A6E'], [0.7, 0.6, 0.35, '#FF2A48'], [0.5, 0.15, 0.25, '#FF9AA6']].forEach(([x, y, r, col]) => {
        const g = ctx.createRadialGradient(x * w, y * h, 0, x * w, y * h, r * w);
        g.addColorStop(0, col); g.addColorStop(1, rgba(col, 0));
        ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      });
    } else {
      // patrón cargado: damero girado + círculos de colores
      ctx.fillStyle = '#111111';
      ctx.fillRect(0, 0, w, h);
      ctx.translate(w / 2, h / 2);
      ctx.rotate(-0.26);
      const lado = 26;
      for (let y = -12; y < 12; y++) for (let x = -16; x < 16; x++) {
        if ((x + y) % 2 === 0) { ctx.fillStyle = (x * y) % 3 === 0 ? '#FFE600' : '#FFFFFF'; ctx.fillRect(x * lado, y * lado, lado, lado); }
      }
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = 0.75;
      [[0.2, 0.3, '#00E5FF'], [0.62, 0.62, '#FF2BD6'], [0.85, 0.25, '#FFE600'], [0.4, 0.8, '#FFFFFF']].forEach(([x, y, col]) => {
        ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x * w, y * h, h * 0.22, 0, Math.PI * 2); ctx.fill();
      });
    }
    ctx.restore();
    return true;
  }

  // ── contraste WCAG medido sobre el canvas ──
  const lin = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  const lum = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  const ratio = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

  // Toma el 90 % más claro de la zona del logo (el peor caso para letras blancas).
  function medirContraste(canvas, borde) {
    try {
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      const w = canvas.width, h = canvas.height;
      const x0 = Math.round(w * 0.12), y0 = Math.round(h * 0.3), ww = Math.round(w * 0.76), hh = Math.round(h * 0.4);
      const d = ctx.getImageData(x0, y0, ww, hh).data;
      const ls = [];
      const px = [];
      for (let i = 0; i < d.length; i += 16) { ls.push(lum(d[i], d[i + 1], d[i + 2])); px.push(i); }
      const orden = ls.map((v, i) => i).sort((a, b) => ls[a] - ls[b]);
      const k = orden[Math.min(orden.length - 1, Math.floor(orden.length * 0.9))];
      const fondoL = ls[k];
      const o = px[k];
      const bc = rgb((borde && borde.color) || '#06050B');
      const a = (borde && borde.alfa) || 0.82;
      const comp = [0, 1, 2].map((c) => bc[c] * a + d[o + c] * (1 - a));
      return { sin: ratio(1, fondoL), con: ratio(1, lum(comp[0], comp[1], comp[2])) };
    } catch (e) {
      return null;
    }
  }

  // ── programador de cuadros ──
  const animaciones = [];
  let visibles = new Set();
  let ultimo = 0;
  let corriendo = false;
  let observador = null;
  const t0 = performance.now();

  function tiempo() { return pideQuieto() ? T_FIJO : (performance.now() - t0) / 1000 + 4; }

  function cuadro(ahora) {
    corriendo = false;
    if (pideQuieto() || document.hidden) return;
    if (ahora - ultimo >= 1000 / FPS - 2) {
      ultimo = ahora;
      const t = tiempo();
      visibles.forEach((a) => { try { a.dibujar(t + (a.desfase || 0)); } catch (e) { /* un visual roto no frena a los demás */ } });
    }
    pedir();
  }
  function pedir() {
    if (corriendo || pideQuieto() || document.hidden || !visibles.size) return;
    corriendo = true;
    requestAnimationFrame(cuadro);
  }

  function registrar(anim, desfase) {
    if (!anim || anim.tipo === 'ninguno') return anim;
    anim.desfase = desfase || 0;
    animaciones.push(anim);
    try { anim.medir(); anim.dibujar(tiempo() + anim.desfase); } catch (e) { /* sin canvas */ }
    if ('IntersectionObserver' in window) {
      if (!observador) {
        observador = new IntersectionObserver((entradas) => {
          entradas.forEach((en) => {
            const a = animaciones.find((x) => x.canvas === en.target);
            if (!a) return;
            if (en.isIntersecting) visibles.add(a); else visibles.delete(a);
          });
          pedir();
        }, { rootMargin: '80px' });
      }
      observador.observe(anim.canvas);
    } else {
      visibles.add(anim);
    }
    pedir();
    return anim;
  }

  // Redibuja todo una vez (cambio de paleta, tamaño o movimiento reducido).
  function redibujar(medir) {
    const t = tiempo();
    animaciones.forEach((a) => { try { if (medir) a.medir(); a.dibujar(t + (a.desfase || 0)); } catch (e) { /* nada */ } });
    pedir();
  }

  document.addEventListener('visibilitychange', () => { if (!document.hidden) pedir(); });
  if (window.matchMedia) {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const cambio = () => redibujar(false);
    if (mq.addEventListener) mq.addEventListener('change', cambio); else if (mq.addListener) mq.addListener(cambio);
  }
  let espera = 0;
  window.addEventListener('resize', () => { clearTimeout(espera); espera = setTimeout(() => redibujar(true), 120); });

  window.MaddaVisuales = { crearPelicula, crearLed, fondoPrueba, medirContraste, registrar, redibujar, pideQuieto, rgb, rgba };
})();
