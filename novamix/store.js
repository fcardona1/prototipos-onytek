/* NOVAMIX · tienda · filtros, ficha, mi lista y mensaje de WhatsApp. Desarrollado por Onytek. */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = NM.esc, money = NM.money;

  function ls(k, v) {
    try {
      if (v === undefined) return localStorage.getItem(k);
      if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v);
    } catch (e) { /* sin almacenamiento */ }
    return null;
  }
  function readCart() { try { return JSON.parse(ls('novamix-cart') || '[]') || []; } catch (e) { return []; } }

  var d = NM.get();
  var S = { cat: 'all', q: '', sort: 'rec', cart: readCart(), open: null, pick: null, qty: 1, mode: 'full', gi: 0, cmode: ls('novamix-cmode') === 'partial' ? 'partial' : 'full', who: ls('novamix-who') || '', opener: null, budget: 'any' };

  function find(id) { for (var i = 0; i < d.products.length; i++) if (d.products[i].id === id) return d.products[i]; return null; }
  function visible() { return d.products.filter(function (p) { return !p.hidden; }); }
  function pctTxt() { return NM.part(d); }
  function owner() { return d.settings.owner || 'Jenny'; }
  function url(u) { u = (u || '').trim(); if (!u) return ''; return /^https?:\/\//i.test(u) ? u : 'https://' + u.replace(/^\/+/, ''); }
  function hasNum() { return !!NM.phone(d.settings.whatsapp); }
  function opts(p) { return (p.options || []).filter(Boolean); }

  var toastT;
  function toast(msg) {
    var t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove('show'); }, 2800);
  }

  /* ---------- reloj de Navidad en vivo ---------- */
  function tick() {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(d.settings.christmas || '2026-12-25'));
    if (!m) return;
    var ms = Math.max(0, new Date(+m[1], +m[2] - 1, +m[3]).getTime() - Date.now()), sec = Math.floor(ms / 1000);
    var two = function (n) { return String(n).padStart(2, '0'); };
    $('#cD').textContent = Math.floor(sec / 86400); $('#cH').textContent = two(Math.floor(sec % 86400 / 3600));
    $('#cM').textContent = two(Math.floor(sec % 3600 / 60)); $('#cS').textContent = two(sec % 60);
  }
  setInterval(tick, 1000);

  /* ---------- textos que dependen de los ajustes ---------- */
  var ICONS = {
    instagram: '<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.200" cy="6.800" r="1.200" fill="currentColor"/></svg>',
    tiktok: '<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M14 3v10.400a3.400 3.400 0 1 1-3.400-3.400M14 3c.4 2.500 2.100 4.100 4.600 4.300" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    facebook: '<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8.500c0-.3.2-.5.5-.5Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>'
  };
  function renderStatic() {
    var s = d.settings, days = NM.daysToXmas(d), o = esc(owner());
    $('#promo').hidden = !s.banner;
    $('#promoText').textContent = s.banner || '';
    var pd = $('#promoDays');
    if (days >= 0) { pd.hidden = false; pd.textContent = days === 0 ? 'Hoy es Navidad' : days === 1 ? 'Falta 1 día' : 'Faltan ' + days + ' días'; } else pd.hidden = true;
    $('#heroPillText').textContent = days > 0 ? 'Navidad 2026 · faltan ' + days + ' días' : (s.slogan || 'Regalos para toda la familia');
    $('#lead').innerHTML = 'Juguetes, lociones y detalles para toda la familia. Escoge lo que te guste y pregúntale a ' + o + ' por WhatsApp si está disponible.';
    $$('.pctTxt').forEach(function (n) { n.textContent = pctTxt(); });
    $$('.ownerName').forEach(function (n) { n.textContent = owner(); });
    $('#xmasLead').textContent = 'Aparta tu regalo pagando solo el ' + pctTxt() + '% hoy y cancela el resto después. Pregunta por WhatsApp y ' + owner() + ' te confirma qué hay disponible.';
    $('#countBox').hidden = days < 0;
    tick();
    var hello = NM.waUrl(d, 'Hola ' + owner() + ' 👋 Vi la tienda NOVAMIX y quiero preguntar por un regalo.');
    ['#heroWa', '#aboutWa', '#footWa', '#waFab', '#dockWa'].forEach(function (id) { $(id).href = hello; });
    var fp = $('#footPhone'), pp = NM.prettyPhone(s.whatsapp);
    if (pp) { fp.textContent = pp; fp.href = hello; } else { fp.textContent = 'WhatsApp muy pronto'; fp.removeAttribute('href'); }
    $('#footTag').textContent = s.slogan || '';
    $('#year').textContent = new Date().getFullYear();
    var c = url(s.community);
    $('#comBtn').innerHTML = c ? '<a class="btn ghost" href="' + esc(c) + '" target="_blank" rel="noopener">Entrar a la comunidad</a>' : '';
    var nets = [['instagram', 'Instagram'], ['tiktok', 'TikTok'], ['facebook', 'Facebook']];
    $('#socials').innerHTML = nets.map(function (n) {
      var u = url(s[n[0]]);
      return u ? '<a class="soc" href="' + esc(u) + '" target="_blank" rel="noopener">' + ICONS[n[0]] + n[1] + '</a>' : '';
    }).join('');
  }

  /* ---------- burbujas de la portada: cada una lleva a una categoría ---------- */
  function emojiOf(name) {
    name = String(name || '').toLowerCase();
    if (/juguet|ni[ñn]|bloq|kids|infan|pelu/.test(name)) return '🧸';
    if (/loci|perfum|fragan|aroma|splash|cuidado/.test(name)) return '🧴';
    if (/hogar|casa|deco|vela/.test(name)) return '🏡';
    return '🎁';
  }
  function renderOrbits() {
    var tones = ['', 'gold', 'green', '', 'navy'], list = d.cats.filter(function (c) { return visible().some(function (p) { return p.cat === c.id; }); }).slice(0, 3)
      .map(function (c, i) { return { id: c.id, name: c.name, em: emojiOf(c.name), tone: ['', 'gold', 'green'][i] }; });
    if (visible().some(function (p) { return NM.pct(p) > 0; })) list.push({ id: 'offers', name: 'Ofertas', em: '🏷️', tone: 'red' });
    if (visible().some(function (p) { return p.navidad; })) list.push({ id: 'xmas', name: 'Navidad', em: '🎄', tone: 'navy' });
    $('#orbits').innerHTML = list.slice(0, 5).map(function (o) {
      return '<button type="button" class="orbit ' + o.tone + '" data-hero="' + esc(o.id) + '" aria-label="Ver ' + esc(o.name) + '"><i aria-hidden="true">' + o.em + '</i><span>' + esc(o.name) + '</span></button>';
    }).join('');
  }

  /* ---------- tira de fotos para el celular: lo primero que se ve son los regalos ---------- */
  function renderStrip() {
    var list = visible().filter(function (p) { return !p.soldOut; }).sort(function (a, b) { return (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || b.n - a.n; }).slice(0, 8);
    $('#strip').innerHTML = list.map(function (p) {
      var off = NM.pct(p);
      return '<button type="button" class="sitem" data-open="' + esc(p.id) + '" aria-label="Ver ' + esc(p.name) + '"><span class="sm">' + NM.art(p, d) + (off ? '<em>−' + off + '%</em>' : '') + '</span><b>' + esc(p.name) + '</b><span class="sp">' + money(p.price) + '</span></button>';
    }).join('');
  }

  /* ---------- categorías y catálogo ---------- */
  var BUDGETS = [['any', 'Cualquiera'], ['l50', 'Hasta $50.000'], ['m80', '$50.000 a $80.000'], ['h80', 'Más de $80.000']];
  function inBudget(p) {
    return S.budget === 'any' || (S.budget === 'l50' && p.price <= 50000) || (S.budget === 'm80' && p.price > 50000 && p.price <= 80000) || (S.budget === 'h80' && p.price > 80000);
  }
  function renderBudget() {
    $('#budget').innerHTML = '<span class="blbl">Mi presupuesto</span>' + BUDGETS.map(function (b) { return '<button type="button" class="bchip" data-budget="' + b[0] + '" aria-pressed="' + (S.budget === b[0]) + '">' + b[1] + '</button>'; }).join('');
  }
  function inCat(p, id) {
    if (id === 'all') return true;
    if (id === 'offers') return NM.pct(p) > 0;
    if (id === 'xmas') return !!p.navidad;
    return p.cat === id;
  }
  function renderChips() {
    var vis = visible(), list = [{ id: 'all', name: 'Todo' }, { id: 'offers', name: 'Ofertas', cls: 'hot' }, { id: 'xmas', name: 'Para Navidad' }];
    d.cats.forEach(function (c) { list.push({ id: c.id, name: c.name }); });
    $('#chips').innerHTML = list.map(function (c) {
      var n = vis.filter(function (p) { return inCat(p, c.id); }).length;
      if (c.id !== 'all' && !n) return '';
      return '<button type="button" class="chip' + (c.cls ? ' ' + c.cls : '') + '" data-cat="' + esc(c.id) + '" aria-pressed="' + (S.cat === c.id) + '">' + esc(c.name) + '<small>' + n + '</small></button>';
    }).join('');
  }
  function filtered() {
    var q = S.q.trim().toLowerCase();
    var list = visible().filter(function (p) {
      if (!inCat(p, S.cat) || !inBudget(p)) return false;
      if (q && (p.name + ' ' + NM.catName(d, p.cat) + ' ' + (p.desc || '') + ' ' + p.ref).toLowerCase().indexOf(q) < 0) return false;
      return true;
    });
    list.sort(function (a, b) {
      if (S.sort === 'low') return a.price - b.price;
      if (S.sort === 'high') return b.price - a.price;
      if (S.sort === 'off') return NM.pct(b) - NM.pct(a) || b.n - a.n;
      var sa = (a.soldOut ? 0 : 2) + (a.featured ? 1 : 0), sb = (b.soldOut ? 0 : 2) + (b.featured ? 1 : 0);
      return sb - sa || b.n - a.n;
    });
    return list;
  }
  function card(p, big) {
    var off = NM.pct(p), b = '';
    if (off) b += '<span class="badge off">Oferta −' + off + '%</span>';
    if (p.badge) b += '<span class="badge ' + (p.badge === 'Nuevo' ? 'new' : p.badge === 'Más vendido' ? 'top' : 'last') + '">' + esc(p.badge) + '</span>';
    var sep = p.soldOut ? 'Pregunta cuándo llega' : p.allowPartial ? 'Sepárala hoy con ' + money(NM.partialOf(d, p.price)) : 'Se paga completo';
    var quick = p.soldOut ? '' : '<button type="button" class="qadd" data-quick="' + esc(p.id) + '" aria-label="' + (opts(p).length ? 'Elegir opción de ' : 'Agregar a mi lista: ') + esc(p.name) + '" title="' + (opts(p).length ? 'Elegir opción' : 'Agregar a mi lista') + '">+</button>';
    return '<article class="card' + (p.soldOut ? ' is-sold' : '') + (big ? ' big' : '') + '"><div class="mwrap">' +
      '<button type="button" class="media" data-open="' + esc(p.id) + '" aria-label="Ver ' + esc(p.name) + '">' + NM.art(p, d) + '<span class="badges">' + b + '</span>' + (p.soldOut ? '<span class="soldtag">Agotado por ahora</span>' : '') + '</button>' + quick + '</div>' +
      '<div class="cbody"><span class="cat">' + esc(NM.catName(d, p.cat)) + '</span>' +
      '<button type="button" class="ctitle" data-open="' + esc(p.id) + '">' + esc(p.name) + '</button>' +
      '<div class="price"><b>' + money(p.price) + '</b>' + (off ? '<s>' + money(p.oldPrice) + '</s>' : '') + '</div>' +
      '<span class="sep">' + sep + '</span>' +
      '<div class="rowbtn"><button type="button" class="btn small block' + (p.soldOut ? ' ghost' : '') + '" data-open="' + esc(p.id) + '">' + (p.soldOut ? 'Avísame cuando llegue' : 'Ver y preguntar') + '</button></div></div></article>';
  }
  function renderGrid() {
    var list = filtered(), total = visible().length;
    var bigOK = S.cat === 'all' && !S.q && S.budget === 'any' && S.sort === 'rec' && list.length >= 4 && list[0].featured && !list[0].soldOut;
    $('#grid').innerHTML = list.map(function (p, i) { return card(p, bigOK && i === 0); }).join('');
    $('#count').textContent = !total ? '' : list.length === total ? total + (total === 1 ? ' regalo esperándote' : ' regalos esperándote') : list.length + ' de ' + total + ' regalos';
    var e = $('#empty'); e.hidden = list.length > 0;
    if (!list.length) $('#emptyMsg').textContent = total ? 'Prueba con otra palabra o mira todas las categorías.' : owner() + ' está sacando nuevos regalos del empaque. Vuelve en un momento.';
    $('#clear').hidden = !total;
    renderChips(); renderBudget(); reveal();
  }

  /* ---------- capas (solo se cierran con la X o con Cerrar) ---------- */
  function openLayer(el, opener) {
    S.opener = opener || document.activeElement;
    el.classList.add('open'); el.setAttribute('aria-hidden', 'false'); if (!S.openCount) NM.lock(); S.openCount = 1;
    var f = $('.xbtn', el); if (f) f.focus({ preventScroll: true });
  }
  function closeLayers() {
    $$('.layer').forEach(function (l) { l.classList.remove('open'); l.setAttribute('aria-hidden', 'true'); });
    var wasOpen = S.openCount; S.openCount = 0; if (wasOpen) NM.unlock(); S.open = null;
    if (S.opener && S.opener.focus) { try { S.opener.focus({ preventScroll: true }); } catch (e) { /* nada */ } }
  }

  /* ---------- ficha de producto ---------- */
  function imgs(p) { return (p.imgs || []).filter(function (s) { return /^data:image\//.test(s); }); }
  function openProduct(id, opener) {
    var p = find(id); if (!p) return;
    S.open = id; S.qty = 1; S.mode = 'full'; S.gi = 0; S.pick = opts(p).length === 1 ? opts(p)[0] : null;
    $('#mCat').textContent = NM.catName(d, p.cat) + ' · Ref ' + p.ref;
    $('#mTitle').textContent = p.name;
    var off = NM.pct(p);
    $('#mPrice').innerHTML = '<b>' + money(p.price) + '</b>' + (off ? '<s>' + money(p.oldPrice) + '</s><span class="off">−' + off + '%</span>' : '');
    $('#mDesc').textContent = p.desc || '';
    $('#mTags').innerHTML = (p.navidad ? '<span class="tagc red">Para Navidad</span>' : '') + (p.badge ? '<span class="tagc">' + esc(p.badge) + '</span>' : '') + (p.soldOut ? '<span class="tagc red">Agotado por ahora</span>' : '');
    var o = opts(p);
    $('#mOptBox').hidden = !o.length;
    $('#mOptLbl').textContent = 'Elige ' + (p.optionLabel ? 'el ' + p.optionLabel.toLowerCase() : 'una opción');
    $('#mOpts').innerHTML = o.map(function (v) { return '<button type="button" class="opt" data-pick="' + esc(v) + '" aria-pressed="false">' + esc(v) + '</button>'; }).join('');
    $('#mQtyBox').hidden = p.soldOut;
    $('#mPayBox').hidden = p.soldOut;
    $('#mPay').innerHTML =
      '<label class="pay"><input type="radio" name="mpay" value="full" checked><span><b>Pago completo</b><small>Pagas todo y listo</small></span><span class="amt" data-amt="full"></span></label>' +
      '<label class="pay' + (p.allowPartial ? '' : ' off') + '"><input type="radio" name="mpay" value="partial"' + (p.allowPartial ? '' : ' disabled') + '><span><b>Separar con el ' + pctTxt() + '%</b><small>' + (p.allowPartial ? 'Hoy pagas la mitad y el resto después' : 'Este regalo se paga completo') + '</small></span><span class="amt" data-amt="partial"></span></label>';
    renderGallery(p);
    updateModal();
    openLayer($('#modal'), opener);
    $('#modal .sheet').scrollTop = 0;
  }
  function renderGallery(p) {
    var im = imgs(p), i = Math.min(S.gi, Math.max(im.length - 1, 0));
    $('#mArt').innerHTML = im.length ? NM.photo(p, i, false) : NM.art(p, d);
    $('#mThumbs').innerHTML = im.length > 1 ? im.map(function (s, k) { return '<button type="button" data-gi="' + k + '" aria-label="Foto ' + (k + 1) + '" aria-current="' + (k === i) + '"><img class="photo" src="' + s + '" alt="" style="' + NM.photoStyle(p.pos && p.pos[k]) + '"></button>'; }).join('') : '';
  }
  function updateModal() {
    var p = find(S.open); if (!p) return;
    var o = opts(p), need = o.length > 0 && !S.pick, total = p.price * S.qty;
    $$('#mOpts .opt').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.pick === S.pick)); });
    $('#mQty').textContent = S.qty;
    var af = $('[data-amt="full"]'), ap = $('[data-amt="partial"]');
    if (af) af.textContent = money(total);
    if (ap) ap.textContent = p.allowPartial ? money(NM.partialOf(d, total)) + ' hoy' : '';
    if (!p.allowPartial) S.mode = 'full';
    var wa = $('#mWa'), hint = $('#mHint'), bub = $('#mBubble'), kind = p.soldOut ? 'back' : 'ask';
    $('#mWaLabel').textContent = p.soldOut ? 'Preguntar cuándo llega' : 'Preguntar disponibilidad';
    $('#mAdd').hidden = p.soldOut;
    $('#mNoNum').hidden = hasNum();
    hint.classList.remove('warn');
    if (need) {
      wa.href = '#'; wa.removeAttribute('data-text'); wa.setAttribute('aria-disabled', 'true'); bub.hidden = true;
      hint.textContent = 'Elige ' + (p.optionLabel ? 'el ' + p.optionLabel.toLowerCase() : 'una opción') + ' para armar el mensaje.';
    } else {
      var text = NM.waText(d, [{ p: p, opt: S.pick, qty: S.qty }], S.mode, S.who, kind);
      wa.href = NM.waUrl(d, text); wa.dataset.text = text; wa.setAttribute('aria-disabled', 'false');
      $('#mText').textContent = text; bub.hidden = false;
      hint.textContent = 'Al tocar el botón se abre WhatsApp con este mensaje. Lo envías tú.';
    }
  }
  function needPick() {
    var g = $('#mOpts'); g.classList.remove('shake'); void g.offsetWidth; g.classList.add('shake');
    var h = $('#mHint'); h.classList.add('warn'); h.textContent = 'Primero elige una opción.';
    toast('Elige una opción primero');
  }

  /* ---------- mi lista ---------- */
  function saveCart() { ls('novamix-cart', JSON.stringify(S.cart)); }
  function cartItems() {
    return S.cart.map(function (c) { var p = find(c.id); return p && !p.hidden && !p.soldOut ? { p: p, opt: c.opt || '', qty: c.qty } : null; }).filter(Boolean);
  }
  function updateBadge() {
    var n = cartItems().reduce(function (a, it) { return a + it.qty; }, 0);
    $('#cartCount').textContent = n;
  }
  function addToCart() {
    var p = find(S.open); if (!p || p.soldOut) return;
    if (opts(p).length && !S.pick) { needPick(); return; }
    var key = S.pick || '', hit = S.cart.filter(function (c) { return c.id === p.id && (c.opt || '') === key; })[0];
    if (hit) hit.qty = Math.min(99, hit.qty + S.qty); else S.cart.push({ id: p.id, opt: key, qty: S.qty });
    saveCart(); updateBadge(); renderCart();
    var b = $('#cartBtn'); b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump');
    toast('Agregado a tu lista: ' + p.name);
  }
  function renderCart() {
    var items = cartItems();
    $('#dForm').hidden = !items.length;
    if (!items.length) {
      $('#dLines').innerHTML = '<div class="d-empty"><h4>Tu lista está vacía</h4><p class="muted">Agrega los regalos que te gusten y pregunta por todos en un solo mensaje.</p></div>';
      $('#dFoot').innerHTML = '<button class="btn" type="button" data-close>Ver los regalos</button>';
      return;
    }
    $('#dLines').innerHTML = items.map(function (it, i) {
      return '<div class="line"><div class="th">' + NM.art(it.p, d) + '</div><div><b>' + esc(it.p.name) + '</b><small>' + (it.opt ? esc((it.p.optionLabel || 'Opción') + ': ' + it.opt) + ' · ' : '') + money(it.p.price) + ' c/u</small>' +
        '<div class="qty" role="group" aria-label="Cantidad"><button type="button" data-q="-1" data-i="' + i + '" aria-label="Menos">−</button><output>' + it.qty + '</output><button type="button" data-q="1" data-i="' + i + '" aria-label="Más">+</button></div></div>' +
        '<button type="button" class="rm" data-rm="' + i + '" aria-label="Quitar ' + esc(it.p.name) + '">×</button></div>';
    }).join('');
    var all = items.every(function (it) { return it.p.allowPartial; });
    if (!all) S.cmode = 'full';
    $('#dPay').innerHTML =
      '<label class="pay"><input type="radio" name="dpay" value="full"' + (S.cmode === 'full' ? ' checked' : '') + '><span><b>Pago completo</b><small>Pagas todo y listo</small></span></label>' +
      '<label class="pay' + (all ? '' : ' off') + '"><input type="radio" name="dpay" value="partial"' + (S.cmode === 'partial' ? ' checked' : '') + (all ? '' : ' disabled') + '><span><b>Separar con el ' + pctTxt() + '%</b><small>' + (all ? 'Hoy pagas la mitad y el resto después' : 'Algún regalo de tu lista se paga completo') + '</small></span></label>';
    $('#dName').value = S.who;
    updateCartText();
  }
  function updateCartText() {
    var items = cartItems(); if (!items.length) return;
    var total = items.reduce(function (a, it) { return a + it.p.price * it.qty; }, 0), part = S.cmode === 'partial';
    $('#dSum').innerHTML = '<div><span>Total de tu lista</span><b>' + money(total) + '</b></div>' + (part ? '<div><span>Saldo después</span><span>' + money(total - NM.partialOf(d, total)) + '</span></div>' : '') +
      '<div class="big"><span>' + (part ? 'Pagas hoy' : 'Pagas') + '</span><span>' + money(part ? NM.partialOf(d, total) : total) + '</span></div>';
    var text = NM.waText(d, items, S.cmode, S.who, 'ask');
    $('#dText').textContent = text;
    $('#dFoot').innerHTML = '<a class="btn wa block" href="' + esc(NM.waUrl(d, text)) + '" target="_blank" rel="noopener" data-text="' + esc(text) + '"><svg aria-hidden="true"><use href="#i-wa"/></svg>Preguntar todo por WhatsApp</a>' +
      (hasNum() ? '' : '<p class="hint">Prototipo: falta poner el WhatsApp de ' + esc(owner()) + ' en su panel.</p>') +
      '<button class="btn ghost block" type="button" data-close>Seguir viendo regalos</button><button class="linkbtn" type="button" data-clear-cart>Vaciar mi lista</button>';
  }

  /* ---------- textos legales ---------- */
  function legal(k) {
    var o = esc(owner()), tel = NM.prettyPhone(d.settings.whatsapp), contact = tel ? 'por WhatsApp al ' + esc(tel) : 'por WhatsApp', p = pctTxt();
    var T = {
      datos: ['Política de tratamiento y protección de datos personales',
        '<p>Esta política aplica a NOVAMIX, tienda atendida por Jenny Cardona, como responsable del tratamiento de tus datos personales, en cumplimiento de la Ley 1581 de 2012 y sus normas reglamentarias.</p>' +
        '<h4>Qué datos tratamos</h4><p>Solo los que tú escribes cuando nos contactas por WhatsApp: tu nombre, tu ciudad o barrio y los productos por los que preguntas. Esta tienda no crea cuentas de clientes ni recibe pagos en línea.</p>' +
        '<h4>Para qué los usamos</h4><ul><li>Responder si un producto está disponible.</li><li>Coordinar el pago, el separado y la entrega.</li><li>Avisarte cuando un producto agotado vuelva a llegar, si lo pediste.</li></ul>' +
        '<h4>Tus derechos</h4><p>Puedes conocer, actualizar, rectificar y pedir la supresión de tus datos, o revocar tu autorización, escribiendo ' + contact + '. No vendemos ni cedemos tus datos a terceros.</p>'],
      terminos: ['Términos de servicio',
        '<p>Al usar este sitio aceptas estos términos.</p><ul><li>El catálogo es informativo. Los precios están en pesos colombianos (COP) y pueden cambiar sin previo aviso.</li><li>La disponibilidad no se garantiza hasta que ' + o + ' te la confirme por WhatsApp.</li><li>Las fotos son de referencia. El producto puede variar un poco en color o empaque.</li><li>La compra se acuerda con ' + o + ' por WhatsApp: se confirma cuando recibes su confirmación y se recibe el pago acordado.</li><li>No manejamos créditos ni pagos en cuotas. Las formas de compra son pago completo o separado con el ' + p + '%.</li></ul>'],
      separados: ['Política de separados',
        '<p>Puedes separar tu regalo pagando el ' + p + '% de su valor. El resto lo cancelas después, según lo que acuerdes con ' + o + ' por WhatsApp.</p><ul><li>Primero ' + o + ' confirma que el producto está disponible.</li><li>Ella te indica los medios de pago y hasta qué fecha queda apartado.</li><li>Algunos productos se venden solo con pago completo y no se pueden separar. Lo verás indicado en cada ficha.</li><li>No manejamos créditos ni cuotas.</li></ul>'],
      reembolso: ['Política de reembolso',
        '<p>Si recibes un producto con algún defecto o diferente al que pediste, escríbele a ' + o + ' ' + contact + ' lo antes posible, con una foto, y buscamos una solución.</p><ul><li>En compras a distancia tienes derecho de retracto en los términos de la Ley 1480 de 2011, con las excepciones que establece la ley.</li><li>Para pedirlo, escribe dentro de los 5 días hábiles siguientes a recibir el producto, que debe estar sin uso y en su empaque.</li><li>Si decides cancelar un separado, escribe para acordar cómo se devuelve el valor abonado.</li><li>Cuando aplica, el reembolso se hace por el mismo medio de pago.</li></ul>'],
      envios: ['Política de envíos',
        '<p>La entrega se coordina directamente con ' + o + ' por WhatsApp, después de confirmar disponibilidad y pago.</p><ul><li>El costo y el tiempo de entrega dependen del destino y se informan antes de pagar.</li><li>Te pedimos confirmar tu nombre, ciudad y dirección o punto de entrega al hacer el pedido.</li><li>Revisa el producto al recibirlo y escribe de inmediato si notas algún problema.</li></ul>']
    };
    return T[k];
  }

  /* ---------- eventos ---------- */
  document.addEventListener('click', function (e) {
    var t = e.target, el;
    if (t.closest('[data-close]')) { closeLayers(); return; }
    if ((el = t.closest('[data-open]'))) { openProduct(el.dataset.open, el); return; }
    if ((el = t.closest('[data-legal]'))) {
      var L = legal(el.dataset.legal); $('#lTitle').textContent = L[0]; $('#lText').innerHTML = L[1];
      openLayer($('#legal'), el); $('#legal .sheet').scrollTop = 0; return;
    }
    if ((el = t.closest('[data-cat]'))) { S.cat = el.dataset.cat; renderGrid(); return; }
    if ((el = t.closest('[data-pick]'))) { S.pick = el.dataset.pick; updateModal(); return; }
    if ((el = t.closest('[data-gi]'))) { S.gi = +el.dataset.gi; var p0 = find(S.open); if (p0) renderGallery(p0); return; }
    if (t.closest('#mPlus')) { S.qty = Math.min(99, S.qty + 1); updateModal(); return; }
    if (t.closest('#mMinus')) { S.qty = Math.max(1, S.qty - 1); updateModal(); return; }
    if (t.closest('#mAdd')) { addToCart(); return; }
    if ((el = t.closest('#mWa'))) {
      if (el.getAttribute('aria-disabled') === 'true') { e.preventDefault(); needPick(); return; }
      NM.logAsk(el.dataset.text || ''); return;
    }
    if ((el = t.closest('#dFoot a[data-text]'))) { NM.logAsk(el.dataset.text || ''); return; }
    if (t.closest('#cartBtn')) { renderCart(); openLayer($('#drawer'), $('#cartBtn')); return; }
    if ((el = t.closest('[data-q]'))) {
      var it = cartItems()[+el.dataset.i];
      if (it) { var rec = S.cart.filter(function (c) { return c.id === it.p.id && (c.opt || '') === it.opt; })[0]; if (rec) { rec.qty = Math.max(1, Math.min(99, rec.qty + (+el.dataset.q))); saveCart(); updateBadge(); renderCart(); } }
      return;
    }
    if ((el = t.closest('[data-rm]'))) {
      var it2 = cartItems()[+el.dataset.rm];
      if (it2) { S.cart = S.cart.filter(function (c) { return !(c.id === it2.p.id && (c.opt || '') === it2.opt); }); saveCart(); updateBadge(); renderCart(); }
      return;
    }
    if (t.closest('[data-clear-cart]')) { S.cart = []; saveCart(); updateBadge(); renderCart(); toast('Tu lista quedó vacía'); return; }
    if ((el = t.closest('[data-hero]'))) { S.cat = el.dataset.hero; S.q = ''; $('#q').value = ''; renderGrid(); var cg = $('#catalogo'); if (cg) cg.scrollIntoView({ behavior: 'smooth' }); return; }
    if ((el = t.closest('[data-budget]'))) { S.budget = el.dataset.budget; renderGrid(); return; }
    if ((el = t.closest('[data-quick]'))) {
      var qp = find(el.dataset.quick); if (!qp) return;
      if (opts(qp).length) { openProduct(qp.id, el); return; }
      var hit = S.cart.filter(function (c) { return c.id === qp.id && !(c.opt || ''); })[0];
      if (hit) hit.qty = Math.min(99, hit.qty + 1); else S.cart.push({ id: qp.id, opt: '', qty: 1 });
      saveCart(); updateBadge(); renderCart(); burst(el); var cb = $('#cartBtn'); cb.classList.remove('bump'); void cb.offsetWidth; cb.classList.add('bump');
      toast('Agregado a tu lista: ' + qp.name); return;
    }
    if (t.closest('#surprise')) {
      var pool = visible().filter(function (p) { return !p.soldOut; }); if (!pool.length) { toast('Pronto llegan más regalos'); return; }
      var pick = pool[Math.floor(Math.random() * pool.length)]; burst(t.closest('#surprise')); openProduct(pick.id, t.closest('#surprise')); return;
    }
    if (t.closest('#clear')) { S.cat = 'all'; S.budget = 'any'; S.q = ''; $('#q').value = ''; renderGrid(); return; }
    if (t.closest('#xmasBtn')) { S.cat = 'xmas'; S.q = ''; $('#q').value = ''; renderGrid(); var c = $('#catalogo'); if (c) c.scrollIntoView({ behavior: 'smooth' }); return; }
  });
  document.addEventListener('change', function (e) {
    var t = e.target;
    if (t.name === 'mpay') { S.mode = t.value; updateModal(); return; }
    if (t.name === 'dpay') { S.cmode = t.value; ls('novamix-cmode', S.cmode); updateCartText(); return; }
    if (t.id === 'sort') { S.sort = t.value; renderGrid(); }
  });
  document.addEventListener('input', function (e) {
    var t = e.target;
    if (t.id === 'q') { S.q = t.value; renderGrid(); return; }
    if (t.id === 'dName') { S.who = t.value.trim(); ls('novamix-who', S.who); updateCartText(); }
  });

  /* si Jenny cambia algo en su panel (otra pestaña), la tienda se actualiza sola */
  window.addEventListener('storage', function (e) {
    if (e.key !== NM.KEY) return;
    d = NM.get(); renderAll();
    if (S.open && !find(S.open)) closeLayers();
  });

  /* ---------- toques de vida: confeti, nieve, brillo y entrada suave ---------- */
  var calm = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce), (max-width: 700px), (hover: none)').matches;
  function burst(el) {
    if (calm || !el.animate) return;
    var r = el.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, cols = ['#2FA3F2', '#FFC94A', '#D12F3B', '#22B25F', '#fff', '#7B2FD6'];
    for (var i = 0; i < 16; i++) {
      var n = document.createElement('i'); n.className = 'confetti'; n.style.left = cx + 'px'; n.style.top = cy + 'px'; n.style.background = cols[i % cols.length];
      document.body.appendChild(n);
      var a = Math.random() * Math.PI * 2, v = 50 + Math.random() * 70;
      n.animate([{ transform: 'translate(0,0) rotate(0)', opacity: 1 }, { transform: 'translate(' + Math.cos(a) * v + 'px,' + (Math.sin(a) * v + 40) + 'px) rotate(' + (Math.random() * 540) + 'deg)', opacity: 0 }], { duration: 700 + Math.random() * 300, easing: 'cubic-bezier(.2,.7,.3,1)' }).onfinish = (function (x) { return function () { x.remove(); }; })(n);
    }
  }
  var io = null;
  function reveal() {
    if (calm || !('IntersectionObserver' in window)) return;
    if (!io) io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { var t = e.target; t.classList.add('in'); io.unobserve(t); setTimeout(function () { t.classList.remove('rv', 'in'); t.style.transitionDelay = ''; }, 1000); } }); }, { threshold: .12 });
    $$('.card:not([data-rv]), .tile:not([data-rv])').forEach(function (n, i) { n.dataset.rv = '1'; n.classList.add('rv'); n.style.transitionDelay = Math.min(i % 4, 3) * 70 + 'ms'; io.observe(n); });
  }
  function lights() {
    var box = $('#lights'); if (!box) return;
    var cols = ['#FF5C6C', '#FFC94A', '#4FD6FF', '#5BE08F'], n = Math.max(10, Math.round((window.innerWidth || 1200) / 58)), html = '';
    for (var i = 0; i < n; i++) {
      var x = (i + .5) / n * 100, y = 22 + Math.sin(i / n * Math.PI * 3) * 14;
      html += '<i style="left:calc(' + x.toFixed(2) + '% - 8px);top:' + y.toFixed(1) + 'px;--c:' + cols[i % 4] + ';animation-delay:-' + (i % 5) * .5 + 's"></i>';
    }
    box.innerHTML = html;
  }
  window.addEventListener('resize', function () { clearTimeout(lights.t); lights.t = setTimeout(lights, 200); });
  function snow() {
    var box = $('#snow'); if (!box || calm) return;
    for (var i = 0; i < 34; i++) {
      var f = document.createElement('i'), s = 3 + Math.random() * 5;
      f.style.cssText = 'left:' + Math.random() * 100 + '%;width:' + s + 'px;height:' + s + 'px;opacity:' + (.4 + Math.random() * .5) + ';animation-duration:' + (9 + Math.random() * 12) + 's;animation-delay:-' + Math.random() * 18 + 's;--dx:' + (Math.random() * 60 - 30) + 'px';
      box.appendChild(f);
    }
  }
  /* los dibujos siguen un poquito al mouse; las tarjetas se inclinan */
  if (!calm && window.matchMedia && matchMedia('(hover: hover)').matches) {
    var hero = $('.hero'), orb = $('.orb'), xi = $('#xmasImg'), sticker = $('.sticker');
    function follow(box, targets, e) {
      var r = box.getBoundingClientRect(), mx = (e.clientX - r.left) / r.width * 2 - 1, my = (e.clientY - r.top) / r.height * 2 - 1;
      targets.forEach(function (t) { t.style.setProperty('--mx', mx.toFixed(2)); t.style.setProperty('--my', my.toFixed(2)); });
    }
    if (hero && orb) hero.addEventListener('pointermove', function (e) { follow(hero, [hero], e); });
    if (xi) $('#navidad').addEventListener('pointermove', function (e) { follow($('#navidad'), [xi.querySelector('img')], e); });
    if (sticker) $('#nosotros').addEventListener('pointermove', function (e) { follow($('#nosotros'), [sticker], e); });
    $('#grid').addEventListener('pointermove', function (e) {
      var c = e.target.closest('.card'); if (!c) return; var r = c.getBoundingClientRect();
      c.style.setProperty('--ry', ((e.clientX - r.left) / r.width - .5) * 8 + 'deg'); c.style.setProperty('--rx', (.5 - (e.clientY - r.top) / r.height) * 8 + 'deg');
    });
    $('#grid').addEventListener('pointerout', function (e) { var c = e.target.closest('.card'); if (c) { c.style.setProperty('--rx', '0deg'); c.style.setProperty('--ry', '0deg'); } });
  }

  function renderAll() { renderStatic(); renderOrbits(); renderStrip(); renderGrid(); updateBadge(); renderCart(); }
  renderAll(); snow(); lights(); reveal();
})();
