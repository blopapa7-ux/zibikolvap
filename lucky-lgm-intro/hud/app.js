// Estudio del HUD: cambiar textos y números, ver cada pieza y bajarla en PNG.
// En modo "artifact" (la página publicada) el visor bloquea las descargas, así que
// se ocultan los botones y la imagen se guarda con clic derecho.
(function () {
  'use strict';

  const HUD = window.LuckyHUD;
  const MODO = window.HUD_MODO || 'local';
  const CLAVE = 'mision-corrientes-hud-v1:';
  const $ = (id) => document.getElementById(id);

  let presetId = 'lucky';
  let est = null;
  let elegida = 0;
  let generacion = 0;
  let urlGrande = null;
  const urlsMini = [];

  const grande = document.createElement('canvas');
  grande.width = HUD.W;
  grande.height = HUD.H;
  const mini = document.createElement('canvas');
  mini.width = HUD.W / 4;
  mini.height = HUD.H / 4;

  function cargar(id) {
    try {
      const s = JSON.parse(localStorage.getItem(CLAVE + id));
      if (s && s.datos && Array.isArray(s.piezas) && s.piezas.length === HUD.PRESETS[id].piezas.length) return s;
    } catch (e) {
      /* sin almacenamiento: se usa el preset */
    }
    return HUD.clonar(id);
  }

  function guardar() {
    try {
      localStorage.setItem(CLAVE + presetId, JSON.stringify(est));
    } catch (e) {
      /* sin almacenamiento: los cambios duran hasta recargar */
    }
  }

  function aBlob(canvas) {
    return new Promise((res) => canvas.toBlob(res, 'image/png'));
  }

  function pintar(canvas, i) {
    const g = canvas.getContext('2d');
    const k = canvas.width / HUD.W;
    g.setTransform(k, 0, 0, k, 0, 0);
    HUD.dibujar(g, est.piezas[i], est.datos);
    g.setTransform(1, 0, 0, 1, 0, 0);
  }

  async function mostrarGrande() {
    const gen = generacion;
    const i = elegida;
    pintar(grande, i);
    const blob = await aBlob(grande);
    if (gen !== generacion || i !== elegida) return;
    if (urlGrande) URL.revokeObjectURL(urlGrande);
    urlGrande = URL.createObjectURL(blob);
    $('est-img').src = urlGrande;
    $('est-img').alt = 'Vista previa de ' + est.piezas[i].archivo;
  }

  async function mostrarMini(i) {
    const gen = generacion;
    pintar(mini, i);
    const blob = await aBlob(mini);
    if (gen !== generacion) return;
    if (urlsMini[i]) URL.revokeObjectURL(urlsMini[i]);
    urlsMini[i] = URL.createObjectURL(blob);
    const img = document.querySelector(`#est-lista [data-i="${i}"] img`);
    if (img) img.src = urlsMini[i];
  }

  async function mostrarTodo() {
    generacion++;
    const gen = generacion;
    await mostrarGrande();
    for (let i = 0; i < est.piezas.length; i++) {
      if (gen !== generacion) return;
      await mostrarMini(i);
      await new Promise((r) => setTimeout(r, 0));
    }
  }

  let espera = null;
  function alCambiar(todas) {
    guardar();
    clearTimeout(espera);
    espera = setTimeout(() => {
      if (todas) mostrarTodo();
      else {
        mostrarGrande();
        mostrarMini(elegida);
      }
    }, 120);
  }

  function campo(id, etiqueta, valor, tipo, alGuardar, ayuda) {
    const envoltura = document.createElement('div');
    envoltura.className = 'est-campo';
    const label = document.createElement('label');
    label.htmlFor = id;
    label.textContent = etiqueta;
    let input;
    if (Array.isArray(tipo)) {
      input = document.createElement('select');
      tipo.forEach((op) => {
        const o = document.createElement('option');
        o.value = op;
        o.textContent = op;
        input.appendChild(o);
      });
      input.value = valor;
    } else if (tipo === 'si-no') {
      envoltura.classList.add('si-no');
      input = document.createElement('input');
      input.type = 'checkbox';
      input.checked = Boolean(valor);
    } else {
      input = document.createElement('input');
      input.type = tipo === 'numero' ? 'number' : 'text';
      input.value = valor;
      if (String(valor).length > 28) envoltura.classList.add('ancho');
    }
    input.id = id;
    input.addEventListener('input', () => {
      if (tipo === 'si-no') alGuardar(input.checked);
      else if (tipo === 'numero') alGuardar(input.value === '' ? 0 : Number(input.value));
      else alGuardar(input.value);
    });
    if (tipo === 'si-no') envoltura.append(input, label);
    else envoltura.append(label, input);
    if (ayuda) {
      envoltura.classList.add('ancho');
      const nota = document.createElement('small');
      nota.id = id + '-ayuda';
      nota.textContent = ayuda;
      input.setAttribute('aria-describedby', nota.id);
      envoltura.appendChild(nota);
    }
    return envoltura;
  }

  function armarDatos() {
    const cont = $('est-datos');
    cont.textContent = '';
    HUD.DATOS.forEach(([k, etiqueta]) => {
      cont.appendChild(
        campo('est-dato-' + k, etiqueta, est.datos[k], 'texto', (v) => {
          est.datos[k] = v;
          alCambiar(true);
        }),
      );
    });
  }

  function armarCampos() {
    const pieza = est.piezas[elegida];
    $('est-titulo').textContent = pieza.archivo.replace(/^\d+-/, '').replace(/-/g, ' ');
    $('est-toma').textContent = 'Toma ' + pieza.toma + ' · ' + pieza.tipo;
    $('est-archivo').textContent = pieza.archivo + '.png · 1080×1920';
    const cont = $('est-campos');
    cont.textContent = '';
    HUD.CAMPOS[pieza.tipo].forEach(([k, etiqueta, tipo, ayuda]) => {
      cont.appendChild(
        campo(
          'est-campo-' + k,
          etiqueta,
          pieza.p[k],
          tipo || 'texto',
          (v) => {
            pieza.p[k] = v;
            alCambiar(false);
          },
          ayuda,
        ),
      );
    });
  }

  function armarLista() {
    const cont = $('est-lista');
    cont.textContent = '';
    est.piezas.forEach((p, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'est-item';
      b.dataset.i = i;
      b.setAttribute('aria-current', String(i === elegida));
      b.innerHTML = '<div class="est-marco"><img alt=""></div><span class="est-item-toma"></span><span class="est-item-archivo"></span>';
      b.querySelector('.est-item-toma').textContent = p.toma;
      b.querySelector('.est-item-archivo').textContent = p.archivo;
      b.querySelector('img').alt = p.archivo;
      b.addEventListener('click', () => elegir(i));
      cont.appendChild(b);
    });
  }

  function elegir(i) {
    elegida = i;
    document.querySelectorAll('#est-lista .est-item').forEach((b) => b.setAttribute('aria-current', String(Number(b.dataset.i) === i)));
    armarCampos();
    mostrarGrande();
  }

  function cambiarPreset(id) {
    presetId = id;
    est = cargar(id);
    elegida = 0;
    document.querySelectorAll('[data-preset]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.preset === id)));
    urlsMini.forEach((u) => u && URL.revokeObjectURL(u));
    urlsMini.length = 0;
    armarDatos();
    armarLista();
    armarCampos();
    mostrarTodo();
  }

  function bajar(blob, nombre) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = nombre;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }

  // ZIP sin compresión: los PNG ya vienen comprimidos.
  const TABLA = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c >>> 0;
    }
    return t;
  })();

  function crc32(b) {
    let c = 0xffffffff;
    for (let i = 0; i < b.length; i++) c = TABLA[(c ^ b[i]) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  }

  function zip(archivos) {
    const enc = new TextEncoder();
    const partes = [];
    const central = [];
    let desplazamiento = 0;
    const fecha = ((2026 - 1980) << 9) | (10 << 5) | 11;
    const hora = 22 << 11;
    for (const a of archivos) {
      const nombre = enc.encode(a.nombre);
      const crc = crc32(a.datos);
      const n = a.datos.length;
      const local = new DataView(new ArrayBuffer(30));
      local.setUint32(0, 0x04034b50, true);
      local.setUint16(4, 20, true);
      local.setUint16(6, 0x0800, true);
      local.setUint16(10, hora, true);
      local.setUint16(12, fecha, true);
      local.setUint32(14, crc, true);
      local.setUint32(18, n, true);
      local.setUint32(22, n, true);
      local.setUint16(26, nombre.length, true);
      partes.push(new Uint8Array(local.buffer), nombre, a.datos);
      const cen = new DataView(new ArrayBuffer(46));
      cen.setUint32(0, 0x02014b50, true);
      cen.setUint16(4, 20, true);
      cen.setUint16(6, 20, true);
      cen.setUint16(8, 0x0800, true);
      cen.setUint16(12, hora, true);
      cen.setUint16(14, fecha, true);
      cen.setUint32(16, crc, true);
      cen.setUint32(20, n, true);
      cen.setUint32(24, n, true);
      cen.setUint16(28, nombre.length, true);
      cen.setUint32(42, desplazamiento, true);
      central.push(new Uint8Array(cen.buffer), nombre);
      desplazamiento += 30 + nombre.length + n;
    }
    const tamCentral = central.reduce((s, p) => s + p.length, 0);
    const fin = new DataView(new ArrayBuffer(22));
    fin.setUint32(0, 0x06054b50, true);
    fin.setUint16(8, archivos.length, true);
    fin.setUint16(10, archivos.length, true);
    fin.setUint32(12, tamCentral, true);
    fin.setUint32(16, desplazamiento, true);
    return new Blob([...partes, ...central, new Uint8Array(fin.buffer)], { type: 'application/zip' });
  }

  async function bajarTodo() {
    const boton = $('est-zip');
    const texto = boton.textContent;
    boton.disabled = true;
    const archivos = [];
    const c = document.createElement('canvas');
    c.width = HUD.W;
    c.height = HUD.H;
    for (let i = 0; i < est.piezas.length; i++) {
      boton.textContent = `Armando ${i + 1} de ${est.piezas.length}…`;
      pintar(c, i);
      const blob = await aBlob(c);
      archivos.push({ nombre: est.piezas[i].archivo + '.png', datos: new Uint8Array(await blob.arrayBuffer()) });
    }
    bajar(zip(archivos), 'hud-' + presetId + '.zip');
    boton.textContent = texto;
    boton.disabled = false;
  }

  function fondoDePrueba() {
    const c = document.createElement('canvas');
    c.width = HUD.W / 2;
    c.height = HUD.H / 2;
    const g = c.getContext('2d');
    g.scale(0.5, 0.5);
    HUD.fondoCiudad(g);
    g.fillStyle = 'rgba(0,0,0,.25)';
    g.fillRect(0, 0, HUD.W, HUD.H);
    $('estudio').style.setProperty('--est-fondo', `url(${c.toDataURL('image/jpeg', 0.82)})`);
  }

  function iniciar() {
    const local = MODO === 'local';
    document.querySelectorAll('[data-solo-local]').forEach((el) => (el.hidden = !local));
    document.querySelectorAll('[data-solo-artifact]').forEach((el) => (el.hidden = local));
    document.querySelectorAll('[data-preset]').forEach((b) => b.addEventListener('click', () => cambiarPreset(b.dataset.preset)));
    $('est-fondo').addEventListener('change', (e) => $('estudio').classList.toggle('con-fondo', e.target.checked));
    $('est-reset').addEventListener('click', () => {
      try {
        localStorage.removeItem(CLAVE + presetId);
      } catch (e) {
        /* nada que borrar */
      }
      cambiarPreset(presetId);
    });
    $('est-png').addEventListener('click', async () => {
      pintar(grande, elegida);
      bajar(await aBlob(grande), est.piezas[elegida].archivo + '.png');
    });
    $('est-zip').addEventListener('click', bajarTodo);
    fondoDePrueba();
    cambiarPreset('lucky');
  }

  HUD.fontsReady().then(iniciar);
})();
