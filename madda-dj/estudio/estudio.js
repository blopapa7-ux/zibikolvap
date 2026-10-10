// Estudio MADDA: los datos se meten en vivo en cada prompt, copiar, marcar hechos, filtros y búsqueda.
(function () {
  'use strict';

  const CONF = window.MADDA_ESTUDIO || { campos: [], paletas: [] };
  const CLAVE = 'madda-estudio:v1';
  const HEX = /^#[0-9a-f]{6}$/i;
  const POR_DEFECTO = Object.fromEntries(CONF.campos.map((c) => [c.token, c.valor]));
  const COLORES = CONF.campos.filter((c) => c.tipo === 'color').map((c) => c.token);
  const $ = (sel, raiz) => (raiz || document).querySelector(sel);
  const $$ = (sel, raiz) => Array.from((raiz || document).querySelectorAll(sel));

  /* ── guardado: puede no haber localStorage (modo privado, vista previa) ── */

  function leerGuardado() {
    try {
      return JSON.parse(localStorage.getItem(CLAVE) || '{}') || {};
    } catch (e) {
      return {};
    }
  }

  function guardar() {
    try {
      localStorage.setItem(CLAVE, JSON.stringify({ datos: estado.datos, auto: estado.auto, hechos: Array.from(estado.hechos) }));
    } catch (e) {
      /* sin guardado: el estudio sigue andando igual */
    }
  }

  // solo tokens conocidos y colores válidos
  function limpiar(datos) {
    const ok = {};
    if (!datos || typeof datos !== 'object') return ok;
    Object.keys(POR_DEFECTO).forEach((tk) => {
      const v = datos[tk];
      if (typeof v !== 'string') return;
      if (COLORES.includes(tk) && !HEX.test(v)) return;
      ok[tk] = v;
    });
    return ok;
  }

  const guardado = leerGuardado();
  const estado = {
    datos: Object.assign({}, POR_DEFECTO, limpiar(guardado.datos)),
    auto: guardado.auto !== false,
    hechos: new Set(Array.isArray(guardado.hechos) ? guardado.hechos.filter((h) => typeof h === 'string') : []),
    filtro: 'todo',
    busqueda: '',
  };

  /* ── datos → prompts ── */

  // "MADDA" → "M-A-D-D-A"; las palabras quedan separadas por un espacio
  function deletrear(nombre) {
    return nombre.trim().split(/\s+/).filter(Boolean).map((p) => Array.from(p).join('-')).join(' ');
  }

  const spans = {};
  $$('.tk[data-tk]').forEach((s) => (spans[s.dataset.tk] = spans[s.dataset.tk] || []).push(s));

  function pintarToken(tk) {
    const v = (estado.datos[tk] || '').trim();
    (spans[tk] || []).forEach((s) => {
      s.textContent = v || '{{' + tk + '}}';
      s.classList.toggle('vacio', !v);
      if (s.classList.contains('tk-color')) s.style.setProperty('--sw', HEX.test(v) ? v : 'transparent');
    });
  }

  function pintarMuestra() {
    const d = estado.datos;
    $$('.muestra').forEach((m) => {
      m.style.setProperty('--m1', d.C1);
      m.style.setProperty('--m2', d.C2);
      m.style.setProperty('--m3', d.C3);
      m.style.setProperty('--mf', d.FONDO);
    });
    $$('[data-muestra]').forEach((el) => {
      el.textContent = (d[el.dataset.muestra] || '').trim() || '—';
    });
  }

  function pintarPaletas() {
    $$('.paleta').forEach((b) => {
      const p = CONF.paletas[Number(b.dataset.paleta)];
      const igual = p && COLORES.every((tk) => String(p[tk]).toUpperCase() === String(estado.datos[tk]).toUpperCase());
      b.setAttribute('aria-pressed', String(Boolean(igual)));
    });
  }

  function pintarDatos() {
    Object.keys(POR_DEFECTO).forEach(pintarToken);
    pintarMuestra();
    pintarPaletas();
  }

  // los inputs muestran lo que hay en el estado
  function rellenar() {
    $$('input[data-token]').forEach((inp) => {
      inp.value = estado.datos[inp.dataset.token] || '';
      inp.classList.remove('invalido');
    });
    $$('input[data-color]').forEach((inp) => {
      const v = estado.datos[inp.dataset.color];
      if (HEX.test(v)) inp.value = v.toLowerCase();
    });
    const auto = $('[data-auto]');
    if (auto) auto.setAttribute('aria-pressed', String(estado.auto));
  }

  function cambiar(tk, valor) {
    estado.datos[tk] = valor;
    pintarToken(tk);
    if (tk === 'NOMBRE' && estado.auto) {
      estado.datos.DELETREO = deletrear(valor);
      const d = $('#f-DELETREO');
      if (d) d.value = estado.datos.DELETREO;
      pintarToken('DELETREO');
    }
    pintarMuestra();
    if (COLORES.includes(tk)) pintarPaletas();
    guardar();
  }

  $$('input[data-token]').forEach((inp) => {
    const tk = inp.dataset.token;
    inp.addEventListener('input', () => {
      if (COLORES.includes(tk)) {
        let v = inp.value.trim();
        if (v && v[0] !== '#') v = '#' + v;
        const ok = HEX.test(v);
        inp.classList.toggle('invalido', !ok && v.length > 0);
        if (!ok) return;
        const picker = $(`input[data-color="${tk}"]`);
        if (picker) picker.value = v.toLowerCase();
        return cambiar(tk, v.toUpperCase());
      }
      if (tk === 'DELETREO' && estado.auto) {
        estado.auto = false;
        $('[data-auto]').setAttribute('aria-pressed', 'false');
      }
      cambiar(tk, inp.value);
    });
    // al salir de un color a medio escribir, vuelve el último válido
    if (COLORES.includes(tk)) {
      inp.addEventListener('blur', () => {
        inp.value = estado.datos[tk];
        inp.classList.remove('invalido');
      });
    }
  });

  $$('input[data-color]').forEach((inp) => {
    inp.addEventListener('input', () => {
      const tk = inp.dataset.color;
      const v = inp.value.toUpperCase();
      const texto = $('#f-' + tk);
      if (texto) {
        texto.value = v;
        texto.classList.remove('invalido');
      }
      cambiar(tk, v);
    });
  });

  const botonAuto = $('[data-auto]');
  if (botonAuto) {
    botonAuto.addEventListener('click', () => {
      estado.auto = !estado.auto;
      botonAuto.setAttribute('aria-pressed', String(estado.auto));
      if (estado.auto) {
        estado.datos.DELETREO = deletrear(estado.datos.NOMBRE || '');
        $('#f-DELETREO').value = estado.datos.DELETREO;
        pintarToken('DELETREO');
      }
      guardar();
    });
  }

  $$('.paleta').forEach((b) => {
    b.addEventListener('click', () => {
      const p = CONF.paletas[Number(b.dataset.paleta)];
      if (!p) return;
      COLORES.forEach((tk) => {
        if (HEX.test(p[tk])) estado.datos[tk] = p[tk].toUpperCase();
      });
      rellenar();
      pintarDatos();
      guardar();
      avisar(`Paleta ${p.nombre}`);
    });
  });

  // Restablecer pide un segundo toque, sin ventanas del navegador
  const restablecer = $('[data-restablecer]');
  let esperaReset = 0;
  if (restablecer) {
    restablecer.addEventListener('click', () => {
      if (!restablecer.classList.contains('confirmar')) {
        restablecer.classList.add('confirmar');
        restablecer.textContent = '¿Seguro? Tocá de nuevo';
        esperaReset = setTimeout(volverReset, 3500);
        return;
      }
      clearTimeout(esperaReset);
      volverReset();
      estado.datos = Object.assign({}, POR_DEFECTO);
      estado.auto = true;
      rellenar();
      pintarDatos();
      guardar();
      avisar('Datos restablecidos');
    });
  }

  function volverReset() {
    restablecer.classList.remove('confirmar');
    restablecer.textContent = 'Restablecer';
  }

  // en el celu el panel de datos se abre y se cierra
  const datos = $('.datos');
  const abrir = $('.datos-abrir');
  if (datos && abrir) {
    abrir.addEventListener('click', () => {
      const abierto = datos.classList.toggle('abierto');
      abrir.setAttribute('aria-expanded', String(abierto));
      abrir.textContent = abierto ? 'Listo' : 'Editar';
      if (abierto) $('input[data-token]', datos).focus({ preventScroll: true });
    });
  }

  // en el celu el índice muestra solo las secciones hasta que se pide ver las fichas
  const indice = $('.indice');
  const abrirIndice = $('.indice-abrir');
  if (indice && abrirIndice) {
    abrirIndice.addEventListener('click', () => {
      const abierto = indice.classList.toggle('abierto');
      abrirIndice.setAttribute('aria-expanded', String(abierto));
      abrirIndice.textContent = abierto ? 'Ver menos' : 'Ver todas las fichas';
    });
  }

  /* ── copiar ── */

  const aviso = $('[data-aviso]');
  function avisar(texto) {
    if (aviso) aviso.textContent = texto;
  }

  function seleccionar(el) {
    const rango = document.createRange();
    rango.selectNodeContents(el);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(rango);
  }

  // si el portapapeles no está permitido, queda el texto seleccionado para copiarlo a mano
  function respaldo(el) {
    seleccionar(el);
    try {
      return document.execCommand('copy');
    } catch (e) {
      return false;
    }
  }

  function marcarBoton(boton, texto) {
    boton.textContent = texto;
    boton.classList.add('listo');
    clearTimeout(boton._espera);
    boton._espera = setTimeout(() => {
      boton.textContent = 'Copiar';
      boton.classList.remove('listo');
    }, 1800);
  }

  document.addEventListener('click', (e) => {
    const boton = e.target.closest('.copiar');
    if (!boton) return;
    const pre = boton.closest('.prompt').querySelector('.prompt-texto');
    const texto = pre.textContent;
    const listo = (ok) => {
      marcarBoton(boton, ok ? 'Copiado' : 'Seleccionado');
      avisar(ok ? 'Prompt copiado' : 'Prompt seleccionado: copialo a mano');
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(texto).then(() => listo(true), () => listo(respaldo(pre)));
    } else {
      listo(respaldo(pre));
    }
  });

  /* ── hechos y progreso ── */

  const checks = $$('input[data-hecho]');
  const fichas = $$('.ficha');

  function pintarHechos() {
    checks.forEach((c) => (c.checked = estado.hechos.has(c.dataset.hecho)));
    fichas.forEach((f) => {
      const propios = $$('input[data-hecho]', f);
      const hecha = propios.length > 0 && propios.every((c) => c.checked);
      f.classList.toggle('hecha', hecha);
      $$(`.pildora[data-ref="${f.dataset.ref}"]`).forEach((p) => p.classList.toggle('hecha', hecha));
    });
    const hechos = checks.filter((c) => c.checked).length;
    const total = checks.length;
    $$('[data-progreso-num]').forEach((el) => (el.textContent = String(hechos)));
    $$('[data-progreso-barra]').forEach((el) => (el.style.width = total ? (100 * hechos) / total + '%' : '0'));
    const n = (clave, valor) => $$(`[data-n="${clave}"]`).forEach((el) => (el.textContent = String(valor)));
    n('hechos', hechos);
    n('pendientes', total - hechos);
    $$('[data-cuenta-sec]').forEach((el) => {
      const sec = document.getElementById(el.dataset.cuentaSec);
      const propios = sec ? $$('input[data-hecho]', sec) : [];
      el.textContent = `${propios.filter((c) => c.checked).length}/${propios.length}`;
    });
  }

  document.addEventListener('change', (e) => {
    const c = e.target.closest('input[data-hecho]');
    if (!c) return;
    if (c.checked) estado.hechos.add(c.dataset.hecho);
    else estado.hechos.delete(c.dataset.hecho);
    pintarHechos();
    if (estado.filtro === 'pendientes' || estado.filtro === 'hechos') aplicarFiltro();
    guardar();
  });

  /* ── filtros y búsqueda ── */

  const contenido = $('.contenido');
  const buscar = $('#buscar');
  const resultado = $('[data-resultado]');
  const sinResultados = $('[data-sin-resultados]');
  const normalizar = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const NOMBRES_FILTRO = { nb2: 'NB2', kling: 'Kling', pendientes: 'pendientes', hechos: 'hechos' };

  // lo que se busca: título, descripción, ajustes y prompt (no los botones)
  const textoDe = (f) => $$('.ficha-cab h4, .ficha > p, .chips, .prompt-texto', f).map((el) => el.textContent).join(' ');

  function pasaFiltro(f) {
    const tipo = f.dataset.tipo;
    const hecha = f.classList.contains('hecha');
    switch (estado.filtro) {
      case 'nb2':
      case 'kling':
        return tipo === estado.filtro;
      case 'pendientes':
        return tipo !== 'nota' && !hecha;
      case 'hechos':
        return hecha;
      default:
        return true;
    }
  }

  function aplicarFiltro() {
    const palabras = normalizar(estado.busqueda).split(/\s+/).filter(Boolean);
    const activo = estado.filtro !== 'todo' || palabras.length > 0;
    contenido.classList.toggle('filtrando', activo);
    let visibles = 0;
    fichas.forEach((f) => {
      let ok = pasaFiltro(f);
      if (ok && palabras.length) {
        const texto = normalizar(textoDe(f));
        ok = palabras.every((p) => texto.includes(p));
      }
      f.classList.toggle('oculto', activo && !ok);
      if (ok) visibles += $$('input[data-hecho]', f).length;
    });
    $$('.grupo, .seccion').forEach((g) => {
      const alguna = $$('.ficha', g).some((f) => !f.classList.contains('oculto'));
      g.classList.toggle('oculto', activo && !alguna);
    });
    if (resultado) {
      resultado.hidden = !activo;
      const que = [NOMBRES_FILTRO[estado.filtro], palabras.length ? `«${estado.busqueda.trim()}»` : ''].filter(Boolean).join(' · ');
      resultado.textContent = `Mostrando ${visibles} de ${checks.length} prompts · ${que}`;
    }
    if (sinResultados) sinResultados.hidden = !activo || visibles > 0;
  }

  function elegirFiltro(filtro) {
    estado.filtro = filtro;
    $$('.filtro').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filtro === filtro)));
    aplicarFiltro();
  }

  function verTodo() {
    estado.busqueda = '';
    if (buscar) buscar.value = '';
    elegirFiltro('todo');
  }

  $$('.filtro').forEach((b) => b.addEventListener('click', () => elegirFiltro(b.dataset.filtro)));
  const botonVerTodo = $('[data-ver-todo]');
  if (botonVerTodo) botonVerTodo.addEventListener('click', verTodo);
  if (buscar) {
    buscar.addEventListener('input', () => {
      estado.busqueda = buscar.value;
      aplicarFiltro();
    });
    buscar.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        buscar.value = '';
        estado.busqueda = '';
        aplicarFiltro();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    const escribiendo = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);
    if (e.key === '/' && !escribiendo && buscar && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      buscar.focus();
    }
  });

  // un link a algo escondido por el filtro primero muestra todo
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute('href').length < 2) return;
    const destino = document.getElementById(a.getAttribute('href').slice(1));
    if (destino && destino.closest('.oculto')) verTodo();
  });

  /* ── sección actual en la barra ── */

  const enlaces = $$('.barra-nav a');
  const secciones = $$('.seccion');
  if ('IntersectionObserver' in window && enlaces.length) {
    const visibles = new Set();
    const obs = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((en) => (en.isIntersecting ? visibles.add(en.target) : visibles.delete(en.target)));
        const actual = secciones.filter((s) => visibles.has(s)).pop();
        enlaces.forEach((a) => a.setAttribute('aria-current', String(Boolean(actual) && a.hash === '#' + actual.id)));
      },
      { rootMargin: '-35% 0px -60% 0px' },
    );
    secciones.forEach((s) => obs.observe(s));
  }

  /* ── arranque ── */
  rellenar();
  pintarDatos();
  pintarHechos();
  aplicarFiltro();
})();
