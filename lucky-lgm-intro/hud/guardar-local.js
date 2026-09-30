// Abriendo el HTML con doble clic, los PNG y el .zip se bajan con un link de descarga común.
// La página publicada no incluye este archivo: ahí guarda la capacidad "downloads" del visor.
window.HUD_GUARDAR = function (blob, nombre) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
};
