/* BERNABEUD · panel de barberos (prototipo con datos locales) */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = BB.esc, S = null, d = null, tab = 'agenda', day = BB.ymd(new Date()), fBar = 'all';

  function toast(m) { var t = $('#toast'); t.textContent = m; t.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(function () { t.classList.remove('show'); }, 2400); }
  function save() { BB.save(d); }
  var ICON = {
    agenda: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',
    servicios: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4L8.1 15.9M14.5 14.5L20 20M8.1 8.1L12 12"/></svg>',
    equipo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.9M16 3.1a4 4 0 010 7.8"/></svg>',
    horarios: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
    ajustes: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 004.6 15a1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.6a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>'
  };
  var STATUS = { pending: 'Pendiente', confirmed: 'Confirmada', done: 'Atendida', noshow: 'No vino', cancel: 'Cancelada' };
  function owner() { return S.role === 'owner'; }

  /* ---------- acceso ---------- */
  function showGate() { $('#gate').hidden = false; $('#app').hidden = true; document.body.classList.add('street'); }
  function enter() {
    S = BB.session(); if (!S) return showGate();
    d = BB.get(); $('#gate').hidden = true; $('#app').hidden = false;
    $('#whoName').textContent = owner() ? 'Bernabeud' : S.name; $('#whoRole').textContent = owner() ? 'Dueño' : 'Barbero';
    var tabs = owner() ? [['agenda', 'Agenda'], ['servicios', 'Servicios'], ['equipo', 'Equipo'], ['horarios', 'Horarios'], ['ajustes', 'Ajustes']] : [['agenda', 'Agenda'], ['equipo', 'Mi perfil'], ['horarios', 'Horarios']];
    $('#nav').innerHTML = tabs.map(function (t) { return '<button type="button" data-tab="' + t[0] + '">' + ICON[t[0]] + '<span>' + t[1] + '</span></button>'; }).join('');
    go('agenda');
  }
  $('#eye').addEventListener('click', function () {
    var i = $('#lPass'), show = i.type === 'password'; i.type = show ? 'text' : 'password'; this.setAttribute('aria-label', show ? 'Ocultar contraseña' : 'Mostrar contraseña'); this.style.opacity = show ? 1 : .65;
  });
  $('#loginForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var s = BB.login($('#lEmail').value, $('#lPass').value, $('#lRem').checked), er = $('#lErr');
    if (!s) { er.textContent = 'Correo o contraseña incorrectos.'; er.hidden = false; return; }
    er.hidden = true; $('#lPass').value = ''; enter();
  });
  $$('[data-demo]').forEach(function (b) { b.addEventListener('click', function () { var p = b.dataset.demo.split('|'); $('#lEmail').value = p[0]; $('#lPass').value = p[1]; $('#lErr').hidden = true; }); });
  $('#logout').addEventListener('click', function () { BB.logout(); S = null; showGate(); });

  /* ---------- navegación ---------- */
  function go(t) {
    tab = t;
    $$('#nav button').forEach(function (b) { b.setAttribute('aria-current', b.dataset.tab === t ? 'true' : 'false'); });
    $$('.view').forEach(function (v) { v.hidden = v.id !== 'v-' + t; });
    $('#fab').hidden = t !== 'agenda';
    render(); window.scrollTo(0, 0);
  }
  function render() { d = BB.get(); ({ agenda: rAgenda, servicios: rServicios, equipo: rEquipo, horarios: rHorarios, ajustes: rAjustes })[tab](); }

  /* ---------- agenda ---------- */
  function rAgenda() {
    var v = $('#v-agenda'), bars = d.barbers, myBar = owner() ? fBar : S.barberId;
    var all = d.bookings.filter(function (k) { return k.date === day && (myBar === 'all' || k.barberId === myBar); }).sort(function (a, b) { return a.time < b.time ? -1 : 1; });
    var act = all.filter(function (k) { return k.status !== 'cancel'; });
    var n = function (st) { return all.filter(function (k) { return k.status === st; }).length; };
    var isToday = day === BB.ymd(new Date());
    v.innerHTML = '<div class="vh"><h1>Agenda</h1></div>' +
      '<div class="stats"><div class="stat"><b>' + act.length + '</b><small>Citas</small></div><div class="stat"><b>' + n('pending') + '</b><small>Pendientes</small></div><div class="stat"><b>' + n('confirmed') + '</b><small>Confirmadas</small></div><div class="stat"><b>' + BB.money(all.filter(function (k) { return k.status === 'done'; }).reduce(function (a, k) { return a + ((BB.svc(d, k.serviceId) || {}).price || 0); }, 0)) + '</b><small>Atendido</small></div></div>' +
      '<div class="tools"><div class="daynav"><button class="btn small ghost" type="button" data-day="-1" aria-label="Día anterior">‹</button><button class="btn small' + (isToday ? '' : ' ghost') + '" type="button" data-day="0">Hoy</button><button class="btn small ghost" type="button" data-day="1" aria-label="Día siguiente">›</button></div>' +
      '<div class="field"><label for="fDay">Fecha</label><input class="in" id="fDay" type="date" value="' + day + '"></div>' +
      (owner() ? '<div class="field"><label for="fBar">Barbero</label><select class="in" id="fBar"><option value="all">Todos</option>' + bars.map(function (b) { return '<option value="' + b.id + '"' + (fBar === b.id ? ' selected' : '') + '>' + esc(b.name) + '</option>'; }).join('') + '</select></div>' : '') + '</div>' +
      '<p class="muted" style="margin:0">' + esc(BB.longDate(day)) + '</p>' +
      '<div class="list">' + (all.length ? all.map(card).join('') : '<div class="empty">No hay citas para este día. ¡Aprovecha para afilar las máquinas! ✂️</div>') + '</div>';
  }
  function card(k) {
    var s = BB.svc(d, k.serviceId) || { name: '—', price: 0 }, b = BB.barber(d, k.barberId) || { name: '—' }, a = '';
    if (k.status === 'pending') a += '<button class="btn small blue" data-st="confirmed" data-id="' + k.id + '">Confirmar</button>';
    if (k.status === 'pending' || k.status === 'confirmed') a += '<button class="btn small" data-st="done" data-id="' + k.id + '">Atendida</button><button class="btn small ghost" data-st="noshow" data-id="' + k.id + '">No vino</button><button class="btn small ghost" data-st="cancel" data-id="' + k.id + '">Cancelar</button>';
    else if (k.status !== 'done') a += '<button class="btn small ghost" data-st="pending" data-id="' + k.id + '">Reabrir</button>';
    if (BB.digits(k.phone).length >= 10) a += '<a class="btn small wa" target="_blank" rel="noopener" href="' + esc(BB.waUrl(k.phone, 'Hola ' + k.name.split(' ')[0] + ' 👋 Te escribimos de BERNABEUD sobre tu cita de ' + BB.longDate(k.date) + ' a las ' + BB.t12(k.time) + '.')) + '">WhatsApp</a>';
    return '<article class="bk ' + k.status + '"><div class="tm">' + BB.t12(k.time).replace(' a. m.', '<small>AM</small>').replace(' p. m.', '<small>PM</small>') + '</div><div><h3>' + esc(k.name) + '<span class="st">' + STATUS[k.status] + '</span></h3><p>' + esc(s.name) + ' · ' + BB.money(s.price) + ' · ' + esc(b.name) + '</p><p>' + esc(BB.prettyPhone(k.phone)) + (k.note ? ' · “' + esc(k.note) + '”' : '') + '</p></div><div class="acts">' + a + '</div></article>';
  }

  /* ---------- servicios (dueño) ---------- */
  function rServicios() {
    $('#v-servicios').innerHTML = '<div class="vh"><h1>Servicios</h1><button class="btn" type="button" data-addsv>+ Nuevo</button></div><p class="note">Lo que cambies aquí se ve al instante en la página y en las reservas.</p><div class="list">' +
      d.services.map(function (s) {
        return '<div class="row' + (s.on ? '' : ' off') + '"><div class="t"><b>' + esc(s.name) + '</b><small>' + BB.money(s.price) + (s.max ? ' – ' + BB.money(s.max) : '') + ' · ' + s.dur + ' min</small></div><button class="btn small ghost" type="button" data-editsv="' + s.id + '">Editar</button><label class="sw"><input type="checkbox" data-tgsv="' + s.id + '"' + (s.on ? ' checked' : '') + ' aria-label="Activo"><i></i></label></div>';
      }).join('') + '</div>';
  }
  function durOpts(sel) { var o = ''; for (var m = 15; m <= 120; m += 15) o += '<option value="' + m + '"' + (m === sel ? ' selected' : '') + '>' + m + ' min</option>'; return o; }
  function fmtMoney(v) { var n = BB.digits(v); return n ? Number(n).toLocaleString('es-CO') : ''; }
  function svSheet(id) {
    var s = id ? BB.svc(d, id) : { name: '', price: '', max: '', dur: 30, desc: '' };
    sheet(id ? 'Editar servicio' : 'Nuevo servicio',
      '<div class="field"><label for="sN">Nombre</label><input class="in" id="sN" maxlength="40" value="' + esc(s.name) + '"></div>' +
      '<div class="grid2"><div class="field"><label for="sP">Precio</label><input class="in" id="sP" inputmode="numeric" data-money value="' + fmtMoney(s.price) + '"></div><div class="field"><label for="sM">Hasta (opcional)</label><input class="in" id="sM" inputmode="numeric" data-money value="' + fmtMoney(s.max) + '"></div></div>' +
      '<div class="field"><label for="sD">Duración</label><select class="in" id="sD">' + durOpts(s.dur) + '</select></div>' +
      '<div class="field"><label for="sT">Descripción</label><textarea class="in" id="sT" maxlength="140">' + esc(s.desc) + '</textarea></div><p class="err" id="shE" hidden></p>',
      '<button class="btn ghost" type="button" data-close>Cancelar</button>' + (id ? '<button class="btn danger" type="button" data-delsv="' + id + '">Borrar</button>' : '') + '<button class="btn" type="button" data-savesv="' + (id || '') + '">Guardar</button>');
  }
  function saveSv(id) {
    var n = $('#sN').value.trim(), p = Number(BB.digits($('#sP').value)), m = Number(BB.digits($('#sM').value)), er = $('#shE');
    if (!n || !p) { er.textContent = 'Pon el nombre y el precio.'; er.hidden = false; return; }
    if (m && m <= p) { er.textContent = '"Hasta" debe ser mayor que el precio.'; er.hidden = false; return; }
    var o = { name: n, price: p, max: m || 0, dur: Number($('#sD').value), desc: $('#sT').value.trim() };
    if (id) Object.assign(BB.svc(d, id), o); else d.services.push(Object.assign({ id: BB.uid('sv'), on: true }, o));
    save(); closeSheet(); render(); toast('Servicio guardado');
  }

  /* ---------- equipo / perfil ---------- */
  function rEquipo() {
    var list = owner() ? d.barbers : d.barbers.filter(function (b) { return b.id === S.barberId; });
    $('#v-equipo').innerHTML = '<div class="vh"><h1>' + (owner() ? 'Equipo' : 'Mi perfil') + '</h1>' + (owner() ? '<button class="btn" type="button" data-addbar>+ Barbero</button>' : '') + '</div><p class="note">Aquí pones tu foto y tus redes sociales: se muestran en la página de la barbería.</p><div class="list">' +
      list.map(function (b) {
        var soc = ['instagram', 'tiktok', 'facebook'].filter(function (k) { return b[k]; }).join(' · ');
        return '<div class="row' + (b.on ? '' : ' off') + '"><span class="avatar">' + (b.photo ? '<img src="' + esc(b.photo) + '" alt="">' : esc(b.name.charAt(0).toUpperCase())) + '</span><div class="t"><b>' + esc(b.name) + '</b><small>' + (soc || 'Sin redes todavía') + '</small></div><button class="btn small ghost" type="button" data-editbar="' + b.id + '">Editar</button>' + (owner() ? '<label class="sw"><input type="checkbox" data-tgbar="' + b.id + '"' + (b.on ? ' checked' : '') + ' aria-label="Activo"><i></i></label>' : '') + '</div>';
      }).join('') + '</div>';
  }
  function barSheet(id) {
    var b = id ? BB.barber(d, id) : { name: '', role: 'Barbero', bio: '', photo: null, instagram: '', tiktok: '', facebook: '', whatsapp: '' };
    sheet(id ? 'Editar perfil' : 'Nuevo barbero',
      '<div class="field"><label for="bN">Nombre</label><input class="in" id="bN" maxlength="24" value="' + esc(b.name) + '"></div>' +
      '<div class="field"><label for="bR">Cargo</label><input class="in" id="bR" maxlength="24" value="' + esc(b.role) + '"></div>' +
      '<div class="field"><label for="bB">Sobre ti</label><textarea class="in" id="bB" maxlength="140">' + esc(b.bio) + '</textarea></div>' +
      '<div class="field"><label for="bF">Foto</label><input class="in" id="bF" type="file" accept="image/*"><small class="note" id="bFn">' + (b.photo ? 'Ya tienes foto. Sube otra para cambiarla.' : 'Opcional.') + '</small></div>' +
      '<div class="field"><label for="bI">Instagram</label><input class="in" id="bI" placeholder="https://instagram.com/tuusuario" value="' + esc(b.instagram) + '"></div>' +
      '<div class="field"><label for="bT">TikTok</label><input class="in" id="bT" placeholder="https://tiktok.com/@tuusuario" value="' + esc(b.tiktok) + '"></div>' +
      '<div class="field"><label for="bFb">Facebook</label><input class="in" id="bFb" placeholder="https://facebook.com/tuusuario" value="' + esc(b.facebook) + '"></div><p class="err" id="shE" hidden></p>',
      '<button class="btn ghost" type="button" data-close>Cancelar</button><button class="btn" type="button" data-savebar="' + (id || '') + '">Guardar</button>');
    $('#bF').addEventListener('change', function () {
      var f = this.files[0]; if (!f) return; var r = new FileReader();
      r.onload = function () { var im = new Image(); im.onload = function () { var c = document.createElement('canvas'), z = Math.min(1, 360 / Math.max(im.width, im.height)); c.width = im.width * z; c.height = im.height * z; c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); sheet.photo = c.toDataURL('image/jpeg', .82); $('#bFn').textContent = 'Foto lista ✔'; }; im.src = r.result; };
      r.readAsDataURL(f);
    });
    sheet.photo = undefined;
  }
  function saveBar(id) {
    var n = $('#bN').value.trim(), er = $('#shE'); if (!n) { er.textContent = 'Pon el nombre.'; er.hidden = false; return; }
    var o = { name: n, role: $('#bR').value.trim() || 'Barbero', bio: $('#bB').value.trim(), instagram: $('#bI').value.trim(), tiktok: $('#bT').value.trim(), facebook: $('#bFb').value.trim() };
    var b = id ? BB.barber(d, id) : { id: BB.uid('b'), on: true, photo: null, whatsapp: '', offDays: [], blocks: [] };
    Object.assign(b, o); if (sheet.photo) b.photo = sheet.photo; if (!id) d.barbers.push(b);
    save(); closeSheet(); render(); toast('Perfil guardado');
  }

  /* ---------- horarios ---------- */
  var hBar = null;
  function timeOpts(sel) { var o = ''; for (var m = 0; m < 24 * 60; m += 30) o += '<option value="' + BB.toTime(m) + '"' + (BB.toTime(m) === sel ? ' selected' : '') + '>' + BB.t12(BB.toTime(m)) + '</option>'; return o; }
  function rHorarios() {
    var id = owner() ? (hBar || d.barbers[0].id) : S.barberId, b = BB.barber(d, id); hBar = id;
    var today = BB.ymd(new Date());
    var offs = (b.offDays || []).filter(function (x) { return x >= today; }).sort(), bl = (b.blocks || []).filter(function (x) { return x.date >= today; });
    $('#v-horarios').innerHTML = '<div class="vh"><h1>Horarios</h1></div>' +
      (owner() ? '<div class="panel"><p class="eyebrow">Horario de la barbería</p><div class="grid2" style="margin-top:.8rem"><div class="field"><label for="hO">Abre</label><select class="in" id="hO">' + timeOpts(d.shop.open) + '</select></div><div class="field"><label for="hC">Cierra</label><select class="in" id="hC">' + timeOpts(d.shop.close) + '</select></div></div><p class="note" style="margin-top:.7rem">Aplica todos los días. Las reservas solo se ofrecen dentro de este horario.</p></div>' : '') +
      '<div class="panel"><p class="eyebrow">Disponibilidad de ' + (owner() ? '' : 'ti, ') + esc(b.name) + '</p>' +
      (owner() ? '<div class="field" style="margin:.8rem 0"><label for="hB">Barbero</label><select class="in" id="hB">' + d.barbers.map(function (x) { return '<option value="' + x.id + '"' + (x.id === id ? ' selected' : '') + '>' + esc(x.name) + '</option>'; }).join('') + '</select></div>' : '') +
      '<h3 style="margin:1rem 0 .4rem;font:700 1rem var(--cond);letter-spacing:.14em;text-transform:uppercase">Días libres</h3><div class="pills">' + (offs.length ? offs.map(function (x) { return '<span class="pill">' + esc(BB.longDate(x)) + '<button type="button" data-deloff="' + x + '" aria-label="Quitar">×</button></span>'; }).join('') : '<span class="note">Sin días libres programados.</span>') + '</div>' +
      '<div class="tools" style="margin-top:.7rem"><div class="field"><label for="oD">Agregar día libre</label><input class="in" id="oD" type="date" min="' + today + '"></div><button class="btn small" type="button" data-addoff>Agregar</button></div>' +
      '<h3 style="margin:1.4rem 0 .4rem;font:700 1rem var(--cond);letter-spacing:.14em;text-transform:uppercase">Pausas (almuerzo, diligencias)</h3><div class="pills">' + (bl.length ? bl.map(function (x, i) { return '<span class="pill">' + esc(BB.longDate(x.date)) + ' · ' + BB.t12(x.from) + '–' + BB.t12(x.to) + '<button type="button" data-delbl="' + i + '" aria-label="Quitar">×</button></span>'; }).join('') : '<span class="note">Sin pausas programadas.</span>') + '</div>' +
      '<div class="tools" style="margin-top:.7rem"><div class="field"><label for="pD">Día</label><input class="in" id="pD" type="date" min="' + today + '"></div><div class="field"><label for="pF">Desde</label><select class="in" id="pF">' + timeOpts('13:00') + '</select></div><div class="field"><label for="pT">Hasta</label><select class="in" id="pT">' + timeOpts('14:00') + '</select></div><button class="btn small" type="button" data-addbl>Agregar</button></div><p class="err" id="hE" hidden style="margin-top:.7rem"></p></div>';
  }

  /* ---------- ajustes (dueño) ---------- */
  function rAjustes() {
    var s = d.shop;
    function f(id, l, v, ph, type) { return '<div class="field"><label for="' + id + '">' + l + '</label><input class="in" id="' + id + '" ' + (type ? 'type="' + type + '" inputmode="tel" ' : '') + 'placeholder="' + (ph || '') + '" value="' + esc(v || '') + '"></div>'; }
    $('#v-ajustes').innerHTML = '<div class="vh"><h1>Ajustes</h1></div><div class="panel" style="display:grid;gap:.9rem"><p class="eyebrow">La barbería</p>' +
      f('aN', 'Nombre', s.name) + f('aS', 'Frase (slogan)', s.slogan) + f('aW', 'WhatsApp de la barbería', s.whatsapp, '300 000 0000', 'tel') +
      f('aA', 'Dirección', s.address, 'Calle 00 # 00-00') + f('aC', 'Ciudad', s.city, 'Ciudad') + f('aM', 'Enlace de Google Maps', s.mapsUrl, 'https://maps.app.goo.gl/...') +
      '</div><div class="panel" style="display:grid;gap:.9rem"><p class="eyebrow">Redes sociales</p>' + f('aI', 'Instagram', s.instagram, 'https://instagram.com/...') + f('aT', 'TikTok', s.tiktok, 'https://tiktok.com/@...') + f('aF', 'Facebook', s.facebook, 'https://facebook.com/...') +
      '<button class="btn" type="button" data-saveset>Guardar cambios</button></div>' +
      '<div class="panel"><p class="eyebrow">Prueba</p><p class="note" style="margin:.6rem 0 .9rem">Restablece los datos de demostración (citas, servicios y perfiles).</p><button class="btn ghost danger" type="button" data-reset>Restablecer demo</button></div>';
  }
  function saveSet() {
    var s = d.shop; s.name = $('#aN').value.trim() || s.name; s.slogan = $('#aS').value.trim(); s.whatsapp = $('#aW').value.trim(); s.address = $('#aA').value.trim(); s.city = $('#aC').value.trim(); s.mapsUrl = $('#aM').value.trim();
    s.instagram = $('#aI').value.trim(); s.tiktok = $('#aT').value.trim(); s.facebook = $('#aF').value.trim(); save(); toast('Ajustes guardados');
  }

  /* ---------- nueva cita manual ---------- */
  var NB = null;
  function nbSheet() {
    NB = { svc: d.services.filter(function (x) { return x.on; })[0].id, bar: owner() ? d.barbers.filter(function (b) { return b.on; })[0].id : S.barberId, date: day < BB.ymd(new Date()) ? BB.ymd(new Date()) : day };
    sheet('Nueva cita',
      '<div class="field"><label for="nS">Servicio</label><select class="in" id="nS">' + d.services.filter(function (x) { return x.on; }).map(function (s) { return '<option value="' + s.id + '">' + esc(s.name) + ' · ' + BB.money(s.price) + '</option>'; }).join('') + '</select></div>' +
      (owner() ? '<div class="field"><label for="nB">Barbero</label><select class="in" id="nB">' + d.barbers.filter(function (b) { return b.on; }).map(function (b) { return '<option value="' + b.id + '">' + esc(b.name) + '</option>'; }).join('') + '</select></div>' : '') +
      '<div class="field"><label for="nD">Día</label><input class="in" id="nD" type="date" min="' + BB.ymd(new Date()) + '" value="' + NB.date + '"></div>' +
      '<div class="field"><label for="nH">Hora</label><select class="in" id="nH"></select></div>' +
      '<div class="field"><label for="nN">Nombre del cliente</label><input class="in" id="nN" maxlength="40"></div>' +
      '<div class="field"><label for="nP">WhatsApp (opcional)</label><input class="in" id="nP" type="tel" inputmode="tel" maxlength="18"></div><p class="err" id="shE" hidden></p>',
      '<button class="btn ghost" type="button" data-close>Cancelar</button><button class="btn" type="button" data-savenb>Guardar</button>');
    nbSlots();
  }
  function nbSlots() {
    NB.svc = $('#nS').value; NB.date = $('#nD').value; if (owner()) NB.bar = $('#nB').value;
    var s = BB.svc(d, NB.svc), sl = BB.slots(d, NB.bar, NB.date, s.dur).filter(function (x) { return x.free; });
    $('#nH').innerHTML = sl.length ? sl.map(function (x) { return '<option value="' + x.time + '">' + BB.t12(x.time) + '</option>'; }).join('') : '<option value="">Sin horas libres</option>';
  }
  function saveNb() {
    var n = $('#nN').value.trim(), t = $('#nH').value, er = $('#shE'), p = BB.digits($('#nP').value);
    if (!n) { er.textContent = 'Pon el nombre del cliente.'; er.hidden = false; return; }
    if (!t) { er.textContent = 'No hay hora libre ese día.'; er.hidden = false; return; }
    if (p && p.length === 10) p = '57' + p;
    var s = BB.svc(d, NB.svc);
    if (!BB.barberFree(d, NB.bar, NB.date, BB.toMin(t), s.dur)) { er.textContent = 'Esa hora ya está ocupada.'; er.hidden = false; nbSlots(); return; }
    d.bookings.push({ id: BB.uid('k'), ref: 'BB-' + (1000 + Math.floor(Math.random() * 8999)), serviceId: s.id, barberId: NB.bar, date: NB.date, time: t, dur: s.dur, name: n, phone: p, status: 'confirmed', created: Date.now(), note: '' });
    save(); day = NB.date; closeSheet(); render(); toast('Cita creada');
  }

  /* ---------- hoja (solo se cierra con X / Cancelar) ---------- */
  function sheet(title, body, foot) {
    $('#shT').textContent = title; $('#shB').innerHTML = body; $('#shF').innerHTML = foot;
    var l = $('#sheet'); l.classList.add('open'); l.setAttribute('aria-hidden', 'false'); document.body.classList.add('lock'); $('#shB').scrollTop = 0;
  }
  function closeSheet() { var l = $('#sheet'); l.classList.remove('open'); l.setAttribute('aria-hidden', 'true'); document.body.classList.remove('lock'); }

  /* ---------- eventos ---------- */
  document.addEventListener('click', function (e) {
    var t = e.target, el;
    if (t.closest('#sheet [data-close]')) return closeSheet();
    if ((el = t.closest('[data-tab]'))) return go(el.dataset.tab);
    if (t.closest('#fab')) return nbSheet();
    if ((el = t.closest('[data-day]'))) { var n = Number(el.dataset.day); day = n === 0 ? BB.ymd(new Date()) : BB.ymd(BB.addDays(BB.fromYmd(day), n)); return render(); }
    if ((el = t.closest('[data-st]'))) { var k = d.bookings.filter(function (x) { return x.id === el.dataset.id; })[0]; if (k) { k.status = el.dataset.st; save(); render(); toast(STATUS[k.status]); } return; }
    if (t.closest('[data-addsv]')) return svSheet();
    if ((el = t.closest('[data-editsv]'))) return svSheet(el.dataset.editsv);
    if ((el = t.closest('[data-savesv]'))) return saveSv(el.dataset.savesv);
    if ((el = t.closest('[data-delsv]'))) { d.services = d.services.filter(function (s) { return s.id !== el.dataset.delsv; }); save(); closeSheet(); render(); return toast('Servicio borrado'); }
    if (t.closest('[data-addbar]')) return barSheet();
    if ((el = t.closest('[data-editbar]'))) return barSheet(el.dataset.editbar);
    if ((el = t.closest('[data-savebar]'))) return saveBar(el.dataset.savebar);
    if ((el = t.closest('[data-deloff]'))) { var b = BB.barber(d, hBar); b.offDays = b.offDays.filter(function (x) { return x !== el.dataset.deloff; }); save(); return render(); }
    if (t.closest('[data-addoff]')) { var v = $('#oD').value; if (!v) return; var b2 = BB.barber(d, hBar); if (b2.offDays.indexOf(v) < 0) b2.offDays.push(v); save(); return render(); }
    if ((el = t.closest('[data-delbl]'))) { var b3 = BB.barber(d, hBar), today = BB.ymd(new Date()), fut = b3.blocks.filter(function (x) { return x.date >= today; }), rm = fut[Number(el.dataset.delbl)]; b3.blocks = b3.blocks.filter(function (x) { return x !== rm; }); save(); return render(); }
    if (t.closest('[data-addbl]')) { var dd = $('#pD').value, f = $('#pF').value, to = $('#pT').value, he = $('#hE'); if (!dd || BB.toMin(to) <= BB.toMin(f)) { he.textContent = 'Elige el día y una hora final posterior a la inicial.'; he.hidden = false; return; } BB.barber(d, hBar).blocks.push({ date: dd, from: f, to: to }); save(); return render(); }
    if (t.closest('[data-saveset]')) return saveSet();
    if (t.closest('[data-reset]')) { BB.reset(); toast('Demo restablecida'); return render(); }
    if (t.closest('[data-savenb]')) return saveNb();
  });
  document.addEventListener('change', function (e) {
    var t = e.target;
    if (t.id === 'fDay') { if (t.value) { day = t.value; render(); } }
    else if (t.id === 'fBar') { fBar = t.value; render(); }
    else if (t.id === 'hB') { hBar = t.value; render(); }
    else if (t.id === 'hO' || t.id === 'hC') {
      var o = $('#hO').value, c = $('#hC').value;
      if (BB.toMin(c) <= BB.toMin(o)) { toast('El cierre debe ser después de la apertura'); return render(); }
      d.shop.open = o; d.shop.close = c; save(); toast('Horario guardado');
    }
    else if (t.dataset && t.dataset.tgsv) { BB.svc(d, t.dataset.tgsv).on = t.checked; save(); render(); }
    else if (t.dataset && t.dataset.tgbar) { BB.barber(d, t.dataset.tgbar).on = t.checked; save(); render(); }
    else if (t.id === 'nS' || t.id === 'nB' || t.id === 'nD') nbSlots();
  });
  document.addEventListener('input', function (e) { var t = e.target; if (t.matches && t.matches('[data-money]')) t.value = fmtMoney(t.value); });
  window.addEventListener('storage', function (e) { if (e.key === 'bernabeud-proto-v1' && S && !$('#sheet').classList.contains('open')) render(); });

  if (BB.session()) enter(); else showGate();
})();
