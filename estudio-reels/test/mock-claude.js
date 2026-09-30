// Simulación local de window.claude (db, assets, sample, downloads) para probar
// estudio.html fuera de claude.ai. El test la inyecta antes de que cargue la página.
(() => {
  const seed = window.__SEED__ || { docs: {} };
  const docs = new Map(Object.entries(seed.docs || {}));
  const listeners = new Set();
  const clone = v => JSON.parse(JSON.stringify(v));
  const parentOf = path => path.split('/').slice(0, -1).join('/');
  const log = (window.__dbLog = []);

  const snapOf = (id, data) => ({ id, exists: data !== undefined, data: () => (data === undefined ? undefined : clone(data)), metadata: { fromCache: false, hasPendingWrites: false } });
  const notify = coll => { for (const l of listeners) if (l.coll === coll) setTimeout(l.fire, 0); };

  function docRef(path) {
    const segs = path.split('/');
    if (segs.length % 2) throw new TypeError('doc path must have an even number of segments: ' + path);
    return {
      id: segs[segs.length - 1], path,
      async get() { return snapOf(segs[segs.length - 1], docs.get(path)); },
      async set(data) { docs.set(path, clone(data)); log.push(['set', path]); notify(parentOf(path)); },
      async update(data) {
        if (!docs.has(path)) throw { code: 'invalid_argument', message: 'missing ' + path };
        docs.set(path, { ...docs.get(path), ...clone(data) }); log.push(['update', path]); notify(parentOf(path));
      },
      async delete() { docs.delete(path); notify(parentOf(path)); },
      onSnapshot(next) { const fire = () => next(snapOf(segs[segs.length - 1], docs.get(path))); setTimeout(fire, 0); return () => {}; }
    };
  }
  function query(coll) {
    return {
      limit() { return query(coll); },
      where() { return query(coll); },
      orderBy() { return query(coll); },
      async get() { return build(); },
      onSnapshot(next) {
        const l = { coll, fire: () => next(build()) };
        listeners.add(l); setTimeout(l.fire, 5);
        return () => listeners.delete(l);
      }
    };
    function build() {
      const list = [...docs.entries()].filter(([p]) => parentOf(p) === coll).sort(([a], [b]) => a.localeCompare(b)).map(([p, d]) => snapOf(p.split('/').pop(), d));
      return { docs: list, size: list.length, empty: !list.length, docChanges: () => [], metadata: { fromCache: false, hasPendingWrites: false } };
    }
  }
  const db = Object.freeze({
    doc: docRef,
    collection: path => ({ ...query(path), path, doc: id => docRef(path + '/' + (id || Math.random().toString(36).slice(2))), async add(d) { const r = docRef(path + '/' + Math.random().toString(36).slice(2)); await r.set(d); return r; } })
  });

  const store = (window.__assets = new Map());
  const assets = Object.freeze({
    async upload(blob, opts) {
      const id = Array.from(crypto.getRandomValues(new Uint8Array(16)), b => b.toString(16).padStart(2, '0')).join('');
      store.set(id, blob);
      return { id, url: URL.createObjectURL(blob), sizeBytes: blob.size, contentType: (opts && opts.type) || blob.type };
    },
    async list() { return { assets: [...store.keys()].map(id => ({ id })), usage: { files: store.size, bytes: 0, maxFiles: 1000, maxBytes: 1e9 } }; },
    async delete(id) { return { deleted: store.delete(id) }; }
  });

  const calls = (window.__sampleCalls = []);
  const sample = Object.assign(async () => ({ text: 'ok', truncated: false, modelTierApplied: 'default' }), {
    async limits() { return { maxPromptBytes: 262144, images: { maxCount: 5, maxInputBytes: 20e6, mediaTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] }, tools: { maxCount: 8 } }; },
    async json(input, opts) {
      calls.push({ input, images: (opts && opts.images && opts.images.length) || 0 });
      await new Promise(r => setTimeout(r, 30));
      const fotos = [...String(input).matchAll(/imagen \d+ = foto (\d+)/g)].map(m => Number(m[1]));
      const libres = [...String(input).matchAll(/^- (\d+) · (\w+) · /gm)].map(m => ({ n: Number(m[1]), cat: m[2] }));
      return fotos.map((f, i) => ({
        foto: f, reel: libres[i] ? libres[i].n : 99, cat: libres[i] ? libres[i].cat : 'normal',
        titulo: 'Toma a medida ' + f, idea: 'Idea escrita mirando la foto ' + f + '.',
        prompt: 'She slowly looks up from photo ' + f + ' and gives a small closed-mouth smile. Everything moves at natural real-time speed.',
        hook: 'gancho ' + f, caption: 'caption ' + f + ' #a #b #c', audio: 'tema suave en tendencia', loop: i % 2 === 0, alerta: f === 2 ? 'dos personas en la foto' : ''
      }));
    }
  });

  const downloads = Object.freeze({ async save(req) { (window.__downloads = window.__downloads || []).push({ filename: req.filename, size: req.data.size || req.data.length || 0 }); return { status: 'saved' }; } });

  const caps = { db, assets, sample, downloads };
  window.claude = Object.freeze({ use: name => new Promise(r => setTimeout(() => r(caps[name] || null), 20)) });
})();
