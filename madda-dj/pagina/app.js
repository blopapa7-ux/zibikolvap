/* Identidad MADDA · arma la página con datos.js y guarda lo que ella elige.
   Todo es defensivo: si falta un dato, la sección se achica o se oculta, nunca se rompe. */
(function () {
  'use strict';

  const D = window.MADDA || {};
  const L = window.MaddaLogos || { svg: () => '' };
  const V = window.MaddaVisuales || null;
  const ES_ARTIFACT = !!window.__ARTIFACT__;
  const CLAVE = 'madda-identidad:v1';
  const ZONA = 'America/Argentina/Buenos_Aires';

  // ── utilidades ──
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const lista = (x) => (Array.isArray(x) ? x : []);
  const txt = (x) => (x == null || (typeof x === 'number' && !Number.isFinite(x)) ? '' : String(x));
  const esc = (s) => txt(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const camino = (obj, ruta) => ruta.split('.').reduce((o, k) => (o && o[k] != null ? o[k] : undefined), obj);
  const esUrl = (u) => /^https:\/\/[^\s"'<>]+$/.test(txt(u));
  const num = (v, d) => (Number.isFinite(+v) ? +v : d);
  const CORAZON = '<svg class="corazon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 20.5s-7.5-4.6-7.5-10.3A4.2 4.2 0 0 1 12 7.6a4.2 4.2 0 0 1 7.5 2.6c0 5.7-7.5 10.3-7.5 10.3z"/></svg>';

  // ── datos normalizados ──
  const NOMBRE = txt(D.nombre).trim() || 'MADDA';
  const GENERO = txt(D.genero) || 'Techno';
  const FIRMA = txt(D.firma) || 'Pk';
  const LOGOS = lista(camino(D, 'logos.opciones')).filter((o) => o && o.id);
  if (!LOGOS.length) LOGOS.push({ id: 'tornasol', nombre: 'Tornasol', porque: '', fuente: '' });
  const VARIANTES = lista(camino(D, 'logos.variantes')).filter((v) => v && v.id);
  if (!VARIANTES.length) VARIANTES.push({ id: 'tornasol', nombre: 'Tornasol' }, { id: 'blanco', nombre: 'Blanco' }, { id: 'rojo', nombre: 'Rojo' });
  const PALETAS = lista(camino(D, 'paletas.opciones')).filter((p) => p && p.id);
  const ESTILOS = lista(camino(D, 'estilos.lista')).filter((e) => e && e.id && Array.isArray(e.bpm) && e.bpm.length === 2 && e.bpm.every(Number.isFinite));
  const ESCALA = Array.isArray(D.escalaBpm) && D.escalaBpm.length === 2 && D.escalaBpm[1] > D.escalaBpm[0] ? D.escalaBpm : [110, 165];
  const PREGUNTAS = lista(camino(D, 'bio.preguntas')).filter((p) => p && p.id && p.texto);
  const VISUALES = lista(camino(D, 'visuales.lista')).filter((v) => v && v.id);

  // ── estado (se guarda en este navegador si se puede) ──
  const estado = {
    logo: null,
    variantes: {},
    paleta: PALETAS[0] ? PALETAS[0].id : '',
    gustos: [],
    visuales: [],
    bpm: null,
    borde: true,
    respuestas: {},
  };

  function cargar() {
    let s = null;
    try { s = JSON.parse(localStorage.getItem(CLAVE) || 'null'); } catch (e) { s = null; }
    if (!s || typeof s !== 'object') return;
    if (LOGOS.some((l) => l.id === s.logo)) estado.logo = s.logo;
    if (s.variantes && typeof s.variantes === 'object') {
      Object.keys(s.variantes).forEach((k) => { if (VARIANTES.some((v) => v.id === s.variantes[k])) estado.variantes[k] = s.variantes[k]; });
    }
    if (PALETAS.some((p) => p.id === s.paleta)) estado.paleta = s.paleta;
    if (Array.isArray(s.gustos)) estado.gustos = s.gustos.filter((g) => ESTILOS.some((e) => e.id === g));
    if (Array.isArray(s.visuales)) estado.visuales = s.visuales.filter((g) => VISUALES.some((v) => v.id === g));
    if (Number.isFinite(s.bpm) && s.bpm > 30 && s.bpm < 300) estado.bpm = Math.round(s.bpm);
    if (typeof s.borde === 'boolean') estado.borde = s.borde;
    if (s.respuestas && typeof s.respuestas === 'object') {
      PREGUNTAS.forEach((p) => { if (typeof s.respuestas[p.id] === 'string') estado.respuestas[p.id] = s.respuestas[p.id].slice(0, 600); });
    }
  }
  let esperaGuardar = 0;
  function guardar() {
    clearTimeout(esperaGuardar);
    esperaGuardar = setTimeout(() => {
      try { localStorage.setItem(CLAVE, JSON.stringify(estado)); } catch (e) { /* sin almacenamiento: la página sigue andando */ }
    }, 150);
  }

  // ── consultas de estado ──
  const logoInfo = (id) => LOGOS.find((l) => l.id === id) || LOGOS[0];
  const logoVisible = () => estado.logo || LOGOS[0].id;
  const varianteDe = (id) => estado.variantes[id] || VARIANTES[0].id;
  const nombreVariante = (id) => txt((VARIANTES.find((v) => v.id === id) || {}).nombre) || txt(id);
  const paleta = () => PALETAS.find((p) => p.id === estado.paleta) || PALETAS[0] || null;

  function dibujarLogo(id, extra) {
    const info = logoInfo(id);
    const variante = (extra && extra.variante) || varianteDe(info.id);
    const titulo = `${NOMBRE}, logo ${txt(info.nombre)} (${nombreVariante(variante)})`;
    return L.svg(info.id, Object.assign({ nombre: NOMBRE, variante, paleta: paleta(), genero: GENERO, titulo }, extra || {}));
  }

  // ── textos fijos desde datos ──
  function llenarCampos() {
    $$('[data-campo]').forEach((el) => {
      const v = camino(D, el.dataset.campo);
      if (typeof v === 'string' && v.trim()) el.textContent = v;
      else el.hidden = true;
    });
    const ojo = (id, texto) => { const el = document.getElementById(id); if (el) { el.textContent = texto; el.hidden = !texto; } };
    const pares = lista(camino(D, 'pedido.pares'));
    ojo('pedido-ojo', pares.length ? `${pares.length} cosas que me dijiste` : '');
    ojo('logo-ojo', `${LOGOS.length} ${LOGOS.length === 1 ? 'opción' : 'opciones'} · elegí con «Me gusta»`);
    ojo('colores-ojo', PALETAS.length ? `${PALETAS.length} paletas · tocá para probar` : '');
    if (ESTILOS.length) {
      const min = Math.min(...ESTILOS.map((e) => e.bpm[0])), max = Math.max(...ESTILOS.map((e) => e.bpm[1]));
      ojo('sonido-ojo', `${ESTILOS.length} estilos · de ${min} a ${max} BPM`);
    } else ojo('sonido-ojo', '');
    const vis = lista(camino(D, 'visuales.lista'));
    ojo('visuales-ojo', vis.length ? `${vis.length} loops · pantalla 2,1 : 1` : '');
    ojo('redes-ojo', '3 maquetas');
    const v = $('#portada-version');
    if (v) v.textContent = [D.version ? `Propuesta ${txt(D.version)}` : '', txt(camino(D, 'portada.fecha'))].filter(Boolean).join(' · ');
    $('#nombre-h1').textContent = NOMBRE;
    const ig = $('#portada-ig');
    if (ig) {
      if (esUrl(D.instagram) && D.handle) { ig.href = D.instagram; ig.textContent = txt(D.handle) + ' ↗'; ig.setAttribute('aria-label', `${txt(D.handle)} en Instagram (se abre en otra pestaña)`); }
      else ig.hidden = true;
    }
    // en el Artifact el archivo de licencias no existe: queda solo el texto
    if (ES_ARTIFACT) { const lic = $('#pie-licencias-link'); if (lic) lic.hidden = true; }
    const dsp = $('#despedida');
    if (dsp && !txt(camino(D, 'despedida.texto')).trim()) dsp.hidden = true;
  }

  // ── portada ──
  function pintarPortada() {
    const id = logoVisible();
    const cont = $('#portada-svg');
    if (cont) {
      cont.dataset.forma = id;
      // abajo, el logo con borde y sombras (quieto); arriba, una copia sin filtros que es la que
      // se mueve: así cada cuadro no recalcula las sombras
      const vivo = !!V && !V.pideQuieto();
      cont.innerHTML = dibujarLogo(id, { borde: true }) + (vivo ? dibujarLogo(id, { clase: 'portada-brillo' }) : '');
    }
    const marca = $('#indice-marca');
    if (marca) marca.innerHTML = dibujarLogo(id, { forma: 'marca' });
    const tema = document.querySelector('meta[name="theme-color"]');
    const p = paleta();
    if (tema && p && p.tokens && p.tokens.fondo) tema.setAttribute('content', p.tokens.fondo);
  }

  // Movimiento del logo de la portada, con el mismo reloj que los canvas (30 fps, quieto
  // fuera de pantalla o con movimiento reducido): el tornasol se corre como una lámina
  // holográfica que cambia con la luz, y los platos de la Doble D giran a 33⅓.
  function movimientoPortada(el) {
    return {
      canvas: el,
      tipo: 'svg',
      medir() {},
      dibujar(t) {
        const svg = $('#portada-svg .portada-brillo');
        if (!svg) return;
        const g = $('linearGradient[id$="-g"]', svg);
        if (g) {
          const ancho = (svg.viewBox && svg.viewBox.baseVal && svg.viewBox.baseVal.width) || 500;
          g.setAttribute('gradientTransform', `translate(${(Math.sin((t * 2 * Math.PI) / 14) * ancho * 0.32).toFixed(1)} 0)`);
        }
        const giro = ((t / 1.8) * 360) % 360;
        $$('.giro', svg).forEach((p) => { p.style.transform = `rotate(${giro.toFixed(1)}deg)`; });
      },
    };
  }

  // ── lo que me pediste ──
  function pintarPedido() {
    const ul = $('#pares');
    const pares = lista(camino(D, 'pedido.pares')).filter((p) => p && p.cita && p.decision);
    if (!ul || !pares.length) { const s = $('#pedido'); if (s) s.hidden = !pares.length; return; }
    ul.innerHTML = pares.map((p) => `
      <li class="par">
        <blockquote class="cita"><span class="par-etq">Vos</span><q>${esc(p.cita)}</q></blockquote>
        <span class="par-flecha" aria-hidden="true">→</span>
        <p class="decision"><span class="par-etq">Lo que hice</span>${esc(p.decision)}</p>
      </li>`).join('');
  }

  // ── logos ──
  function pintarLogos() {
    const ul = $('#logos');
    if (!ul) return;
    ul.innerHTML = LOGOS.map((o) => {
      const chips = VARIANTES.map((v) => `<button type="button" data-variante="${esc(v.id)}" aria-pressed="false"><span class="punto punto-${esc(v.id)}" aria-hidden="true"></span>${esc(v.nombre)}</button>`).join('');
      return `
      <li class="logo-card" data-logo="${esc(o.id)}">
        <div class="logo-escena" data-forma="${esc(o.id)}"><span class="en-portada" hidden>En portada</span><div class="logo-dibujo"></div></div>
        <div class="logo-cabeza"><h3>${esc(o.nombre)}</h3><span class="dato">${esc(o.fuente)}</span></div>
        <p class="logo-porque">${esc(o.porque)}</p>
        <div class="logo-acciones">
          <div class="segmento" role="group" aria-label="Versión de color de ${esc(o.nombre)}">${chips}</div>
          <button type="button" class="boton" data-accion="gusta" aria-pressed="false" aria-label="Me gusta ${esc(o.nombre)}">${CORAZON}Me gusta</button>
        </div>
      </li>`;
    }).join('');
    ul.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      const card = b && b.closest('[data-logo]');
      if (!card) return;
      const id = card.dataset.logo;
      if (b.dataset.accion === 'gusta') estado.logo = estado.logo === id ? null : id;
      else if (b.dataset.variante) estado.variantes[id] = b.dataset.variante;
      else return;
      guardar();
      refrescarLogos();
    });
  }

  function refrescarTarjetas() {
    const visible = logoVisible();
    $$('#logos [data-logo]').forEach((card) => {
      const id = card.dataset.logo;
      const dib = $('.logo-dibujo', card);
      if (dib) dib.innerHTML = dibujarLogo(id);
      const v = varianteDe(id);
      $$('[data-variante]', card).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.variante === v)));
      const gusta = estado.logo === id;
      const bg = $('[data-accion="gusta"]', card);
      if (bg) bg.setAttribute('aria-pressed', String(gusta));
      card.classList.toggle('es-favorito', gusta);
      const badge = $('.en-portada', card);
      if (badge) badge.hidden = id !== visible;
    });
  }

  function pintarAvatares() {
    const id = logoVisible();
    ['#avatar-110', '#avatar-40'].forEach((sel) => {
      const el = $(sel);
      if (!el) return;
      el.dataset.forma = id;
      el.innerHTML = dibujarLogo(id, { forma: 'marca' });
    });
  }

  // ── paletas ──
  function aplicarPaleta() {
    const p = paleta();
    if (!p || !p.tokens) return;
    const r = document.documentElement.style;
    const t = p.tokens;
    if (t.fondo) r.setProperty('--fondo', t.fondo);
    if (t.acento) r.setProperty('--acento', t.acento);
    if (t.acento2) r.setProperty('--acento-2', t.acento2);
    if (t.brillo) r.setProperty('--brillo', t.brillo);
    if (t.texto) r.setProperty('--acento-texto', t.texto);
  }

  function pintarPaletas() {
    const ul = $('#paletas');
    if (!ul) return;
    if (!PALETAS.length) { ul.hidden = true; return; }
    ul.innerHTML = PALETAS.map((p) => {
      const colores = lista(p.colores).filter((c) => c && /^#[0-9a-f]{3,8}$/i.test(txt(c.hex)));
      const tira = colores.map((c) => `<span data-c="${esc(c.hex)}" data-peso="${num(c.peso, 1)}"></span>`).join('');
      const hex = colores.map((c) => `<li><span class="punto" data-c="${esc(c.hex)}" aria-hidden="true"></span>${esc(c.nombre)}<code>${esc(c.hex.toUpperCase())}</code></li>`).join('');
      return `
      <li class="paleta" data-paleta="${esc(p.id)}">
        <div class="muestra" aria-hidden="true"><div class="tira">${tira}</div><div class="tira-brillo"></div></div>
        <h3>${esc(p.nombre)}</h3>
        <ul class="hex">${hex}</ul>
        <p class="paleta-uso">${esc(p.uso)}</p>
        <button type="button" class="boton" aria-pressed="false" aria-label="Usar la paleta ${esc(p.nombre)}">Usar esta paleta</button>
      </li>`;
    }).join('');
    // colores por propiedad (sin estilos en línea)
    $$('[data-c]', ul).forEach((el) => {
      el.style.background = el.dataset.c;
      if (el.dataset.peso) el.style.flexGrow = el.dataset.peso;
    });
    // la tira de brillo: el degradé tornasol de cada paleta, como lo lleva el logo
    $$('[data-paleta]', ul).forEach((li) => {
      const p = PALETAS.find((x) => x.id === li.dataset.paleta);
      const grad = lista(p && p.grad).filter((c) => /^#[0-9a-f]{3,8}$/i.test(txt(c)));
      const el = $('.tira-brillo', li);
      if (!el) return;
      if (grad.length > 1) el.style.backgroundImage = `linear-gradient(180deg, rgba(255,255,255,.32), rgba(255,255,255,0) 55%), linear-gradient(100deg, ${grad.join(', ')})`;
      else el.hidden = true;
    });
    ul.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      const li = b && b.closest('[data-paleta]');
      if (!li) return;
      estado.paleta = li.dataset.paleta;
      guardar();
      aplicarPaleta();
      refrescarPaletas();
      refrescarLogos();
      pintarHistoria();
      if (V) V.redibujar(false);
    });
  }

  function refrescarPaletas() {
    const act = paleta();
    $$('#paletas [data-paleta]').forEach((li) => {
      const on = !!act && li.dataset.paleta === act.id;
      li.classList.toggle('activa', on);
      const b = $('button', li);
      if (b) { b.setAttribute('aria-pressed', String(on)); b.textContent = on ? 'Paleta en uso' : 'Usar esta paleta'; }
    });
  }

  // ── laboratorio de legibilidad ──
  const medidas = {};
  function pintarLab() {
    const ul = $('#lab');
    const fondos = lista(camino(D, 'legibilidad.fondos')).filter((f) => f && f.id);
    if (!ul || !fondos.length) { const b = $('#legible'); if (b) b.hidden = true; return; }
    ul.innerHTML = fondos.map((f) => `
      <li class="lab-item" data-fondo="${esc(f.id)}">
        <div class="lab-escena"><canvas role="img" aria-label="Fondo de prueba: ${esc(f.nombre)}"></canvas><div class="lab-logo"></div></div>
        <div class="lab-pie"><span class="lab-nombre">${esc(f.nombre)}</span><span class="lab-medida"></span></div>
      </li>`).join('');
    $$('[data-fondo]', ul).forEach((li) => {
      const cv = $('canvas', li);
      if (V && V.fondoPrueba(cv, li.dataset.fondo)) medidas[li.dataset.fondo] = V.medirContraste(cv, { color: '#06050B', alfa: 0.85 });
    });
    const b = $('#borde');
    if (b) b.addEventListener('click', () => { estado.borde = !estado.borde; guardar(); refrescarLab(); });
  }

  const veredicto = (r) => (r >= 4.5 ? ['se lee perfecto', 'ok'] : r >= 3 ? ['se lee', 'ok'] : ['se pierde', 'mal']);
  const ratioTxt = (r) => r.toFixed(1).replace('.', ',') + ' : 1';

  function refrescarLab() {
    const b = $('#borde');
    if (b) b.setAttribute('aria-pressed', String(estado.borde));
    const id = logoVisible();
    $$('#lab [data-fondo]').forEach((li) => {
      const cont = $('.lab-logo', li);
      if (cont) cont.innerHTML = dibujarLogo(id, { variante: 'blanco', borde: estado.borde });
      const m = medidas[li.dataset.fondo];
      const el = $('.lab-medida', li);
      if (!el) return;
      if (!m) { el.textContent = ''; return; }
      const r = estado.borde ? m.con : m.sin;
      const [v, clase] = veredicto(r);
      el.innerHTML = `${estado.borde ? 'con borde' : 'sin borde'} · contraste <b>${esc(ratioTxt(r))}</b><span class="veredicto ${clase}">${esc(v)}</span>`;
    });
  }

  // ── sonido: playlist ──
  function pintarPlaylist() {
    const P = D.playlist || {};
    const art = $('#playlist');
    if (!art) return;
    if (!P.titulo && !esUrl(P.url)) { art.hidden = true; return; }
    const h = $('#playlist-t');
    if (h) h.innerHTML = `<q>${esc(P.titulo || 'Tu playlist')}</q>`;
    const abrir = $('#abrir-spotify');
    if (abrir) { if (esUrl(P.url)) abrir.href = P.url; else abrir.hidden = true; }
    const escuchar = $('#escuchar');
    if (!ES_ARTIFACT && escuchar && /^https:\/\/open\.spotify\.com\/embed\//.test(txt(P.embed))) {
      escuchar.hidden = false;
      escuchar.addEventListener('click', () => {
        const marco = $('#spotify-marco');
        if (!marco) return;
        if (!marco.firstChild) {
          const f = document.createElement('iframe');
          f.src = P.embed + '?utm_source=generator&theme=0';
          f.title = `Playlist «${txt(P.titulo)}» en Spotify`;
          f.loading = 'lazy';
          f.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
          marco.appendChild(f);
        }
        marco.hidden = false;
        escuchar.hidden = true;
      });
    }
  }

  // ── estilos de techno ──
  const pos = (bpm) => ((bpm - ESCALA[0]) / (ESCALA[1] - ESCALA[0])) * 100;

  function pintarEstilos() {
    const ul = $('#estilos-lista');
    const eje = $('#eje');
    if (!ul || !ESTILOS.length) { const b = $('#estilos-bloque'); if (b) b.hidden = true; return; }
    const paso = 10;
    const ticks = [];
    for (let v = Math.ceil(ESCALA[0] / paso) * paso; v <= ESCALA[1] - 3; v += paso) ticks.push(v);
    if (eje) eje.innerHTML = ticks.map((v) => `<span style="left:${pos(v)}%">${v}</span>`).join('') + '<span class="eje-vos" hidden></span>';
    const est = $('#estilos');
    if (est) est.style.setProperty('--paso', (paso / (ESCALA[1] - ESCALA[0])) * 100 + '%');
    ul.innerHTML = ESTILOS.map((e) => `
      <li class="estilo" data-estilo="${esc(e.id)}">
        <div class="estilo-titulo"><span class="estilo-nombre">${esc(e.nombre)}</span><span class="estilo-bpm">aprox. ${e.bpm[0]}–${e.bpm[1]} BPM</span></div>
        <div class="estilo-medio">
          <div class="pista" aria-hidden="true"><span class="rango" style="left:${pos(e.bpm[0])}%;width:${pos(e.bpm[1]) - pos(e.bpm[0])}%"></span><span class="marca-bpm" hidden></span></div>
          <p class="estilo-mood">${lista(e.mood).map(esc).join(' · ')}</p>
          <p class="estilo-suena">${esc(e.suena)}</p>
        </div>
        <div class="estilo-fin"><span class="estilo-coincide" hidden>Coincide con tus BPM</span>
          <button type="button" class="boton boton-chico" aria-pressed="false" aria-label="Me gusta para tocar: ${esc(e.nombre)}">${CORAZON}Me gusta para tocar</button>
        </div>
      </li>`).join('');
    ul.addEventListener('click', (ev) => {
      const b = ev.target.closest('button');
      const li = b && b.closest('[data-estilo]');
      if (!li) return;
      const id = li.dataset.estilo;
      estado.gustos = estado.gustos.includes(id) ? estado.gustos.filter((g) => g !== id) : estado.gustos.concat(id);
      guardar();
      refrescarEstilos();
      pintarResumen();
    });
  }

  function coinciden(bpm) { return Number.isFinite(bpm) ? ESTILOS.filter((e) => bpm >= e.bpm[0] && bpm <= e.bpm[1]) : []; }

  function refrescarEstilos() {
    const bpm = estado.bpm;
    const dentro = bpm != null && bpm >= ESCALA[0] && bpm <= ESCALA[1];
    const ok = new Set(coinciden(bpm).map((e) => e.id));
    $$('#estilos-lista [data-estilo]').forEach((li) => {
      const id = li.dataset.estilo;
      const gusta = estado.gustos.includes(id);
      li.classList.toggle('gusta', gusta);
      const b = $('button', li);
      if (b) b.setAttribute('aria-pressed', String(gusta));
      const m = $('.marca-bpm', li);
      if (m) { m.hidden = !dentro; if (dentro) m.style.left = pos(bpm) + '%'; }
      const c = $('.estilo-coincide', li);
      if (c) c.hidden = !ok.has(id);
    });
    const vos = $('#eje .eje-vos');
    if (vos) { vos.hidden = !dentro; if (dentro) { vos.style.left = pos(bpm) + '%'; vos.textContent = 'vos ' + bpm; } }
  }

  // ── medidor de tempo ──
  let golpes = [];
  let ultimaTecla = 0;
  function golpe() {
    const ahora = performance.now();
    if (golpes.length && ahora - golpes[golpes.length - 1] > 2000) golpes = [];
    golpes.push(ahora);
    if (golpes.length > 16) golpes.shift();
    const b = $('#tap');
    if (b) { b.classList.remove('golpe'); void b.offsetWidth; b.classList.add('golpe'); }
    if (golpes.length >= 2) {
      const prom = (golpes[golpes.length - 1] - golpes[0]) / (golpes.length - 1);
      const bpm = Math.round(60000 / prom);
      if (bpm >= 40 && bpm <= 260) estado.bpm = bpm;
    }
    refrescarTap();
    refrescarEstilos();
    pintarResumen();
    guardar();
  }

  function refrescarTap() {
    const n = golpes.length;
    const bpm = estado.bpm;
    const out = $('#tap-bpm');
    if (out) { out.textContent = bpm ? String(bpm) : '000'; out.classList.toggle('vacio', !bpm); }
    const est = $('#tap-estado');
    if (est) {
      if (n === 0) est.textContent = bpm ? 'Tu última medición. Tocá de nuevo para medir otro tema.' : 'Tocá por lo menos 4 veces seguidas.';
      else if (n < 4) est.textContent = `${n} ${n === 1 ? 'golpe' : 'golpes'} · seguí tocando…`;
      else est.textContent = `${n} golpes · cuanto más tocás, más preciso`;
    }
    const re = $('#tap-reiniciar');
    if (re) re.hidden = !bpm && !n;
    const co = $('#tap-coinciden');
    if (co) {
      const c = coinciden(bpm);
      if (!bpm) co.textContent = '';
      else if (c.length) co.innerHTML = `A ${bpm} BPM suenan: ${c.map((e) => `<b>${esc(e.nombre)}</b>`).join(', ')}.`;
      else co.textContent = bpm < ESCALA[0] ? 'Es más lento que los estilos de la lista: probá contar el doble.' : 'Es más rápido que los estilos de la lista.';
    }
  }

  function pintarTap() {
    const b = $('#tap');
    if (!b) return;
    b.addEventListener('pointerdown', (e) => { if (e.button === 0 || e.pointerType !== 'mouse') golpe(); });
    b.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); if (!e.repeat) { ultimaTecla = performance.now(); golpe(); } }
    });
    // lectores de pantalla activan con un click sin puntero (detail 0)
    b.addEventListener('click', (e) => { if (e.detail === 0 && performance.now() - ultimaTecla > 400) golpe(); });
    const r = $('#tap-reiniciar');
    // al reiniciar, el foco vuelve al botón grande (este botón se oculta)
    if (r) r.addEventListener('click', () => { golpes = []; estado.bpm = null; guardar(); refrescarTap(); refrescarEstilos(); pintarResumen(); b.focus(); });
  }

  // ── curva de un set (SVG a escala) ──
  function curvaSuave(pts) {
    let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += `C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
    }
    return d;
  }

  function pintarSet() {
    const S = D.set || {};
    const cont = $('#set-grafico');
    const bloque = $('#set');
    const curva = lista(S.curva).filter((p) => Array.isArray(p) && Number.isFinite(p[0]) && Number.isFinite(p[1]));
    if (!cont || curva.length < 2) { if (bloque) bloque.hidden = true; return; }
    const dur = num(S.duracion, curva[curva.length - 1][0]) || 120;
    const rango = Array.isArray(S.bpm) && S.bpm.length === 2 ? S.bpm : [120, 136];
    const W = Math.max(280, Math.round(cont.clientWidth || 640));
    const H = W < 560 ? 240 : 300;
    const m = { l: 34, r: 10, t: 24, b: 28 };
    const x = (v) => m.l + (v / dur) * (W - m.l - m.r);
    const y = (v) => m.t + (1 - (v - rango[0]) / (rango[1] - rango[0])) * (H - m.t - m.b);
    const fases = lista(S.fases).filter((f) => f && Number.isFinite(f.desde) && Number.isFinite(f.hasta));
    let s = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" aria-hidden="true" focusable="false">`;
    s += `<defs><linearGradient id="set-area" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="var(--acento)" stop-opacity=".45"/><stop offset="1" stop-color="var(--acento)" stop-opacity="0"/></linearGradient></defs>`;
    fases.forEach((f, i) => {
      const x0 = x(f.desde), x1 = x(f.hasta);
      s += `<rect class="${i % 2 ? 'g-banda-b' : 'g-banda-a'}" x="${x0.toFixed(1)}" y="${m.t}" width="${(x1 - x0).toFixed(1)}" height="${H - m.t - m.b}"/>`;
      const etq = `${i + 1} ${txt(f.nombre)}`;
      const cabe = etq.length * 7.4 + 12 < x1 - x0;
      s += `<text class="g-fase" x="${(x0 + 7).toFixed(1)}" y="${m.t + 17}">${esc(cabe ? etq : String(i + 1))}</text>`;
    });
    for (let v = rango[0]; v <= rango[1]; v += 4) {
      s += `<line class="g-grilla" x1="${m.l}" x2="${W - m.r}" y1="${y(v).toFixed(1)}" y2="${y(v).toFixed(1)}"/>`;
      s += `<text class="g-texto" x="${m.l - 6}" y="${(y(v) + 4).toFixed(1)}" text-anchor="end">${v}</text>`;
    }
    for (let v = 0; v <= dur; v += 30) {
      const xx = x(v);
      s += `<line class="g-eje" x1="${xx.toFixed(1)}" x2="${xx.toFixed(1)}" y1="${H - m.b}" y2="${H - m.b + 5}"/>`;
      const anc = v === 0 ? 'start' : v >= dur ? 'end' : 'middle';
      s += `<text class="g-texto" x="${xx.toFixed(1)}" y="${H - 6}" text-anchor="${anc}">${v === dur ? v + ' min' : v}</text>`;
    }
    s += `<line class="g-eje" x1="${m.l}" x2="${W - m.r}" y1="${H - m.b}" y2="${H - m.b}"/>`;
    const pts = curva.map((p) => [x(p[0]), y(p[1])]);
    const d = curvaSuave(pts);
    s += `<path class="g-area" fill="url(#set-area)" d="${d}L${x(curva[curva.length - 1][0]).toFixed(1)} ${H - m.b}L${x(curva[0][0]).toFixed(1)} ${H - m.b}Z"/>`;
    s += `<path class="g-curva" d="${d}"/>`;
    const pico = curva.reduce((a, b) => (b[1] > a[1] ? b : a));
    const px = x(pico[0]), py = y(pico[1]);
    s += `<circle class="g-punto" cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="5"/>`;
    s += `<text class="g-pico" x="${(px - 9).toFixed(1)}" y="${(py - 7).toFixed(1)}" text-anchor="end">~${Math.round(pico[1])} BPM</text>`;
    s += `<text class="g-texto" x="${m.l - 6}" y="${m.t - 9}" text-anchor="end">BPM</text>`;
    s += '</svg>';
    cont.innerHTML = s;
    const ol = $('#fases');
    if (ol) {
      ol.innerHTML = fases.map((f) => {
        const tramo = curva.filter((p) => p[0] >= f.desde && p[0] <= f.hasta).map((p) => p[1]);
        const bpm = tramo.length ? `${Math.round(Math.min(...tramo))}–${Math.round(Math.max(...tramo))} BPM` : '';
        return `<li class="fase"><p class="fase-nombre">${esc(f.nombre)}</p><p class="fase-datos">min ${f.desde}–${f.hasta}${bpm ? ' · ' + bpm : ''}</p><p>${esc(f.texto)}</p></li>`;
      }).join('');
    }
  }

  // ── visuales LED ──
  function pintarVisuales() {
    const ul = $('#leds');
    const vis = VISUALES;
    if (!ul || !vis.length) { const s = $('#visuales'); if (s) s.hidden = true; return; }
    ul.innerHTML = vis.map((v) => `
      <li class="led-item" data-led="${esc(v.id)}">
        <div class="led"><canvas role="img" aria-label="Vista previa del visual ${esc(v.nombre)} con tu logo"></canvas><div class="led-logo"></div></div>
        <div class="led-pie">
          <div class="led-pie-texto"><h3>${esc(v.nombre)}</h3><p>${esc(v.texto)}</p></div>
          <button type="button" class="boton boton-chico" aria-pressed="false" aria-label="Me gusta el visual ${esc(v.nombre)}">${CORAZON}Me gusta</button>
        </div>
      </li>`).join('');
    // «Me gusta» en los visuales: puede marcar más de uno
    ul.addEventListener('click', (ev) => {
      const b = ev.target.closest('button');
      const li = b && b.closest('[data-led]');
      if (!li) return;
      const id = li.dataset.led;
      estado.visuales = estado.visuales.includes(id) ? estado.visuales.filter((g) => g !== id) : estado.visuales.concat(id);
      guardar();
      refrescarGustosVisuales();
      pintarResumen();
    });
    refrescarGustosVisuales();
    if (!V) return;
    $$('[data-led]', ul).forEach((li, i) => {
      const cv = $('canvas', li);
      V.registrar(V.crearLed(cv, li.dataset.led, { paleta }), i * 3.7);
    });
  }

  function refrescarGustosVisuales() {
    $$('#leds [data-led]').forEach((li) => {
      const gusta = estado.visuales.includes(li.dataset.led);
      li.classList.toggle('gusta', gusta);
      const b = $('.led-pie button', li);
      if (b) b.setAttribute('aria-pressed', String(gusta));
    });
  }

  function refrescarVisuales() {
    const id = logoVisible();
    $$('#leds [data-led]').forEach((li) => {
      const c = $('.led-logo', li);
      if (c) c.innerHTML = dibujarLogo(id, { borde: true });
    });
  }

  // ── redes (maquetas) ──
  function pintarRedes() {
    const cont = $('#mocks');
    if (!cont) return;
    const R = D.redes || {};
    const H = R.historia || {};
    const P = R.post || {};
    const F = R.perfil || {};
    const usuario = txt(D.usuario) || txt(D.handle).replace(/^@/, '') || NOMBRE.toLowerCase();
    cont.innerHTML = `
      <figure class="mock mock-perfil">
        <div class="perfil">
          <div class="perfil-cabeza">
            <div class="perfil-avatar"><div class="avatar" data-mock="avatar"></div></div>
            <div class="perfil-datos">
              <p class="perfil-usuario">${esc(usuario)}</p>
              <p class="perfil-nombre">${esc(NOMBRE)}</p>
              <p class="perfil-cat">${esc(F.categoria || 'DJ')}</p>
              <p class="perfil-bio">${esc(F.bio)}</p>
            </div>
          </div>
          <div class="perfil-botones" aria-hidden="true"><span>Seguir</span><span>Mensaje</span></div>
          <div class="perfil-grilla" aria-hidden="true">
            <div class="tesela tesela-pelicula" data-mock="marca"></div>
            <div class="tesela tesela-fecha"><span>${esc(P.dia || '')}</span><b>${esc(P.fecha || '')}</b><span>${esc(GENERO)}</span></div>
            <div class="tesela tesela-negra" data-mock="nombre"></div>
          </div>
        </div>
        <figcaption><b>Perfil</b> · maqueta, no es una captura real</figcaption>
      </figure>
      <figure class="mock mock-historia">
        <div class="historia">
          <canvas aria-hidden="true"></canvas>
          <div class="h-capa">
            <div><div class="h-barras" aria-hidden="true"><span></span><span></span></div>
              <div class="h-top"><div class="avatar" data-mock="avatar-chico"></div>${esc(usuario)}</div></div>
            <div></div>
            <div class="h-cuerpo">
              <p class="h-arriba">${esc(H.arriba)}</p>
              <div class="h-logo" data-mock="logo"></div>
              <p class="h-fecha">${esc(H.fecha)}</p>
              <p class="h-lugar">${esc(H.lugar)}</p>
            </div>
          </div>
        </div>
        <figcaption><b>Historia 9:16</b> · maqueta</figcaption>
      </figure>
      <figure class="mock mock-post">
        <div class="post">
          <svg class="post-lineas" viewBox="0 0 400 500" preserveAspectRatio="none" aria-hidden="true" focusable="false">${lineasFlyer()}</svg>
          <div class="post-capa">
            <div class="post-arriba"><span>${esc(P.dia)}</span><b>${esc(P.fecha)}</b></div>
            <div class="post-logo" data-mock="logo"></div>
            <div class="post-pie"><p class="post-genero">${esc(P.genero || GENERO.toUpperCase())}</p><p class="post-lugar">${esc(P.pie)}</p></div>
          </div>
        </div>
        <figcaption><b>Post 4:5</b> · flyer de ejemplo</figcaption>
      </figure>`;
    pintarHistoria();
  }

  function lineasFlyer() {
    let s = '<defs><linearGradient id="flyer-l" x1="0" x2="0" y1="1" y2="0"><stop offset="0" stop-color="var(--acento)" stop-opacity=".9"/><stop offset="1" stop-color="var(--acento-2)" stop-opacity="0"/></linearGradient>' +
      '<radialGradient id="flyer-r" cx=".5" cy="1" r=".75"><stop offset="0" stop-color="var(--acento)" stop-opacity=".45"/><stop offset="1" stop-color="var(--acento)" stop-opacity="0"/></radialGradient></defs>';
    s += '<rect width="400" height="500" fill="url(#flyer-r)"/>';
    for (let i = 0; i <= 16; i++) {
      const xx = -120 + i * 40;
      s += `<line x1="200" y1="560" x2="${xx}" y2="-20" stroke="url(#flyer-l)" stroke-width="1"/>`;
    }
    return s;
  }

  let peliculaHistoria = null;
  function pintarHistoria() {
    const cv = $('#mocks .historia canvas');
    if (!cv || !V) return;
    if (!peliculaHistoria || peliculaHistoria.canvas !== cv) peliculaHistoria = V.crearPelicula(cv, { modo: '2d', centro: [0.5, 0.62], max2d: 100, paleta });
    try { peliculaHistoria.medir(); peliculaHistoria.dibujar(22); } catch (e) { /* sin canvas */ }
  }

  function refrescarRedes() {
    const id = logoVisible();
    $$('#mocks [data-mock]').forEach((el) => {
      const tipo = el.dataset.mock;
      el.dataset.forma = id;
      if (tipo === 'avatar' || tipo === 'avatar-chico') el.innerHTML = dibujarLogo(id, { forma: 'marca' });
      else if (tipo === 'marca') el.innerHTML = dibujarLogo(id, { forma: 'marca', variante: 'blanco', borde: true });
      else if (tipo === 'nombre') el.innerHTML = dibujarLogo(id);
      else el.innerHTML = dibujarLogo(id, { borde: true });
    });
  }

  // ── fechas ──
  function hoyBA() {
    try {
      const partes = new Intl.DateTimeFormat('en-CA', { timeZone: ZONA, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
      const v = (t) => (partes.find((p) => p.type === t) || {}).value;
      return `${v('year')}-${v('month')}-${v('day')}`;
    } catch (e) {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }
  }
  const diasEntre = (a, b) => Math.round((Date.parse(b + 'T00:00:00Z') - Date.parse(a + 'T00:00:00Z')) / 86400000);
  const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const DIAS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];

  function enlaceAgenda(f) {
    const ini = f.fecha.replace(/-/g, '');
    const fin = new Date(Date.parse(f.fecha + 'T00:00:00Z') + 86400000).toISOString().slice(0, 10).replace(/-/g, '');
    const titulo = [NOMBRE, f.evento || `Set de ${GENERO.toLowerCase()}`].filter(Boolean).join(' · ');
    const detalle = [txt(f.detalle), f.lugar ? txt(f.lugar) : ''].filter(Boolean).join(' · ');
    return 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent(titulo) +
      `&dates=${ini}/${fin}` + (detalle ? '&details=' + encodeURIComponent(detalle) : '');
  }

  function itemFecha(f, hoy, proxima) {
    const d = new Date(Date.parse(f.fecha + 'T12:00:00Z'));
    const faltan = diasEntre(hoy, f.fecha);
    const cuenta = !proxima ? '' : faltan === 0 ? 'Hoy' : faltan === 1 ? 'Mañana' : `Faltan ${faltan} días`;
    return `
      <li class="fecha${proxima ? ' proxima' : ''}">
        <div class="fecha-dia" aria-hidden="true"><span class="fecha-sem">${DIAS[d.getUTCDay()]}</span><span class="fecha-num">${d.getUTCDate()}</span><span class="fecha-mes">${MESES[d.getUTCMonth()]}</span></div>
        <div class="fecha-info"><p class="fecha-texto">${esc(f.texto || f.fecha)}</p><p class="fecha-detalle">${esc(f.detalle)}</p></div>
        <div class="fecha-acciones">${cuenta ? `<span class="cuenta">${esc(cuenta)}</span>` : ''}${proxima ? `<a class="boton boton-chico" href="${esc(enlaceAgenda(f))}" target="_blank" rel="noopener noreferrer">Agendar <span aria-hidden="true">↗</span></a>` : ''}</div>
      </li>`;
  }

  function pintarFechas() {
    const todas = lista(camino(D, 'fechas.lista')).filter((f) => f && /^\d{4}-\d{2}-\d{2}$/.test(txt(f.fecha))).sort((a, b) => a.fecha.localeCompare(b.fecha));
    const hoy = hoyBA();
    const prox = todas.filter((f) => f.fecha >= hoy);
    const pas = todas.filter((f) => f.fecha < hoy).reverse();
    const cp = $('#fechas-proximas'), cpa = $('#fechas-pasadas');
    if (cp) cp.innerHTML = `<h3 class="fechas-titulo">Próximas</h3>` + (prox.length ? `<ul class="fechas-lista">${prox.map((f) => itemFecha(f, hoy, true)).join('')}</ul>` : '<p class="fechas-lista bajada">Por ahora no hay fechas cargadas.</p>');
    if (cpa) { cpa.hidden = !pas.length; cpa.innerHTML = pas.length ? `<h3 class="fechas-titulo">Pasadas</h3><ul class="fechas-lista">${pas.map((f) => itemFecha(f, hoy, false)).join('')}</ul>` : ''; }
    const ojo = $('#fechas-ojo');
    if (ojo) ojo.textContent = prox.length ? `${prox.length} ${prox.length === 1 ? 'próxima' : 'próximas'} · hora de Buenos Aires` : 'Hora de Buenos Aires';
  }

  // ── bio ──
  function pintarBio() {
    const t = $('#bio-texto');
    const parrafos = lista(camino(D, 'bio.texto')).filter((p) => typeof p === 'string' && p.trim());
    if (t) t.innerHTML = parrafos.map((p) => `<p>${esc(p)}</p>`).join('');
    const form = $('#preguntas');
    if (!form) return;
    if (!PREGUNTAS.length) { form.hidden = true; return; }
    form.innerHTML = PREGUNTAS.map((p) => `
      <div class="pregunta">
        <label for="resp-${esc(p.id)}">${esc(p.texto)}</label>
        <textarea id="resp-${esc(p.id)}" name="${esc(p.id)}" rows="2" maxlength="600" placeholder="Escribí lo que quieras, aunque sea corto"></textarea>
      </div>`).join('');
    PREGUNTAS.forEach((p) => { const el = document.getElementById('resp-' + p.id); if (el) el.value = estado.respuestas[p.id] || ''; });
    form.addEventListener('submit', (e) => e.preventDefault());
    form.addEventListener('input', (e) => {
      const el = e.target;
      if (!el || !el.name) return;
      estado.respuestas[el.name] = el.value.slice(0, 600);
      guardar();
      pintarResumen();
    });
  }

  // ── tu elección ──
  function textoEleccion() {
    const info = estado.logo ? logoInfo(estado.logo) : null;
    const p = paleta();
    const gustos = ESTILOS.filter((e) => estado.gustos.includes(e.id)).map((e) => e.nombre);
    const visuales = nombresVisuales();
    const lineas = [
      txt(camino(D, 'eleccion.titulo')) || `Identidad ${NOMBRE} · mi elección`,
      'Logo: ' + (info ? `${txt(info.nombre)} · versión ${nombreVariante(varianteDe(info.id))}` : 'todavía no elegí'),
      'Paleta: ' + (p ? txt(p.nombre) : 'todavía no elegí'),
      'Estilos para tocar: ' + (gustos.length ? gustos.join(', ') : 'todavía ninguno'),
      ...(VISUALES.length ? ['Visuales: ' + (visuales.length ? visuales.join(', ') : 'todavía ninguno')] : []),
      'Mis BPM: ' + (estado.bpm ? `${estado.bpm} (medidos con el tap)` : 'sin medir'),
    ];
    const resp = PREGUNTAS.filter((q) => txt(estado.respuestas[q.id]).trim());
    if (resp.length) {
      lineas.push('', 'Para la bio:');
      resp.forEach((q) => lineas.push(`${q.texto} ${txt(estado.respuestas[q.id]).trim()}`));
    }
    return lineas.join('\n');
  }

  function nombresVisuales() {
    return VISUALES.filter((v) => estado.visuales.includes(v.id)).map((v) => txt(v.nombre) || v.id);
  }

  function pintarResumen() {
    const info = estado.logo ? logoInfo(estado.logo) : null;
    const p = paleta();
    const gustos = ESTILOS.filter((e) => estado.gustos.includes(e.id)).map((e) => e.nombre);
    const visuales = nombresVisuales();
    const resp = PREGUNTAS.filter((q) => txt(estado.respuestas[q.id]).trim()).length;
    const fila = (dt, dd, pendiente) => `<div><dt>${esc(dt)}</dt><dd${pendiente ? ' class="pendiente"' : ''}>${esc(dd)}</dd></div>`;
    const dl = $('#resumen');
    if (dl) {
      dl.innerHTML =
        fila('Logo', info ? `${txt(info.nombre)} · versión ${nombreVariante(varianteDe(info.id))}` : `Todavía no elegiste (se ve ${txt(logoInfo(logoVisible()).nombre)})`, !info) +
        fila('Paleta', p ? txt(p.nombre) : '—', !p) +
        fila('Estilos', gustos.length ? gustos.join(', ') : 'Todavía ninguno', !gustos.length) +
        (VISUALES.length ? fila('Visuales', visuales.length ? visuales.join(', ') : 'Todavía ninguno', !visuales.length) : '') +
        fila('Tus BPM', estado.bpm ? `${estado.bpm} BPM` : 'Sin medir', !estado.bpm) +
        (PREGUNTAS.length ? fila('Bio', resp ? `${resp} de ${PREGUNTAS.length} respuestas` : 'Sin respuestas todavía', !resp) : '');
    }
    const logo = $('#eleccion-logo');
    if (logo) { logo.dataset.forma = logoVisible(); logo.innerHTML = `<div class="eleccion-dibujo">${dibujarLogo(logoVisible())}</div>`; }
    const texto = textoEleccion();
    const wa = $('#whatsapp');
    if (wa) wa.href = 'https://wa.me/?text=' + encodeURIComponent(texto);
    const ta = $('#copia-texto');
    if (ta) ta.value = texto;
  }

  function pintarEleccion() {
    const b = $('#copiar');
    if (!b) return;
    b.addEventListener('click', () => {
      const texto = textoEleccion();
      const estadoEl = $('#estado-copia');
      const respaldo = () => {
        const caja = $('#copia-respaldo');
        const ta = $('#copia-texto');
        if (caja) caja.hidden = false;
        if (ta) { ta.value = texto; ta.focus(); ta.select(); }
        if (estadoEl) estadoEl.textContent = 'No pude copiar solo: el texto quedó seleccionado abajo, copialo con Ctrl+C o manteniendo apretado.';
      };
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(texto).then(() => { if (estadoEl) estadoEl.textContent = 'Copiado. Pegalo en el chat con Pk.'; }, respaldo);
        } else respaldo();
      } catch (e) { respaldo(); }
    });
  }

  // ── índice: marca la sección visible ──
  function seguirIndice() {
    const enlaces = $$('.indice ul a');
    if (!('IntersectionObserver' in window) || !enlaces.length) return;
    const porId = new Map(enlaces.map((a) => [a.getAttribute('href').slice(1), a]));
    const io = new IntersectionObserver((entradas) => {
      entradas.forEach((en) => {
        if (!en.isIntersecting) return;
        enlaces.forEach((a) => a.removeAttribute('aria-current'));
        const a = porId.get(en.target.id);
        if (a) {
          a.setAttribute('aria-current', 'true');
          const ul = a.closest('ul');
          if (ul && ul.scrollWidth > ul.clientWidth) {
            const ra = a.getBoundingClientRect(), ru = ul.getBoundingClientRect();
            const fuera = ra.left < ru.left || ra.right > ru.right - 24;
            if (fuera) ul.scrollTo({ left: ul.scrollLeft + ra.left - ru.left - 8, behavior: V && V.pideQuieto() ? 'auto' : 'smooth' });
          }
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    porId.forEach((a, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
  }

  // ── todo lo que depende del logo elegido ──
  function refrescarLogos() {
    pintarPortada();
    refrescarTarjetas();
    pintarAvatares();
    refrescarLab();
    refrescarVisuales();
    refrescarRedes();
    pintarResumen();
  }

  // ── arranque ──
  function iniciar() {
    cargar();
    aplicarPaleta();
    llenarCampos();
    pintarPedido();
    pintarLogos();
    pintarPaletas();
    pintarLab();
    pintarPlaylist();
    pintarEstilos();
    pintarTap();
    pintarVisuales();
    pintarRedes();
    pintarFechas();
    pintarBio();
    pintarEleccion();
    refrescarPaletas();
    refrescarLogos();
    refrescarEstilos();
    refrescarTap();
    pintarSet();
    seguirIndice();
    if (V) {
      const lienzo = $('.portada-lienzo');
      if (lienzo) V.registrar(V.crearPelicula(lienzo, { paleta, centro: [0.45, 0.5], escala: 0.5 }));
      const portada = $('#portada');
      if (portada) V.registrar(movimientoPortada(portada));
    }
    // la curva del set se redibuja al cambiar de ancho
    if ('ResizeObserver' in window) {
      let ancho = 0;
      const cont = $('#set-grafico');
      if (cont) new ResizeObserver(() => { const w = Math.round(cont.clientWidth); if (Math.abs(w - ancho) > 8) { ancho = w; pintarSet(); } }).observe(cont);
    }
    // cuando cargan las fuentes, los SVG se reacomodan solos; el set mide texto, lo rehacemos
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { pintarSet(); }).catch(() => {});
  }

  try { iniciar(); } catch (e) {
    // si algo falla, que al menos se vea la portada
    if (window.console) console.warn('Identidad MADDA: no se pudo armar todo', e);
  }
})();
