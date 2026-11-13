/* ===================== TIENDA ===================== */
const ST = { gen: 'Todos', casa: null, q: '', shown: 24, cfg: null, code: null };
const ACT = {};
const HEART = '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.3 3 4.5 6.6 4.5c2 0 3.6 1 5.4 3 1.8-2 3.4-3 5.4-3 3.600 0 5.700 3.800 4.200 7.300C19.500 16.400 12 21 12 21Z"/></svg>';
const SVGI = {
  bag: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8h14l-1 12H6L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
  book: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h12a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3V4Z"/><path d="M8 4v16M12 9h4"/></svg>',
  heart: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7.500-4.600-9.600-9.200C.9 8.300 3 4.500 6.600 4.500c2 0 3.600 1 5.400 3 1.800-2 3.400-3 5.400-3 3.600 0 5.700 3.800 4.200 7.300C19.500 16.400 12 21 12 21Z"/></svg>',
  panel: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9" rx="1.500"/><rect x="14" y="3" width="7" height="5" rx="1.500"/><rect x="14" y="12" width="7" height="9" rx="1.500"/><rect x="3" y="16" width="7" height="5" rx="1.500"/></svg>',
  x: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.600" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  wa: '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.500 15.200L2 22l4.900-1.400A10 10 0 1 0 12 2Zm5.800 14.100c-.2.700-1.400 1.300-2 1.400-.5.100-1.200.1-1.900-.1-.4-.1-1-.3-1.700-.6-3-1.300-4.900-4.300-5.100-4.500-.1-.2-1.200-1.600-1.200-3s.8-2.100 1-2.400c.3-.3.600-.3.800-.3h.6c.2 0 .4 0 .6.500l.9 2.200c.1.200.1.400 0 .5l-.4.600-.4.500c-.1.200-.3.400-.1.700.2.300.8 1.300 1.700 2.100 1.200 1 2.100 1.400 2.400 1.500.3.200.5.100.7-.1l.9-1c.2-.3.400-.2.700-.1l2 1c.3.100.5.200.6.300.1.200.1.800-.1 1.500Z"/></svg>'
};

/* ---------- HERO: el frasco que cambia de aroma ---------- */
let _hTimer = null;
function renderHero() {
  const host = $('#hBottle'); if (!host) return;
  const pick = () => S.productos.filter(p => p.activo)[Math.floor(Math.random() * S.productos.length)] || S.productos[0];
  host.innerHTML = bottleSVG({ color: '#C68A2E', level: .1, size: 2, label: 'Frasco El Francés' });
  const swap = () => {
    const p = pick(); if (!p) return;
    setBottle(host, .84, p.color);
    const n = $('#hName'); if (n) { n.classList.remove('in'); void n.offsetWidth; n.textContent = p.n; n.classList.add('in'); }
    const g = $('#hGen'); if (g) g.textContent = (dest(p.d) || {}).nombre || '';
  };
  setTimeout(swap, 400); clearInterval(_hTimer); _hTimer = setInterval(() => { if (document.hidden || !$('#v-store').classList.contains('on')) return; swap(); }, 3800);
  tilt($('#hStage'), 10);
}

/* ---------- Franja de casas ---------- */
function casasOrdenadas() {
  const n = {}; S.productos.filter(p => p.activo).forEach(p => { n[p.d] = (n[p.d] || 0) + 1; });
  return S.destinos.filter(d => n[d.id]).map(d => ({ ...d, n: n[d.id] })).sort((a, b) => b.n - a.n || a.nombre.localeCompare(b.nombre));
}
function renderMarq() {
  const cs = casasOrdenadas(), a = cs.slice(0, Math.ceil(cs.length / 2)), b = cs.slice(Math.ceil(cs.length / 2));
  const row = (arr, cls) => { const one = arr.map(c => `<span>${esc(c.nombre)}</span>`).join(''); return `<div class="mq ${cls}"><div class="tr">${one}${one}</div></div>`; };
  $('#marq').innerHTML = row(a, 'l') + row(b, 'r');
}

/* ---------- Historia que se llena con el scroll ---------- */
function storyInit() {
  const host = $('#sBottle'); if (!host || host._i) return; host._i = 1;
  host.innerHTML = bottleSVG({ color: '#D9B25F', level: .08, size: 2, label: 'Frasco llenándose' });
  const sec = $('#story'), steps = $$('.stp', sec);
  const upd = () => {
    const r = sec.getBoundingClientRect(), total = r.height - innerHeight; if (total <= 0) return;
    const pr = Math.min(1, Math.max(0, -r.top / total));
    const idx = Math.min(steps.length - 1, Math.floor(pr * steps.length));
    steps.forEach((s, i) => s.classList.toggle('on', i === idx));
    setBottle(host, .08 + pr * .8, ['#D9B25F', '#C68A2E', '#B76E79', '#7A4A2E'][idx]);
    $('#sBar').style.height = (pr * 100) + '%'; $('#sNum').textContent = '0' + (idx + 1);
  };
  addEventListener('scroll', upd, { passive: true }); upd();
}

/* ---------- La carta ---------- */
function renderFilters() {
  const gens = ['Todos', 'Hombre', 'Mujer'];
  $('#filters').innerHTML = `<div class="gtabs">${gens.map(g => `<button class="${ST.gen === g ? 'on' : ''}" data-act="gen" data-g="${g}">${g}</button>`).join('')}</div>
   <label class="xsearch"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg><input id="q" type="search" placeholder="Busca: Chanel, Boss, 212…" value="${esc(ST.q)}" aria-label="Buscar"></label>`;
  const q = $('#q'); if (q) q.oninput = e => { ST.q = e.target.value; ST.shown = 24; renderGrid(); };
  const cc = ST.casa ? dest(ST.casa) : null;
  $('#filters').insertAdjacentHTML('beforeend', `<button class="casabtn" data-act="casaMenu"><small>Casa de inspiración</small><b>${cc ? esc(cc.nombre) : 'Todas las casas'}</b><i>&#9662;</i></button>`);
  $('#casas').innerHTML = `<button class="cc${!ST.casa ? ' on' : ''}" data-act="casa" data-id="">Todas las casas</button>` + casasOrdenadas().map(c => `<button class="cc${ST.casa === c.id ? ' on' : ''}" data-act="casa" data-id="${c.id}">${esc(c.nombre)} <i>${c.n}</i></button>`).join('');
}
ACT.gen = el => { ST.gen = el.dataset.g; ST.shown = 24; renderFilters(); renderGrid(); };
ACT.casa = el => { ST.casa = el.dataset.id || null; ST.shown = 24; renderFilters(); renderGrid(); };
function listaCarta() {
  const q = ST.q.trim().toLowerCase();
  return S.productos.filter(p => p.activo && (!ST.casa || p.d === ST.casa) && (ST.gen === 'Todos' || p.g === ST.gen) && (!q || (p.n + ' ' + ((dest(p.d) || {}).nombre || '')).toLowerCase().includes(q)));
}
function prodCard(p, i) {
  const d = dest(p.d) || { nombre: '' }, fav = S.favs.includes(p.id);
  return `<article class="xc" style="--c:${p.color};--i:${i % 12}">
   <div class="glow"></div>
   <button class="fav${fav ? ' on' : ''}" data-act="fav" data-id="${p.id}" aria-label="Favorito" aria-pressed="${fav}">${HEART}</button>
   <div class="xb">${bottleSVG({ color: p.color, level: .72, size: 1, label: p.n })}</div>
   <div class="xt"><small>${esc(d.nombre)}<em>${esc(p.g)}</em></small><h3>${esc(p.n)}</h3><span class="g">${esc(p.g)}</span></div>
   <button class="xp" data-act="cfg" data-id="${p.id}"><span>Pedir esta</span><b>desde ${fmt(minPrice())}</b></button></article>`;
}
function renderGrid(append) {
  const l = listaCarta(), g = $('#grid'), more = $('#more'), cnt = $('#cnt');
  const part = l.slice(0, ST.shown);
  if (cnt) cnt.textContent = l.length + ' esencia' + (l.length === 1 ? '' : 's');
  g.innerHTML = part.length ? part.map(prodCard).join('') : '<div class="empty">No encontramos esa esencia en el catálogo. Escríbele a Diego y la consigue sobre pedido.</div>';
  more.style.display = l.length > ST.shown ? '' : 'none';
  more.textContent = 'Ver ' + Math.min(24, l.length - ST.shown) + ' más';
  observeReveal(g);
  $$('.xc', g).forEach(c => {
    c.addEventListener('mousemove', e => { const r = c.getBoundingClientRect(); c.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%'); c.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%'); });
  });
}
ACT.more = () => { ST.shown += 24; renderGrid(); };
ACT.fav = (el) => {
  const id = el.dataset.id, i = S.favs.indexOf(id);
  if (i >= 0) S.favs.splice(i, 1); else { S.favs.push(id); burstEl(el, 8); toast('Guardada en favoritos'); }
  save(); updateBadges(); el.classList.toggle('on', S.favs.includes(id)); el.setAttribute('aria-pressed', S.favs.includes(id)); if ($('#dr-fav').classList.contains('on')) renderFav();
};

/* ---------- Sorpréndeme (ruleta) ---------- */
let _spinT = null;
ACT.spin = () => {
  const l = S.productos.filter(p => p.activo); if (!l.length) return;
  const win = l[Math.floor(Math.random() * l.length)];
  $('#spinBody').innerHTML = `<div class="spin"><small>EL DESTINO ELIGE</small><div class="reel"><div class="rr" id="rr"></div></div><div class="sres" id="sres"></div></div>`;
  openOv('ov-spin');
  const rr = $('#rr'); let n = 0, delay = 60; const tot = 26;
  clearTimeout(_spinT);
  const step = () => {
    const p = n >= tot ? win : l[Math.floor(Math.random() * l.length)];
    rr.style.setProperty('--c', p.color); rr.textContent = p.n; rr.classList.remove('tk'); void rr.offsetWidth; rr.classList.add('tk');
    n++; delay += 9;
    if (n <= tot) _spinT = setTimeout(step, delay); else {
      burstEl($('.reel'), 22);
      $('#sres').innerHTML = `<div class="xb" style="height:190px">${bottleSVG({ color: win.color, level: .1, size: 1, label: win.n })}</div><p><b>${esc(win.n)}</b><br><span>${esc((dest(win.d) || {}).nombre)} &middot; ${esc(win.g)}</span></p><div class="acts" style="justify-content:center"><button class="btn btn-line" style="color:var(--cream)" data-act="spin">Otra vez</button><button class="btn btn-gold" data-act="spinPick" data-id="${win.id}">Pedir esta</button></div>`;
      setTimeout(() => setBottle($('#sres .xb'), .8, win.color), 80);
    }
  };
  step();
};
ACT.spinPick = el => { closeOv('ov-spin'); ACT.cfg(el); };
ACT.closeSpin = () => { clearTimeout(_spinT); closeOv('ov-spin'); };

/* ---------- Tamaños ---------- */
const SZ = { env: 'nuevo' };
function renderSizes() {
  const keys = ['oz1', 'oz1c', 'oz2c'], cols = ['#D9A24A', '#B76E79', '#7A1E2E'];
  $('#envTog').innerHTML = `<button class="${SZ.env === 'nuevo' ? 'on' : ''}" data-act="senv" data-k="nuevo">Con envase nuevo</button><button class="${SZ.env === 'recarga' ? 'on' : ''}" data-act="senv" data-k="recarga">Traigo mi envase</button><i style="transform:translateX(${SZ.env === 'nuevo' ? 0 : 100}%)"></i>`;
  $('#sizes').innerHTML = keys.map((k, i) => { const t = TAM[k];
    return `<div class="sz reveal" style="--c:${cols[i]};--d:${i * 120}ms"><div class="sb">${bottleSVG({ color: cols[i], level: .1, size: t.size, label: t.nombre })}</div>
     <h3>${t.nombre}</h3><p>${t.cargada ? 'Cargada: más gramos de esencia' : 'Esencia en su medida normal'}</p><div class="sp money" data-v="${S.prices[k][SZ.env]}">${fmt(S.prices[k][SZ.env])}</div></div>`; }).join('');
  observeReveal($('#sizes'));
  $$('#sizes .sz').forEach((z, i) => { const sb = $('.sb', z); const lv = TAM[keys[i]].nivel; z.onmouseenter = () => setBottle(sb, lv); z.onmouseleave = () => setBottle(sb, .1); });
  if (!window._szIO) { window._szIO = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { const i = $$('#sizes .sz').indexOf(e.target); setTimeout(() => setBottle($('.sb', e.target), TAM[keys[i]].nivel), i * 250); setTimeout(() => setBottle($('.sb', e.target), .1), 2600 + i * 250); window._szIO.unobserve(e.target); } }), { threshold: .6 }); }
  $$('#sizes .sz').forEach(z => window._szIO.observe(z));
}
ACT.senv = el => { SZ.env = el.dataset.k; const o = $$('#sizes .sp'); const keys = ['oz1', 'oz1c', 'oz2c']; $$('#envTog button').forEach(b => b.classList.toggle('on', b.dataset.k === SZ.env)); $('#envTog i').style.transform = `translateX(${SZ.env === 'nuevo' ? 0 : 100}%)`; o.forEach((e, i) => countUp(e, S.prices[keys[i]][SZ.env], 500)); };

/* ---------- FAQ ---------- */
ACT.faq = el => { const it = el.closest('.fq'); const on = it.classList.contains('on'); $$('.fq.on').forEach(x => x.classList.remove('on')); if (!on) it.classList.add('on'); };

ACT.scr = (el, e) => { const t = document.getElementById(el.dataset.to); if (t) { e && e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); } };

/* ---------- varios ---------- */
function updateBadges() {
  const nb = S.bag.reduce((a, b) => a + b.qty, 0), nf = S.favs.length;
  [['#bagBd2', nb], ['#favBd2', nf]].forEach(([s, n]) => { const e = $(s); if (e) { e.textContent = n; e.style.display = n ? '' : 'none'; } });
  const mt = $('#mbTxt'); if (mt) { mt.textContent = nb ? 'Mi pedido · ' + nb : 'Mi pedido'; $('#mbBag').classList.toggle('has', !!nb); }
}
function renderEspecial() {
  const a = $('#espWa'); if (a) a.href = waLink('Hola Diego 👋 Quiero un frasco especial 🎁 para mi esencia. ¿Qué opciones tienes? ✨', WA);
  const b = $('#askWa'); if (b) b.href = waLink('Hola Diego 👋 No encontré mi esencia en el catálogo. ¿Me la puedes conseguir sobre pedido? 🧴', WA);
}
function navSpy() {
  if (window._spy) return; window._spy = 1;
  const ids = ['top', 'catalogo', 'tamanos', 'como', 'especial', 'faq'];
  const f = () => { if (!$('#v-store').classList.contains('on')) return; let cur = 'top'; ids.forEach(i => { const e = document.getElementById(i); if (e && e.getBoundingClientRect().top < 160) cur = i; }); $$('#tlinks a').forEach(a => { const on = a.dataset.to === cur; a.classList.toggle('on', on); if (on && a._l !== 1) { } }); const act = $('#tlinks a.on'); if (act && window._cur !== cur) { window._cur = cur; const bar = $('#tlinks'); if (bar.scrollWidth > bar.clientWidth) bar.scrollTo({ left: act.offsetLeft - 40, behavior: 'smooth' }); } $('#tnav').classList.toggle('sc', scrollY > 10); };
  addEventListener('scroll', f, { passive: true }); f();
}
function dockMag() {
  const d = $('#dock'); if (!d || d._m) return; d._m = 1;
  const items = $$('.di', d);
  d.addEventListener('mousemove', e => items.forEach(it => { const r = it.getBoundingClientRect(), dist = Math.abs(e.clientX - (r.left + r.width / 2)); it.style.setProperty('--s', 1 + Math.max(0, 1 - dist / 120) * .45); }));
  d.addEventListener('mouseleave', () => items.forEach(it => it.style.setProperty('--s', 1)));
}
function spot() {
  const v = $('#v-store'); if (!v || v._sp) return; v._sp = 1;
  addEventListener('mousemove', e => { v.style.setProperty('--sx', e.clientX + 'px'); v.style.setProperty('--sy', e.clientY + 'px'); });
}
function renderStore() {
  renderHero(); renderMarq(); renderFilters(); renderGrid(); renderSizes(); renderEspecial(); updateBadges(); navSpy(); spot(); observeReveal($('#v-store'));
}
/* ---------- armar frasco ---------- */
ACT.cfg = (el) => {
  const p = prod(el.dataset.id); if (!p) return;
  ST.cfg = { pid: p.id, tam: 'oz1', envase: 'nuevo', qty: 1, special: false };
  const d = { color: p.color, nombre: (dest(p.d) || {}).nombre };
  $('#cfgBody').innerHTML = `<div class="cfg" style="--c:${d.color}">
   <div class="stage"><div id="cfgBottle"></div></div>
   <div class="cf-head"><h3>${esc(p.n)}</h3><div class="sub">Inspirada en ${esc(d.nombre)} &middot; ${esc(p.g)}</div><p class="cf-p">Diego la prepara sobre pedido, solo para ti.</p></div>
   <div class="cf-form">
    <div class="lbl">Presentación</div><div class="seg seg3" id="sTam"></div>
    <div class="lbl">Envase</div><div class="seg seg2c" id="sEnv"></div>
    <label class="special"><input type="checkbox" id="spc"><span><b>Quiero un frasco especial</b><small>Bonito, a pedido. Precio a convenir con Diego por WhatsApp.</small></span></label>
   </div>
   <div class="cf-foot">
    <div class="priceline"><div><div class="lbl" style="margin:0">Total</div><div class="pv money" id="cfgPrice">$0</div></div>
     <div class="qty"><button data-act="cq" data-d="-1" aria-label="Menos">&minus;</button><b id="cfgQty">1</b><button data-act="cq" data-d="1" aria-label="Más">+</button></div></div>
    <div class="acts"><button class="btn btn-line cf-cancel" data-act="closeCfg">Cancelar</button><button class="btn btn-red" data-act="addBag" id="addBtn">Añadir a mi pedido</button></div>
   </div></div>`;
  $('#spc').onchange = e => { ST.cfg.special = e.target.checked; if (ST.cfg.special) ST.cfg.envase = 'nuevo'; refreshCfg(); };
  openOv('ov-cfg'); ST.cfg._size = 0; refreshCfg(true);
  tilt($('#cfgBottle'), 14);
};
function refreshCfg(first) {
  const c = ST.cfg, p = prod(c.pid), d = { color: p.color }, t = TAM[c.tam];
  $('#sTam').innerHTML = Object.keys(TAM).map(k => `<button class="${c.tam === k ? 'on' : ''}" data-act="ctam" data-k="${k}">${TAM[k].nombre}<small>${TAM[k].cargada ? 'Más esencia' : 'Normal'}</small></button>`).join('');
  $('#sEnv').innerHTML = ['nuevo', 'recarga'].map(k => `<button class="${c.envase === k ? 'on' : ''}" data-act="cenv" data-k="${k}" ${c.special && k === 'recarga' ? 'disabled' : ''}>${k === 'nuevo' ? 'Envase nuevo' : 'Recarga'}<small>${k === 'nuevo' ? 'Te lo entrego lleno' : 'Traigo mi envase'}</small></button>`).join('');
  const host = $('#cfgBottle');
  if (!c._size || c._size !== t.size) { host.innerHTML = bottleSVG({ color: d.color, level: first ? .1 : t.nivel, size: t.size, label: p.n }); c._size = t.size; if (first || true) setTimeout(() => setBottle(host, t.nivel), 60); }
  else setBottle(host, t.nivel);
  $('#cfgQty').textContent = c.qty;
  const pv = $('#cfgPrice');
  if (c.special) { pv.textContent = 'A convenir'; pv.style.fontSize = '28px'; pv._v = 0; }
  else { pv.style.fontSize = ''; countUp(pv, priceOf(c.tam, c.envase) * c.qty, 500); }
}
ACT.ctam = el => { ST.cfg.tam = el.dataset.k; refreshCfg(); };
ACT.cenv = el => { ST.cfg.envase = el.dataset.k; refreshCfg(); };
ACT.cq = el => { ST.cfg.qty = Math.max(1, Math.min(20, ST.cfg.qty + Number(el.dataset.d))); refreshCfg(); };
ACT.closeCfg = () => closeOv('ov-cfg');
ACT.addBag = (el) => {
  const c = ST.cfg, p = prod(c.pid), key = [c.pid, c.tam, c.envase, c.special ? 1 : 0].join('|');
  const ex = S.bag.find(b => b.key === key);
  if (ex) ex.qty += c.qty; else S.bag.push({ key, prod: c.pid, nombre: p.n, tam: c.tam, envase: c.envase, qty: c.qty, especial: c.special });
  const sv = $('#cfgBottle svg'), from = sv ? sv.getBoundingClientRect() : null;
  save(); burstEl(el, 16); closeOv('ov-cfg'); updateBadges();
  if ($('#dr-bag').classList.contains('on')) renderBag();
  flyBottle(from, p, () => { bumpBag(); showAdded(p); });
};
function bagTarget() { const m = $('#mbBag'); if (m && getComputedStyle(m.parentNode).display !== 'none') return m; return $('#bagBtn'); }
function bumpBag() { [$('#bagBtn'), $('#mbBag')].forEach(ic => { if (!ic) return; ic.classList.remove('bump'); void ic.offsetWidth; ic.classList.add('bump'); }); }
function flyBottle(from, p, done) {
  const tg = bagTarget(); if (!from || !tg || !tg.animate) { done(); return; }
  const t = tg.getBoundingClientRect(), w = Math.max(60, from.width * .62), h = w * 1.86;
  const fl = document.createElement('div'); fl.className = 'flyb'; fl.style.cssText = `left:${from.left + from.width / 2 - w / 2}px;top:${from.top + from.height / 2 - h / 2}px;width:${w}px;height:${h}px`;
  fl.innerHTML = bottleSVG({ color: p.color, level: .75, size: 1, label: p.n }); document.body.appendChild(fl);
  const dx = t.left + t.width / 2 - (from.left + from.width / 2), dy = t.top + t.height / 2 - (from.top + from.height / 2);
  const an = fl.animate([
    { transform: 'translate(0,0) scale(1) rotate(0deg)', opacity: 1 },
    { transform: `translate(${dx * .45}px,${Math.min(dy, 0) * .2 - 150}px) scale(.62) rotate(-14deg)`, opacity: 1, offset: .5 },
    { transform: `translate(${dx}px,${dy}px) scale(.12) rotate(10deg)`, opacity: .85 }
  ], { duration: 950, easing: 'cubic-bezier(.5,0,.3,1)', fill: 'forwards' });
  const iv = setInterval(() => { const r = fl.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height * .7, 2); }, 70);
  an.onfinish = () => { clearInterval(iv); fl.remove(); burstEl(tg, 18); done(); };
}
function showAdded(p) {
  const n = S.bag.reduce((a, b) => a + b.qty, 0), k = bagCalc(), pool = S.productos.filter(x => x.activo && x.id !== p.id);
  const sh = a => a.slice().sort(() => Math.random() - .5);
  let sug = sh(pool.filter(x => x.d === p.d)).slice(0, 2).concat(sh(pool.filter(x => x.g !== p.g)).slice(0, 1));
  sug = sug.concat(sh(pool)).filter((x, i, ar) => ar.findIndex(y => y.id === x.id) === i).slice(0, 3);
  const msg = n === 1 ? 'Regalar una esencia siempre queda bien. ¿Le sumas otra, para ti o para alguien especial?' : `Ya llevas ${n} esencias. Diego te las prepara juntas, con un solo domicilio, gratis en Cali.`;
  $('#addBody').innerHTML = `<div class="added"><div class="okc"><svg viewBox="0 0 52 52"><circle cx="26" cy="26" r="23"/><path d="M15 27l8 8 14-17"/></svg></div>
   <small class="ey">¡Excelente elección!</small><h3>${esc(p.n)} <i>ya está en tu pedido</i></h3>
   <div class="ad-sum"><span>Llevas <b>${n}</b> ${n === 1 ? 'esencia' : 'esencias'}</span>${k.esp ? '<b>+ frasco especial</b>' : `<b class="money">${fmt(k.sub)}</b>`}</div>
   <p class="ad-msg">${msg}</p>
   <div class="ad-tag"><span>Sobre pedido, solo para ti</span><span>Domicilio gratis en Cali</span></div>
   <div class="ad-sg"><small>Combínala con</small><div>${sug.map(x => `<button class="sg" data-act="sugg" data-id="${x.id}"><span class="sb">${bottleSVG({ color: x.color, level: .7, size: 1, label: x.n })}</span><b>${esc(x.n)}</b><em>desde ${fmt(minPrice())}</em></button>`).join('')}</div></div>
   <div class="ad-cta"><button class="btn btn-red" data-act="closeAdd">Seguir comprando</button><button class="btn btn-gold" data-act="addBagGo">Ver mi pedido (${n})</button></div></div>`;
  openOv('ov-add'); setTimeout(() => { const r = $('#addBody .okc'); if (r) burstEl(r, 22); }, 380);
}
ACT.closeAdd = () => closeOv('ov-add');
ACT.addBagGo = () => { closeOv('ov-add'); setTimeout(() => ACT.bag(), 200); };
ACT.sugg = el => { closeOv('ov-add'); setTimeout(() => ACT.cfg({ dataset: { id: el.dataset.id } }), 250); };
ACT.quick = el => {
  ST.gen = el.dataset.g; ST.casa = null; ST.q = ''; ST.shown = 24; renderFilters(); renderGrid();
  const t = $('#catalogo'); if (t) t.scrollIntoView({ behavior: 'smooth' });
};
/* ---------- bolsa ---------- */
function bagCalc() {
  let sub = 0, esp = 0;
  S.bag.forEach(b => { if (b.especial) esp++; else sub += priceOf(b.tam, b.envase) * b.qty; });
  const cd = ST.code && S.codigos.find(x => x.code === ST.code && x.activo);
  const dsc = cd ? Math.round(sub * cd.pct / 100) : 0;
  return { sub, esp, cd, dsc, total: sub - dsc };
}
function bagMsg(name, barrio) {
  const k = bagCalc();
  let m = 'Hola Diego 👋 Quiero hacer este pedido en El Francés:\n\n';
  S.bag.forEach(b => {
    const t = TAM[b.tam];
    m += `🧴 *${b.qty}x ${b.nombre}* · ${t.nombre} · ${b.envase === 'nuevo' ? 'envase nuevo' : 'recarga'}` + (b.especial ? ' · 🎁 frasco especial (precio a convenir)' : ' · ' + fmt(priceOf(b.tam, b.envase) * b.qty)) + '\n';
  });
  m += '\n💵 Subtotal: ' + fmt(k.sub) + '\n';
  if (k.cd) m += `🏷️ Código ${k.cd.code} (-${k.cd.pct}%): -${fmt(k.dsc)}\n`;
  m += '💰 *Total: ' + fmt(k.total) + '*' + (k.esp ? ' + frasco especial a convenir' : '') + '\n';
  if (name) m += '\n👤 Nombre: ' + name;
  if (barrio) m += '\n📍 Barrio o zona en Cali: ' + barrio;
  m += '\n\nGracias ✨';
  return m;
}
function renderBag() {
  const bd = $('#bagBd'), ft = $('#bagFt');
  if (!S.bag.length) {
    bd.innerHTML = `<div class="empt">${EIFFEL_SVG('#14100E')}<h3 style="margin-top:12px">Tu pedido está vacío</h3><p>Elige una esencia del catálogo y Diego la prepara para ti.</p><button class="btn btn-red" data-act="closeBag">Ver el catálogo</button></div>`;
    ft.style.display = 'none'; return;
  }
  ft.style.display = '';
  bd.innerHTML = S.bag.map((b, i) => { const p = prod(b.prod), d = { color: p.color }, t = TAM[b.tam];
    return `<div class="it"><div class="th">${bottleSVG({ color: d.color, level: t.nivel, size: t.size })}</div>
    <div class="nm"><b>${esc(b.nombre)}</b><small>${t.nombre} &middot; ${b.envase === 'nuevo' ? 'envase nuevo' : 'recarga'}${b.especial ? ' &middot; frasco especial' : ''}</small>
    <div class="mini"><button data-act="bq" data-i="${i}" data-d="-1" aria-label="Menos">&minus;</button><b>${b.qty}</b><button data-act="bq" data-i="${i}" data-d="1" aria-label="Más">+</button></div></div>
    <div class="pr money">${b.especial ? 'A convenir' : fmt(priceOf(b.tam, b.envase) * b.qty)}</div></div>`; }).join('');
  const k = bagCalc();
  ft.innerHTML = `<div class="code"><input id="codeIn" placeholder="Código de descuento" value="${esc(ST.code || '')}" aria-label="Código de descuento"><button class="btn btn-gold" style="min-height:42px;padding:0 18px" data-act="applyCode">Aplicar</button></div>
   <div class="row2"><div class="field" style="margin:0 0 10px"><label for="bName">Tu nombre</label><input id="bName" autocomplete="name"></div><div class="field" style="margin:0 0 10px"><label for="bBar">Barrio o zona</label><input id="bBar" placeholder="Ej. San Fernando"></div></div>
   <div class="tot"><span>Subtotal</span><b class="money">${fmt(k.sub)}</b></div>
   ${k.cd ? `<div class="tot" style="color:var(--ok)"><span>Código ${esc(k.cd.code)} (-${k.cd.pct}%)</span><b class="money">-${fmt(k.dsc)}</b></div>` : ''}
   ${k.esp ? '<div class="tot"><span>Frasco especial</span><b>A convenir</b></div>' : ''}
   <div class="tot big"><span>Total</span><span class="money">${fmt(k.total)}</span></div>
   <div class="deliv"><span style="font-size:20px">&#10024;</span><span><b>Sobre pedido.</b> Diego prepara tu esencia y te escribe para coordinar la entrega.</span></div>
   <a class="btn btn-red" id="waBtn" style="width:100%;gap:12px" target="_blank" rel="noopener" href="#">${SVGI.wa} Pedir por WhatsApp</a>`;
  const upd = () => { $('#waBtn').href = waLink(bagMsg($('#bName').value.trim(), $('#bBar').value.trim()), WA); };
  $('#bName').oninput = upd; $('#bBar').oninput = upd; upd();
  $('#waBtn').onclick = e => {
    const name = $('#bName').value.trim();
    if (!name) { e.preventDefault(); toast('Escribe tu nombre para enviar el pedido'); $('#bName').focus(); return; }
    registrarPedido(name, $('#bBar').value.trim());
  };
}
function registrarPedido(name, barrio) {
  let c = S.clientes.find(x => x.nombre.toLowerCase() === name.toLowerCase());
  if (!c) { c = { id: uid('c'), nombre: name, nota: barrio ? 'Barrio: ' + barrio : 'Desde la tienda' }; S.clientes.push(c); }
  const k = bagCalc();
  const items = S.bag.map(b => ({ prod: b.prod, nombre: b.nombre, tam: b.tam, envase: b.envase, qty: b.qty, precio: b.especial ? 0 : priceOf(b.tam, b.envase), especial: !!b.especial }));
  S.pedidos.unshift({ id: uid('o'), cliente: c.id, fecha: new Date().toISOString(), items, estado: 'nuevo', abonado: 0, total: k.total, codigo: k.cd ? k.cd.code : '', web: true });
  save(); toast('Pedido enviado. También quedó anotado en el panel de Diego (demo)');
  setTimeout(() => { S.bag = []; ST.code = null; save(); updateBadges(); renderBag(); closeDr('dr-bag'); }, 700);
}
ACT.bq = el => { const b = S.bag[Number(el.dataset.i)]; b.qty += Number(el.dataset.d); if (b.qty < 1) S.bag.splice(Number(el.dataset.i), 1); save(); updateBadges(); renderBag(); };
ACT.applyCode = () => {
  const v = ($('#codeIn').value || '').trim().toUpperCase(), cd = S.codigos.find(x => x.code === v && x.activo);
  if (cd) { ST.code = v; toast('Código ' + v + ': ' + cd.pct + '% de descuento'); burstEl($('#codeIn'), 10); } else { ST.code = null; toast(v ? 'Ese código no existe o está inactivo' : 'Escribe un código'); }
  const n = $('#bName') ? $('#bName').value : '', b = $('#bBar') ? $('#bBar').value : ''; renderBag(); if (n) $('#bName').value = n; if (b) $('#bBar').value = b; if ($('#waBtn')) $('#bName').dispatchEvent(new Event('input'));
};
ACT.bag = () => { renderBag(); openDr('dr-bag'); };
ACT.closeBag = () => closeDr('dr-bag');

/* ---------- favoritos ---------- */
function renderFav() {
  const b = $('#favBd');
  if (!S.favs.length) { b.innerHTML = `<div class="empt">${HEART.replace('<svg', '<svg style="fill:#D9B25F;opacity:.4;width:80px;height:80px"')}<h3 style="margin-top:12px">Aún no tienes favoritas</h3><p>Toca el corazón en las esencias que te enamoren.</p></div>`; return; }
  b.innerHTML = S.favs.map(id => { const p = prod(id); if (!p) return ''; const d = { color: p.color, nombre: (dest(p.d) || {}).nombre };
    return `<div class="it"><div class="th">${bottleSVG({ color: d.color, level: .8, size: 1 })}</div><div class="nm"><b>${esc(p.n)}</b><small>${esc(d.nombre)} &middot; ${esc(p.g)}</small></div><button class="btn btn-red" style="min-height:40px;padding:0 16px" data-act="cfgFav" data-id="${p.id}">Armar</button></div>`; }).join('');
}
ACT.favs = () => { renderFav(); openDr('dr-fav'); };
ACT.closeFav = () => closeDr('dr-fav');
ACT.cfgFav = el => { closeDr('dr-fav'); ACT.cfg(el); };
/* menú móvil (hamburguesa) */
ACT.menu = () => {
  const nf = S.favs.length;
  const L = [['top', 'Inicio'], ['catalogo', 'Catálogo de esencias'], ['tamanos', 'Tamaños y precios'], ['como', 'Cómo pedir'], ['especial', 'Frasco especial'], ['faq', 'Preguntas frecuentes']];
  $('#menuBody').innerHTML = `<div class="mn"><img class="mn-l" src="img/sello.png" alt=""><small>PERFUMERÍA EL FRANCÉS · CALI</small>
   <nav>${L.map(([id, t]) => `<button data-act="menuGo" data-to="${id}"><span>${t}</span><i>&rsaquo;</i></button>`).join('')}</nav>
   <div class="mn-q"><button data-act="menuSpin">Sorpréndeme ✦</button><button data-act="menuFav">Mis favoritos${nf ? ' (' + nf + ')' : ''}</button></div>
   <a class="btn btn-red mn-wa" target="_blank" rel="noopener" href="${waLink('Hola Diego 👋 Quiero preguntarte por una esencia 🧴', WA)}">Hablar con Diego</a>
   <a class="mn-p" href="#panel">Panel de Diego</a>
   <div class="mn-o"><span>Desarrollado por</span><a href="https://onytek.co" target="_blank" rel="noopener"><img src="img/onytek.png" alt="Onytek"></a></div></div>`;
  openOv('ov-menu');
};
ACT.closeMenu = () => closeOv('ov-menu');
ACT.menuGo = el => { closeOv('ov-menu'); setTimeout(() => { const t = document.getElementById(el.dataset.to); if (t) t.scrollIntoView({ behavior: 'smooth' }); }, 260); };
ACT.menuSpin = () => { closeOv('ov-menu'); setTimeout(() => ACT.spin(), 250); };
ACT.menuFav = () => { closeOv('ov-menu'); setTimeout(() => ACT.favs(), 250); };

ACT.casaMenu = () => {
  const cs = casasOrdenadas(), tot = cs.reduce((a, c) => a + c.n, 0);
  $('#casasBody').innerHTML = `<h3 style="font-size:26px;margin:0 46px 4px 0">Elige la casa</h3><p style="margin:0 0 10px;font-size:15px;opacity:.85">Toca una y te mostramos sus esencias.</p>
   <div class="cl"><button class="${!ST.casa ? 'on' : ''}" data-act="casaPick" data-id=""><span>Todas las casas</span><i>${tot}</i></button>${cs.map(c => `<button class="${ST.casa === c.id ? 'on' : ''}" data-act="casaPick" data-id="${c.id}"><span>${esc(c.nombre)}</span><i>${c.n}</i></button>`).join('')}</div>`;
  openOv('ov-casas');
};
ACT.closeCasas = () => closeOv('ov-casas');
ACT.casaPick = el => { ST.casa = el.dataset.id || null; ST.shown = 24; closeOv('ov-casas'); renderFilters(); renderGrid(); };
