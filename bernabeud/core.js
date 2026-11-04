/* BERNABEUD Barbershop · prototipo · datos, disponibilidad y utilidades compartidas.
   Desarrollado por Onytek. En el prototipo los datos viven en el navegador de quien prueba;
   en la versión real se conectan a Supabase (mismo modelo). */
(function () {
  'use strict';
  var KEY = 'bernabeud-proto-v1';
  var STEP = 15; // minutos entre horas ofrecidas

  function pad(n) { return String(n).padStart(2, '0'); }
  function ymd(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function fromYmd(s) { var p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function toMin(t) { var p = t.split(':'); return +p[0] * 60 + +p[1]; }
  function toTime(m) { return pad(Math.floor(m / 60)) + ':' + pad(m % 60); }
  function t12(t) { var m = toMin(t), h = Math.floor(m / 60), ap = h >= 12 ? 'p. m.' : 'a. m.'; h = h % 12 || 12; return h + ':' + pad(m % 60) + ' ' + ap; }
  function uid(p) { return p + Date.now().toString(36) + Math.random().toString(36).slice(2, 5); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function money(n) { return '$' + Number(n || 0).toLocaleString('es-CO'); }
  function digits(s) { return String(s || '').replace(/\D/g, ''); }
  function prettyPhone(s) {
    var d = digits(s);
    if (d.length === 12 && d.indexOf('57') === 0) return '+57 ' + d.slice(2, 5) + ' ' + d.slice(5, 8) + ' ' + d.slice(8);
    return d ? '+' + d : '';
  }
  function addDays(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
  var DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  var DAYS3 = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  var MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  function longDate(s) { var d = fromYmd(s); return DAYS[d.getDay()] + ' ' + d.getDate() + ' de ' + MONTHS[d.getMonth()]; }

  function defaults() {
    var today = new Date();
    function bk(n, sv, bar, dayOff, time, name, phone, st) {
      var s = null; // se completa abajo
      return { id: 'k' + n, ref: 'BB-' + (1000 + n), serviceId: sv, barberId: bar, date: ymd(addDays(today, dayOff)), time: time, name: name, phone: phone, status: st, created: Date.now() - n * 3600000, note: '', demo: true };
    }
    var d = {
      v: 1,
      shop: {
        name: 'BERNABEUD Barbershop', slogan: 'Aquí el corte se respeta.', whatsapp: '', address: '', city: '', mapsUrl: '',
        instagram: '', tiktok: '', facebook: '', open: '09:00', close: '23:00'
      },
      services: [
        { id: 'sv1', name: 'Corte sencillo', price: 16000, max: 0, dur: 30, on: true, desc: 'Corte limpio y rápido, con rayas y cejas incluidas.' },
        { id: 'sv2', name: 'Corte de niño', price: 18000, max: 0, dur: 30, on: true, desc: 'Para los pequeños de la casa, con paciencia y estilo.' },
        { id: 'sv3', name: 'Corte de adulto', price: 20000, max: 0, dur: 30, on: true, desc: 'El clásico de la casa, con acabado de revista.' },
        { id: 'sv4', name: 'Corte con barba', price: 22000, max: 25000, dur: 45, on: true, desc: 'Corte más perfilado y arreglo de barba. El precio depende de la barba.' },
        { id: 'sv5', name: 'Corte con barba, cejas y rayas', price: 26000, max: 0, dur: 60, on: true, desc: 'El combo completo: corte, barba, cejas y rayas.' },
        { id: 'sv6', name: 'Miky', price: 8000, max: 0, dur: 15, on: true, desc: 'Servicio rápido de la casa.' },
        { id: 'sv7', name: 'Miky con barba', price: 12000, max: 0, dur: 30, on: true, desc: 'Miky más arreglo de barba.' },
        { id: 'sv8', name: 'Cejas', price: 7000, max: 0, dur: 15, on: true, desc: 'Diseño y perfilado de cejas.' }
      ],
      barbers: [
        { id: 'b1', name: 'Junior', role: 'Barbero', bio: 'Fades, rayas y diseños. Dale una idea y la hace realidad.', photo: null, instagram: '', tiktok: '', facebook: '', whatsapp: '', on: true, offDays: [], blocks: [] },
        { id: 'b2', name: 'Nelly', role: 'Barbera', bio: 'Cortes clásicos y barba perfilada, siempre con detalle.', photo: null, instagram: '', tiktok: '', facebook: '', whatsapp: '', on: true, offDays: [], blocks: [] }
      ],
      users: [
        { id: 'u1', email: 'dueno@bernabeud.demo', pass: 'bernabeud', role: 'owner', barberId: null, name: 'Dueño' },
        { id: 'u2', email: 'junior@bernabeud.demo', pass: 'junior123', role: 'barber', barberId: 'b1', name: 'Junior' },
        { id: 'u3', email: 'nelly@bernabeud.demo', pass: 'nelly123', role: 'barber', barberId: 'b2', name: 'Nelly' }
      ],
      bookings: [
        bk(1, 'sv3', 'b1', 0, '15:00', 'Carlos Pérez', '573001112233', 'confirmed'),
        bk(2, 'sv5', 'b1', 0, '16:00', 'Andrés Ríos', '573004445566', 'pending'),
        bk(3, 'sv4', 'b2', 0, '15:30', 'Sebastián Mora', '573007778899', 'confirmed'),
        bk(4, 'sv1', 'b1', 1, '10:00', 'Luis Gómez', '573011223344', 'pending'),
        bk(5, 'sv5', 'b2', 1, '18:00', 'Daniel Cano', '573015566778', 'confirmed')
      ]
    };
    return d;
  }

  var mem = null;
  function load() {
    try { var raw = localStorage.getItem(KEY); if (raw) { mem = raw; return JSON.parse(raw); } } catch (e) { /* sin almacenamiento */ }
    if (mem) { try { return JSON.parse(mem); } catch (e2) { /* sigue */ } }
    return defaults();
  }
  function save(d) { var s = JSON.stringify(d); mem = s; try { localStorage.setItem(KEY, s); } catch (e) { return false; } return true; }

  function svc(d, id) { return d.services.filter(function (s) { return s.id === id; })[0]; }
  function barber(d, id) { return d.barbers.filter(function (b) { return b.id === id; })[0]; }

  /* ---------- disponibilidad ---------- */
  function busyRanges(d, barberId, date, ignoreId) {
    var out = [];
    d.bookings.forEach(function (k) {
      if (k.barberId !== barberId || k.date !== date || k.status === 'cancel' || k.id === ignoreId) return;
      var s = svc(d, k.serviceId); var dur = k.dur || (s ? s.dur : 30);
      out.push([toMin(k.time), toMin(k.time) + dur]);
    });
    var b = barber(d, barberId);
    if (b) (b.blocks || []).forEach(function (x) { if (x.date === date) out.push([toMin(x.from), toMin(x.to)]); });
    return out;
  }
  function barberFree(d, barberId, date, start, dur, ignoreId) {
    var b = barber(d, barberId); if (!b || !b.on) return false;
    if ((b.offDays || []).indexOf(date) > -1) return false;
    var r = busyRanges(d, barberId, date, ignoreId);
    for (var i = 0; i < r.length; i++) if (start < r[i][1] && start + dur > r[i][0]) return false;
    return true;
  }
  /* horas del día: [{time, free, barberId}] ; barberId 'any' = cualquiera */
  function slots(d, barberId, date, dur, ignoreId) {
    var open = toMin(d.shop.open), close = toMin(d.shop.close), out = [];
    var now = new Date(), isToday = date === ymd(now), nowMin = now.getHours() * 60 + now.getMinutes() + 20;
    var pool = barberId === 'any' ? d.barbers.filter(function (b) { return b.on; }).map(function (b) { return b.id; }) : [barberId];
    for (var m = open; m + dur <= close; m += STEP) {
      var free = null;
      if (!(isToday && m < nowMin) && date >= ymd(now)) {
        for (var i = 0; i < pool.length; i++) if (barberFree(d, pool[i], date, m, dur, ignoreId)) { free = pool[i]; break; }
      }
      out.push({ time: toTime(m), free: !!free, barberId: free });
    }
    return out;
  }
  function freeCount(d, barberId, date, dur) { return slots(d, barberId, date, dur).filter(function (s) { return s.free; }).length; }
  /* para "cualquiera": elige el barbero con menos citas ese día */
  function pickBarber(d, date, start, dur) {
    var best = null, bestN = 1e9;
    d.barbers.forEach(function (b) {
      if (!barberFree(d, b.id, date, start, dur)) return;
      var n = d.bookings.filter(function (k) { return k.barberId === b.id && k.date === date && k.status !== 'cancel'; }).length;
      if (n < bestN) { best = b.id; bestN = n; }
    });
    return best;
  }
  function isOpenNow(d) {
    var n = new Date(), m = n.getHours() * 60 + n.getMinutes();
    return m >= toMin(d.shop.open) && m < toMin(d.shop.close);
  }

  function waUrl(num, text) { return 'https://wa.me/' + digits(num) + '?text=' + encodeURIComponent(text); }
  function ics(d, k) {
    var s = svc(d, k.serviceId), dur = k.dur || (s ? s.dur : 30), a = fromYmd(k.date), m = toMin(k.time);
    function f(date, min) { return date.getFullYear() + pad(date.getMonth() + 1) + pad(date.getDate()) + 'T' + pad(Math.floor(min / 60)) + pad(min % 60) + '00'; }
    return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Onytek//Bernabeud//ES', 'BEGIN:VEVENT', 'UID:' + k.ref + '@bernabeud', 'DTSTAMP:' + f(new Date(), 0).slice(0, 9) + '000000',
      'DTSTART:' + f(a, m), 'DTEND:' + f(a, m + dur), 'SUMMARY:Cita en ' + d.shop.name + ' (' + (s ? s.name : 'Servicio') + ')',
      'LOCATION:' + (d.shop.address || d.shop.name), 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  }

  /* ---------- sesión del panel (prototipo) ---------- */
  var AUTH = 'bernabeud-auth-v1';
  function getSess() {
    try { var r = localStorage.getItem(AUTH) || sessionStorage.getItem(AUTH); return r ? JSON.parse(r) : null; } catch (e) { return null; }
  }
  function login(email, pass, remember) {
    var d = load(), em = String(email || '').trim().toLowerCase();
    var u = d.users.filter(function (x) { return x.email.toLowerCase() === em && x.pass === pass; })[0];
    if (!u) return null;
    var s = { id: u.id, email: u.email, role: u.role, barberId: u.barberId, name: u.name };
    try { localStorage.removeItem(AUTH); sessionStorage.removeItem(AUTH); (remember ? localStorage : sessionStorage).setItem(AUTH, JSON.stringify(s)); } catch (e) { /* nada */ }
    return s;
  }
  function logout() { try { localStorage.removeItem(AUTH); sessionStorage.removeItem(AUTH); } catch (e) { /* nada */ } }

  window.BB = {
    STEP: STEP, DAYS: DAYS, DAYS3: DAYS3, MONTHS: MONTHS,
    get: load, save: save, reset: function () { var d = defaults(); save(d); return d; },
    pad: pad, ymd: ymd, fromYmd: fromYmd, toMin: toMin, toTime: toTime, t12: t12, uid: uid, esc: esc, money: money, digits: digits, prettyPhone: prettyPhone,
    addDays: addDays, longDate: longDate, svc: svc, barber: barber,
    slots: slots, freeCount: freeCount, pickBarber: pickBarber, barberFree: barberFree, isOpenNow: isOpenNow, waUrl: waUrl, ics: ics,
    session: getSess, login: login, logout: logout
  };
})();
