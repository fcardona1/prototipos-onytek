/* NOVAMIX · prototipo · datos compartidos, dibujos de producto y mensajes de WhatsApp.
   Desarrollado por Onytek. Los datos viven en el navegador de quien prueba el prototipo. */
(function () {
  'use strict';

  var KEY = 'novamix-proto-v1';

  /* iconos de 64x64 para los dibujos de ejemplo */
  var ICONS = {
    blocks: '<rect x="12" y="30" width="40" height="22" rx="5"/><rect x="18" y="20" width="10" height="10" rx="3"/><rect x="36" y="20" width="10" height="10" rx="3"/>',
    bottle: '<rect x="21" y="28" width="22" height="26" rx="7"/><rect x="28" y="18" width="8" height="10" rx="2"/><path d="M26 12h14"/><path d="M27 41h10"/>',
    gift: '<rect x="12" y="29" width="40" height="23" rx="4"/><rect x="9" y="21" width="46" height="9" rx="3"/><path d="M32 21v31"/><path d="M32 21c-5-10-17-9-13-3 2 3 8 3 13 3zM32 21c5-10 17-9 13-3-2 3-8 3-13 3z"/>',
    home: '<path d="M11 32L32 13l21 19"/><path d="M17 28v25h30V28"/><path d="M27 53V39h10v14"/>'
  };
  var PALS = [['#6CC0FF', '#1479CC'], ['#9AD6FF', '#2E7FE0'], ['#7FD3E8', '#1B84B8'], ['#B7A4F7', '#6A3FD0']];

  function iconKey(name) {
    name = String(name || '').toLowerCase();
    if (/juguet|ni[ñn]|bloq|kids|infan|pelu/.test(name)) return 'blocks';
    if (/loci|perfum|fragan|aroma|splash|cuidado/.test(name)) return 'bottle';
    if (/hogar|casa|deco|vela/.test(name)) return 'home';
    return 'gift';
  }

  function defaults() {
    function p(n, name, cat, price, old, more) {
      var o = { id: 'p' + n, ref: 'NM-' + String(n).padStart(3, '0'), n: n, name: name, cat: cat, price: price, oldPrice: old || 0,
        optionLabel: '', options: [], desc: '', imgs: [], badge: '', soldOut: false, hidden: false, allowPartial: true, navidad: false, featured: false, sample: true };
      for (var k in more) o[k] = more[k];
      return o;
    }
    return {
      v: 1, seq: 10,
      settings: {
        owner: 'Jenny', whatsapp: '', banner: 'Navidad 2026: separa tu regalo hoy con solo el 50%', partialPct: 50,
        christmas: '2026-12-25', slogan: 'Un poco de todo, para todos', community: '', instagram: '', tiktok: '', facebook: ''
      },
      cats: [{ id: 'c1', name: 'Juguetes' }, { id: 'c2', name: 'Lociones' }, { id: 'c3', name: 'Regalos y detalles' }],
      products: [
        p(1, 'Bloques armables Armatodo, 120 piezas', 'c1', 59900, 74900, { badge: 'Más vendido', navidad: true, featured: true, desc: 'Un set colorido para construir torres, carros y casitas. Piezas lavables y fáciles de encajar. Ideal desde los 4 años.' }),
        p(2, 'Cocinita de juguete con luces y sonidos', 'c1', 89900, 0, { badge: 'Nuevo', navidad: true, desc: 'Hornillas que se iluminan, sonido de sartén y accesorios incluidos.' }),
        p(3, 'Carro de control remoto todoterreno', 'c1', 69900, 0, { navidad: true, optionLabel: 'Color', options: ['Rojo', 'Azul', 'Verde'], desc: 'Llantas anchas, control a distancia y batería recargable por USB.' }),
        p(4, 'Loción Aurora, 100 ml', 'c2', 45000, 0, { featured: true, desc: 'Fragancia fresca y floral para todos los días.' }),
        p(5, 'Loción Noche Dorada, 100 ml', 'c2', 52000, 0, { badge: 'Últimas unidades', desc: 'Aroma cálido con notas de vainilla y ámbar.' }),
        p(6, 'Set de regalo: loción y body splash', 'c2', 78000, 95000, { navidad: true, desc: 'Dos fragancias que combinan, listas para regalar en su caja.' }),
        p(7, 'Peluche osito con moño', 'c1', 54900, 0, { navidad: true, optionLabel: 'Tamaño', options: ['Pequeño', 'Mediano', 'Grande'], desc: 'Suave, lavable y con moño azul. El abrazo perfecto para esta Navidad.' }),
        p(8, 'Vela aromática de vainilla', 'c3', 25000, 0, { allowPartial: false, desc: 'Vela de cera suave en vaso de vidrio con tapa. Dura más de 30 horas.' }),
        p(9, 'Caja sorpresa de Navidad', 'c3', 38000, 0, { soldOut: true, navidad: true, allowPartial: false, desc: 'Caja decorada con dulces y un detalle sorpresa. Perfecta para amigo secreto.' })
      ],
      log: []
    };
  }

  var mem = null;
  function load() {
    var raw = null;
    try { raw = localStorage.getItem(KEY); } catch (e) { /* sin almacenamiento */ }
    if (!raw && mem) raw = mem;
    var base = defaults();
    if (raw) {
      try {
        var d = JSON.parse(raw);
        if (d && d.products && d.cats && d.settings) {
          for (var k in base.settings) if (d.settings[k] === undefined) d.settings[k] = base.settings[k];
          return d;
        }
      } catch (e2) { /* datos dañados: vuelve a los de ejemplo */ }
    }
    return base;
  }
  function save(d) {
    var s = JSON.stringify(d);
    mem = s;
    try { localStorage.setItem(KEY, s); return true; } catch (e) { return false; }
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }
  function money(n) { return '$' + String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
  function digits(s) { return String(s || '').replace(/\D/g, ''); }
  function phone(s) {
    var d = digits(s);
    if (d.length === 10 && d.charAt(0) === '3') d = '57' + d;
    return d.length >= 11 ? d : '';
  }
  function prettyPhone(s) {
    var d = phone(s);
    if (d.length === 12 && d.indexOf('57') === 0) return '+57 ' + d.slice(2, 5) + ' ' + d.slice(5, 8) + ' ' + d.slice(8);
    return d ? '+' + d : '';
  }
  function pct(p) { return p.oldPrice > p.price ? Math.round((1 - p.price / p.oldPrice) * 100) : 0; }
  function part(d) { var v = Number(d.settings.partialPct) || 50; return Math.min(90, Math.max(10, v)); }
  function partialOf(d, total) { return Math.round(total * part(d) / 100); }
  function uid(prefix) { return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 5); }
  function catName(d, id) { for (var i = 0; i < d.cats.length; i++) if (d.cats[i].id === id) return d.cats[i].name; return 'Otros'; }
  function daysToXmas(d) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(d.settings.christmas || '2026-12-25'));
    if (!m) return -1;
    var t = new Date(+m[1], +m[2] - 1, +m[3]), n = new Date(); n.setHours(0, 0, 0, 0);
    return Math.round((t - n) / 864e5);
  }

  /* WhatsApp: el mensaje ya llega con la opción, la cantidad y la forma de pago */
  function waText(d, items, mode, who, kind) {
    var o = d.settings.owner || 'Jenny';
    var hi = 'Hola ' + o + ' 👋' + (who ? ' Soy *' + who + '*.' : '');
    var intro = kind === 'back'
      ? hi + ' Quiero saber cuándo vuelve a llegar este regalo:'
      : hi + ' Quiero saber si ' + (items.length > 1 ? 'están disponibles estos regalos:' : 'está disponible este regalo:');
    var total = 0;
    var lines = items.map(function (it, i) {
      var p = it.p; total += p.price * it.qty;
      var s = (items.length > 1 ? (i + 1) + ') ' : '') + '🎁 *' + p.name + '* · Ref ' + p.ref;
      if (it.opt) s += '\n✨ ' + (p.optionLabel || 'Opción') + ': *' + it.opt + '*';
      return s + '\n🔢 Cantidad: *' + it.qty + '*\n💰 ' + money(p.price * it.qty);
    });
    var t = intro + '\n\n' + lines.join('\n\n');
    if (kind !== 'back') {
      t += '\n\n' + (items.length > 1 ? 'Total: *' + money(total) + '*\n' : '');
      t += mode === 'partial' ? 'Pago: *Separar con el ' + part(d) + '%* (' + money(partialOf(d, total)) + ' hoy)' : 'Pago: *Pago completo*';
    }
    return t + '\n\nLo vi en NOVAMIX.';
  }
  function waUrl(d, text) {
    var n = phone(d.settings.whatsapp);
    return 'https://wa.me/' + n + '?text=' + encodeURIComponent(text);
  }
  function logAsk(text) {
    var d = load(); d.log = d.log || [];
    d.log.unshift({ t: Date.now(), text: text }); d.log = d.log.slice(0, 20);
    save(d);
  }

  /* foto con el encuadre que dejó Jenny: pos = {x, y, z} (centro en % y zoom) */
  function photo(p, i, lazy) {
    var q = (p.pos && p.pos[i]) || {}, x = isFinite(q.x) ? q.x : 50, y = isFinite(q.y) ? q.y : 50, z = isFinite(q.z) ? q.z : 1;
    return '<img class="photo" src="' + p.imgs[i] + '" alt="' + esc(p.name) + '"' + (lazy ? ' loading="lazy"' : '') + ' style="--px:' + x + '%;--py:' + y + '%;--z:' + z + '">';
  }
  function photoStyle(q) { q = q || {}; return '--px:' + (isFinite(q.x) ? q.x : 50) + '%;--py:' + (isFinite(q.y) ? q.y : 50) + '%;--z:' + (isFinite(q.z) ? q.z : 1); }

  /* dibujo de ejemplo cuando el producto aún no tiene foto */
  var gN = 0;
  function art(p, d) {
    if (p.imgs && p.imgs[0] && /^data:image\//.test(p.imgs[0])) return photo(p, 0, true);
    var ci = 0; for (var i = 0; i < d.cats.length; i++) if (d.cats[i].id === p.cat) ci = i;
    var pal = PALS[ci % PALS.length], id = 'ph' + (++gN);
    return '<svg class="ph" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Dibujo de ejemplo de ' + esc(p.name) + '" xmlns="http://www.w3.org/2000/svg">' +
      '<defs><radialGradient id="' + id + '" cx=".28" cy=".2" r="1.1"><stop offset="0" stop-color="' + pal[0] + '"/><stop offset="1" stop-color="' + pal[1] + '"/></radialGradient></defs>' +
      '<rect width="200" height="200" fill="url(#' + id + ')"/><circle cx="158" cy="42" r="30" fill="#fff" opacity=".22"/><circle cx="34" cy="168" r="40" fill="#fff" opacity=".16"/><circle cx="170" cy="150" r="9" fill="#fff" opacity=".4"/>' +
      '<g transform="translate(36 36) scale(2)" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round">' + ICONS[iconKey(catName(d, p.cat))] + '</g></svg>';
  }

  /* reduce la foto para que quepa en el navegador */
  function compress(file) {
    return new Promise(function (res, rej) {
      var url = URL.createObjectURL(file), im = new Image();
      im.onload = function () {
        var r = Math.min(1, 760 / Math.max(im.width, im.height)), w = Math.round(im.width * r), h = Math.round(im.height * r);
        var c = document.createElement('canvas'); c.width = w; c.height = h;
        var x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); x.drawImage(im, 0, 0, w, h);
        var out = c.toDataURL('image/webp', .72); if (out.indexOf('data:image/webp') !== 0) out = c.toDataURL('image/jpeg', .72);
        URL.revokeObjectURL(url); res(out);
      };
      im.onerror = function () { URL.revokeObjectURL(url); rej(new Error('imagen')); };
      im.src = url;
    });
  }

  var SVG_WA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.3-.15-1.263-.465-2.403-1.485-.888-.795-1.484-1.77-1.66-2.07-.174-.3-.019-.465.13-.615.136-.135.301-.345.451-.523.146-.181.194-.301.297-.496.1-.21.049-.375-.025-.524-.075-.15-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.172-.015-.371-.015-.571-.015-.2 0-.523.074-.797.359-.273.3-1.045 1.02-1.045 2.475s1.07 2.865 1.219 3.075c.149.18 2.095 3.195 5.076 4.483.709.3 1.263.489 1.694.626.712.226 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>';

  /* al abrir una ventana el fondo se queda quieto y, al cerrarla, vuelve exactamente donde estaba */
  var lockY = 0, locked = 0;
  function lock() {
    if (locked++) return;
    lockY = window.pageYOffset || 0;
    document.body.style.top = (-lockY) + 'px'; document.body.classList.add('lock');
  }
  function unlock() {
    if (!locked || --locked) return;
    document.body.classList.remove('lock'); document.body.style.top = '';
    window.scrollTo({ top: lockY, behavior: 'instant' });
  }

  window.NM = {
    lock: lock, unlock: unlock,
    KEY: KEY, get: load, save: save, reset: function () { var d = defaults(); save(d); return d; },
    esc: esc, money: money, digits: digits, phone: phone, prettyPhone: prettyPhone, pct: pct, part: part, partialOf: partialOf,
    uid: uid, catName: catName, daysToXmas: daysToXmas, waText: waText, waUrl: waUrl, logAsk: logAsk, art: art, photo: photo, photoStyle: photoStyle, compress: compress,
    ICONS: ICONS, SVG_WA: SVG_WA
  };
})();
