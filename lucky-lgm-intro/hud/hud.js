// Motor del HUD de "Misión Corrientes": todo se dibuja con canvas 2D a 1080×1920,
// sin imágenes externas. Lo comparten el estudio (hud/app.js) y el exportador
// (scripts/render.mjs), así que lo que se ve en el navegador es lo que se exporta.
(function () {
  'use strict';

  const W = 1080;
  const H = 1920;

  const ANTON = '"Anton", Impact, sans-serif';
  const MONT = '"Montserrat", "Arial Black", sans-serif';

  // Paleta del flyer del Festival Cultura D.
  const COLOR = {
    magenta: '#ff2d8d',
    rosa: '#ff7ac0',
    cian: '#28d7ff',
    noche: '#0b1036',
    tinta: '#060920',
    oro: '#ffc83d',
    naranja: '#ff8a00',
    vida: '#4be36a',
    escudo: '#37b6ff',
    rojo: '#ff3b4e',
    tormenta: '#a57bff',
  };

  const RAREZA = {
    comun: { nombre: 'COMÚN', color: '#aab3c0', oscuro: '#353b46' },
    poco: { nombre: 'POCO COMÚN', color: '#3bd16f', oscuro: '#0d4f26' },
    raro: { nombre: 'RARO', color: '#2f8cff', oscuro: '#0b3478' },
    epico: { nombre: 'ÉPICO', color: '#b24bff', oscuro: '#3f1069' },
    legendario: { nombre: 'LEGENDARIO', color: '#ff9b21', oscuro: '#6e3300' },
    mitico: { nombre: 'MÍTICO', color: '#ffd54a', oscuro: '#6b5000' },
  };

  // Lo que puede ir en el inventario: nombre que se muestra y rareza del casillero.
  const ITEMS = {
    llave: { nombre: 'LLAVE DE NEÓN', rareza: 'comun' },
    sopapa: { nombre: 'LANZASOPAPAS', rareza: 'epico' },
    mate: { nombre: 'MATE', rareza: 'raro' },
    'mate-escudo': { nombre: 'MATE ESCUDO', rareza: 'raro' },
    muzza: { nombre: 'PORCIÓN DE MUZZA', rareza: 'poco' },
    entrada: { nombre: 'ENTRADA', rareza: 'legendario' },
    paraguas: { nombre: 'PARAGUAS FILETEADO', rareza: 'epico' },
    mic: { nombre: 'MICRÓFONO', rareza: 'mitico' },
    almohada: { nombre: 'ALMOHADA ESCUDO', rareza: 'raro' },
    chocolatada: { nombre: 'CHOCOLATADA', rareza: 'poco' },
    zanahoria: { nombre: 'ZANAHORIA DORADA', rareza: 'legendario' },
    conejo: { nombre: 'OREJAS HOLOGRÁFICAS', rareza: 'mitico' },
  };

  const TONOS = { verde: '#3bd16f', oro: COLOR.oro, magenta: COLOR.magenta, cian: COLOR.cian, rojo: COLOR.rojo };

  // ---------- utilidades ----------

  function fuente(peso, tam, familia) {
    return `${peso} ${tam}px ${familia}`;
  }

  function espaciado(g, px) {
    if ('letterSpacing' in g) g.letterSpacing = px + 'px';
  }

  function alfa(hex, a) {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  }

  function aclarar(hex, k) {
    const n = parseInt(hex.slice(1), 16);
    const c = (v) => Math.round(v + (255 - v) * k);
    return `rgb(${c((n >> 16) & 255)},${c((n >> 8) & 255)},${c(n & 255)})`;
  }

  function lineal(g, x0, y0, x1, y1, paradas) {
    const gr = g.createLinearGradient(x0, y0, x1, y1);
    paradas.forEach((c, i) => gr.addColorStop(i / (paradas.length - 1), c));
    return gr;
  }

  function radial(g, x, y, r0, r1, paradas) {
    const gr = g.createRadialGradient(x, y, r0, x, y, r1);
    paradas.forEach((c, i) => gr.addColorStop(i / (paradas.length - 1), c));
    return gr;
  }

  function azar(semilla) {
    let a = semilla >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function redondeado(g, x, y, w, h, r) {
    g.beginPath();
    g.roundRect(x, y, w, h, r);
  }

  // Paralelogramo inclinado, como las barras de los juegos.
  function inclinado(g, x, y, w, h, s) {
    const d = h * s;
    g.beginPath();
    g.moveTo(x + d, y);
    g.lineTo(x + w, y);
    g.lineTo(x + w - d, y + h);
    g.lineTo(x, y + h);
    g.closePath();
  }

  // Achica la letra hasta que el texto entra en el ancho pedido.
  function ajustar(g, texto, peso, familia, max, ancho, min = 12, esp = 0) {
    let t = max;
    espaciado(g, esp);
    g.font = fuente(peso, t, familia);
    while (t > min && g.measureText(texto).width > ancho) {
      t -= 2;
      g.font = fuente(peso, t, familia);
    }
    return t;
  }

  // Parte un título en una o dos líneas, la opción que deje la letra más grande.
  function lineas(g, texto, max, ancho, minUnaLinea) {
    const t1 = ajustar(g, texto, 400, ANTON, max, ancho);
    const palabras = texto.split(' ');
    if (t1 >= minUnaLinea || palabras.length < 2) return { lineas: [texto], tam: t1 };
    let mejor = null;
    for (let i = 1; i < palabras.length; i++) {
      const a = palabras.slice(0, i).join(' ');
      const b = palabras.slice(i).join(' ');
      const t = Math.min(ajustar(g, a, 400, ANTON, max, ancho), ajustar(g, b, 400, ANTON, max, ancho));
      if (!mejor || t > mejor.tam) mejor = { lineas: [a, b], tam: t };
    }
    return mejor.tam > t1 ? mejor : { lineas: [texto], tam: t1 };
  }

  // Corta un texto en renglones que entran en el ancho (para descripciones).
  function renglones(g, texto, ancho, maxRenglones) {
    const palabras = texto.split(' ');
    const out = [];
    let actual = '';
    for (const p of palabras) {
      const prueba = actual ? actual + ' ' + p : p;
      if (g.measureText(prueba).width > ancho && actual) {
        out.push(actual);
        actual = p;
      } else actual = prueba;
    }
    if (actual) out.push(actual);
    if (out.length > maxRenglones) {
      const resto = out.slice(maxRenglones - 1).join(' ');
      out.length = maxRenglones - 1;
      let ult = resto;
      while (g.measureText(ult + '…').width > ancho && ult.length > 1) ult = ult.slice(0, -1);
      out.push(ult === resto ? ult : ult.trimEnd() + '…');
    }
    return out;
  }

  // Letra de título de juego: condensada, inclinada, con contorno oscuro y brillo.
  function titulo(g, texto, x, y, tam, o = {}) {
    const {
      relleno = '#ffffff',
      brillo = COLOR.magenta,
      contorno = 'rgba(6,9,32,.92)',
      grosor = Math.max(4, tam * 0.075),
      alinear = 'center',
      inclinar = -0.16,
    } = o;
    g.save();
    g.translate(x, y);
    g.transform(1, 0, inclinar, 1, 0, 0);
    espaciado(g, 0);
    g.font = fuente(400, tam, ANTON);
    g.textAlign = alinear;
    g.textBaseline = 'alphabetic';
    g.lineJoin = 'round';
    g.lineWidth = grosor * 2;
    g.strokeStyle = contorno;
    g.shadowColor = 'rgba(0,0,0,.55)';
    g.shadowBlur = tam * 0.12;
    g.shadowOffsetY = tam * 0.04;
    g.strokeText(texto, 0, 0);
    g.shadowOffsetY = 0;
    g.fillStyle = typeof relleno === 'function' ? relleno(g, tam) : relleno;
    if (brillo) {
      g.shadowColor = brillo;
      g.shadowBlur = tam * 0.3;
      g.fillText(texto, 0, 0);
    }
    g.shadowBlur = 0;
    g.fillText(texto, 0, 0);
    g.restore();
  }

  const ORO = (g, tam) => lineal(g, 0, -tam * 0.78, 0, 0, ['#fff6c4', '#ffd54a', '#ff9b21']);
  const NEON = (g, tam) => lineal(g, 0, -tam * 0.78, 0, 0, ['#ffc2e3', COLOR.rosa, COLOR.magenta]);

  // Texto de interfaz (Montserrat) con sombra para que se lea sobre cualquier video.
  function texto(g, s, x, y, o = {}) {
    const { peso = 800, tam = 30, color = '#ffffff', esp = 0, alinear = 'left', base = 'alphabetic', sombra = true } = o;
    g.save();
    espaciado(g, esp);
    g.font = fuente(peso, tam, MONT);
    g.textAlign = alinear;
    g.textBaseline = base;
    // el espaciado suma aire después de la última letra: compensarlo al centrar
    const dx = alinear === 'center' ? esp / 2 : alinear === 'right' ? esp : 0;
    if (sombra) {
      g.shadowColor = 'rgba(0,0,0,.75)';
      g.shadowBlur = tam * 0.35;
      g.shadowOffsetY = 2;
    }
    g.fillStyle = color;
    g.fillText(s, x + dx, y);
    g.restore();
  }

  function medir(g, s, peso, tam, esp = 0, familia = MONT) {
    g.save();
    espaciado(g, esp);
    g.font = fuente(peso, tam, familia);
    const w = g.measureText(s).width;
    g.restore();
    return w;
  }

  function estrella(g, cx, cy, r, puntas = 5, adentro = 0.46) {
    g.beginPath();
    for (let i = 0; i < puntas * 2; i++) {
      const rr = i % 2 ? r * adentro : r;
      const a = -Math.PI / 2 + (i * Math.PI) / puntas;
      g.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
    }
    g.closePath();
  }

  function borde(g, a = 0.45, w = 2.2) {
    g.lineWidth = w;
    g.strokeStyle = `rgba(0,0,0,${a})`;
    g.stroke();
  }

  // ---------- íconos (dibujados en un cuadrado de 100×100) ----------

  const PLATA = (g) => lineal(g, 30, 0, 70, 0, ['#7f8899', '#f4f6fb', '#9aa3b3', '#6c7586']);

  const ICONOS = {
    llave(g) {
      g.translate(50, 50);
      g.rotate(-0.62);
      g.translate(-50, -50);
      const metal = PLATA(g);
      g.fillStyle = metal;
      redondeado(g, 43, 38, 14, 58, 6);
      g.fill();
      borde(g);
      g.save();
      g.strokeStyle = COLOR.cian;
      g.lineWidth = 3.4;
      g.lineCap = 'round';
      g.shadowColor = COLOR.cian;
      g.shadowBlur = 10;
      g.beginPath();
      g.moveTo(50, 48);
      g.lineTo(50, 88);
      g.stroke();
      g.restore();
      g.fillStyle = metal;
      redondeado(g, 43, 16, 14, 26, 3);
      g.fill();
      borde(g);
      redondeado(g, 33, 6, 42, 13, 3);
      g.fill();
      borde(g);
      redondeado(g, 33, 29, 28, 11, 3);
      g.fill();
      borde(g);
      g.fillStyle = '#4b5361';
      redondeado(g, 39, 20, 22, 7, 2);
      g.fill();
      g.strokeStyle = '#1f242d';
      g.lineWidth = 1.2;
      for (let x = 42; x < 59; x += 3) {
        g.beginPath();
        g.moveTo(x, 20);
        g.lineTo(x, 27);
        g.stroke();
      }
      g.fillStyle = '#3a414d';
      for (let x = 58; x < 74; x += 4.5) {
        g.beginPath();
        g.moveTo(x, 19);
        g.lineTo(x + 2.2, 22);
        g.lineTo(x + 4.5, 19);
        g.fill();
      }
    },

    sopapa(g) {
      g.translate(50, 50);
      g.rotate(0.5);
      g.translate(-50, -50);
      g.fillStyle = lineal(g, 44, 0, 56, 0, ['#7a4a1f', '#e0a867', '#8a5a2b']);
      redondeado(g, 45, 2, 10, 64, 4);
      g.fill();
      borde(g);
      g.beginPath();
      g.moveTo(20, 66);
      g.quadraticCurveTo(50, 50, 80, 66);
      g.lineTo(86, 86);
      g.quadraticCurveTo(50, 100, 14, 86);
      g.closePath();
      g.fillStyle = lineal(g, 0, 56, 0, 98, ['#ff6a5c', '#d61f33', '#7d0b18']);
      g.fill();
      borde(g, 0.5, 2.6);
      g.strokeStyle = 'rgba(255,255,255,.6)';
      g.lineWidth = 3.4;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(28, 70);
      g.quadraticCurveTo(37, 63, 47, 62);
      g.stroke();
    },

    mate(g, o) {
      const yerba = o.yerba || '#5aa843';
      g.beginPath();
      g.moveTo(31, 42);
      g.bezierCurveTo(12, 58, 20, 95, 50, 95);
      g.bezierCurveTo(80, 95, 88, 58, 69, 42);
      g.closePath();
      g.fillStyle = radial(g, 40, 62, 4, 52, ['#c48a52', '#7a4722', '#3b200c']);
      g.fill();
      borde(g, 0.5, 2.6);
      g.fillStyle = PLATA(g);
      g.beginPath();
      g.ellipse(50, 42, 22, 7.5, 0, 0, Math.PI * 2);
      g.fill();
      borde(g);
      g.save();
      if (o.brillo) {
        g.shadowColor = yerba;
        g.shadowBlur = 16;
      }
      g.fillStyle = yerba;
      g.beginPath();
      g.ellipse(50, 42, 17, 4.8, 0, 0, Math.PI * 2);
      g.fill();
      g.restore();
      g.strokeStyle = PLATA(g);
      g.lineCap = 'round';
      g.lineWidth = 5.5;
      g.beginPath();
      g.moveTo(55, 43);
      g.lineTo(73, 8);
      g.quadraticCurveTo(76, 3, 83, 5);
      g.stroke();
      g.strokeStyle = 'rgba(0,0,0,.35)';
      g.lineWidth = 1.4;
      g.stroke();
    },

    'mate-escudo'(g, o) {
      ICONOS.mate(g, { ...o, yerba: COLOR.escudo, brillo: true });
    },

    muzza(g) {
      g.translate(50, 50);
      g.rotate(-0.3);
      g.translate(-50, -50);
      g.beginPath();
      g.moveTo(50, 97);
      g.lineTo(15, 30);
      g.quadraticCurveTo(50, 12, 85, 30);
      g.closePath();
      g.fillStyle = lineal(g, 0, 20, 0, 96, ['#fff0a3', '#ffd04a', '#f2a51c']);
      g.fill();
      borde(g, 0.45, 2.4);
      g.strokeStyle = lineal(g, 0, 12, 0, 34, ['#f0b56a', '#b8702c']);
      g.lineWidth = 11;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(17, 30);
      g.quadraticCurveTo(50, 13, 83, 30);
      g.stroke();
      for (const [x, y] of [[40, 43], [60, 49], [49, 68]]) {
        g.fillStyle = '#5b8a2c';
        g.beginPath();
        g.ellipse(x, y, 6, 5, 0.3, 0, Math.PI * 2);
        g.fill();
        borde(g, 0.35, 1.2);
        g.fillStyle = '#c42a3c';
        g.beginPath();
        g.arc(x + 0.5, y, 2, 0, Math.PI * 2);
        g.fill();
      }
    },

    entrada(g) {
      g.translate(50, 50);
      g.rotate(-0.22);
      g.translate(-50, -50);
      g.beginPath();
      g.moveTo(8, 27);
      g.lineTo(92, 27);
      g.lineTo(92, 42);
      g.arc(92, 50, 8, -Math.PI / 2, Math.PI / 2, true);
      g.lineTo(92, 73);
      g.lineTo(8, 73);
      g.lineTo(8, 58);
      g.arc(8, 50, 8, Math.PI / 2, -Math.PI / 2, true);
      g.closePath();
      g.fillStyle = lineal(g, 0, 27, 0, 73, ['#fff3b0', '#ffc83d', '#e08a00']);
      g.fill();
      borde(g, 0.45, 2.4);
      g.setLineDash([3, 3]);
      g.strokeStyle = 'rgba(110,60,0,.65)';
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(69, 30);
      g.lineTo(69, 70);
      g.stroke();
      g.setLineDash([]);
      estrella(g, 38, 50, 13);
      g.fillStyle = '#fffbe6';
      g.fill();
      borde(g, 0.35, 1.6);
      g.fillStyle = 'rgba(110,60,0,.85)';
      g.font = fuente(800, 10, MONT);
      g.textAlign = 'center';
      g.fillText('11·10', 80.5, 54);
    },

    mic(g) {
      g.translate(50, 50);
      g.rotate(0.35);
      g.translate(-50, -50);
      const oro = lineal(g, 30, 0, 70, 0, ['#a87b08', '#fff1a8', '#e0b020', '#8a6400']);
      g.beginPath();
      g.moveTo(40, 50);
      g.lineTo(60, 50);
      g.lineTo(55, 96);
      g.lineTo(45, 96);
      g.closePath();
      g.fillStyle = oro;
      g.fill();
      borde(g);
      g.fillStyle = '#2a1a4a';
      redondeado(g, 38, 45, 24, 9, 3);
      g.fill();
      g.beginPath();
      g.arc(50, 28, 21, 0, Math.PI * 2);
      g.fillStyle = oro;
      g.fill();
      borde(g, 0.5, 2.4);
      g.save();
      g.beginPath();
      g.arc(50, 28, 17.5, 0, Math.PI * 2);
      g.clip();
      g.fillStyle = 'rgba(255,45,141,.75)';
      g.fillRect(30, 8, 40, 40);
      g.strokeStyle = 'rgba(70,40,0,.75)';
      g.lineWidth = 1.6;
      for (let i = 0; i < 80; i += 6) {
        g.beginPath();
        g.moveTo(20 + i, 8);
        g.lineTo(i, 48);
        g.stroke();
        g.beginPath();
        g.moveTo(i, 8);
        g.lineTo(20 + i, 48);
        g.stroke();
      }
      g.restore();
    },

    paraguas(g) {
      g.beginPath();
      g.moveTo(8, 54);
      g.arc(50, 54, 42, Math.PI, 0);
      for (let i = 3; i >= 0; i--) g.arc(8 + 10.5 + i * 21, 54, 10.5, 0, Math.PI, true);
      g.closePath();
      g.fillStyle = lineal(g, 0, 12, 0, 60, ['#2a2d4a', '#101226']);
      g.fill();
      borde(g, 0.6, 2.4);
      g.save();
      g.clip();
      g.lineCap = 'round';
      g.lineWidth = 3;
      const colores = [COLOR.magenta, COLOR.cian, COLOR.oro, COLOR.magenta];
      [29, 50, 71].forEach((x) => {
        g.strokeStyle = 'rgba(255,255,255,.35)';
        g.lineWidth = 1.6;
        g.beginPath();
        g.moveTo(50, 12);
        g.quadraticCurveTo(x, 30, x, 54);
        g.stroke();
      });
      [[20, 44], [40, 34], [60, 34], [80, 44]].forEach(([x, y], i) => {
        g.strokeStyle = colores[i];
        g.lineWidth = 3;
        g.beginPath();
        g.arc(x, y, 6, Math.PI * 0.2, Math.PI * 1.7);
        g.stroke();
        g.beginPath();
        g.arc(x + 3, y + 1, 2.4, 0, Math.PI * 2);
        g.stroke();
      });
      g.restore();
      g.strokeStyle = '#e8e2d0';
      g.lineWidth = 4;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(50, 6);
      g.lineTo(50, 12);
      g.moveTo(50, 54);
      g.lineTo(50, 84);
      g.arc(43, 84, 7, 0, Math.PI);
      g.stroke();
    },

    zanahoria(g) {
      g.translate(50, 50);
      g.rotate(0.62);
      g.translate(-50, -50);
      g.fillStyle = '#3fbf4a';
      [-0.55, 0, 0.55].forEach((a) => {
        g.save();
        g.translate(50, 26);
        g.rotate(a);
        g.beginPath();
        g.ellipse(0, -11, 5, 13, 0, 0, Math.PI * 2);
        g.fill();
        borde(g, 0.35, 1.4);
        g.restore();
      });
      g.beginPath();
      g.moveTo(33, 30);
      g.quadraticCurveTo(50, 22, 67, 30);
      g.lineTo(53, 95);
      g.quadraticCurveTo(50, 99, 47, 95);
      g.closePath();
      g.fillStyle = lineal(g, 34, 0, 66, 0, ['#ff9a3c', '#ffc36b', '#e8660f']);
      g.fill();
      borde(g, 0.45, 2.2);
      g.strokeStyle = 'rgba(140,50,0,.55)';
      g.lineWidth = 2;
      [[40, 45, 50, 44], [46, 60, 56, 58], [45, 75, 52, 74]].forEach(([a, b, c, d]) => {
        g.beginPath();
        g.moveTo(a, b);
        g.lineTo(c, d);
        g.stroke();
      });
    },

    conejo(g) {
      [[37, -0.2], [63, 0.2]].forEach(([x, a]) => {
        g.save();
        g.translate(x, 30);
        g.rotate(a);
        g.beginPath();
        g.ellipse(0, 0, 9.5, 25, 0, 0, Math.PI * 2);
        g.fillStyle = '#ffffff';
        g.fill();
        borde(g, 0.4, 2);
        g.beginPath();
        g.ellipse(0, 2, 4.8, 18, 0, 0, Math.PI * 2);
        g.fillStyle = COLOR.rosa;
        g.fill();
        g.restore();
      });
      g.beginPath();
      g.arc(50, 66, 27, 0, Math.PI * 2);
      g.fillStyle = '#ffffff';
      g.fill();
      borde(g, 0.45, 2.4);
      g.fillStyle = '#1b1537';
      g.beginPath();
      g.arc(40, 62, 4, 0, Math.PI * 2);
      g.arc(60, 62, 4, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = COLOR.magenta;
      g.beginPath();
      g.moveTo(46, 71);
      g.lineTo(54, 71);
      g.lineTo(50, 76);
      g.closePath();
      g.fill();
      g.strokeStyle = 'rgba(40,30,70,.5)';
      g.lineWidth = 1.5;
      [[-1, 70], [1, 70], [-1, 75], [1, 75]].forEach(([s, y]) => {
        g.beginPath();
        g.moveTo(50 + s * 8, y);
        g.lineTo(50 + s * 22, y + (y > 72 ? 3 : -2));
        g.stroke();
      });
    },

    almohada(g) {
      g.beginPath();
      g.moveTo(12, 36);
      g.quadraticCurveTo(50, 24, 88, 36);
      g.quadraticCurveTo(80, 57, 88, 78);
      g.quadraticCurveTo(50, 90, 12, 78);
      g.quadraticCurveTo(20, 57, 12, 36);
      g.closePath();
      g.fillStyle = lineal(g, 0, 26, 0, 88, ['#e9e3ff', '#b9a8ff', '#8c75f0']);
      g.fill();
      borde(g, 0.45, 2.4);
      g.fillStyle = '#ffffff';
      g.font = fuente(400, 26, ANTON);
      g.textAlign = 'center';
      g.fillText('Z', 44, 66);
      g.font = fuente(400, 18, ANTON);
      g.fillText('Z', 60, 54);
      g.font = fuente(400, 12, ANTON);
      g.fillText('Z', 71, 45);
    },

    chocolatada(g) {
      g.strokeStyle = '#ff5a73';
      g.lineWidth = 5;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(58, 46);
      g.lineTo(70, 6);
      g.stroke();
      g.beginPath();
      g.moveTo(28, 22);
      g.lineTo(72, 22);
      g.lineTo(66, 94);
      g.lineTo(34, 94);
      g.closePath();
      g.fillStyle = 'rgba(210,230,255,.35)';
      g.fill();
      borde(g, 0.5, 2.4);
      g.beginPath();
      g.moveTo(30.5, 40);
      g.lineTo(69.5, 40);
      g.lineTo(65, 91);
      g.lineTo(35, 91);
      g.closePath();
      g.fillStyle = lineal(g, 0, 40, 0, 91, ['#b5774a', '#7b4a26']);
      g.fill();
      g.fillStyle = 'rgba(255,255,255,.4)';
      g.fillRect(36, 26, 4, 60);
    },

    check(g, o) {
      g.strokeStyle = o.color || '#ffffff';
      g.lineWidth = 7;
      g.beginPath();
      g.arc(50, 50, 40, 0, Math.PI * 2);
      g.stroke();
      g.lineCap = 'round';
      g.lineJoin = 'round';
      g.lineWidth = 10;
      g.beginPath();
      g.moveTo(30, 52);
      g.lineTo(44, 66);
      g.lineTo(71, 36);
      g.stroke();
    },

    estrella(g, o) {
      estrella(g, 50, 52, 44);
      g.fillStyle = o.color || '#ffffff';
      g.fill();
    },

    destello(g, o) {
      g.fillStyle = o.color || '#ffffff';
      g.shadowColor = o.color || '#ffffff';
      g.shadowBlur = 14;
      estrella(g, 50, 50, 44, 4, 0.22);
      g.fill();
      estrella(g, 78, 22, 13, 4, 0.3);
      g.fill();
      estrella(g, 22, 76, 9, 4, 0.3);
      g.fill();
    },

    alerta(g, o) {
      g.beginPath();
      g.moveTo(50, 8);
      g.lineTo(94, 88);
      g.lineTo(6, 88);
      g.closePath();
      g.lineJoin = 'round';
      g.lineWidth = 8;
      g.strokeStyle = o.color || '#ffffff';
      g.stroke();
      g.fillStyle = o.color || '#ffffff';
      redondeado(g, 45, 34, 10, 30, 4);
      g.fill();
      g.beginPath();
      g.arc(50, 75, 6, 0, Math.PI * 2);
      g.fill();
    },

    pin(g, o) {
      g.beginPath();
      g.moveTo(50, 96);
      g.bezierCurveTo(30, 66, 16, 54, 16, 38);
      g.arc(50, 38, 34, Math.PI, 0);
      g.bezierCurveTo(84, 54, 70, 66, 50, 96);
      g.closePath();
      g.fillStyle = o.color || COLOR.magenta;
      g.fill();
      g.beginPath();
      g.arc(50, 38, 13, 0, Math.PI * 2);
      g.fillStyle = '#ffffff';
      g.fill();
    },

    jugadores(g, o) {
      g.fillStyle = o.color || '#ffffff';
      g.beginPath();
      g.arc(50, 30, 17, 0, Math.PI * 2);
      g.fill();
      g.beginPath();
      g.moveTo(18, 92);
      g.quadraticCurveTo(18, 54, 50, 54);
      g.quadraticCurveTo(82, 54, 82, 92);
      g.closePath();
      g.fill();
    },

    mira(g, o) {
      g.strokeStyle = o.color || '#ffffff';
      g.lineWidth = 7;
      g.beginPath();
      g.arc(50, 50, 30, 0, Math.PI * 2);
      g.stroke();
      g.lineCap = 'round';
      [[50, 4, 50, 24], [50, 76, 50, 96], [4, 50, 24, 50], [76, 50, 96, 50]].forEach(([a, b, c, d]) => {
        g.beginPath();
        g.moveTo(a, b);
        g.lineTo(c, d);
        g.stroke();
      });
      g.fillStyle = o.color || '#ffffff';
      g.beginPath();
      g.arc(50, 50, 7, 0, Math.PI * 2);
      g.fill();
    },

    tormenta(g, o) {
      g.fillStyle = o.color || COLOR.tormenta;
      g.beginPath();
      g.arc(34, 46, 18, 0, Math.PI * 2);
      g.arc(56, 36, 23, 0, Math.PI * 2);
      g.arc(74, 50, 16, 0, Math.PI * 2);
      g.fill();
      g.fillRect(20, 46, 62, 18);
      g.beginPath();
      g.moveTo(52, 58);
      g.lineTo(40, 80);
      g.lineTo(52, 80);
      g.lineTo(44, 98);
      g.lineTo(66, 72);
      g.lineTo(54, 72);
      g.lineTo(62, 58);
      g.closePath();
      g.fillStyle = COLOR.oro;
      g.fill();
    },

    caja(g) {
      g.beginPath();
      g.moveTo(14, 38);
      g.lineTo(50, 22);
      g.lineTo(86, 38);
      g.lineTo(50, 54);
      g.closePath();
      g.fillStyle = '#e8c08a';
      g.fill();
      borde(g, 0.4, 2);
      g.beginPath();
      g.moveTo(14, 38);
      g.lineTo(50, 54);
      g.lineTo(50, 78);
      g.lineTo(14, 62);
      g.closePath();
      g.fillStyle = '#c69455';
      g.fill();
      borde(g, 0.4, 2);
      g.beginPath();
      g.moveTo(86, 38);
      g.lineTo(50, 54);
      g.lineTo(50, 78);
      g.lineTo(86, 62);
      g.closePath();
      g.fillStyle = '#a97a40';
      g.fill();
      borde(g, 0.4, 2);
      g.fillStyle = COLOR.rojo;
      g.beginPath();
      g.ellipse(50, 38, 9, 4.5, 0, 0, Math.PI * 2);
      g.fill();
    },

    baldosa(g) {
      g.fillStyle = '#e9d9b3';
      redondeado(g, 12, 12, 76, 76, 6);
      g.fill();
      borde(g, 0.4, 2);
      g.fillStyle = '#cdb98e';
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          redondeado(g, 19 + i * 22, 19 + j * 22, 18, 18, 3);
          g.fill();
        }
      }
    },

    chapa(g) {
      g.save();
      redondeado(g, 10, 18, 80, 64, 5);
      g.clip();
      for (let i = 0; i < 8; i++) {
        g.fillStyle = i % 2 ? '#8e98aa' : '#d4dae6';
        g.fillRect(10 + i * 10, 18, 10, 64);
      }
      g.restore();
      redondeado(g, 10, 18, 80, 64, 5);
      borde(g, 0.45, 2);
    },
  };

  function icono(g, nombre, cx, cy, tam, o = {}) {
    const dibujo = ICONOS[nombre];
    if (!dibujo) return;
    g.save();
    g.translate(cx - tam / 2, cy - tam / 2);
    g.scale(tam / 100, tam / 100);
    dibujo(g, o);
    g.restore();
  }

  // ---------- piezas ----------

  // Minimapa del centro porteño: Obelisco, Corrientes, los diques y el Puente de la Mujer.
  function mapa(g, x, y, s, ruta) {
    const u = s / 100;
    g.save();
    g.shadowColor = 'rgba(40,215,255,.5)';
    g.shadowBlur = 26;
    g.fillStyle = 'rgba(8,12,40,.94)';
    redondeado(g, x, y, s, s, 26);
    g.fill();
    g.restore();

    g.save();
    redondeado(g, x, y, s, s, 26);
    g.clip();
    g.translate(x, y);
    // manzanas
    g.fillStyle = '#152058';
    for (let i = 0; i < 80; i += 6.5) {
      for (let j = -2; j < 100; j += 6.5) g.fillRect((i + 0.8) * u, (j + 0.8) * u, 5.2 * u, 5.2 * u);
    }
    // río y diques
    g.fillStyle = '#0a3a5e';
    g.fillRect(80 * u, 0, 20 * u, s);
    g.fillStyle = '#152058';
    g.fillRect(88 * u, 0, 6 * u, s);
    [[0, 6], [38, 42], [74, 78]].forEach(([a, b]) => g.fillRect(80 * u, a * u, 8 * u, (b - a) * u));
    // avenidas
    g.fillStyle = '#2f43a8';
    g.fillRect(25.5 * u, 0, 6 * u, s); // 9 de Julio
    g.fillRect(77.5 * u, 0, 2.4 * u, s); // Alem / Madero
    g.fillStyle = '#4a6ad8';
    g.fillRect(0, 34.8 * u, 80 * u, 2.6 * u); // Corrientes
    g.fillStyle = '#26358a';
    g.fillRect(0, 61 * u, 80 * u, 2 * u); // Av. de Mayo
    // puente sobre el dique
    g.strokeStyle = '#ffffff';
    g.lineWidth = 1.2 * u;
    g.beginPath();
    g.moveTo(80 * u, 62 * u);
    g.lineTo(88 * u, 62 * u);
    g.stroke();
    // Sudestada: todo lo que queda fuera del círculo, en violeta
    g.save();
    g.beginPath();
    g.rect(0, 0, s, s);
    g.arc(47 * u, 50 * u, 60 * u, 0, Math.PI * 2, true);
    g.fillStyle = 'rgba(165,123,255,.30)';
    g.fill('evenodd');
    g.restore();
    g.strokeStyle = 'rgba(205,175,255,.95)';
    g.lineWidth = 0.9 * u;
    g.beginPath();
    g.arc(47 * u, 50 * u, 60 * u, 0, Math.PI * 2);
    g.stroke();
    // recorrido
    const puntos =
      ruta === 'astros'
        ? [[85, 62], [79, 62], [79, 36], [40, 36]]
        : [[28.5, 36], [79, 36], [79, 62], [85, 62]];
    g.save();
    g.strokeStyle = COLOR.magenta;
    g.shadowColor = COLOR.magenta;
    g.shadowBlur = 8;
    g.lineWidth = 1.7 * u;
    g.lineCap = 'round';
    g.setLineDash([2.4 * u, 1.8 * u]);
    g.beginPath();
    puntos.forEach(([a, b], i) => (i ? g.lineTo(a * u, b * u) : g.moveTo(a * u, b * u)));
    g.stroke();
    g.restore();
    // Obelisco
    g.save();
    g.shadowColor = '#ffffff';
    g.shadowBlur = 10;
    g.fillStyle = '#ffffff';
    g.beginPath();
    g.moveTo(28.5 * u, 27 * u);
    g.lineTo(30 * u, 30 * u);
    g.lineTo(29.6 * u, 37.5 * u);
    g.lineTo(27.4 * u, 37.5 * u);
    g.lineTo(27 * u, 30 * u);
    g.closePath();
    g.fill();
    g.restore();
    // Teatro Astros
    g.save();
    g.shadowColor = COLOR.oro;
    g.shadowBlur = 10;
    estrella(g, 40 * u, 36 * u, 3.4 * u);
    g.fillStyle = COLOR.oro;
    g.fill();
    g.restore();
    // Puente de la Mujer
    icono(g, 'pin', 84 * u, 56.5 * u, 9 * u, { color: COLOR.magenta });
    // jugador
    const [px, py] = puntos[0];
    const [qx, qy] = puntos[1];
    const ang = Math.atan2(qy - py, qx - px);
    g.save();
    g.translate(px * u, py * u);
    g.rotate(ang);
    g.shadowColor = 'rgba(0,0,0,.8)';
    g.shadowBlur = 6;
    g.fillStyle = '#ffffff';
    g.beginPath();
    g.moveTo(4.2 * u, 0);
    g.lineTo(-3 * u, -3.2 * u);
    g.lineTo(-1.6 * u, 0);
    g.lineTo(-3 * u, 3.2 * u);
    g.closePath();
    g.fill();
    g.restore();
    g.restore();

    g.save();
    redondeado(g, x, y, s, s, 26);
    g.lineWidth = 3;
    g.strokeStyle = 'rgba(255,255,255,.38)';
    g.stroke();
    g.beginPath();
    g.arc(x + s / 2, y, 17, 0, Math.PI * 2);
    g.fillStyle = COLOR.tinta;
    g.fill();
    g.stroke();
    g.restore();
    texto(g, 'N', x + s / 2, y + 1, { tam: 18, base: 'middle', alinear: 'center', sombra: false });
  }

  // Pastilla de estado alineada a la derecha: [ícono] texto [ícono] texto…
  function pastilla(g, derecha, y, alto, partes) {
    const tamIcono = alto * 0.62;
    let ancho = 22;
    for (const p of partes) {
      p.w = p.icono ? tamIcono + 8 : 0;
      p.tw = p.texto ? medir(g, p.texto, p.peso || 800, p.tam || 30, p.esp || 0) : 0;
      ancho += p.w + p.tw + 16;
    }
    ancho += 4;
    const x0 = derecha - ancho;
    g.save();
    g.fillStyle = 'rgba(8,12,40,.8)';
    redondeado(g, x0, y, ancho, alto, alto / 2);
    g.fill();
    g.lineWidth = 2;
    g.strokeStyle = 'rgba(255,255,255,.14)';
    g.stroke();
    g.restore();
    let cx = x0 + 22;
    for (const p of partes) {
      if (p.icono) {
        icono(g, p.icono, cx + tamIcono / 2, y + alto / 2, tamIcono, { color: p.colorIcono });
        cx += p.w;
      }
      if (p.texto) {
        texto(g, p.texto, cx, y + alto / 2 + 2, { tam: p.tam || 30, peso: p.peso || 800, color: p.color || '#fff', esp: p.esp || 0, base: 'middle', sombra: false });
        cx += p.tw + 16;
      }
    }
  }

  function hexagono(g, cx, cy, r) {
    g.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = Math.PI / 6 + (i * Math.PI) / 3;
      g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    }
    g.closePath();
  }

  function barra(g, x, y, w, h, valor, color) {
    const nw = 84;
    g.save();
    g.fillStyle = 'rgba(8,12,40,.84)';
    inclinado(g, x, y, nw, h, 0.3);
    g.fill();
    g.restore();
    texto(g, String(valor), x + nw / 2 + 2, y + h / 2 + 2, { tam: 27, alinear: 'center', base: 'middle', sombra: false });
    const bx = x + nw + 10;
    const bw = w - nw - 10;
    const r = Math.max(0, Math.min(1, Number(valor) / 100));
    g.save();
    g.fillStyle = 'rgba(8,12,40,.74)';
    inclinado(g, bx, y, bw, h, 0.3);
    g.fill();
    if (r > 0) {
      g.save();
      inclinado(g, bx, y, bw, h, 0.3);
      g.clip();
      g.shadowColor = color;
      g.shadowBlur = 14;
      g.fillStyle = lineal(g, 0, y, 0, y + h, [aclarar(color, 0.45), color, color]);
      g.fillRect(bx, y, bw * r, h);
      g.shadowBlur = 0;
      g.fillStyle = 'rgba(255,255,255,.25)';
      g.fillRect(bx, y, bw * r, h * 0.34);
      g.strokeStyle = 'rgba(8,12,40,.5)';
      g.lineWidth = 3;
      for (let i = 1; i < 4; i++) {
        const tx = bx + (bw * i) / 4;
        g.beginPath();
        g.moveTo(tx + h * 0.3, y);
        g.lineTo(tx, y + h);
        g.stroke();
      }
      g.restore();
    }
    g.lineWidth = 2;
    g.strokeStyle = 'rgba(255,255,255,.32)';
    inclinado(g, bx, y, bw, h, 0.3);
    g.stroke();
    g.restore();
  }

  function inventario(g, x, y, p) {
    const items = String(p.inventario || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const elegido = Number(p.seleccion) - 1;
    const lado = 104;
    const paso = 118;
    for (let i = 0; i < 5; i++) {
      const it = ITEMS[items[i]];
      const sel = i === elegido && it;
      const sx = x + i * paso;
      const sy = sel ? y - 12 : y;
      g.save();
      g.fillStyle = 'rgba(8,12,40,.8)';
      redondeado(g, sx, sy, lado, lado, 14);
      g.fill();
      if (it) {
        const r = RAREZA[it.rareza];
        g.save();
        redondeado(g, sx, sy, lado, lado, 14);
        g.clip();
        g.fillStyle = lineal(g, 0, sy, 0, sy + lado, [alfa(r.color, 0.05), alfa(r.color, 0.55)]);
        g.fillRect(sx, sy, lado, lado);
        g.fillStyle = r.color;
        g.fillRect(sx, sy + lado - 7, lado, 7);
        g.restore();
        icono(g, items[i], sx + lado / 2, sy + lado / 2 - 2, 74);
      }
      redondeado(g, sx, sy, lado, lado, 14);
      if (sel) {
        g.shadowColor = '#ffffff';
        g.shadowBlur = 16;
        g.lineWidth = 5;
        g.strokeStyle = '#ffffff';
      } else {
        g.lineWidth = 2.5;
        g.strokeStyle = 'rgba(255,255,255,.22)';
      }
      g.stroke();
      g.restore();
      texto(g, String(i + 1), sx + 12, sy + 24, { tam: 17, color: 'rgba(255,255,255,.75)', sombra: false });
    }
    const it = ITEMS[items[elegido]];
    if (it) {
      const nx = x + 5 * paso + 6;
      texto(g, it.nombre, nx, y + 44, { tam: ajustar(g, it.nombre, 800, MONT, 26, 290, 16), color: '#ffffff' });
      texto(g, RAREZA[it.rareza].nombre, nx, y + 76, { tam: 19, esp: 3, color: RAREZA[it.rareza].color });
    }
  }

  function hud(g, p) {
    const s = 300;
    const mx = W - 44 - s;
    const my = 214;
    mapa(g, mx, my, s, p.ruta);
    const der = W - 44;
    let y = my + s + 24;
    pastilla(g, der, y, 54, [
      { icono: 'tormenta', texto: String(p.tormenta || '').toUpperCase(), tam: 21, esp: 3, color: '#d9c6ff' },
      { texto: String(p.tiempo), tam: 32 },
    ]);
    y += 64;
    pastilla(g, der, y, 54, [
      { icono: 'jugadores', texto: String(p.jugadores), tam: 30 },
      { icono: 'mira', texto: String(p.eliminaciones), tam: 30 },
    ]);
    const mats = String(p.materiales || '')
      .split(',')
      .map((s) => s.trim());
    ['caja', 'baldosa', 'chapa'].forEach((ic, i) => {
      if (!mats[i]) return;
      pastilla(g, der, y + 70 + i * 52, 44, [{ icono: ic, texto: mats[i], tam: 25 }]);
    });

    const x = 60;
    const by = 1226;
    g.save();
    g.shadowColor = COLOR.magenta;
    g.shadowBlur = 16;
    g.fillStyle = COLOR.magenta;
    hexagono(g, x + 26, by + 24, 26);
    g.fill();
    g.restore();
    g.save();
    g.lineWidth = 3;
    g.strokeStyle = 'rgba(255,255,255,.85)';
    hexagono(g, x + 26, by + 24, 26);
    g.stroke();
    g.restore();
    texto(g, String(p.nivel), x + 26, by + 26, { tam: 24, alinear: 'center', base: 'middle', sombra: false });
    texto(g, p.nombre, x + 66, by + 36, { tam: 32, esp: 2 });
    barra(g, x, by + 58, 520, 38, p.escudo, COLOR.escudo);
    barra(g, x, by + 106, 520, 38, p.vida, COLOR.vida);
    inventario(g, x, 1400, p);
  }

  // Cartel de lugar: aparece arriba cuando el personaje entra en una zona.
  function lugar(g, p) {
    const cx = W / 2;
    const y = 318;
    texto(g, p.arriba, cx, y, { tam: ajustar(g, p.arriba, 800, MONT, 30, 900, 18, 10), esp: 10, color: COLOR.cian, alinear: 'center' });
    const t = ajustar(g, p.nombre, 400, ANTON, 158, 960);
    const base = y + 26 + t * 0.9;
    titulo(g, p.nombre, cx, base, t);
    const ancho = Math.min(medir(g, p.nombre, 400, t, 0, ANTON), 960);
    const ly = base + 34;
    g.save();
    g.shadowColor = COLOR.magenta;
    g.shadowBlur = 14;
    g.fillStyle = lineal(g, cx - ancho / 2, 0, cx + ancho / 2, 0, [alfa(COLOR.magenta, 0), COLOR.magenta, COLOR.cian, alfa(COLOR.cian, 0)]);
    g.fillRect(cx - ancho / 2, ly, ancho, 6);
    g.restore();
  }

  function jugador(g, p) {
    const x = 60;
    const y = 1110;
    g.save();
    g.fillStyle = lineal(g, 0, 0, W, 0, ['rgba(8,12,40,.92)', 'rgba(8,12,40,.78)', 'rgba(8,12,40,0)']);
    inclinado(g, -40, y - 30, W + 40, 360, 0.1);
    g.fill();
    g.fillStyle = lineal(g, 0, 0, W, 0, [COLOR.magenta, COLOR.cian, alfa(COLOR.cian, 0)]);
    g.fillRect(0, y - 30, W, 5);
    g.restore();
    texto(g, p.bajada, x, y + 34, { tam: ajustar(g, p.bajada, 800, MONT, 30, 950, 18, 5), esp: 5, color: COLOR.cian });
    const t = ajustar(g, p.nombre, 400, ANTON, 188, 940);
    const base = y + 44 + t * 0.88;
    titulo(g, p.nombre, x + t * 0.14, base, t, { alinear: 'left' });
    const chips = String(p.chips || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    let cx = x;
    const cy = base + 30;
    chips.forEach((c, i) => {
      const w = medir(g, c, 800, 24, 2) + 40;
      if (cx + w > W - 40) return;
      g.save();
      g.fillStyle = 'rgba(8,12,40,.85)';
      redondeado(g, cx, cy, w, 50, 25);
      g.fill();
      g.lineWidth = 2.5;
      g.strokeStyle = i % 2 ? COLOR.cian : COLOR.magenta;
      g.stroke();
      g.restore();
      texto(g, c, cx + 20, cy + 27, { tam: 24, esp: 2, base: 'middle', sombra: false });
      cx += w + 14;
    });
  }

  // Aviso de misión cumplida: tarjeta arriba al centro.
  function aviso(g, p) {
    const col = TONOS[p.color] || TONOS.verde;
    const x = 90;
    const y = 470;
    const w = 900;
    const h = 176;
    const bloque = 172;
    g.save();
    g.shadowColor = col;
    g.shadowBlur = 40;
    g.fillStyle = 'rgba(8,12,40,.92)';
    inclinado(g, x, y, w, h, 0.12);
    g.fill();
    g.restore();
    g.save();
    inclinado(g, x, y, w, h, 0.12);
    g.clip();
    g.fillStyle = lineal(g, 0, y, 0, y + h, [aclarar(col, 0.35), col]);
    g.fillRect(x, y, bloque, h);
    g.restore();
    icono(g, p.icono, x + bloque / 2 + 8, y + h / 2, 100, { color: '#ffffff' });
    const tx = x + bloque + 34;
    texto(g, p.titulo, tx, y + 60, { tam: 26, esp: 5, color: col });
    const premioT = 66;
    const premioW = medir(g, p.premio, 400, premioT, 0, ANTON);
    titulo(g, p.premio, x + w - 44, y + 128, premioT, { alinear: 'right', relleno: ORO, brillo: col });
    const libre = w - bloque - 34 - premioW - 44 - 40;
    const t = ajustar(g, p.texto, 800, MONT, 48, libre, 24);
    texto(g, p.texto, tx, y + 124, { tam: t });
    g.save();
    g.lineWidth = 3;
    g.strokeStyle = col;
    inclinado(g, x, y, w, h, 0.12);
    g.stroke();
    g.restore();
  }

  function cinta(g, y, alto, color) {
    g.save();
    g.beginPath();
    g.rect(0, y, W, alto);
    g.clip();
    g.fillStyle = alfa(color, 0.9);
    g.fillRect(0, y, W, alto);
    g.fillStyle = 'rgba(6,9,32,.85)';
    for (let x = -alto; x < W + alto; x += alto * 2.2) {
      g.beginPath();
      g.moveTo(x, y + alto);
      g.lineTo(x + alto, y);
      g.lineTo(x + alto * 2, y);
      g.lineTo(x + alto, y + alto);
      g.closePath();
      g.fill();
    }
    g.restore();
    g.save();
    const fade = lineal(g, 0, 0, W, 0, ['rgba(0,0,0,1)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0)', 'rgba(0,0,0,1)']);
    g.globalCompositeOperation = 'destination-out';
    g.fillStyle = fade;
    g.fillRect(0, y, W, alto);
    g.restore();
  }

  // Alerta grande a mitad de pantalla: emergencia o misión nueva.
  function alerta(g, p) {
    const show = p.tema === 'show';
    const a = show ? COLOR.oro : COLOR.rojo;
    const fondo = show ? 'rgba(34,10,58,.9)' : 'rgba(46,6,24,.9)';
    const { lineas: ls, tam } = lineas(g, p.titulo, 150, 960, 118);
    const alturaTitulo = ls.length * tam * 0.98;
    const alto = 60 + 64 + 38 + alturaTitulo + 28 + 44 + 18 + 34 + 60;
    const y0 = Math.round(860 - alto / 2);
    g.save();
    g.fillStyle = lineal(g, 0, 0, W, 0, ['rgba(0,0,0,0)', fondo, fondo, fondo, 'rgba(0,0,0,0)']);
    g.fillRect(0, y0, W, alto);
    g.restore();
    cinta(g, y0, 18, a);
    cinta(g, y0 + alto - 18, 18, a);
    // etiqueta
    let y = y0 + 60;
    const et = String(p.etiqueta).toUpperCase();
    const etW = medir(g, et, 800, 34, 8) + 64 + 36;
    const ex = W / 2 - etW / 2;
    g.save();
    g.shadowColor = a;
    g.shadowBlur = 24;
    g.fillStyle = a;
    inclinado(g, ex, y, etW, 64, 0.35);
    g.fill();
    g.restore();
    icono(g, show ? 'mic' : 'alerta', ex + 50, y + 32, 42, { color: show ? undefined : '#ffffff' });
    texto(g, et, ex + 80, y + 34, { tam: 34, esp: 8, base: 'middle', color: show ? COLOR.tinta : '#ffffff', sombra: false });
    y += 64 + 38;
    ls.forEach((l) => {
      y += tam * 0.98;
      titulo(g, l, W / 2, y - tam * 0.08, tam, { brillo: show ? COLOR.magenta : COLOR.rojo });
    });
    y += 28;
    const tt = ajustar(g, p.texto, 700, MONT, 38, 940, 22);
    texto(g, p.texto, W / 2, y + 30, { tam: tt, peso: 700, alinear: 'center', color: 'rgba(255,255,255,.95)' });
    y += 44 + 18;
    const mt = ajustar(g, String(p.meta).toUpperCase(), 800, MONT, 28, 900, 18, 4);
    texto(g, String(p.meta).toUpperCase(), W / 2, y + 26, { tam: mt, esp: 4, alinear: 'center', color: a });
  }

  // Marcador de destino con haz de luz, como un ping del mapa.
  function marcador(g, p) {
    const cx = W / 2;
    const cy = 880;
    g.save();
    g.fillStyle = lineal(g, 0, 250, 0, cy, [alfa(COLOR.magenta, 0), alfa(COLOR.magenta, 0.6)]);
    g.fillRect(cx - 8, 250, 16, cy - 250);
    g.shadowColor = COLOR.magenta;
    g.shadowBlur = 30;
    g.translate(cx, cy);
    g.rotate(Math.PI / 4);
    g.fillStyle = COLOR.magenta;
    redondeado(g, -32, -32, 64, 64, 10);
    g.fill();
    g.shadowBlur = 0;
    g.lineWidth = 5;
    g.strokeStyle = '#ffffff';
    g.stroke();
    g.restore();
    g.save();
    g.fillStyle = '#ffffff';
    g.beginPath();
    g.arc(cx, cy, 11, 0, Math.PI * 2);
    g.fill();
    g.restore();
    texto(g, p.nombre, cx, cy + 96, { tam: ajustar(g, p.nombre, 800, MONT, 38, 900, 20, 3), esp: 3, alinear: 'center' });
    titulo(g, p.distancia, cx, cy + 176, 70, { relleno: NEON });
  }

  function chispas(g, cx, cy, ancho, alto, color, semilla, n = 26) {
    const r = azar(semilla);
    g.save();
    g.fillStyle = color;
    g.shadowColor = color;
    g.shadowBlur = 10;
    for (let i = 0; i < n; i++) {
      const x = cx + (r() - 0.5) * ancho;
      const y = cy - r() * alto;
      const s = 2 + r() * 5;
      estrella(g, x, y, s * 1.6, 4, 0.3);
      g.fill();
    }
    g.restore();
  }

  // Tarjeta de loot con el color de su rareza y el haz de luz del item.
  function loot(g, p) {
    const r = RAREZA[p.rareza] || RAREZA.comun;
    const x = 160;
    const y = 1030;
    const w = 760;
    const h = 250;
    g.save();
    g.fillStyle = lineal(g, 0, 520, 0, y + 30, [alfa(r.color, 0), alfa(r.color, 0.55)]);
    g.beginPath();
    g.moveTo(W / 2 - 70, y + 30);
    g.lineTo(W / 2 + 70, y + 30);
    g.lineTo(W / 2 + 24, 520);
    g.lineTo(W / 2 - 24, 520);
    g.closePath();
    g.fill();
    g.restore();
    chispas(g, W / 2, y + 10, 420, 460, aclarar(r.color, 0.4), p.nombre.length * 97 + 13);
    g.save();
    g.shadowColor = r.color;
    g.shadowBlur = 44;
    g.fillStyle = lineal(g, x, 0, x + w, 0, [alfa(r.oscuro, 0.96), 'rgba(8,12,40,.95)']);
    redondeado(g, x, y, w, h, 22);
    g.fill();
    g.restore();
    const ts = h - 52;
    const tx = x + 26;
    const ty = y + 26;
    g.save();
    redondeado(g, tx, ty, ts, ts, 16);
    g.clip();
    g.fillStyle = radial(g, tx + ts / 2, ty + ts / 2, 6, ts * 0.78, [aclarar(r.color, 0.25), r.color, r.oscuro]);
    g.fillRect(tx, ty, ts, ts);
    g.translate(tx + ts / 2, ty + ts / 2);
    g.fillStyle = 'rgba(255,255,255,.12)';
    for (let i = 0; i < 12; i++) {
      g.rotate((Math.PI * 2) / 12);
      g.beginPath();
      g.moveTo(0, 0);
      g.lineTo(ts, -ts * 0.14);
      g.lineTo(ts, ts * 0.14);
      g.closePath();
      g.fill();
    }
    g.restore();
    icono(g, p.icono, tx + ts / 2, ty + ts / 2, ts * 0.8);
    const cx = tx + ts + 32;
    const ancho = x + w - 32 - cx;
    texto(g, r.nombre, cx, y + 66, { tam: 26, esp: 6, color: r.color });
    const t = ajustar(g, p.nombre, 400, ANTON, 76, ancho, 36);
    titulo(g, p.nombre, cx + t * 0.1, y + 76 + t * 0.86, t, { alinear: 'left', brillo: r.color });
    g.save();
    espaciado(g, 0);
    g.font = fuente(600, 27, MONT);
    const rs = renglones(g, p.texto, ancho, 2);
    g.restore();
    rs.forEach((l, i) => texto(g, l, cx, y + 92 + t * 0.86 + 36 + i * 34, { tam: 27, peso: 600, color: 'rgba(255,255,255,.88)' }));
    g.save();
    g.lineWidth = 3;
    g.strokeStyle = r.color;
    redondeado(g, x, y, w, h, 22);
    g.stroke();
    g.restore();
    const tecla = 'E';
    const accion = 'AGARRAR';
    const aw = medir(g, accion, 800, 30, 4);
    const total = 56 + 18 + aw;
    const kx = W / 2 - total / 2;
    const ky = y + h + 30;
    g.save();
    g.fillStyle = '#ffffff';
    g.shadowColor = 'rgba(0,0,0,.6)';
    g.shadowBlur = 12;
    redondeado(g, kx, ky, 56, 56, 10);
    g.fill();
    g.restore();
    texto(g, tecla, kx + 28, ky + 30, { tam: 30, alinear: 'center', base: 'middle', color: COLOR.tinta, sombra: false });
    texto(g, accion, kx + 56 + 18, ky + 30, { tam: 30, esp: 4, base: 'middle' });
  }

  // Pantalla de victoria.
  function victoria(g, p) {
    const cx = W / 2;
    const cy = 900;
    g.save();
    g.fillStyle = radial(g, cx, cy, 20, 640, ['rgba(255,200,61,.42)', 'rgba(255,45,141,.16)', 'rgba(255,45,141,0)']);
    g.fillRect(0, 0, W, H);
    g.translate(cx, cy);
    // rayos que se apagan hacia los bordes
    g.fillStyle = radial(g, 0, 0, 60, 940, ['rgba(255,213,74,.26)', 'rgba(255,213,74,.09)', 'rgba(255,213,74,0)']);
    for (let i = 0; i < 18; i++) {
      g.rotate((Math.PI * 2) / 18);
      g.beginPath();
      g.moveTo(0, 0);
      g.lineTo(900, -110);
      g.lineTo(900, 110);
      g.closePath();
      g.fill();
    }
    g.restore();
    titulo(g, p.puesto, cx, cy - 150, 290, { relleno: ORO, brillo: COLOR.naranja });
    const t = ajustar(g, p.titulo, 400, ANTON, 206, 980);
    titulo(g, p.titulo, cx, cy + 60, t, { relleno: ORO, brillo: COLOR.magenta });
    texto(g, p.nombre, cx, cy + 156, { tam: ajustar(g, p.nombre, 800, MONT, 66, 940, 30, 10), esp: 10, alinear: 'center' });
    texto(g, p.texto, cx, cy + 222, { tam: ajustar(g, p.texto, 700, MONT, 36, 960, 20), peso: 700, alinear: 'center', color: 'rgba(255,255,255,.92)' });
    chispas(g, cx, cy + 260, 900, 820, '#fff1b0', 7, 40);
  }

  // Fondo de ciudad: cielo, skyline, el Obelisco y el piso con grilla de neón.
  function fondoCiudad(g) {
    const hor = 1330;
    g.fillStyle = lineal(g, 0, 0, 0, hor, ['#03051a', '#0b0a33', '#26104f', '#4a1257']);
    g.fillRect(0, 0, W, hor);
    g.fillStyle = radial(g, W / 2, hor, 10, 760, ['rgba(255,45,141,.55)', 'rgba(255,45,141,.12)', 'rgba(255,45,141,0)']);
    g.fillRect(0, 0, W, hor);
    const r = azar(1936);
    for (let i = 0; i < 120; i++) {
      g.fillStyle = `rgba(255,255,255,${0.2 + r() * 0.5})`;
      g.fillRect(r() * W, r() * 700, 2, 2);
    }
    // skyline
    let x = -20;
    while (x < W + 20) {
      const w = 46 + r() * 90;
      const h = 110 + r() * (Math.abs(x + w / 2 - W / 2) < 170 ? 180 : 470);
      g.fillStyle = r() > 0.5 ? '#0a0b28' : '#0d0f33';
      g.fillRect(x, hor - h, w, h);
      for (let wy = hor - h + 16; wy < hor - 10; wy += 22) {
        for (let wx = x + 8; wx < x + w - 10; wx += 16) {
          const k = r();
          if (k > 0.8) {
            g.fillStyle = k > 0.95 ? alfa(COLOR.magenta, 0.8) : k > 0.9 ? alfa(COLOR.cian, 0.7) : 'rgba(255,200,120,.55)';
            g.fillRect(wx, wy, 7, 10);
          }
        }
      }
      x += w + 4;
    }
    // Obelisco
    g.save();
    g.shadowColor = COLOR.magenta;
    g.shadowBlur = 50;
    g.beginPath();
    g.moveTo(W / 2 - 38, hor);
    g.lineTo(W / 2 - 24, 590);
    g.lineTo(W / 2, 520);
    g.lineTo(W / 2 + 24, 590);
    g.lineTo(W / 2 + 38, hor);
    g.closePath();
    g.fillStyle = lineal(g, W / 2 - 38, 0, W / 2 + 38, 0, ['#b9bde0', '#eef0ff', '#8a8fc4', '#ff7ac0']);
    g.fill();
    g.restore();
    g.fillStyle = 'rgba(40,20,80,.35)';
    g.fillRect(W / 2 - 17, 700, 8, 16);
    // piso
    g.fillStyle = lineal(g, 0, hor, 0, H, ['#1a0833', '#05030f']);
    g.fillRect(0, hor, W, H - hor);
    g.save();
    g.beginPath();
    g.rect(0, hor, W, H - hor);
    g.clip();
    g.strokeStyle = alfa(COLOR.magenta, 0.5);
    g.lineWidth = 2;
    for (let i = -16; i <= 16; i++) {
      g.beginPath();
      g.moveTo(W / 2 + i * 26, hor);
      g.lineTo(W / 2 + i * 210, H);
      g.stroke();
    }
    for (let k = 1; k <= 14; k++) {
      const yy = hor + (H - hor) * Math.pow(k / 14, 2.1);
      g.strokeStyle = alfa(COLOR.cian, 0.12 + 0.35 * (k / 14));
      g.beginPath();
      g.moveTo(0, yy);
      g.lineTo(W, yy);
      g.stroke();
    }
    g.restore();
    g.fillStyle = lineal(g, 0, hor - 6, 0, hor + 6, [alfa(COLOR.magenta, 0), alfa(COLOR.rosa, 0.9), alfa(COLOR.magenta, 0)]);
    g.fillRect(0, hor - 6, W, 12);
    // llovizna
    g.strokeStyle = 'rgba(190,220,255,.10)';
    g.lineWidth = 1.5;
    for (let i = 0; i < 160; i++) {
      const lx = r() * W;
      const ly = r() * H;
      g.beginPath();
      g.moveTo(lx, ly);
      g.lineTo(lx - 10, ly + 38);
      g.stroke();
    }
  }

  // Placa final con los datos del show.
  function placa(g, p) {
    if (p.fondo) {
      fondoCiudad(g);
      g.fillStyle = 'rgba(4,6,22,.35)';
      g.fillRect(0, 0, W, H);
    } else {
      g.fillStyle = radial(g, W / 2, 900, 100, 1100, ['rgba(4,6,22,.86)', 'rgba(4,6,22,.72)', 'rgba(4,6,22,.6)']);
      g.fillRect(0, 0, W, H);
    }
    const cx = W / 2;
    let y = 560;
    const arriba = String(p.arriba).toUpperCase();
    texto(g, arriba, cx, y, { tam: ajustar(g, arriba, 800, MONT, 34, 940, 18, 8), esp: 8, alinear: 'center', color: 'rgba(255,255,255,.9)' });
    const t = ajustar(g, p.nombre, 400, ANTON, 250, 980);
    y += 40 + t * 0.9;
    titulo(g, p.nombre, cx, y, t);
    const tf = ajustar(g, p.fecha, 400, ANTON, 112, 960);
    y += 40 + tf * 0.9;
    titulo(g, p.fecha, cx, y, tf, { relleno: NEON, brillo: COLOR.magenta });
    y += 72;
    texto(g, p.lugar, cx, y, { tam: ajustar(g, p.lugar, 800, MONT, 42, 960, 20, 2), esp: 2, alinear: 'center', color: COLOR.cian });
    const cta = String(p.cta || '');
    if (cta) {
      y += 54;
      const cw = medir(g, cta, 800, 34, 3) + 80;
      g.save();
      g.shadowColor = COLOR.magenta;
      g.shadowBlur = 30;
      g.fillStyle = COLOR.magenta;
      inclinado(g, cx - cw / 2, y, cw, 76, 0.3);
      g.fill();
      g.restore();
      texto(g, cta, cx, y + 40, { tam: 34, esp: 3, alinear: 'center', base: 'middle', sombra: false });
    }
  }

  const TIPOS = { hud, lugar, jugador, aviso, alerta, marcador, loot, victoria, placa };

  // ---------- presets ----------

  const LUCKY = {
    nombre: 'Lucky LGM',
    datos: {
      nombre: 'LUCKY LGM',
      evento: 'FESTIVAL CULTURA D',
      fecha: 'DOMINGO 11 DE OCTUBRE',
      fechaCorta: 'DOM 11/10',
      lugar: 'TEATRO ASTROS',
      direccion: 'AV. CORRIENTES 746',
    },
    piezas: [
      { archivo: '01-hud-1-inicio', tipo: 'hud', toma: 'T05', p: { nombre: '{nombre}', nivel: '11', vida: 100, escudo: 0, jugadores: 12, eliminaciones: 0, tormenta: 'Sudestada', tiempo: '0:59', materiales: '999, 746, 11', inventario: 'llave', seleccion: 1, ruta: 'puente' } },
      { archivo: '02-hud-2-loot', tipo: 'hud', toma: 'T06–T08', p: { nombre: '{nombre}', nivel: '11', vida: 100, escudo: 0, jugadores: 12, eliminaciones: 0, tormenta: 'Sudestada', tiempo: '0:52', materiales: '999, 746, 11', inventario: 'llave, sopapa, mate-escudo, entrada', seleccion: 2, ruta: 'puente' } },
      { archivo: '03-hud-3-escudo', tipo: 'hud', toma: 'T09–T12', p: { nombre: '{nombre}', nivel: '11', vida: 100, escudo: 100, jugadores: 12, eliminaciones: 0, tormenta: 'Sudestada', tiempo: '0:41', materiales: '958, 746, 11', inventario: 'llave, sopapa, entrada, muzza', seleccion: 2, ruta: 'puente' } },
      { archivo: '04-hud-4-eliminaciones', tipo: 'hud', toma: 'T13–T17', p: { nombre: '{nombre}', nivel: '11', vida: 100, escudo: 100, jugadores: 12, eliminaciones: 2, tormenta: 'Sudestada', tiempo: '0:23', materiales: '958, 746, 11', inventario: 'llave, sopapa, entrada, muzza', seleccion: 3, ruta: 'astros' } },
      { archivo: '05-lugar-buenos-aires-2077', tipo: 'lugar', toma: 'T01', p: { arriba: 'BIENVENIDOS A', nombre: 'BUENOS AIRES 2077' } },
      { archivo: '06-jugador-lucky', tipo: 'jugador', toma: 'T02', p: { nombre: '{nombre}', bajada: 'PLOMERO · CANTANTE · HÉROE MULTITASK', chips: 'NIVEL 11, CLASE: MULTITASK, SKIN: LABURO' } },
      { archivo: '07-mision-bano', tipo: 'aviso', toma: 'T03', p: { titulo: 'MISIÓN COMPLETADA', texto: "Destapar el baño de Ugi's", premio: '+100 XP', color: 'verde', icono: 'check' } },
      { archivo: '08-alerta-emergencia', tipo: 'alerta', toma: 'T04', p: { etiqueta: 'EMERGENCIA', titulo: 'PUENTE DE LA MUJER', texto: 'Quieren secuestrar a tu novia. ¡Rescatala!', meta: '1,8 km · objetivo marcado', tema: 'emergencia' } },
      { archivo: '09-marcador-puente', tipo: 'marcador', toma: 'T05', p: { nombre: 'PUENTE DE LA MUJER', distancia: '1,8 KM' } },
      { archivo: '10-lugar-av-corrientes', tipo: 'lugar', toma: 'T06', p: { arriba: 'BUENOS AIRES 2077', nombre: 'AV. CORRIENTES' } },
      { archivo: '11-loot-lanzasopapas', tipo: 'loot', toma: 'T06', p: { nombre: 'LANZASOPAPAS', rareza: 'epico', texto: 'Pega sopapas a distancia. Ideal para motochorros.', icono: 'sopapa' } },
      { archivo: '12-loot-mate', tipo: 'loot', toma: 'T06', p: { nombre: 'MATE ESCUDO', rareza: 'raro', texto: '+50 de escudo. Se comparte.', icono: 'mate-escudo' } },
      { archivo: '13-loot-entrada', tipo: 'loot', toma: 'T07', p: { nombre: 'ENTRADA {evento}', rareza: 'legendario', texto: '{fechaCorta} · {lugar}', icono: 'entrada' } },
      { archivo: '14-lugar-luna-park', tipo: 'lugar', toma: 'T10', p: { arriba: 'CORRIENTES BAJA', nombre: 'LUNA PARK' } },
      { archivo: '15-loot-muzza', tipo: 'loot', toma: 'T10', p: { nombre: 'PORCIÓN DE MUZZA', rareza: 'poco', texto: '+25 de vida. Al paso.', icono: 'muzza' } },
      { archivo: '16-lugar-puente-de-la-mujer', tipo: 'lugar', toma: 'T11', p: { arriba: 'PUERTO MADERO', nombre: 'PUENTE DE LA MUJER' } },
      { archivo: '17-rescate-completado', tipo: 'aviso', toma: 'T13', p: { titulo: 'RESCATE COMPLETADO', texto: 'Novia a salvo', premio: '+500 XP', color: 'oro', icono: 'estrella' } },
      { archivo: '18-alerta-show', tipo: 'alerta', toma: 'T15', p: { etiqueta: 'NUEVA MISIÓN', titulo: 'SHOW EN {lugar}', texto: 'Domingo 11 de octubre · {direccion}', meta: '{evento}', tema: 'show' } },
      { archivo: '19-skin-equipada', tipo: 'aviso', toma: 'T16', p: { titulo: 'SKIN EQUIPADA', texto: 'Lucky LGM · Modo show', premio: 'MÍTICA', color: 'magenta', icono: 'destello' } },
      { archivo: '20-loot-paraguas', tipo: 'loot', toma: 'T17', p: { nombre: 'PARAGUAS FILETEADO', rareza: 'epico', texto: 'Planeador. Volvé por Corrientes sin tocar el piso.', icono: 'paraguas' } },
      { archivo: '21-lugar-teatro-astros', tipo: 'lugar', toma: 'T17', p: { arriba: '{direccion}', nombre: '{lugar}' } },
      { archivo: '22-loot-microfono', tipo: 'loot', toma: 'T19', p: { nombre: 'MICRÓFONO DE LUCKY', rareza: 'mitico', texto: 'Desbloquea: show en vivo.', icono: 'mic' } },
      { archivo: '23-victoria', tipo: 'victoria', toma: 'T19', p: { puesto: '#1', titulo: '¡VICTORIA!', nombre: '{nombre}', texto: 'Show desbloqueado · {lugar} · {fechaCorta}' } },
      { archivo: '24-placa-final', tipo: 'placa', toma: 'T20', p: { arriba: '{evento} presenta', nombre: '{nombre}', fecha: '{fecha}', lugar: '{lugar} · {direccion}', cta: 'ENTRADAS: LINK EN BIO', fondo: false } },
      { archivo: '25-placa-final-fondo', tipo: 'placa', toma: 'T20', p: { arriba: '{evento} presenta', nombre: '{nombre}', fecha: '{fecha}', lugar: '{lugar} · {direccion}', cta: 'ENTRADAS: LINK EN BIO', fondo: true } },
    ],
  };

  // Borrador para la intro de la hermana: mismo mundo, su loot y su skin.
  const LXLX = {
    nombre: 'LXLX ZZZ',
    datos: { ...LUCKY.datos, nombre: 'LXLX ZZZ' },
    piezas: [
      { archivo: '01-hud-1-inicio', tipo: 'hud', toma: 'despierta', p: { nombre: '{nombre}', nivel: '11', vida: 100, escudo: 0, jugadores: 12, eliminaciones: 0, tormenta: 'Sudestada', tiempo: '0:59', materiales: '999, 746, 11', inventario: 'almohada', seleccion: 1, ruta: 'astros' } },
      { archivo: '02-hud-2-loot', tipo: 'hud', toma: 'saltos', p: { nombre: '{nombre}', nivel: '11', vida: 100, escudo: 100, jugadores: 12, eliminaciones: 0, tormenta: 'Sudestada', tiempo: '0:31', materiales: '999, 746, 11', inventario: 'almohada, chocolatada, zanahoria, conejo', seleccion: 4, ruta: 'astros' } },
      { archivo: '03-lugar-buenos-aires-2077', tipo: 'lugar', toma: 'apertura', p: { arriba: 'BIENVENIDOS A', nombre: 'BUENOS AIRES 2077' } },
      { archivo: '04-jugador-lxlx', tipo: 'jugador', toma: 'presentación', p: { nombre: '{nombre}', bajada: 'DORMILONA · CANTANTE · CONEJITA', chips: 'NIVEL 11, CLASE: SALTARINA, SKIN: PIJAMA' } },
      { archivo: '05-mision-despertar', tipo: 'aviso', toma: 'despierta', p: { titulo: 'MISIÓN COMPLETADA', texto: 'Salir de la cama', premio: '+100 XP', color: 'verde', icono: 'check' } },
      { archivo: '06-alerta-show', tipo: 'alerta', toma: 'alarma', p: { etiqueta: 'NUEVA MISIÓN', titulo: 'SHOW EN {lugar}', texto: 'Domingo 11 de octubre · {direccion}', meta: '{evento}', tema: 'show' } },
      { archivo: '07-loot-almohada', tipo: 'loot', toma: 'cama', p: { nombre: 'ALMOHADA ESCUDO', rareza: 'raro', texto: '+50 de escudo. Dormir también es estrategia.', icono: 'almohada' } },
      { archivo: '08-loot-chocolatada', tipo: 'loot', toma: 'cocina', p: { nombre: 'CHOCOLATADA', rareza: 'poco', texto: '+25 de vida.', icono: 'chocolatada' } },
      { archivo: '09-loot-zanahoria', tipo: 'loot', toma: 'Corrientes', p: { nombre: 'ZANAHORIA DORADA', rareza: 'legendario', texto: 'Tu entrada: {fechaCorta} · {lugar}', icono: 'zanahoria' } },
      { archivo: '10-skin-conejita', tipo: 'loot', toma: 'transformación', p: { nombre: 'SKIN CONEJITA', rareza: 'mitico', texto: 'Orejas holográficas y doble salto.', icono: 'conejo' } },
      { archivo: '11-skin-equipada', tipo: 'aviso', toma: 'transformación', p: { titulo: 'SKIN EQUIPADA', texto: 'Conejita', premio: 'MÍTICA', color: 'magenta', icono: 'destello' } },
      { archivo: '12-lugar-teatro-astros', tipo: 'lugar', toma: 'llegada', p: { arriba: '{direccion}', nombre: '{lugar}' } },
      { archivo: '13-victoria', tipo: 'victoria', toma: 'escenario', p: { puesto: '#1', titulo: '¡VICTORIA!', nombre: '{nombre}', texto: 'Show desbloqueado · {lugar} · {fechaCorta}' } },
      { archivo: '14-placa-final', tipo: 'placa', toma: 'final', p: { arriba: '{evento} presenta', nombre: '{nombre}', fecha: '{fecha}', lugar: '{lugar} · {direccion}', cta: 'ENTRADAS: LINK EN BIO', fondo: false } },
      { archivo: '15-placa-final-fondo', tipo: 'placa', toma: 'final', p: { arriba: '{evento} presenta', nombre: '{nombre}', fecha: '{fecha}', lugar: '{lugar} · {direccion}', cta: 'ENTRADAS: LINK EN BIO', fondo: true } },
    ],
  };

  const PRESETS = { lucky: LUCKY, lxlx: LXLX };

  // Campos que el estudio deja editar en cada tipo de pieza.
  const opcionesIcono = Object.keys(ICONOS);
  const CAMPOS = {
    hud: [
      ['vida', 'Vida', 'numero'],
      ['escudo', 'Escudo', 'numero'],
      ['jugadores', 'Jugadores', 'numero'],
      ['eliminaciones', 'Eliminaciones', 'numero'],
      ['tormenta', 'Tormenta'],
      ['tiempo', 'Tiempo'],
      ['nivel', 'Nivel'],
      ['materiales', 'Materiales (3 números)'],
      ['inventario', 'Inventario (hasta 5, separados por coma)', 'texto', 'Se puede usar: ' + Object.keys(ITEMS).join(', ') + '.'],
      ['seleccion', 'Casillero elegido (1 a 5)', 'numero'],
      ['ruta', 'Recorrido del mapa', ['puente', 'astros']],
    ],
    lugar: [['arriba', 'Línea chica'], ['nombre', 'Lugar']],
    jugador: [['nombre', 'Nombre'], ['bajada', 'Bajada'], ['chips', 'Etiquetas (separadas por coma)']],
    aviso: [['titulo', 'Título'], ['texto', 'Texto'], ['premio', 'Premio'], ['color', 'Color', Object.keys(TONOS)], ['icono', 'Ícono', opcionesIcono]],
    alerta: [['etiqueta', 'Etiqueta'], ['titulo', 'Título'], ['texto', 'Texto'], ['meta', 'Línea de abajo'], ['tema', 'Tema', ['emergencia', 'show']]],
    marcador: [['nombre', 'Destino'], ['distancia', 'Distancia']],
    loot: [['nombre', 'Nombre'], ['rareza', 'Rareza', Object.keys(RAREZA)], ['texto', 'Descripción'], ['icono', 'Ícono', opcionesIcono]],
    victoria: [['puesto', 'Puesto'], ['titulo', 'Título'], ['nombre', 'Nombre'], ['texto', 'Texto']],
    placa: [['arriba', 'Arriba'], ['nombre', 'Nombre'], ['fecha', 'Fecha'], ['lugar', 'Lugar'], ['cta', 'Llamado'], ['fondo', 'Con fondo de ciudad', 'si-no']],
  };

  const DATOS = [
    ['nombre', 'Nombre del artista'],
    ['evento', 'Evento'],
    ['fecha', 'Fecha'],
    ['fechaCorta', 'Fecha corta'],
    ['lugar', 'Lugar'],
    ['direccion', 'Dirección'],
  ];

  // Reemplaza {nombre}, {fecha}, etc. por los datos del show.
  function resolver(p, datos) {
    const out = {};
    for (const [k, v] of Object.entries(p)) {
      out[k] = typeof v === 'string' ? v.replace(/\{(\w+)\}/g, (m, key) => (key in datos ? datos[key] : m)) : v;
    }
    return out;
  }

  function dibujar(g, pieza, datos) {
    g.clearRect(0, 0, W, H);
    TIPOS[pieza.tipo](g, resolver(pieza.p, datos));
  }

  function clonar(id) {
    return JSON.parse(JSON.stringify(PRESETS[id]));
  }

  function fontsReady() {
    const caras = ['400 100px Anton', '600 30px Montserrat', '700 30px Montserrat', '800 30px Montserrat'];
    return Promise.all(caras.map((f) => document.fonts.load(f))).then(() => document.fonts.ready);
  }

  window.LuckyHUD = { W, H, PRESETS, CAMPOS, DATOS, ITEMS, RAREZA, dibujar, fondoCiudad, clonar, fontsReady };
})();
