/* Datos de ejemplo + estado (se guarda en el navegador de quien prueba el prototipo) */
const WA = '573185409795';
const LS_KEY = 'ef_proto_v3';
const LS_SESS = 'ef_sess_v3';
let S = null;
let session = null;

const TAM = {
  oz1:  { nombre: '1 onza',          corto: '1 oz',          cargada: false, nivel: 0.66, size: 1 },
  oz1c: { nombre: '1 onza cargada',  corto: '1 oz cargada',  cargada: true,  nivel: 0.86, size: 1 },
  oz2c: { nombre: '2 onzas cargadas',corto: '2 oz cargadas', cargada: true,  nivel: 0.88, size: 2 }
};
const ESTADOS = { nuevo: 'Nuevo', preparando: 'Preparando', ruta: 'En ruta', entregado: 'Entregado' };

const fmt = n => '$' + String(Math.round(n || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const uid = p => p + Math.random().toString(36).slice(2, 8);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
const dAgo = (n, h) => { const d = new Date(); d.setDate(d.getDate() - n); d.setHours(h == null ? 10 : h, 0, 0, 0); return d.toISOString(); };

function seed() {
  const PAL_H = ['#C68A2E', '#8B5A2B', '#3E5C4A', '#5C6B73', '#7A1E2E', '#B08A2E', '#6B4A2E', '#4A5A52'];
  const PAL_M = ['#E3B7A0', '#C98BA0', '#B76E79', '#D8A33F', '#9B6A8F', '#E2C48C', '#A8434F', '#C9A0A0'];
  const hsh = t => { let h = 7; for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) >>> 0; return h; };
  const slug = t => t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const D = [], seen = {};
  const P = CATALOGO.map((c, i) => {
    const id = slug(c.b);
    if (!seen[id]) { seen[id] = 1; D.push({ id, nombre: c.b, lema: 'Casa de inspiración', color: PAL_H[hsh(c.b) % PAL_H.length] }); }
    const pal = c.g === 'Mujer' ? PAL_M : PAL_H;
    return { id: 'p' + (i + 1), n: c.n, d: id, g: c.g, color: pal[hsh(c.n + c.g) % pal.length], activo: true };
  });
  D.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
  const byN = (t, g) => (P.find(p => p.n.toLowerCase().includes(t.toLowerCase()) && (!g || p.g === g)) || P[0]).id;
  const C = [
    { id: 'c1', nombre: 'Laura Gómez',   nota: 'Compañera de trabajo' },
    { id: 'c2', nombre: 'Carlos Ruiz',   nota: 'Compañero de trabajo' },
    { id: 'c3', nombre: 'Andrea Patiño', nota: 'Familiar' },
    { id: 'c4', nombre: 'Jhon Mejía',    nota: 'Cliente externo' },
    { id: 'c5', nombre: 'Sandra Ríos',   nota: 'Compañera de trabajo' },
    { id: 'c6', nombre: 'Mauricio Vélez',nota: 'Compañero de trabajo' }
  ];
  const prices = { oz1: { nuevo: 16000, recarga: 14000 }, oz1c: { nuevo: 26000, recarga: 24000 }, oz2c: { nuevo: 50000, recarga: 48000 } };
  const it = (pid, tam, envase, qty) => { const p = P.find(x => x.id === pid) || P[0]; return { prod: pid, nombre: p.n, tam, envase, qty, precio: prices[tam][envase] }; };
  const tot = items => items.reduce((a, b) => a + b.precio * b.qty, 0);
  const mk = (id, cid, dias, items, estado, abonado) => ({ id, cliente: cid, fecha: dAgo(dias, 11), items, estado, abonado, total: tot(items), codigo: '' });
  const O = [
    mk('o1', 'c1', 12, [it(byN('1 Million','Hombre'), 'oz1c', 'nuevo', 1)], 'entregado', 26000),
    mk('o2', 'c2', 9,  [it(byN('Bleu de Chanel'), 'oz1', 'recarga', 2)], 'entregado', 14000),
    mk('o3', 'c3', 8,  [it(byN('Chance','Mujer'), 'oz2c', 'nuevo', 1)], 'entregado', 50000),
    mk('o4', 'c4', 5,  [it(byN('Light Blue','Mujer'), 'oz1c', 'recarga', 1), it(byN('Bleu de Chanel'), 'oz1', 'nuevo', 1)], 'entregado', 0),
    mk('o5', 'c5', 3,  [it(byN('Boss Bottle'), 'oz2c', 'recarga', 1)], 'entregado', 20000),
    mk('o6', 'c1', 2,  [it(byN('212 Sexy','Hombre'), 'oz1', 'nuevo', 1)], 'preparando', 0),
    mk('o7', 'c6', 1,  [it(byN('Viva la Juicy'), 'oz1c', 'nuevo', 1), it(byN('Cool Water'), 'oz1', 'recarga', 1)], 'nuevo', 0),
    mk('o8', 'c3', 0,  [it(byN('Aqua di Gio'), 'oz1', 'nuevo', 1), it(byN('Invictus'), 'oz1', 'nuevo', 1)], 'nuevo', 0)
  ];
  const pg = (id, dias, cid, oid, monto, nota) => ({ id, fecha: dAgo(dias, 15), cliente: cid, pedido: oid, monto, nota: nota || '' });
  const G = [
    pg('g1', 11, 'c1', 'o1', 26000), pg('g2', 8, 'c2', 'o2', 14000), pg('g3', 8, 'c3', 'o3', 50000), pg('g4', 2, 'c5', 'o5', 20000),
    pg('g5', 6, 'c1', null, 42000, 'Ventas anteriores'), pg('g6', 4, 'c3', null, 30000, 'Ventas anteriores'), pg('g7', 1, 'c2', null, 16000, 'Ventas anteriores'),
    pg('g8', 18, 'c4', null, 52000, 'Ventas anteriores'), pg('g9', 25, 'c5', null, 78000, 'Ventas anteriores'), pg('g10', 33, 'c6', null, 96000, 'Ventas anteriores'),
    pg('g11', 41, 'c1', null, 64000, 'Ventas anteriores'), pg('g12', 55, 'c2', null, 112000, 'Ventas anteriores'), pg('g13', 70, 'c3', null, 88000, 'Ventas anteriores'),
    pg('g14', 90, 'c4', null, 120000, 'Ventas anteriores'), pg('g15', 120, 'c5', null, 72000, 'Ventas anteriores'), pg('g16', 150, 'c6', null, 66000, 'Ventas anteriores')
  ];
  return {
    prices, destinos: D, productos: P, clientes: C, pedidos: O, pagos: G,
    codigos: [{ code: 'FRANCES10', pct: 10, activo: true }, { code: 'COMPA5', pct: 5, activo: true }],
    favs: [], bag: [], meta: 7,
    cuenta: { nombre: 'Diego', usuario: 'diego', clave: 'elfrances', foto: '' },
    pasaporte: { titular: '', numero: '', sellos: {} }
  };
}

function load() {
  try { const r = localStorage.getItem(LS_KEY); if (r) { const s = JSON.parse(r); if (s && s.prices && s.productos) { if (!s.cuenta) s.cuenta = { nombre: 'Diego', usuario: 'diego', clave: 'elfrances', foto: '' }; return s; } } } catch (e) {}
  return seed();
}
function save() { try { localStorage.setItem(LS_KEY, JSON.stringify(S)); } catch (e) {} }
function loadSession() { try { const r = localStorage.getItem(LS_SESS); if (r) return JSON.parse(r); } catch (e) {} return null; }
function saveSession(remember) { try { if (remember && session) localStorage.setItem(LS_SESS, JSON.stringify(session)); else localStorage.removeItem(LS_SESS); } catch (e) {} }
function resetDemo() { try { localStorage.removeItem(LS_KEY); localStorage.removeItem(LS_SESS); } catch (e) {} S = seed(); session = null; }

S = load();
session = loadSession();

/* helpers de negocio */
const prod = id => S.productos.find(p => p.id === id);
const dest = id => S.destinos.find(d => d.id === id);
const cli = id => S.clientes.find(c => c.id === id);
const priceOf = (tam, envase) => (S.prices[tam] && S.prices[tam][envase]) || 0;
const minPrice = () => Math.min(...Object.values(S.prices).map(p => p.recarga));
const debe = o => Math.max(0, o.total - o.abonado);
const sumPagos = (desde) => S.pagos.filter(p => new Date(p.fecha) >= desde).reduce((a, b) => a + b.monto, 0);
const startOfDay = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
function totalDeudas() { return S.pedidos.reduce((a, o) => a + debe(o), 0); }
function deudoresList() {
  const m = {};
  S.pedidos.forEach(o => { const d = debe(o); if (d > 0) { (m[o.cliente] = m[o.cliente] || { cliente: o.cliente, monto: 0, pedidos: 0 }); m[o.cliente].monto += d; m[o.cliente].pedidos++; } });
  return Object.values(m).sort((a, b) => b.monto - a.monto);
}
function lociones(o) { return o.items.reduce((a, b) => a + b.qty, 0); }
function pendientesRuta() { return S.pedidos.filter(o => o.estado === 'nuevo' || o.estado === 'preparando').reduce((a, o) => a + lociones(o), 0); }
const IS_MOBILE = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '') || (navigator.maxTouchPoints > 1 && /Mac/i.test(navigator.platform || ''));
function waLink(text, phone) {
  const ph = String(phone || '').replace(/\D/g, ''), q = 'text=' + encodeURIComponent(text);
  return IS_MOBILE ? 'https://wa.me/' + ph + '?' + q : 'https://web.whatsapp.com/send?' + (ph ? 'phone=' + ph + '&' : '') + q;
}
