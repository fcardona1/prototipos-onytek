/* BERNABEUD Barbershop · sitio público · servicios, equipo, reservas con validación de disponibilidad */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = BB.esc;
  var d = BB.get();

  function toast(msg) { var t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(function () { t.classList.remove('show'); }, 2600); }
  function url(u) { u = (u || '').trim(); if (!u) return ''; return /^https?:\/\//i.test(u) ? u : 'https://' + u.replace(/^\/+/, ''); }
  function priceTxt(s) { return BB.money(s.price) + (s.max ? ' – ' + BB.money(s.max) : ''); }

  /* ---------- contenido ---------- */
  function renderStatic() {
    var s = d.shop;
    $('#tagline').textContent = s.slogan || '';
    $('#footTag').textContent = s.slogan || 'Aquí el corte se respeta.';
    var open = BB.isOpenNow(d), p = $('#openPill');
    p.textContent = open ? 'Abierto ahora' : 'Cerrado ahora'; p.classList.toggle('closed', !open);
    $('#hoursPill').textContent = BB.t12(s.open).replace(':00', '') + ' a ' + BB.t12(s.close).replace(':00', '') + ' · Todos los días';
    $('#copy').textContent = '© ' + new Date().getFullYear() + ' ' + s.name + ' · Todos los derechos reservados.';
    var wa = $('#waFab'); if (BB.digits(s.whatsapp).length >= 10) { wa.href = BB.waUrl(s.whatsapp, 'Hola BERNABEUD 👋 Quiero información.'); wa.hidden = false; } else wa.hidden = true;
  }
  var IC = {
    cut: '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4L8.1 15.9M14.5 14.5L20 20M8.1 8.1L12 12"/></svg>',
    razor: '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 15l9-9 4 4-9 9H3z"/><path d="M12 6l3-3 6 6-3 3M7 14l3 3"/></svg>',
    comb: '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="6" width="18" height="6" rx="1.5"/><path d="M6 12v6M9 12v4M12 12v6M15 12v4M18 12v6"/></svg>'
  };
  function icon(n) { n = n.toLowerCase(); return /barba|ceja/.test(n) && !/^corte/.test(n) ? IC.razor : /miky/.test(n) ? IC.comb : /barba/.test(n) ? IC.razor : IC.cut; }
  function renderServices() {
    $('#svGrid').innerHTML = d.services.filter(function (x) { return x.on; }).map(function (s) {
      return '<button type="button" class="mrow" data-book="' + esc(s.id) + '"><span class="mn">' + icon(s.name) + esc(s.name) + '</span><span class="ml" aria-hidden="true"></span><span class="mp">' + priceTxt(s) + '</span>' +
        '<span class="md">' + esc(s.desc) + ' · ' + s.dur + ' min</span><span class="mt">Reservar →</span></button>';
    }).join('');
  }
  function socialLinks(o) {
    var out = [];
    [['instagram', 'Instagram'], ['tiktok', 'TikTok'], ['facebook', 'Facebook']].forEach(function (k) { if ((o[k[0]] || '').trim()) out.push('<a class="soc" href="' + esc(url(o[k[0]])) + '" target="_blank" rel="noopener">' + k[1] + '</a>'); });
    return out.join('');
  }
  function avatar(b, cls) { return '<span class="avatar ' + (cls || '') + '">' + (b.photo ? '<img src="' + esc(b.photo) + '" alt="' + esc(b.name) + '">' : esc(b.name.charAt(0).toUpperCase())) + '</span>'; }
  function renderBarbers() {
    $('#brGrid').innerHTML = d.barbers.filter(function (b) { return b.on; }).map(function (b, i) {
      return '<article class="br reveal"><div class="br-top">' + avatar(b) + '<div><span class="cn">' + String(i + 1).padStart(2, '0') + '</span><h3>' + esc(b.name) + '</h3><span class="role">' + esc(b.role || 'Barbero') + '</span></div></div>' +
        '<p>' + esc(b.bio) + '</p><div class="row"><button class="btn small" type="button" data-book-b="' + esc(b.id) + '">Reservar con ' + esc(b.name) + '</button>' + socialLinks(b) + '</div><span class="dorsal" aria-hidden="true">' + (i + 1) + '</span><div class="bar-code" aria-hidden="true"></div></article>';
    }).join('');
  }
  function renderToday() {
    var today = BB.ymd(new Date()), svc = d.services.filter(function (x) { return x.on; })[0];
    var dur = svc ? svc.dur : 30;
    $('#today').innerHTML = '<h3>Hoy · horas libres</h3>' + d.barbers.filter(function (b) { return b.on; }).map(function (b) {
      var n = BB.freeCount(d, b.id, today, dur), t = String(Math.min(n, 99)).padStart(2, '0');
      return '<div class="it"><span>' + esc(b.name) + '</span><span class="flaps ' + (n === 0 ? 'none' : n < 5 ? 'low' : '') + '"><i class="fl">' + t.charAt(0) + '</i><i class="fl">' + t.charAt(1) + '</i><small>' + (n === 0 ? 'SIN HORAS' : 'LIBRES') + '</small></span></div>';
    }).join('');
  }
  function renderLoc() {
    var s = d.shop, a = $('#addr');
    if ((s.address || '').trim()) { a.textContent = s.address + (s.city ? ', ' + s.city : ''); a.classList.remove('pend'); } else { a.textContent = 'Dirección pendiente por confirmar'; a.classList.add('pend'); }
    var dow = new Date().getDay();
    $('#hrs').innerHTML = BB.DAYS.map(function (n, i) { return '<li class="' + (i === dow ? 'today-d' : '') + '"><span>' + n + '</span><span>' + BB.t12(s.open) + ' – ' + BB.t12(s.close) + '</span></li>'; }).join('');
    var btn = '';
    if ((s.mapsUrl || '').trim()) btn += '<a class="btn small" href="' + esc(url(s.mapsUrl)) + '" target="_blank" rel="noopener">Abrir en Google Maps</a>';
    else btn += '<span class="btn small" aria-disabled="true">Mapa próximamente</span>';
    if (BB.digits(s.whatsapp).length >= 10) btn += '<a class="btn small wa" href="' + esc(BB.waUrl(s.whatsapp, 'Hola BERNABEUD 👋 ¿Cómo llego a la barbería?')) + '" target="_blank" rel="noopener">Preguntar por WhatsApp</a>';
    $('#locBtns').innerHTML = btn;
    $('#howTo').innerHTML = ['Toca "Abrir en Google Maps" y deja que la app te guíe.', 'Busca el poste de barbero en la entrada: ahí es.', 'Si te pierdes, escríbenos por WhatsApp y te ubicamos.'].map(function (t) { return '<li>' + t + '</li>'; }).join('');
  }
  function renderSocials() {
    var s = d.shop, out = '';
    [['instagram', 'Instagram'], ['tiktok', 'TikTok'], ['facebook', 'Facebook']].forEach(function (k) {
      out += (s[k[0]] || '').trim() ? '<a class="soc-big" href="' + esc(url(s[k[0]])) + '" target="_blank" rel="noopener">' + k[1] + '</a>' : '<span class="soc-big pend">' + k[1] + ' · próximamente</span>';
    });
    $('#socials').innerHTML = out;
  }
  function renderAll() { renderStatic(); renderServices(); renderBarbers(); renderToday(); renderLoc(); renderSocials(); observe(); }

  /* ---------- aparición al hacer scroll ---------- */
  var io = ('IntersectionObserver' in window) ? new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: .12 }) : null;
  function observe() { $$('.reveal:not(.in)').forEach(function (el) { if (io) io.observe(el); else el.classList.add('in'); }); }

  /* ---------- asistente de reserva ---------- */
  var layer = $('#book'), W = null;
  function fresh(svcId, barId) {
    var c = {}; try { c = JSON.parse(localStorage.getItem('bernabeud-cliente') || '{}'); } catch (e) { /* nada */ }
    return { step: svcId ? (barId ? 3 : 2) : 1, svc: svcId || null, bar: barId || null, date: null, time: null, assigned: null, name: c.name || '', phone: c.phone || '', note: '', ok: false, done: null };
  }
  function openBook(svcId, barId) {
    d = BB.get(); W = fresh(svcId, barId);
    layer.classList.add('open'); layer.setAttribute('aria-hidden', 'false'); document.body.classList.add('lock');
    drawBook();
  }
  function closeBook() { layer.classList.remove('open'); layer.setAttribute('aria-hidden', 'true'); document.body.classList.remove('lock'); renderToday(); }
  function curSvc() { return BB.svc(d, W.svc); }
  function firstFreeDate() {
    var s = curSvc(); if (!s) return BB.ymd(new Date());
    for (var i = 0; i < 14; i++) { var ds = BB.ymd(BB.addDays(new Date(), i)); if (BB.freeCount(d, W.bar, ds, s.dur) > 0) return ds; }
    return BB.ymd(new Date());
  }
  function drawBook() {
    var body = $('#bBody'), foot = $('#bFoot'), title = $('#bTitle'), st = W.step, h = '';
    var dots = '<div class="dots" aria-hidden="true">' + [1, 2, 3, 4].map(function (i) { return '<i class="' + (i <= Math.min(st, 4) ? 'on' : '') + '"></i>'; }).join('') + '</div>';
    if (st === 1) {
      title.textContent = '¿Qué te hacemos?';
      h = dots + '<div class="opts">' + d.services.filter(function (x) { return x.on; }).map(function (s) {
        return '<button type="button" class="opt" data-svc="' + esc(s.id) + '" aria-pressed="' + (W.svc === s.id) + '"><span class="t"><b>' + esc(s.name) + '</b><small>' + s.dur + ' min</small></span><span class="pr">' + priceTxt(s) + '</span></button>';
      }).join('') + '</div>';
      foot.innerHTML = '<button class="btn ghost" type="button" data-close>Cancelar</button><button class="btn" type="button" data-next ' + (W.svc ? '' : 'disabled') + '>Siguiente</button>';
    } else if (st === 2) {
      title.textContent = '¿Con quién?';
      h = dots + '<div class="opts"><button type="button" class="opt" data-bar="any" aria-pressed="' + (W.bar === 'any') + '"><span class="avatar av">★</span><span class="t"><b>El primero disponible</b><small>Te asignamos al que tenga tu hora libre</small></span></button>' +
        d.barbers.filter(function (b) { return b.on; }).map(function (b) {
          return '<button type="button" class="opt" data-bar="' + esc(b.id) + '" aria-pressed="' + (W.bar === b.id) + '">' + avatar(b, 'av') + '<span class="t"><b>' + esc(b.name) + '</b><small>' + esc(b.role || 'Barbero') + '</small></span></button>';
        }).join('') + '</div>';
      foot.innerHTML = '<button class="btn ghost" type="button" data-back>Atrás</button><button class="btn" type="button" data-next ' + (W.bar ? '' : 'disabled') + '>Siguiente</button>';
    } else if (st === 3) {
      title.textContent = 'Día y hora';
      if (!W.date) W.date = firstFreeDate();
      var s = curSvc(), days = '';
      for (var i = 0; i < 14; i++) {
        var dt = BB.addDays(new Date(), i), ds = BB.ymd(dt), n = BB.freeCount(d, W.bar, ds, s.dur);
        days += '<button type="button" class="day' + (n === 0 ? ' full' : '') + '" data-date="' + ds + '" aria-pressed="' + (W.date === ds) + '" ' + (n === 0 ? 'disabled' : '') + '>' + (i === 0 ? 'Hoy' : BB.DAYS3[dt.getDay()]) + '<b>' + dt.getDate() + '</b><small>' + (n === 0 ? 'lleno' : n + ' libres') + '</small></button>';
      }
      var sl = BB.slots(d, W.bar, W.date, s.dur), g = { 'Mañana': [], 'Tarde': [], 'Noche': [] };
      sl.forEach(function (x) { var m = BB.toMin(x.time); g[m < 720 ? 'Mañana' : m < 1080 ? 'Tarde' : 'Noche'].push(x); });
      var grid = Object.keys(g).map(function (k) {
        if (!g[k].length) return '';
        return '<p class="grp">' + k + '</p><div class="slots">' + g[k].map(function (x) { return '<button type="button" class="slot" data-time="' + x.time + '" data-as="' + (x.barberId || '') + '" aria-pressed="' + (W.time === x.time) + '" ' + (x.free ? '' : 'disabled') + '>' + BB.t12(x.time).replace(' a. m.', ' am').replace(' p. m.', ' pm') + '</button>'; }).join('') + '</div>';
      }).join('');
      h = dots + '<div class="days" role="group" aria-label="Día">' + days + '</div><p class="muted" style="margin:0">' + esc(BB.longDate(W.date)) + ' · ' + esc(s.name) + ' (' + s.dur + ' min)</p>' + (sl.some(function (x) { return x.free; }) ? grid : '<p class="err">No quedan horas libres este día. Prueba con otro.</p>');
      foot.innerHTML = '<button class="btn ghost" type="button" data-back>Atrás</button><button class="btn" type="button" data-next ' + (W.time ? '' : 'disabled') + '>Siguiente</button>';
    } else if (st === 4) {
      title.textContent = 'Tus datos';
      var sv = curSvc(), bn = W.bar === 'any' ? (BB.barber(d, W.assigned) || {}).name + ' (primero disponible)' : (BB.barber(d, W.bar) || {}).name;
      h = dots + '<div class="sum"><div><span>Servicio</span><b>' + esc(sv.name) + '</b></div><div><span>Barbero</span><b>' + esc(bn) + '</b></div><div><span>Día</span><b>' + esc(BB.longDate(W.date)) + '</b></div><div><span>Hora</span><b>' + BB.t12(W.time) + '</b></div><div><span>Precio</span><b>' + priceTxt(sv) + '</b></div></div>' +
        '<div class="field"><label for="cName">Tu nombre</label><input class="in" id="cName" autocomplete="name" value="' + esc(W.name) + '" maxlength="40"></div>' +
        '<div class="field"><label for="cPhone">Tu WhatsApp</label><input class="in" id="cPhone" type="tel" inputmode="tel" autocomplete="tel" placeholder="300 000 0000" value="' + esc(W.phone) + '" maxlength="18"></div>' +
        '<div class="field"><label for="cNote">¿Algo que debamos saber? (opcional)</label><input class="in" id="cNote" maxlength="120" placeholder="Ej. fade bajo, diseño en la ceja" value="' + esc(W.note) + '"></div>' +
        '<label class="chk"><input type="checkbox" id="cOk"' + (W.ok ? ' checked' : '') + '> Autorizo el tratamiento de mis datos para gestionar mi cita (Ley 1581 de 2012).</label><p class="err" id="cErr" hidden></p>';
      foot.innerHTML = '<button class="btn ghost" type="button" data-back>Atrás</button><button class="btn" type="button" data-confirm>Confirmar cita</button>';
    } else {
      var k = W.done, sv2 = BB.svc(d, k.serviceId), b2 = BB.barber(d, k.barberId), s = d.shop;
      title.textContent = '¡Cita lista!';
      var msg = 'Hola BERNABEUD 👋 Reservé una cita:\n✂️ ' + sv2.name + '\n👤 ' + b2.name + '\n📅 ' + BB.longDate(k.date) + '\n🕒 ' + BB.t12(k.time) + '\n🙋 ' + k.name + '\nCódigo ' + k.ref;
      var hasWa = BB.digits(s.whatsapp).length >= 10;
      h = '<div class="done"><svg class="ck" viewBox="0 0 80 80" aria-hidden="true"><circle cx="40" cy="40" r="36" fill="#D4A72C" stroke="#000" stroke-width="4"/><path d="M24 41l11 11 21-24" fill="none" stroke="#000" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
        '<p class="big">Te esperamos, ' + esc(k.name.split(' ')[0]) + '</p><span class="code">' + esc(k.ref) + '</span>' +
        '<div class="sum"><div><span>Servicio</span><b>' + esc(sv2.name) + '</b></div><div><span>Barbero</span><b>' + esc(b2.name) + '</b></div><div><span>Día</span><b>' + esc(BB.longDate(k.date)) + '</b></div><div><span>Hora</span><b>' + BB.t12(k.time) + '</b></div></div>' +
        '<p class="muted" style="margin:0">Tu cita queda <b>pendiente</b> hasta que el barbero la confirme.' + (hasWa ? ' Avísanos por WhatsApp para agilizarla.' : '') + '</p>' +
        (hasWa ? '<a class="btn wa" href="' + esc(BB.waUrl(s.whatsapp, msg)) + '" target="_blank" rel="noopener">Avisar por WhatsApp</a>' : '') +
        '<button class="btn ghost small" type="button" data-ics>Agregar al calendario</button></div>';
      foot.innerHTML = '<button class="btn" type="button" data-close>Listo</button>';
    }
    body.innerHTML = h; body.scrollTop = 0;
    var sel = $('.opt[aria-pressed="true"], .day[aria-pressed="true"]', body); if (sel && sel.scrollIntoView && st === 3) { var dd = $('.days', body); var t = $('.day[aria-pressed="true"]', dd); if (t) dd.scrollLeft = t.offsetLeft - 20; }
  }
  function confirmBooking() {
    var name = $('#cName').value.trim(), phone = BB.digits($('#cPhone').value), er = $('#cErr');
    W.name = name; W.phone = $('#cPhone').value; W.note = $('#cNote').value.trim(); W.ok = $('#cOk').checked;
    var err = '';
    if (name.length < 2) err = 'Escribe tu nombre.';
    else if (phone.length < 10) err = 'Escribe tu WhatsApp con 10 números, ej. 300 123 4567.';
    else if (!W.ok) err = 'Debes autorizar el tratamiento de datos para continuar.';
    if (err) { er.textContent = err; er.hidden = false; return; }
    d = BB.get();
    var s = curSvc(), start = BB.toMin(W.time), bar = W.bar === 'any' ? BB.pickBarber(d, W.date, start, s.dur) : (BB.barberFree(d, W.bar, W.date, start, s.dur) ? W.bar : null);
    if (!bar) { toast('Esa hora acaba de ocuparse. Elige otra.'); W.step = 3; W.time = null; drawBook(); return; }
    if (phone.length === 10) phone = '57' + phone;
    var n = d.bookings.length + 1, ref = 'BB-' + (1000 + Math.floor(Math.random() * 8999));
    var k = { id: BB.uid('k'), ref: ref, serviceId: s.id, barberId: bar, date: W.date, time: W.time, dur: s.dur, name: name, phone: phone, status: 'pending', created: Date.now(), note: W.note };
    d.bookings.push(k); BB.save(d);
    try { localStorage.setItem('bernabeud-cliente', JSON.stringify({ name: name, phone: W.phone })); } catch (e) { /* nada */ }
    W.done = k; W.step = 5; drawBook();
  }
  function downloadIcs() {
    var k = W.done, blob = new Blob([BB.ics(d, k)], { type: 'text/calendar' }), a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'cita-' + k.ref + '.ics'; document.body.appendChild(a); a.click(); a.remove();
  }

  /* ---------- eventos ---------- */
  document.addEventListener('click', function (e) {
    var t = e.target, el;
    if ((el = t.closest('[data-book-b]'))) { openBook(null, el.dataset.bookB); return; }
    if ((el = t.closest('[data-book]'))) { openBook(el.dataset.book || null); return; }
    if (t.closest('#book [data-close]')) { closeBook(); return; }
    if ((el = t.closest('[data-legal]'))) { openLegal(el.dataset.legal); return; }
    if (t.closest('#legal [data-close]')) { closeLegal(); return; }
    if (!W || !layer.classList.contains('open')) { /* resto abajo */ } else {
      if ((el = t.closest('[data-svc]'))) { W.svc = el.dataset.svc; W.time = null; W.date = null; drawBook(); return; }
      if ((el = t.closest('[data-bar]'))) { W.bar = el.dataset.bar; W.time = null; W.date = null; drawBook(); return; }
      if ((el = t.closest('[data-date]'))) { W.date = el.dataset.date; W.time = null; drawBook(); return; }
      if ((el = t.closest('[data-time]'))) { W.time = el.dataset.time; W.assigned = el.dataset.as || null; drawBook(); return; }
      if (t.closest('[data-next]')) { W.step = Math.min(4, W.step + 1); if (W.step === 3 && !W.svc) W.step = 1; drawBook(); return; }
      if (t.closest('[data-back]')) { W.step = Math.max(1, W.step - 1); drawBook(); return; }
      if (t.closest('[data-confirm]')) { confirmBooking(); return; }
      if (t.closest('[data-ics]')) { downloadIcs(); return; }
    }
    if (t.closest('[data-install]')) { install(); return; }
  });

  /* ---------- instalar como app ---------- */
  var dip = null;
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); dip = e; $$('[data-install]').forEach(function (b) { b.hidden = false; }); });
  window.addEventListener('appinstalled', function () { $$('[data-install]').forEach(function (b) { b.hidden = true; }); });
  function install() { if (dip) { dip.prompt(); dip = null; } else toast('En el menú del navegador: "Agregar a pantalla de inicio".'); }
  if (/iPhone|iPad/.test(navigator.userAgent) && !window.navigator.standalone) $$('[data-install]').forEach(function (b) { b.hidden = false; });

  /* ---------- barra inferior: sección activa ---------- */
  var links = $$('#bnav [data-s]');
  if ('IntersectionObserver' in window) {
    var so = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) links.forEach(function (a) { var on = a.dataset.s === e.target.id; a.classList.toggle('on', on); if (on && a.scrollIntoView && getComputedStyle(a.parentNode).display !== 'none') { var bx = a.parentNode; bx.scrollTo({ left: a.offsetLeft - 24, behavior: 'smooth' }); } }); }); }, { rootMargin: '-45% 0px -50% 0px' });
    ['inicio', 'servicios', 'barberos', 'reservar', 'llegar', 'redes'].forEach(function (id) { var el = document.getElementById(id); if (el) so.observe(el); });
  }

  /* ---------- logo interactivo: toca y salen destellos dorados ---------- */
  var st = $('#sticker');
  if (st) st.addEventListener('click', function (e) {
    st.classList.remove('wig'); void st.offsetWidth; st.classList.add('wig');
    var x = e.clientX || innerWidth / 2, y = e.clientY || innerHeight / 3;
    for (var i = 0; i < 14; i++) {
      var p = document.createElement('i'), a = Math.random() * Math.PI * 2, r = 50 + Math.random() * 90;
      p.className = 'dot-burst'; p.style.left = x + 'px'; p.style.top = y + 'px'; p.style.background = p.style.color = ['#FFC83D', '#FFE08A', '#5B8CFF', '#FF4457'][i % 4];
      p.style.setProperty('--dx', Math.cos(a) * r + 'px'); p.style.setProperty('--dy', Math.sin(a) * r + 'px');
      document.body.appendChild(p); setTimeout(function (q) { q.remove(); }.bind(null, p), 950);
    }
  });


  /* ---------- información legal (se abre en hoja; solo cierra con X o Cerrar) ---------- */
  function legalDocs() {
    var s = d.shop, n = esc(s.name), wa = BB.digits(s.whatsapp).length >= 10 ? esc(BB.prettyPhone(s.whatsapp)) : 'el WhatsApp de la barbería (pendiente de publicar)';
    return {
      datos: ['Tratamiento de datos personales',
        '<p>En ' + n + ' cuidamos tus datos. Esta política aplica a la información que nos das al reservar una cita en este sitio, conforme a la Ley 1581 de 2012 y el Decreto 1377 de 2013 de Colombia.</p><h3>Responsable</h3><p>' + n + '. Razón social, NIT y dirección: <b>pendientes de completar</b>. Contacto: ' + wa + '.</p><h3>Qué datos pedimos</h3><ul><li>Nombre y número de WhatsApp.</li><li>La nota opcional que escribas en tu reserva.</li></ul><h3>Para qué los usamos</h3><ul><li>Gestionar y confirmar tu cita.</li><li>Escribirte por WhatsApp sobre esa cita (cambios, recordatorios).</li></ul><p>No vendemos ni compartimos tus datos con terceros, salvo que la ley lo exija.</p><h3>Tus derechos</h3><p>Puedes conocer, actualizar, rectificar y suprimir tus datos, y revocar tu autorización, escribiéndonos por el canal de contacto. Al reservar marcas la casilla de autorización; sin ella no podemos agendar tu cita.</p>'],
      terminos: ['Términos de servicio',
        '<p>Al usar este sitio y reservar una cita aceptas estos términos.</p><ul><li>Las citas están sujetas a la disponibilidad que muestra el sitio al momento de reservar.</li><li>Una cita queda <b>pendiente</b> hasta que el barbero la confirme.</li><li>Los precios son los publicados en La carta. El corte con barba puede variar dentro del rango indicado según el trabajo.</li><li>El pago se hace en la barbería al terminar el servicio.</li><li>Nos reservamos el derecho de reprogramar una cita por causas de fuerza mayor; te avisaremos por WhatsApp.</li><li>Los contenidos del sitio (logo, textos e imágenes) pertenecen a ' + n + ' y no pueden usarse sin permiso.</li></ul>'],
      reembolso: ['Política de reembolso',
        '<p>Hoy esta página <b>no cobra nada por adelantado</b>: reservar es gratis y el servicio se paga en la barbería.</p><p>Si estás inconforme con un servicio, díselo a tu barbero en el momento para corregirlo. Si en el futuro se habilitan pagos en línea, aquí publicaremos las condiciones de devolución antes de activarlos.</p>'],
      reservas: ['Política de reservas',
        '<ul><li><b>Llegada:</b> te esperamos hasta 15 minutos después de tu hora; pasado ese tiempo la cita puede liberarse.</li><li><b>Cancelar o cambiar:</b> avísanos por WhatsApp con al menos 2 horas de anticipación para dejar la hora libre a otra persona.</li><li><b>Inasistencias:</b> si no llegas y no avisas varias veces, podemos pedirte confirmar por WhatsApp antes de agendar de nuevo.</li><li><b>Duración:</b> cada servicio reserva el tiempo indicado en La carta, para que nadie espere.</li><li>Horario: todos los días, de ' + BB.t12(s.open) + ' a ' + BB.t12(s.close) + '.</li></ul>'],
      quienes: ['¿Quiénes somos?',
        '<p><b>' + n + '</b> es una barbería urbana con sello callejero, salsero y madridista. Aquí el corte se respeta: fades, rayas, barba y cejas, con atención de barberos que cuidan cada detalle.</p><p>Nuestro equipo titular: ' + d.barbers.filter(function (b) { return b.on; }).map(function (b) { return esc(b.name); }).join(' y ') + '.</p><p>Abrimos todos los días de ' + BB.t12(s.open) + ' a ' + BB.t12(s.close) + '. Dirección: ' + ((s.address || '').trim() ? esc(s.address) : 'pendiente de confirmar') + '.</p>']
    };
  }
  function openLegal(k) {
    var x = legalDocs()[k]; if (!x) return;
    $('#lgT').textContent = x[0]; $('#lgB').innerHTML = x[1]; $('#lgB').scrollTop = 0;
    var l = $('#legal'); l.classList.add('open'); l.setAttribute('aria-hidden', 'false'); document.body.classList.add('lock');
  }
  function closeLegal() { var l = $('#legal'); l.classList.remove('open'); l.setAttribute('aria-hidden', 'true'); document.body.classList.remove('lock'); }

  /* ---------- poste de barbero: gira con el scroll ---------- */
  var rail = $('.rail');
  if (rail && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    rail.classList.add('js');
    var tick = false;
    addEventListener('scroll', function () { if (tick) return; tick = true; requestAnimationFrame(function () { rail.style.backgroundPosition = '0 ' + Math.round(scrollY * .5) + 'px'; tick = false; }); }, { passive: true });
  }

  /* ---------- tijeras: cada toque en la pared corta ---------- */
  document.addEventListener('pointerdown', function (e) {
    if (e.target.closest('button, a, input, select, textarea, .sheet, .top, .cta-bar, label')) return;
    var x = e.clientX, y = e.clientY, el = document.createElement('div');
    el.className = 'snip';
    el.style.left = x + 'px'; el.style.top = y + 'px';
    el.innerHTML = '<svg viewBox="0 0 46 46" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><g class="b1"><path d="M14 32L38 8"/><circle cx="10" cy="36" r="4.5"/></g><g class="b2"><path d="M14 32L38 40"/><circle cx="10" cy="36" r="4.5" transform="translate(0 0)"/></g></svg>';
    document.body.appendChild(el); setTimeout(function () { el.remove(); }, 750);
    for (var i = 0; i < 6; i++) {
      var h = document.createElement('i'), a = Math.random() * Math.PI * 2, r = 30 + Math.random() * 40;
      h.className = 'hair'; h.style.left = x + 'px'; h.style.top = y + 'px';
      h.style.setProperty('--dx', Math.cos(a) * r + 'px'); h.style.setProperty('--dy', Math.sin(a) * r + 20 + 'px'); h.style.setProperty('--r', (Math.random() * 360 | 0) + 'deg');
      document.body.appendChild(h); setTimeout(function (q) { q.remove(); }.bind(null, h), 850);
    }
  });

  /* ---------- espejo con inclinación al mover el puntero ---------- */
  var art = $('.hero-art'), mir = $('#sticker');
  if (art && mir && matchMedia('(pointer: fine)').matches) {
    art.addEventListener('pointermove', function (e) { var r = art.getBoundingClientRect(); mir.style.setProperty('--ry', ((e.clientX - r.left) / r.width - .5) * 14 + 'deg'); mir.style.setProperty('--rx', (.5 - (e.clientY - r.top) / r.height) * 12 + 'deg'); });
    art.addEventListener('pointerleave', function () { mir.style.setProperty('--ry', '0deg'); mir.style.setProperty('--rx', '0deg'); });
  }

  /* ---------- la clave: son 3-2 sintetizado (solo suena si lo tocas) ---------- */
  var AC = null, on = false, step = 0, nextT = 0, timer = null, BPM = 100;
  var CLAVE = [0, 3, 6, 10, 12], CONGA = [4, 8, 10, 12, 15], COW = [0, 4, 8, 12];
  function ac() { if (!AC) { var C = window.AudioContext || window.webkitAudioContext; if (!C) return null; AC = new C(); } if (AC.state === 'suspended') AC.resume(); return AC; }
  function env(g, t, v, dur) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + .004); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); }
  function sClave(t) { var o = AC.createOscillator(), g = AC.createGain(); o.type = 'triangle'; o.frequency.setValueAtTime(2500, t); o.connect(g); g.connect(AC.destination); env(g, t, .32, .09); o.start(t); o.stop(t + .12); }
  function sCow(t, v) { var g = AC.createGain(), f = AC.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 800; f.Q.value = 1.2; [540, 800].forEach(function (fr) { var o = AC.createOscillator(); o.type = 'square'; o.frequency.value = fr; o.connect(f); o.start(t); o.stop(t + .25); }); f.connect(g); g.connect(AC.destination); env(g, t, v, .22); }
  function sConga(t) { var o = AC.createOscillator(), g = AC.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(240, t); o.frequency.exponentialRampToValueAtTime(130, t + .12); o.connect(g); g.connect(AC.destination); env(g, t, .5, .2); o.start(t); o.stop(t + .24); }
  function sched() {
    var dt = 60 / BPM / 4;
    while (nextT < AC.currentTime + .12) {
      var st = step % 16;
      if (CLAVE.indexOf(st) > -1) { sClave(nextT); (function (ms) { setTimeout(function () { var m = $('#sticker'); if (!m) return; m.classList.add('beat'); setTimeout(function () { m.classList.remove('beat'); }, 120); }, ms); })(Math.max(0, (nextT - AC.currentTime) * 1000)); }
      if (CONGA.indexOf(st) > -1) sConga(nextT);
      if (COW.indexOf(st) > -1) sCow(nextT, .07);
      nextT += dt; step++;
    }
  }
  function claveToggle() {
    var b = $('#clave'); if (!b) return;
    if (on) { on = false; clearInterval(timer); b.setAttribute('aria-pressed', 'false'); $('.clave-t', b).textContent = 'Dale a la clave'; return; }
    if (!ac()) { toast('Tu navegador no deja reproducir sonido.'); return; }
    on = true; step = 0; nextT = AC.currentTime + .08; timer = setInterval(sched, 25); b.setAttribute('aria-pressed', 'true'); $('.clave-t', b).textContent = 'Suena la clave · apagar';
  }
  var cb = $('#clave'); if (cb) cb.addEventListener('click', claveToggle);
  document.addEventListener('visibilitychange', function () { if (document.hidden && on) claveToggle(); });

  window.addEventListener('storage', function (e) { if (e.key === 'bernabeud-proto-v1' && !layer.classList.contains('open')) { d = BB.get(); renderAll(); } });
  setInterval(function () { var o = BB.isOpenNow(d), p = $('#openPill'); p.textContent = o ? 'Abierto ahora' : 'Cerrado ahora'; p.classList.toggle('closed', !o); }, 60000);
  renderAll();
})();
