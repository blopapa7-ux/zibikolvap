// La página de la biblia: copiar prompts, el teléfono de la portada y la sección actual.
(function () {
  'use strict';

  function marcar(boton, texto) {
    boton.textContent = texto;
    boton.classList.add('listo');
    setTimeout(() => {
      boton.textContent = 'Copiar';
      boton.classList.remove('listo');
    }, 1800);
  }

  document.addEventListener('click', async (e) => {
    const boton = e.target.closest('.copiar');
    if (!boton) return;
    const pre = boton.closest('.prompt').querySelector('pre');
    try {
      await navigator.clipboard.writeText(pre.textContent);
      marcar(boton, 'Copiado');
    } catch (err) {
      const rango = document.createRange();
      rango.selectNodeContents(pre);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(rango);
      marcar(boton, 'Seleccionado: Ctrl+C');
    }
  });

  // Teléfono de la portada: el HUD sobre la ciudad, pasando por cuatro momentos.
  const tel = document.querySelector('.telefono');
  const HUD = window.LuckyHUD;
  if (tel && HUD) {
    HUD.fontsReady().then(() => {
      const preset = HUD.PRESETS.lucky;
      const pieza = Object.fromEntries(preset.piezas.map((p) => [p.archivo, p]));
      const escenas = [
        ['02-hud-2-loot', '11-loot-lanzasopapas'],
        ['01-hud-1-inicio', '08-alerta-emergencia'],
        ['04-hud-4-eliminaciones', '17-rescate-completado'],
        ['23-victoria'],
      ];
      const fondo = document.createElement('canvas');
      fondo.width = HUD.W;
      fondo.height = HUD.H;
      HUD.fondoCiudad(fondo.getContext('2d'));
      const capa = document.createElement('canvas');
      capa.width = HUD.W;
      capa.height = HUD.H;
      const lienzos = escenas.map((capas, i) => {
        const c = i === 0 ? tel.querySelector('canvas') : document.createElement('canvas');
        c.width = 540;
        c.height = 960;
        const g = c.getContext('2d');
        g.drawImage(fondo, 0, 0, 540, 960);
        g.fillStyle = 'rgba(0,0,0,.18)';
        g.fillRect(0, 0, 540, 960);
        capas.forEach((a) => {
          HUD.dibujar(capa.getContext('2d'), pieza[a], preset.datos);
          g.drawImage(capa, 0, 0, 540, 960);
        });
        if (i) tel.appendChild(c);
        return c;
      });
      lienzos[0].classList.add('visible');
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      let k = 0;
      setInterval(() => {
        lienzos[k].classList.remove('visible');
        k = (k + 1) % lienzos.length;
        lienzos[k].classList.add('visible');
      }, 2800);
    });
  }

  // Marca en la barra la sección que se está leyendo.
  const enlaces = Array.from(document.querySelectorAll('.secciones-lista a'));
  const zonas = Array.from(document.querySelectorAll('.seccion, #hud'));
  const visibles = new Set();
  const obs = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((en) => (en.isIntersecting ? visibles.add(en.target) : visibles.delete(en.target)));
      const actual = zonas.filter((z) => visibles.has(z)).pop();
      enlaces.forEach((a) => a.setAttribute('aria-current', String(Boolean(actual) && a.hash === '#' + actual.id)));
    },
    { rootMargin: '-40% 0px -55% 0px' },
  );
  zonas.forEach((z) => obs.observe(z));
})();
