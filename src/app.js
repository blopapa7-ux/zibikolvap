/* Estudio: edita los textos, suma fotos y exporta las piezas dibujadas por render.js. */
(function () {
  'use strict';
  const L = window.Legado;
  const $ = (sel) => document.querySelector(sel);
  const STORE_KEY = 'legado-jah-fabio:v1';
  const TEXT_FIELDS = ['phrase', 'reelPhrase', 'song', 'hashtag', 'cta'];
  const PREVIEW_SCALE = 0.5; // el reel se previsualiza a 540×960
  const FILES = { card: 'legado-jah-fabio-tarjeta.png', collage: 'legado-jah-fabio-collage.png' };
  const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const state = {
    kind: 'card',
    opts: Object.assign({}, L.DEFAULTS),
    photos: [null, null, null],
    playing: !reducedMotion,
    t: reducedMotion ? 5.6 : 0,
    last: 0,
    busy: false,
  };

  const canvas = $('#preview');
  const ctx = canvas.getContext('2d');
  const form = $('#form');

  // ── borrador local (solo comodidad de este navegador) ──
  try {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
    if (saved) {
      TEXT_FIELDS.forEach((k) => { if (typeof saved[k] === 'string') state.opts[k] = saved[k]; });
      if (typeof saved.cardPhotoBg === 'boolean') state.opts.cardPhotoBg = saved.cardPhotoBg;
    }
  } catch (e) { /* sin almacenamiento: se usan los textos por defecto */ }

  function persist() {
    try {
      const data = { cardPhotoBg: state.opts.cardPhotoBg };
      TEXT_FIELDS.forEach((k) => { data[k] = state.opts[k]; });
      localStorage.setItem(STORE_KEY, JSON.stringify(data));
    } catch (e) { /* ignorar */ }
  }

  function fillForm() {
    TEXT_FIELDS.forEach((k) => { form.elements[k].value = state.opts[k]; });
    form.elements.cardPhotoBg.checked = !!state.opts.cardPhotoBg;
  }

  function setStatus(msg) { $('#status').textContent = msg || ''; }

  // ── dibujo ──
  function sizeFor(kind) {
    const s = L.SIZES[kind];
    return kind === 'reel' ? { w: s.w * PREVIEW_SCALE, h: s.h * PREVIEW_SCALE } : s;
  }

  function setupCanvas() {
    const { w, h } = sizeFor(state.kind);
    canvas.width = w;
    canvas.height = h;
    $('#frame').style.setProperty('--ar', String(w / h));
    $('#player').style.setProperty('--ar', String(w / h));
  }

  function drawStill() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (state.kind === 'card') L.drawCard(ctx, state.opts, state.photos);
    else L.drawCollage(ctx, state.opts, state.photos);
  }

  function drawReel() {
    ctx.setTransform(PREVIEW_SCALE, 0, 0, PREVIEW_SCALE, 0, 0);
    L.drawReelFrame(ctx, state.t, state.opts, state.photos);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const dur = L.reelDuration(state.opts);
    $('#scrub').value = String(Math.round((state.t / dur) * 1000));
    $('#time').textContent = state.t.toFixed(1) + ' s';
  }

  function draw() {
    if (state.kind === 'reel') drawReel();
    else drawStill();
  }

  function loop(now) {
    if (state.kind === 'reel' && state.playing && !state.busy) {
      const dt = state.last ? (now - state.last) / 1000 : 0;
      const dur = L.reelDuration(state.opts);
      state.t = (state.t + Math.min(dt, 0.1)) % dur;
      drawReel();
    }
    state.last = now;
    requestAnimationFrame(loop);
  }

  // ── pestañas ──
  function selectKind(kind, focus) {
    state.kind = kind;
    document.querySelectorAll('.tabs [role="tab"]').forEach((b) => {
      const on = b.dataset.kind === kind;
      b.setAttribute('aria-selected', String(on));
      b.tabIndex = on ? 0 : -1;
      if (on && focus) b.focus();
    });
    document.querySelectorAll('[data-for]').forEach((el) => {
      el.hidden = !el.dataset.for.split(' ').includes(kind);
    });
    $('#player').hidden = kind !== 'reel';
    $('#fallback').hidden = true;
    setStatus('');
    setupCanvas();
    draw();
    const anchor = { card: 'tarjeta', collage: 'collage', reel: 'reel' }[kind];
    try { history.replaceState(null, '', '#' + anchor); } catch (e) { /* ignorar */ }
  }

  const tabs = [...document.querySelectorAll('.tabs [role="tab"]')];
  tabs.forEach((b, i) => {
    b.addEventListener('click', () => selectKind(b.dataset.kind));
    b.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
      selectKind(next.dataset.kind, true);
    });
  });

  // ── formulario ──
  let pending = 0;
  form.addEventListener('input', (e) => {
    const el = e.target;
    if (TEXT_FIELDS.includes(el.name)) state.opts[el.name] = el.value;
    if (el.name === 'cardPhotoBg') state.opts.cardPhotoBg = el.checked;
    if (!state.opts.hashtag.trim()) state.opts.hashtag = L.DEFAULTS.hashtag;
    persist();
    cancelAnimationFrame(pending);
    pending = requestAnimationFrame(() => {
      if (state.kind === 'reel') state.t = Math.min(state.t, L.reelDuration(state.opts) - 0.01);
      draw();
    });
  });
  form.addEventListener('submit', (e) => e.preventDefault());

  $('#reset').addEventListener('click', () => {
    TEXT_FIELDS.forEach((k) => { state.opts[k] = L.DEFAULTS[k]; });
    state.opts.cardPhotoBg = false;
    fillForm();
    persist();
    draw();
    setStatus('Textos restaurados.');
  });

  // ── fotos ──
  function loadPhoto(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const max = 1600;
        const s = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
        const c = document.createElement('canvas');
        c.width = Math.max(1, Math.round(img.naturalWidth * s));
        c.height = Math.max(1, Math.round(img.naturalHeight * s));
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        c.dataset.thumb = c.toDataURL('image/jpeg', 0.7);
        URL.revokeObjectURL(url);
        resolve(c);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('No se pudo leer la imagen'));
      };
      img.src = url;
    });
  }

  function renderSlots() {
    const wrap = $('#slots');
    wrap.textContent = '';
    state.photos.forEach((p, i) => {
      const slot = document.createElement('div');
      slot.className = 'slot';
      if (p) {
        const img = document.createElement('img');
        img.src = p.dataset.thumb;
        img.alt = 'Foto ' + (i + 1);
        const rm = document.createElement('button');
        rm.type = 'button';
        rm.textContent = 'Quitar';
        rm.setAttribute('aria-label', 'Quitar foto ' + (i + 1));
        rm.addEventListener('click', () => {
          state.photos[i] = null;
          renderSlots();
          draw();
        });
        slot.append(img, rm);
      } else {
        slot.textContent = 'Foto ' + (i + 1);
      }
      wrap.append(slot);
    });
  }

  $('#photoInput').addEventListener('change', async (e) => {
    const files = [...e.target.files];
    e.target.value = '';
    for (const file of files) {
      let idx = state.photos.findIndex((p) => !p);
      if (idx === -1) idx = state.photos.length - 1;
      try {
        state.photos[idx] = await loadPhoto(file);
      } catch (err) {
        setStatus('No pude abrir una de las fotos. Probá con JPG o PNG.');
      }
    }
    renderSlots();
    draw();
  });

  // ── descargas ──
  let downloadsCap = null;
  function getDownloads() {
    if (!downloadsCap) {
      downloadsCap = window.claude && typeof window.claude.use === 'function'
        ? window.claude.use('downloads').catch(() => null)
        : Promise.resolve(null);
    }
    return downloadsCap;
  }
  getDownloads();

  function showFallback(blob, isVideo) {
    const url = URL.createObjectURL(blob);
    const img = $('#fallbackImg'), vid = $('#fallbackVideo');
    img.hidden = isVideo;
    vid.hidden = !isVideo;
    if (isVideo) vid.src = url; else img.src = url;
    $('#fallback').hidden = false;
  }

  async function offer(filename, blob) {
    const dl = await getDownloads();
    if (dl) {
      try {
        const res = await dl.save({ filename, data: blob });
        setStatus(res && res.status === 'delivered' ? '' : 'Listo: ' + filename);
        return;
      } catch (err) {
        const code = err && err.code;
        if (code === 'declined') return setStatus('Descarga cancelada.');
        if (code === 'rate_limited') return setStatus('Ya hay una descarga esperando tu confirmación.');
      }
    }
    setStatus('');
    showFallback(blob, /\.(mp4|webm)$/.test(filename));
  }

  function setBusy(on) {
    state.busy = on;
    document.querySelectorAll('.actions button, .tabs button').forEach((b) => { b.disabled = on; });
  }

  $('#savePng').addEventListener('click', async () => {
    const kind = state.kind;
    const { w, h } = L.SIZES[kind];
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const g = c.getContext('2d');
    if (kind === 'card') L.drawCard(g, state.opts, state.photos);
    else L.drawCollage(g, state.opts, state.photos);
    const blob = await new Promise((r) => c.toBlob(r, 'image/png'));
    if (blob) offer(FILES[kind], blob);
    else setStatus('No se pudo generar la imagen.');
  });

  function pickMime() {
    if (typeof MediaRecorder === 'undefined') return null;
    const list = ['video/mp4;codecs=avc1.640028', 'video/mp4;codecs=avc1.42E01E', 'video/mp4;codecs=avc1', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];
    return list.find((m) => { try { return MediaRecorder.isTypeSupported(m); } catch (e) { return false; } }) || null;
  }

  $('#record').addEventListener('click', async () => {
    const mime = pickMime();
    if (!mime || !canvas.captureStream) {
      setStatus('Este navegador no puede grabar video. Usá el botón «Reel listo en MP4».');
      return;
    }
    setBusy(true);
    const { w, h } = L.SIZES.reel;
    canvas.width = w;
    canvas.height = h;
    const dur = L.reelDuration(state.opts);
    let rec;
    try {
      const stream = canvas.captureStream(30);
      rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 12000000 });
    } catch (err) {
      setBusy(false);
      setupCanvas();
      draw();
      setStatus('No se pudo iniciar la grabación en este navegador.');
      return;
    }
    const chunks = [];
    rec.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };
    const stopped = new Promise((r) => { rec.onstop = r; });
    L.drawReelFrame(ctx, 0, state.opts, state.photos);
    rec.start(250);
    const t0 = performance.now();
    await new Promise((resolve) => {
      const tick = (now) => {
        const t = (now - t0) / 1000;
        L.drawReelFrame(ctx, Math.min(t, dur - 0.001), state.opts, state.photos);
        setStatus('Grabando… ' + Math.min(t, dur).toFixed(0) + ' de ' + dur.toFixed(0) + ' s. Dejá esta pantalla abierta.');
        if (t < dur) requestAnimationFrame(tick);
        else resolve();
      };
      requestAnimationFrame(tick);
    });
    rec.stop();
    await stopped;
    setBusy(false);
    setupCanvas();
    draw();
    const type = mime.split(';')[0];
    const blob = new Blob(chunks, { type });
    if (!blob.size) return setStatus('La grabación salió vacía. Probá de nuevo o usá el MP4 listo.');
    setStatus('Video listo.');
    offer('legado-jah-fabio-reel.' + (type === 'video/mp4' ? 'mp4' : 'webm'), blob);
  });

  $('#readyMp4').addEventListener('click', async () => {
    setStatus('Preparando el MP4…');
    try {
      const res = await fetch('media/03-reel.mp4');
      if (!res.ok) throw new Error(String(res.status));
      offer('legado-jah-fabio-reel.mp4', await res.blob());
    } catch (err) {
      setStatus('No encontré el MP4 listo en esta página.');
    }
  });

  // ── reproductor ──
  $('#play').addEventListener('click', () => {
    state.playing = !state.playing;
    $('#play').textContent = state.playing ? 'Pausar' : 'Reproducir';
  });
  $('#scrub').addEventListener('input', (e) => {
    state.playing = false;
    $('#play').textContent = 'Reproducir';
    state.t = (Number(e.target.value) / 1000) * (L.reelDuration(state.opts) - 0.01);
    drawReel();
  });
  $('#play').textContent = state.playing ? 'Pausar' : 'Reproducir';

  // ── inicio ──
  fillForm();
  renderSlots();
  const fromHash = { '#collage': 'collage', '#reel': 'reel', '#tarjeta': 'card' }[location.hash];
  selectKind(fromHash || 'card');
  L.fontsReady().then(() => {
    draw();
    requestAnimationFrame(loop);
  });
})();
