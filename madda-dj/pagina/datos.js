/* Identidad MADDA · todo el contenido de la página vive acá.
   Los demás archivos solo dibujan: si cambiás un texto, cambialo en este objeto.
   Regla: solo datos confirmados por ella. Lo que no sabemos queda "a confirmar". */
window.MADDA = {
  // ── quién es ──
  nombre: 'MADDA',
  deletreo: 'M-A-D-D-A',
  handle: '@madda_dj',
  usuario: 'madda_dj',
  instagram: 'https://www.instagram.com/madda_dj/',
  genero: 'Techno',
  firma: 'Pk',
  version: 'v1',

  // ── portada ──
  portada: {
    ojo: 'Identidad visual · propuesta para vos',
    linea: 'Techno',
    hecha: 'Hecha por Pk',
    fecha: 'Octubre 2026',
    bajar: 'Bajá y elegí',
  },

  // ── lo que me pediste (sus palabras, WhatsApp 9/10/2026) → lo que hice ──
  pedido: {
    bajada: 'Te leí y te escuché. Esto es lo que me dijiste y lo que hice con cada cosa.',
    pares: [
      {
        cita: 'los colores me gustaría o un violeta o rojo y uno blanco',
        decision: 'Violeta como color principal, rojo como alternativa y blanco para tu nombre.',
      },
      {
        cita: 'para que cuando pongan las visuales y los nombres quede con lo que le ponen de fondo',
        decision: 'Tu nombre siempre en blanco con un borde fino y una sombra sutil, para que se lea arriba de cualquier visual.',
      },
      {
        cita: 'a mí me gusta el tornasolado medio violetoso azulado',
        decision: 'El brillo tornasol que va del violeta al azul es tu firma: está en el logo principal, en los visuales y en esta portada.',
      },
      {
        cita: 'a mí me gusta la posta lo oscurito',
        decision: 'Fondos casi negros con un toque violeta. Nada de fondos blancos: todo pensado para la noche.',
      },
      {
        cita: 'recién arranco y ni idea qué género es el mío',
        decision: 'Una parte entera para descubrir tu sonido: estilos de techno con sus BPM, un medidor de tempo y cómo se arma un set.',
      },
    ],
    cierre: 'Y como me dijiste «te lo dejo a tu criterio», te armé opciones: elegís vos y me la mandás.',
  },

  // ── logos: mismo orden y nombres que los prompts y la biblia ──
  logos: {
    bajada: 'Seis caminos para tu nombre, todos dibujados para esta propuesta. Tocá «Me gusta» en el que más te represente y probalo en tornasol, blanco o rojo: la portada, los visuales y las redes cambian con tu elección.',
    opciones: [
      { id: 'tornasol', nombre: 'Tornasol', fuente: 'Unbounded 900', porque: 'Tu firma: el brillo violeta → azul que te encanta, en letras anchas y firmes.' },
      { id: 'doble-d', nombre: 'Doble D', fuente: 'Unbounded 900 + dibujo', porque: 'Las dos D son dos bandejas espalda con espalda, con el mixer en el medio. La idea más tuya.' },
      { id: 'laser', nombre: 'Láser', fuente: 'Michroma', porque: 'Letras hechas de líneas finas, como los láseres que cruzan la pista.' },
      { id: 'pulso', nombre: 'Pulso', fuente: 'Big Shoulders Display 900', porque: 'Una onda de sonido corta las letras: se lee techno a la primera.' },
      { id: 'mono', nombre: 'Mono', fuente: 'Major Mono Display', porque: 'En minúsculas, simple y elegante. Funciona chiquito y sobre cualquier fondo.' },
      { id: 'sello', nombre: 'Sello', fuente: 'Unbounded + vinilo', porque: 'Tu M en el centro de un vinilo, con tu nombre girando alrededor. Ideal para perfil y merch.' },
    ],
    variantes: [
      { id: 'tornasol', nombre: 'Tornasol' },
      { id: 'blanco', nombre: 'Blanco' },
      { id: 'rojo', nombre: 'Rojo' },
    ],
    chiquito: 'En tamaños chicos queda solo la marca, para que se reconozca igual en la foto de perfil o en una mención.',
  },

  // ── paletas: la primera es la de su pedido (Tornasol) ──
  paletas: {
    bajada: 'Cuatro paletas. Tocá una y la página entera se pinta con ella.',
    opciones: [
      {
        id: 'tornasol',
        nombre: 'Tornasol',
        uso: 'La principal, la que me pediste: flyers, visuales y perfil.',
        colores: [
          { nombre: 'Fondo', hex: '#06050B', peso: 3 },
          { nombre: 'Violeta', hex: '#7B4DFF', peso: 2 },
          { nombre: 'Azul eléctrico', hex: '#3A6BFF', peso: 2 },
          { nombre: 'Brillo lila', hex: '#C9B8FF', peso: 1 },
          { nombre: 'Blanco', hex: '#FFFFFF', peso: 1 },
        ],
        tokens: { fondo: '#06050B', acento: '#7B4DFF', acento2: '#3A6BFF', brillo: '#C9B8FF', texto: '#C9B8FF' },
        grad: ['#E4DAFF', '#7B4DFF', '#3A6BFF', '#7B4DFF', '#C9B8FF'],
        pelicula: ['#B9A0FF', '#7B4DFF', '#3A6BFF', '#6C8CFF'],
      },
      {
        id: 'violeta',
        nombre: 'Violeta y blanco',
        uso: 'Más limpia: el brillo queda en violeta y blanco, sin el azul. Para placas con mucho texto o cuando el flyer ya viene cargado.',
        colores: [
          { nombre: 'Fondo', hex: '#06050B', peso: 3 },
          { nombre: 'Violeta', hex: '#7B4DFF', peso: 3 },
          { nombre: 'Violeta profundo', hex: '#3F23A6', peso: 1 },
          { nombre: 'Blanco', hex: '#FFFFFF', peso: 2 },
        ],
        tokens: { fondo: '#06050B', acento: '#7B4DFF', acento2: '#3F23A6', brillo: '#D9CCFF', texto: '#C9B8FF' },
        grad: ['#FFFFFF', '#C9B8FF', '#7B4DFF', '#5A35D6', '#C9B8FF'],
        pelicula: ['#C9B8FF', '#7B4DFF', '#4A2AC4', '#9C7BFF'],
      },
      {
        id: 'rojo',
        nombre: 'Rojo y blanco',
        uso: 'La alternativa que nombraste. Para noches más duras o para cambiar de aire.',
        colores: [
          { nombre: 'Fondo', hex: '#070406', peso: 3 },
          { nombre: 'Rojo', hex: '#E3123B', peso: 3 },
          { nombre: 'Rojo profundo', hex: '#7A0A22', peso: 1 },
          { nombre: 'Blanco', hex: '#FFFFFF', peso: 2 },
        ],
        tokens: { fondo: '#070406', acento: '#E3123B', acento2: '#7A0A22', brillo: '#FF9AAE', texto: '#FF8FA3' },
        grad: ['#FFC2CD', '#E3123B', '#8E0B2A', '#E3123B', '#FF8FA3'],
        pelicula: ['#FF7D94', '#E3123B', '#8E0B2A', '#FF4A68'],
      },
      {
        id: 'noche',
        nombre: 'Noche',
        uso: 'Casi todo negro y blanco, el violeta solo como resplandor. La más oscura y sobria.',
        colores: [
          { nombre: 'Fondo', hex: '#030206', peso: 4 },
          { nombre: 'Carbón', hex: '#15121F', peso: 2 },
          { nombre: 'Gris lila', hex: '#8E89A6', peso: 1 },
          { nombre: 'Resplandor', hex: '#7B4DFF', peso: 1 },
          { nombre: 'Blanco', hex: '#FFFFFF', peso: 1 },
        ],
        tokens: { fondo: '#030206', acento: '#7B4DFF', acento2: '#15121F', brillo: '#B9B4CC', texto: '#C9C4DC' },
        grad: ['#FFFFFF', '#B9B4CC', '#7B4DFF', '#B9B4CC', '#FFFFFF'],
        pelicula: ['#8E89A6', '#2A2440', '#7B4DFF', '#3A3352'],
      },
    ],
  },

  // ── tu nombre arriba de cualquier visual ──
  legibilidad: {
    bajada: 'En los boliches ponen tu nombre arriba de lo que esté pasando en la pantalla. Mirá cómo se lee tu logo en blanco sobre fondos difíciles, con y sin borde.',
    regla: 'un pequeño trazo o sombra muy sutil, fino y profesional, para que no se mezcle con el fondo',
    reglaFirma: 'Mi regla para cualquier nombre en pantalla',
    fondos: [
      { id: 'brillante', nombre: 'Muy brillante' },
      { id: 'arcoiris', nombre: 'Arcoíris' },
      { id: 'rojo', nombre: 'Rojo' },
      { id: 'patron', nombre: 'Patrón cargado' },
    ],
  },

  // ── tu sonido ──
  sonido: {
    bajada: 'Me dijiste que recién arrancás y que todavía no sabés cuál es tu género. Buenísimo: esta parte es para descubrirlo juntos. Escuchá, medí y marcá lo que te gustaría tocar.',
  },
  playlist: {
    titulo: 'Todo tipo de techno',
    url: 'https://open.spotify.com/playlist/235attgApBbVQnFxcuYBfR',
    embed: 'https://open.spotify.com/embed/playlist/235attgApBbVQnFxcuYBfR',
    nota: 'La que me pasaste: «tenés de todo desde mis comienzos que me empezó a gustar el techno / electrónica». Me la puse para descifrarte un poco.',
  },

  // ── estilos de techno (BPM aproximados, uso habitual) ──
  escalaBpm: [110, 165],
  estilos: {
    bajada: 'Diez estilos de techno ordenados por velocidad. Los BPM son aproximados: cada tema y cada DJ los mueve un poco.',
    lista: [
      { id: 'dub', nombre: 'Dub techno', bpm: [115, 125], mood: ['profundo', 'espacial', 'cálido'], suena: 'Acordes con eco que se repiten y se disuelven, bajo redondo, mucha atmósfera. Ideal para abrir.' },
      { id: 'melodic', nombre: 'Melodic techno', bpm: [120, 126], mood: ['emotivo', 'épico', 'melódico'], suena: 'Arpegios y melodías largas arriba de un bombo firme; sube y baja como una historia.' },
      { id: 'minimal', nombre: 'Minimal / deep tech', bpm: [124, 128], mood: ['groovero', 'seco', 'elegante'], suena: 'Pocos elementos muy bien puestos: percusión fina, bajos que rebotan, mucho aire entre sonidos.' },
      { id: 'detroit', nombre: 'Detroit', bpm: [125, 135], mood: ['funky', 'futurista', 'con alma'], suena: 'El techno original: máquinas con alma, acordes y cuerdas, ritmos con swing.' },
      { id: 'hypnotic', nombre: 'Hypnotic', bpm: [126, 132], mood: ['hipnótico', 'circular', 'oscuro'], suena: 'Loops que giran y cambian de a poco; te mete en trance sin necesitar grandes subidas.' },
      { id: 'peak', nombre: 'Peak time / driving', bpm: [128, 134], mood: ['potente', 'constante', 'de pista llena'], suena: 'Bombo al frente, bajo que empuja y subidas claras, para el momento más alto de la noche.' },
      { id: 'raw', nombre: 'Raw / warehouse', bpm: [130, 138], mood: ['crudo', 'sucio', 'de galpón'], suena: 'Sonido áspero, con distorsión y reverb de lugar grande: menos melodía, más textura.' },
      { id: 'industrial', nombre: 'Industrial', bpm: [130, 140], mood: ['metálico', 'frío', 'intenso'], suena: 'Golpes metálicos, ruido y distorsión; oscuro y duro, con mucha tensión.' },
      { id: 'acid', nombre: 'Acid techno', bpm: [130, 145], mood: ['ácido', 'retorcido', 'enérgico'], suena: 'El sonido chillón y elástico de una línea de bajo tipo 303 que se retuerce sobre el bombo.' },
      { id: 'hard', nombre: 'Hard techno', bpm: [145, 160], mood: ['rápido', 'duro', 'eufórico'], suena: 'Más de 145 BPM, bombos saturados y energía a full: la pista salta.' },
    ],
  },

  // ── medidor de tempo ──
  tap: {
    bajada: 'Poné un tema de tu playlist y tocá el botón en cada golpe del bombo. También sirve la barra espaciadora o Enter con el botón seleccionado.',
  },

  // ── cómo se arma un set (ejemplo genérico de 2 horas) ──
  set: {
    bajada: 'Un set no es una lista de temas sueltos: es un viaje de energía. Así se suele armar uno de dos horas.',
    duracion: 120,
    bpm: [120, 136],
    curva: [[0, 122], [10, 122.5], [20, 123.5], [30, 125], [40, 126], [50, 127], [60, 128.5], [70, 130], [80, 131.5], [90, 132.5], [97, 132.6], [104, 131], [110, 129], [116, 127.5], [120, 126.5]],
    fases: [
      { nombre: 'Warm-up', desde: 0, hasta: 30, texto: 'Arrancás suave: la pista se está llenando, leés a la gente y armás clima.' },
      { nombre: 'Subida', desde: 30, hasta: 70, texto: 'Sumás energía de a poco: más percusión, un par de BPM más, temas con más tensión.' },
      { nombre: 'Pico', desde: 70, hasta: 100, texto: 'El momento más alto: tus temas más fuertes con la pista entregada.' },
      { nombre: 'Cierre', desde: 100, hasta: 120, texto: 'Bajás un cambio y terminás con un tema que la gente se lleve en la cabeza.' },
    ],
    consejo: 'Si te toca abrir la noche, todo tu set es un warm-up: dejale la pista lista al que viene después.',
  },

  // ── visuales para la pantalla de la cabina ──
  visuales: {
    bajada: 'Así se vería tu logo en la pantalla de atrás de la cabina. Son vistas previas en vivo, dibujadas acá mismo. Marcá con «Me gusta» los que más te gusten (podés elegir más de uno).',
    pantalla: 'Pantalla de ejemplo: 2432 × 1152 px (proporción 2,1 : 1).',
    kling: 'Los loops finales los hago en Kling a partir del logo que elijas.',
    lista: [
      { id: 'tornasol', nombre: 'Tornasol líquido', texto: 'La película tornasol fluyendo lento, como aceite sobre agua.' },
      { id: 'laser', nombre: 'Túnel de láser', texto: 'Líneas finas que viajan hacia el centro. Sin flashes.' },
      { id: 'onda', nombre: 'Onda', texto: 'Barras que laten a 130 BPM, como el bombo.' },
      { id: 'humo', nombre: 'Humo y haz', texto: 'Haces de luz suaves que cruzan el humo de la pista.' },
    ],
  },

  // ── redes (maquetas) ──
  redes: {
    bajada: 'Maquetas para que te imagines tu perfil, una historia y un flyer con tu logo y tu paleta. No son capturas reales.',
    perfil: { categoria: 'DJ', bio: 'Techno del lado oscuro.' },
    historia: { arriba: 'Este domingo toco', fecha: 'DOMINGO 11.10', lugar: 'LUGAR A CONFIRMAR' },
    post: { dia: 'DOMINGO', fecha: '11.10', genero: 'TECHNO', pie: 'LUGAR Y HORA A CONFIRMAR' },
  },

  // ── fechas (YYYY-MM-DD, hora de Buenos Aires) ──
  fechas: {
    nota: 'Las próximas las vamos sumando.',
    lista: [
      { fecha: '2026-10-11', texto: 'Domingo 11 de octubre de 2026', detalle: 'Lugar y hora a confirmar', evento: '' },
    ],
  },

  // ── bio: solo hechos confirmados ──
  bio: {
    etiqueta: 'Borrador para escribir juntos · corregime lo que quieras',
    texto: [
      'MADDA es DJ de techno. Recién arranca y lo hace a su manera: toca todo tipo de techno, siempre del lado más oscuro.',
      'Su playlist «Todo tipo de techno» junta los temas que la acompañan desde que empezó a gustarle la electrónica, y es el mejor mapa de lo que viene buscando.',
    ],
    corta: 'DJ de techno · del lado oscuro',
    preguntas: [
      { id: 'origen', texto: '¿De dónde sos?' },
      { id: 'desde', texto: '¿Desde cuándo tocás?' },
      { id: 'arranque', texto: '¿Qué te hizo arrancar?' },
      { id: 'pista', texto: '¿Qué querés que sienta la pista cuando tocás?' },
    ],
    bajada: 'Escribí solo lo que sé de vos. Respondé las preguntas de abajo y lo terminamos juntos: tus respuestas viajan con tu elección.',
  },

  // ── tu elección ──
  eleccion: {
    bajada: 'Lo que fuiste marcando queda acá. Copialo o mandámelo por WhatsApp y con eso armo las versiones finales.',
    titulo: 'Identidad MADDA · mi elección',
  },

  // ── despedida: la nota final, firmada ──
  despedida: {
    texto: 'Esto es un punto de partida, no algo cerrado. Mirala tranqui, marcá lo que te guste y lo que no te cierre lo cambiamos. Y tu sonido lo vamos encontrando juntos, como dijiste.',
    firma: 'Pk',
  },

  pie: 'Identidad MADDA · v1 · hecha por Pk',
};
