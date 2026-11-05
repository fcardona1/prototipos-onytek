/* NOVAMIX · panel de Jenny · productos, categorías y ajustes. Desarrollado por Onytek. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = NM.esc, money = NM.money;
  var SESSION = 'novamix-session';

  function ls(k, v) {
    try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { /* nada */ }
    return null;
  }
  function ss(k, v) {
    try { if (v === undefined) return sessionStorage.getItem(k); if (v === null) sessionStorage.removeItem(k); else sessionStorage.setItem(k, v); } catch (e) { /* nada */ }
    return null;
  }

  var d = NM.get(), tab = 'home', editing = null, photos = [], mem = false, confirmId = null, pq = '';

  function persist() { if (!NM.save(d)) toast('No se pudo guardar: el navegador no deja'); }
  var toastT;
  function toast(m) { var t = $('#toast'); t.textContent = m; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove('show'); }, 2600); }
  function owner() { return d.settings.owner || 'Jenny'; }
  function num(v) { return Math.max(0, parseInt(String(v || '').replace(/\D/g, ''), 10) || 0); }

  /* ---------- entrada ---------- */
  function logged() { return ls(SESSION) === '1' || ss(SESSION) === '1'; }
  function show() {
    var on = logged();
    $('#login').hidden = on; $('#app').hidden = !on;
    if (on) { $('#hello').textContent = 'Hola, ' + owner(); renderAll(); }
  }
  $('#loginForm').addEventListener('submit', function (e) {
    e.preventDefault();
    if (!$('#lUser').value.trim()) { toast('Escribe tu usuario'); return; }
    if ($('#lRem').checked) ls(SESSION, '1'); else ss(SESSION, '1');
    show();
  });
  $('#eye').addEventListener('click', function () {
    var p = $('#lPass'), on = p.type === 'password'; p.type = on ? 'text' : 'password';
    this.setAttribute('aria-label', on ? 'Ocultar contraseña' : 'Mostrar contraseña');
  });
  $('#logout').addEventListener('click', function () { ls(SESSION, null); ss(SESSION, null); show(); });

  /* ---------- pestañas ---------- */
  function setTab(t) {
    tab = t;
    $$('.tab').forEach(function (s) { s.hidden = s.id !== 't-' + t; });
    $$('[data-tab]').forEach(function (b) { b.setAttribute('aria-current', b.dataset.tab === t ? 'page' : 'false'); });
    window.scrollTo(0, 0);
    renderAll();
  }
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-tab]'); if (el) { setTab(el.dataset.tab); return; }
    if (e.target.closest('#newP') || e.target.closest('#fab')) { openForm(null); return; }
    if (e.target.closest('[data-close]')) { closeForm(); return; }
    if ((el = e.target.closest('[data-act]'))) { act(el.dataset.act, el.dataset.id); }
  });

  /* ---------- resumen ---------- */
  function renderHome() {
    $('#greet').textContent = 'Hola, ' + owner() + ' 👋';
    var prods = d.products, vis = prods.filter(function (p) { return !p.hidden; });
    var sold = prods.filter(function (p) { return p.soldOut; }).length;
    var st = [[prods.length, 'Productos'], [vis.length - sold, 'Disponibles'], [sold, 'Agotados'], [NM.daysToXmas(d) >= 0 ? NM.daysToXmas(d) : '—', 'Días para Navidad']];
    $('#stats').innerHTML = st.map(function (s) { return '<div class="stat"><b>' + s[0] + '</b><span>' + s[1] + '</span></div>'; }).join('');
    var t = [];
    if (!NM.phone(d.settings.whatsapp)) t.push('<div class="todo warn"><span>Falta poner tu WhatsApp. Sin él, los clientes no pueden escribirte desde la tienda.</span><button class="btn small" data-tab="set" type="button">Ponerlo</button></div>');
    var samples = prods.filter(function (p) { return p.sample; }).length;
    if (samples) t.push('<div class="todo"><span>Tienes ' + samples + ' productos de ejemplo. Cuando quieras, bórralos y carga los tuyos.</span><button class="btn small ghost" data-tab="prods" type="button">Ver productos</button></div>');
    if (!samples && prods.length) t.push('<div class="todo"><span>Tu tienda tiene solo productos tuyos. ¡Qué bien!</span><a class="btn small ghost" href="store.html" target="_blank" rel="noopener">Ver tienda</a></div>');
    $('#todo').innerHTML = t.length ? '<h3>Para hacer</h3>' + t.join('') : '';
    $('#todo').hidden = !t.length;
    var log = d.log || [];
    $('#asks').innerHTML = log.length ? log.slice(0, 6).map(function (l) { return '<li><time>' + new Date(l.t).toLocaleString('es-CO', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) + '</time>' + esc(l.text) + '</li>'; }).join('') : '<li>Todavía no hay preguntas. Prueba la tienda y toca “Preguntar disponibilidad”.</li>';
  }

  /* ---------- productos ---------- */
  function pills(p) {
    var a = [];
    if (p.hidden) a.push('<span class="pill gray">Oculto</span>');
    a.push(p.soldOut ? '<span class="pill red">Agotado</span>' : '<span class="pill">Disponible</span>');
    if (NM.pct(p)) a.push('<span class="pill gold">Oferta −' + NM.pct(p) + '%</span>');
    if (p.navidad) a.push('<span class="pill red">Navidad</span>');
    if (p.featured) a.push('<span class="pill gold">Destacado</span>');
    a.push('<span class="pill gray">' + (p.allowPartial ? 'Se puede separar' : 'Solo pago completo') + '</span>');
    if (p.sample) a.push('<span class="pill gray">Ejemplo</span>');
    return a.join('');
  }
  function renderProds() {
    var q = pq.trim().toLowerCase();
    var list = d.products.slice().sort(function (a, b) { return b.n - a.n; }).filter(function (p) { return !q || (p.name + ' ' + p.ref).toLowerCase().indexOf(q) >= 0; });
    var samples = d.products.filter(function (p) { return p.sample; }).length;
    $('#pcount').textContent = d.products.length + (d.products.length === 1 ? ' producto' : ' productos');
    $('#delSamples').hidden = !samples; $('#delSamples').textContent = 'Borrar los ' + samples + ' ejemplos';
    if (!list.length) { $('#plist').innerHTML = '<div class="box"><h3>' + (d.products.length ? 'No encontré ese producto' : 'Aún no tienes productos') + '</h3><p class="muted">' + (d.products.length ? 'Prueba con otra palabra.' : 'Toca “Agregar producto” para cargar el primero.') + '</p></div>'; return; }
    $('#plist').innerHTML = list.map(function (p) {
      var row = '<article class="prow"><div class="th">' + NM.art(p, d) + '</div><div><h4>' + esc(p.name) + '</h4><div class="meta"><b>' + money(p.price) + '</b> · ' + esc(NM.catName(d, p.cat)) + ' · ' + esc(p.ref) + '</div><div class="pills">' + pills(p) + '</div></div>' +
        '<div class="acts"><button class="btn small ghost" type="button" data-act="avail" data-id="' + p.id + '">' + (p.soldOut ? 'Marcar disponible' : 'Marcar agotado') + '</button>' +
        '<button class="btn small" type="button" data-act="edit" data-id="' + p.id + '">Editar</button>' +
        '<button class="btn small ghost" type="button" data-act="dup" data-id="' + p.id + '">Duplicar</button>' +
        '<button class="btn small ghost" type="button" data-act="del" data-id="' + p.id + '">Borrar</button></div>';
      if (confirmId === p.id) row += '<div class="confirm"><span>¿Borrar “' + esc(p.name) + '”? No se puede deshacer.</span><button class="btn small red" type="button" data-act="delok" data-id="' + p.id + '">Sí, borrar</button><button class="btn small ghost" type="button" data-act="delno">No</button></div>';
      return row + '</article>';
    }).join('');
  }
  function byId(id) { for (var i = 0; i < d.products.length; i++) if (d.products[i].id === id) return d.products[i]; return null; }
  function act(a, id) {
    var p = byId(id);
    if (a === 'avail' && p) { p.soldOut = !p.soldOut; persist(); toast(p.soldOut ? 'Marcado como agotado' : 'Marcado como disponible'); renderAll(); }
    else if (a === 'edit' && p) openForm(p);
    else if (a === 'dup' && p) {
      var c = JSON.parse(JSON.stringify(p)); d.seq++; c.id = 'p' + d.seq; c.n = d.seq; c.ref = 'NM-' + String(d.seq).padStart(3, '0'); c.name = p.name + ' (copia)'; c.sample = false;
      d.products.push(c); persist(); toast('Producto duplicado: ahora edítalo'); renderAll();
    }
    else if (a === 'del') { confirmId = id; renderProds(); }
    else if (a === 'delno') { confirmId = null; renderProds(); }
    else if (a === 'delok') { d.products = d.products.filter(function (x) { return x.id !== id; }); confirmId = null; persist(); toast('Producto borrado'); renderAll(); }
    else if (a === 'catdel') {
      var n = d.products.filter(function (x) { return x.cat === id; }).length;
      if (n) { $('#catErr').textContent = 'Esa categoría tiene ' + n + ' productos. Cámbialos de categoría antes de borrarla.'; return; }
      d.cats = d.cats.filter(function (c) { return c.id !== id; }); persist(); renderAll();
    }
    else if (a === 'catsave') {
      var inp = $('#cn-' + id), v = inp.value.trim();
      if (!v) { $('#catErr').textContent = 'La categoría necesita un nombre.'; return; }
      d.cats.forEach(function (c) { if (c.id === id) c.name = v; }); persist(); $('#catErr').textContent = ''; toast('Categoría guardada'); renderAll();
    }
  }
  $('#pq').addEventListener('input', function () { pq = this.value; renderProds(); });
  $('#delSamples').addEventListener('click', function () {
    if (this.dataset.ask !== '1') { this.dataset.ask = '1'; this.textContent = 'Toca otra vez para confirmar'; var b = this; setTimeout(function () { b.dataset.ask = ''; renderProds(); }, 4000); return; }
    d.products = d.products.filter(function (p) { return !p.sample; }); persist(); toast('Ejemplos borrados'); renderAll();
  });

  /* ---------- formulario ---------- */
  function vars(q) { return NM.photoStyle(q); }
  function renderPhotos() {
    $('#photos').innerHTML = photos.map(function (q, i) {
      return '<div class="ph-slot"><button type="button" class="pick" data-edph="' + i + '" aria-label="Acomodar la foto ' + (i + 1) + '"><img class="photo" src="' + q.src + '" alt="Foto ' + (i + 1) + '" style="' + vars(q) + '"></button>' +
        (i === 0 ? '<span class="main">Principal</span>' : '') + '<span class="mv">Mover</span><button type="button" class="rm" data-rmph="' + i + '" aria-label="Quitar foto ' + (i + 1) + '">×</button></div>';
    }).join('') + (photos.length < 3 ? '<label class="ph-add"><input type="file" id="fFile" accept="image/*" multiple>+ Foto</label>' : '');
    updatePreview();
  }
  $('#photos').addEventListener('click', function (e) {
    var b = e.target.closest('[data-rmph]'); if (b) { photos.splice(+b.dataset.rmph, 1); renderPhotos(); return; }
    b = e.target.closest('[data-edph]'); if (b) openFrame(+b.dataset.edph);
  });
  $('#photos').addEventListener('change', function (e) {
    if (e.target.id !== 'fFile') return;
    var files = Array.prototype.slice.call(e.target.files).slice(0, 3 - photos.length), first = photos.length;
    Promise.all(files.map(function (f) { return NM.compress(f).catch(function () { return null; }); })).then(function (r) {
      r.forEach(function (src) { if (src && photos.length < 3) photos.push({ src: src, x: 50, y: 50, z: 1 }); });
      renderPhotos(); if (photos.length > first) openFrame(first);
    });
  });

  /* vista previa en vivo: así queda la tarjeta en la tienda */
  function updatePreview() {
    var name = $('#fName').value.trim() || 'Nombre del producto', price = num($('#fPrice').value), old = num($('#fOld').value);
    var cat = $('#fCat').options[$('#fCat').selectedIndex], badge = $('#fBadge').value;
    var fake = { name: name, cat: $('#fCat').value, imgs: photos.map(function (q) { return q.src; }), pos: photos.map(function (q) { return { x: q.x, y: q.y, z: q.z }; }) };
    var off = old > price && price ? Math.round((1 - price / old) * 100) : 0;
    $('#prevCard').innerHTML = '<div class="pcard"><div class="pm">' + NM.art(fake, d) + (off ? '<span class="pb">−' + off + '%</span>' : (badge ? '<span class="pb" style="background:var(--blue)">' + esc(badge) + '</span>' : '')) + '</div><div><small>' + esc(cat ? cat.textContent : '') + '</small><b>' + esc(name) + '</b><div class="pp">' + (price ? money(price) : '$0') + (off ? '<s>' + money(old) + '</s>' : '') + '</div></div></div>';
  }
  $('#pf').addEventListener('input', updatePreview);
  $('#pf').addEventListener('change', updatePreview);

  /* acomodar foto: arrastrar, acercar, centrar */
  var fr = null, cropEl = $('#crop'), cropImg = $('#cropImg');
  function paintFrame() {
    cropImg.style.setProperty('--px', fr.x + '%'); cropImg.style.setProperty('--py', fr.y + '%'); cropImg.style.setProperty('--z', fr.z);
    $('#zoom').value = Math.round(fr.z * 100);
  }
  function range() {
    var W = cropEl.clientWidth || 300, nw = cropImg.naturalWidth || 1, nh = cropImg.naturalHeight || 1, k = Math.max(W / nw, W / nh);
    return { kx: Math.max(nw * k - W, 0) * fr.z + (fr.z - 1) * W, ky: Math.max(nh * k - W, 0) * fr.z + (fr.z - 1) * W };
  }
  function pan(dx, dy) {
    var r = range();
    if (r.kx > 12) fr.x = Math.min(100, Math.max(0, fr.x - dx / r.kx * 100));
    if (r.ky > 12) fr.y = Math.min(100, Math.max(0, fr.y - dy / r.ky * 100));
    paintFrame();
  }
  function openFrame(i) {
    var q = photos[i]; if (!q) return;
    fr = { i: i, x: q.x, y: q.y, z: q.z };
    cropImg.src = q.src; paintFrame(); $('#frMain').hidden = i === 0;
    var L = $('#frame'); L.classList.add('open'); L.setAttribute('aria-hidden', 'false'); cropEl.focus({ preventScroll: true });
  }
  function closeFrame() { var L = $('#frame'); L.classList.remove('open'); L.setAttribute('aria-hidden', 'true'); fr = null; }
  var drag = null;
  cropEl.addEventListener('pointerdown', function (e) { drag = { x: e.clientX, y: e.clientY }; cropEl.setPointerCapture(e.pointerId); cropEl.classList.add('drag'); });
  cropEl.addEventListener('pointermove', function (e) { if (!drag || !fr) return; pan(e.clientX - drag.x, e.clientY - drag.y); drag.x = e.clientX; drag.y = e.clientY; });
  function endDrag() { drag = null; cropEl.classList.remove('drag'); }
  cropEl.addEventListener('pointerup', endDrag); cropEl.addEventListener('pointercancel', endDrag);
  cropEl.addEventListener('keydown', function (e) {
    var m = { ArrowLeft: [-12, 0], ArrowRight: [12, 0], ArrowUp: [0, -12], ArrowDown: [0, 12] }[e.key];
    if (m && fr) { e.preventDefault(); pan(m[0], m[1]); }
  });
  $('#zoom').addEventListener('input', function () { if (fr) { fr.z = this.value / 100; paintFrame(); } });
  $('#zMinus').addEventListener('click', function () { if (fr) { fr.z = Math.max(1, fr.z - .1); paintFrame(); } });
  $('#zPlus').addEventListener('click', function () { if (fr) { fr.z = Math.min(3, fr.z + .1); paintFrame(); } });
  $('#frame').addEventListener('click', function (e) {
    var n = e.target.closest('[data-nudge]'); if (n && fr) { var v = n.dataset.nudge.split(','); pan(-v[0] * 4, -v[1] * 4); }
    if (e.target.closest('[data-closeframe]')) closeFrame();
  });
  $('#frCenter').addEventListener('click', function () { if (fr) { fr.x = 50; fr.y = 50; fr.z = 1; paintFrame(); } });
  $('#frMain').addEventListener('click', function () {
    if (!fr) return; var q = photos.splice(fr.i, 1)[0]; q.x = fr.x; q.y = fr.y; q.z = fr.z; photos.unshift(q); renderPhotos(); closeFrame(); toast('Ahora es la foto principal');
  });
  $('#frDone').addEventListener('click', function () {
    if (!fr) return; var q = photos[fr.i]; q.x = Math.round(fr.x * 10) / 10; q.y = Math.round(fr.y * 10) / 10; q.z = Math.round(fr.z * 100) / 100; renderPhotos(); closeFrame();
  });

  function openForm(p) {
    editing = p ? p.id : null;
    $('#fTitle').textContent = p ? 'Editar producto' : 'Agregar producto';
    $('#fCat').innerHTML = d.cats.map(function (c) { return '<option value="' + esc(c.id) + '">' + esc(c.name) + '</option>'; }).join('');
    $('#fPct').textContent = NM.part(d);
    var v = p || { name: '', cat: d.cats[0] ? d.cats[0].id : '', price: '', oldPrice: '', optionLabel: '', options: [], desc: '', imgs: [], pos: [], badge: '', soldOut: false, hidden: false, allowPartial: true, navidad: false, featured: false };
    photos = (v.imgs || []).map(function (s, i) { var q = (v.pos && v.pos[i]) || {}; return { src: s, x: isFinite(q.x) ? q.x : 50, y: isFinite(q.y) ? q.y : 50, z: isFinite(q.z) ? q.z : 1 }; });
    $('#fName').value = v.name; $('#fCat').value = v.cat; $('#fBadge').value = v.badge || '';
    $('#fPrice').value = v.price || ''; $('#fOld').value = v.oldPrice || '';
    $('#fOptLbl').value = v.optionLabel || ''; $('#fOpts').value = (v.options || []).join(', '); $('#fDesc').value = v.desc || '';
    $('#fAvail').checked = !v.soldOut; $('#fPart').checked = v.allowPartial; $('#fXmas').checked = !!v.navidad; $('#fFeat').checked = !!v.featured; $('#fHide').checked = !!v.hidden;
    $('#fErr').textContent = ''; renderPhotos();
    var L = $('#pform'); L.classList.add('open'); L.setAttribute('aria-hidden', 'false'); NM.lock();
    $('.fbody', L).scrollTop = 0; $('#fName').focus({ preventScroll: true });
  }
  function closeForm() {
    var L = $('#pform'); L.classList.remove('open'); L.setAttribute('aria-hidden', 'true'); NM.unlock(); editing = null; if (fr) closeFrame();
  }
  $('#pf').addEventListener('submit', function (e) {
    e.preventDefault();
    var name = $('#fName').value.trim(), price = num($('#fPrice').value), old = num($('#fOld').value), err = $('#fErr');
    if (!name) { err.textContent = 'Ponle un nombre al producto.'; $('#fName').focus(); return; }
    if (!price) { err.textContent = 'Escribe el precio, solo números.'; $('#fPrice').focus(); return; }
    if (old && old <= price) { err.textContent = 'El precio anterior debe ser mayor que el precio actual, o déjalo vacío.'; $('#fOld').focus(); return; }
    var options = $('#fOpts').value.split(',').map(function (s) { return s.trim(); }).filter(Boolean).slice(0, 12);
    var data = { name: name, cat: $('#fCat').value, price: price, oldPrice: old, optionLabel: options.length ? ($('#fOptLbl').value.trim() || 'Opción') : '', options: options,
      desc: $('#fDesc').value.trim(), imgs: photos.map(function (q) { return q.src; }), pos: photos.map(function (q) { return { x: q.x, y: q.y, z: q.z }; }), badge: $('#fBadge').value, soldOut: !$('#fAvail').checked, allowPartial: $('#fPart').checked, navidad: $('#fXmas').checked, featured: $('#fFeat').checked, hidden: $('#fHide').checked };
    var p = editing ? byId(editing) : null;
    if (p) { for (var k in data) p[k] = data[k]; toast('Cambios guardados'); }
    else {
      d.seq++; data.id = 'p' + d.seq; data.n = d.seq; data.ref = 'NM-' + String(d.seq).padStart(3, '0'); data.sample = false;
      d.products.push(data); toast('Producto agregado a la tienda');
    }
    persist(); closeForm(); setTab('prods');
  });

  /* ---------- categorías ---------- */
  function renderCats() {
    $('#clist').innerHTML = d.cats.map(function (c) {
      var n = d.products.filter(function (p) { return p.cat === c.id; }).length;
      return '<li><input class="in" id="cn-' + c.id + '" value="' + esc(c.name) + '" maxlength="40" aria-label="Nombre de la categoría"><small>' + n + ' productos</small><button class="btn small" type="button" data-act="catsave" data-id="' + c.id + '">Guardar</button><button class="btn small ghost" type="button" data-act="catdel" data-id="' + c.id + '">Borrar</button></li>';
    }).join('');
  }
  $('#catForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var v = $('#catName').value.trim(), err = $('#catErr');
    if (!v) { err.textContent = 'Escribe el nombre de la categoría.'; return; }
    if (d.cats.some(function (c) { return c.name.toLowerCase() === v.toLowerCase(); })) { err.textContent = 'Esa categoría ya existe.'; return; }
    d.cats.push({ id: NM.uid('c'), name: v }); persist(); $('#catName').value = ''; err.textContent = ''; toast('Categoría agregada'); renderAll();
  });

  /* ---------- ajustes ---------- */
  function fillSettings() {
    var s = d.settings;
    $('#sOwner').value = s.owner; $('#sWa').value = s.whatsapp; $('#sBanner').value = s.banner; $('#sPct').value = s.partialPct; $('#sXmas').value = s.christmas;
    $('#sSlogan').value = s.slogan; $('#sCom').value = s.community; $('#sIg').value = s.instagram; $('#sTt').value = s.tiktok; $('#sFb').value = s.facebook;
  }
  $('#setForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var s = d.settings, wa = $('#sWa').value.trim();
    if (wa && !NM.phone(wa)) { $('#setOk').textContent = ''; toast('Revisa tu WhatsApp: faltan números'); $('#sWa').focus(); return; }
    s.owner = $('#sOwner').value.trim() || 'Jenny'; s.whatsapp = wa; s.banner = $('#sBanner').value.trim();
    s.partialPct = Math.min(90, Math.max(10, parseInt($('#sPct').value, 10) || 50)); s.christmas = $('#sXmas').value || '2026-12-25';
    s.slogan = $('#sSlogan').value.trim(); s.community = $('#sCom').value.trim(); s.instagram = $('#sIg').value.trim(); s.tiktok = $('#sTt').value.trim(); s.facebook = $('#sFb').value.trim();
    persist(); $('#hello').textContent = 'Hola, ' + owner(); $('#setOk').textContent = '✓ Guardado. Ya se ve en la tienda.'; toast('Ajustes guardados');
    setTimeout(function () { $('#setOk').textContent = ''; }, 3500);
  });
  $('#resetBox').addEventListener('click', function (e) {
    if (e.target.id === 'resetAsk') {
      this.innerHTML = '<div class="confirm"><span>Se borra todo lo que cargaste y vuelven los ejemplos. ¿Seguimos?</span><button class="btn small red" type="button" id="resetOk">Sí, restaurar</button><button class="btn small ghost" type="button" id="resetNo">No</button></div>';
    } else if (e.target.id === 'resetNo') {
      this.innerHTML = '<button class="btn ghost small" id="resetAsk" type="button">Restaurar los ejemplos</button>';
    } else if (e.target.id === 'resetOk') {
      d = NM.reset(); this.innerHTML = '<button class="btn ghost small" id="resetAsk" type="button">Restaurar los ejemplos</button>'; toast('Todo quedó como al inicio'); renderAll(); fillSettings();
    }
  });

  function renderAll() {
    if (tab === 'home') renderHome(); else if (tab === 'prods') renderProds(); else if (tab === 'cats') renderCats();
  }
  window.addEventListener('storage', function (e) { if (e.key === NM.KEY) { d = NM.get(); if (logged() && tab !== 'set') renderAll(); } });

  fillSettings(); show();
})();
