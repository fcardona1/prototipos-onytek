/* ===================== PANEL DE DIEGO ===================== */
const PV = { view: 'inicio', per: 'dia', fped: 'todos' };
const NAVI = {
  inicio: '<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9Z"/>',
  pedidos: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1M9 10h6M9 14h6M9 18h3"/>',
  cuentas: '<circle cx="12" cy="12" r="9"/><path d="M14.500 9a2.500 2.500 0 0 0-2.500-1.500c-1.500 0-2.500.9-2.500 2s1 1.700 2.500 2 2.500.9 2.500 2-1 2-2.500 2A2.500 2.500 0 0 1 9.500 15M12 6v2M12 16v2"/>',
  productos: '<path d="M9 3h6v4H9zM7 7h10v14H7z"/><path d="M10 12h4"/>',
  casas: '<path d="M12 21s7-6.200 7-11.500A7 7 0 0 0 5 9.500C5 14.800 12 21 12 21Z"/><circle cx="12" cy="9.500" r="2.500"/>',
  clientes: '<circle cx="9" cy="8" r="3.500"/><path d="M2.500 20a6.500 6.500 0 0 1 13 0M16 4.500a3.500 3.500 0 0 1 0 7M18 14.500a6.500 6.500 0 0 1 3.500 5.500"/>',
  descuentos: '<path d="M3 12l9-9h8v8l-9 9-8-8Z"/><circle cx="15.500" cy="8.500" r="1.500"/>',
  perfil: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  mas: '<circle cx="5" cy="12" r="1.600"/><circle cx="12" cy="12" r="1.600"/><circle cx="19" cy="12" r="1.600"/>'
};
const ni = k => `<svg viewBox="0 0 24 24" aria-hidden="true">${NAVI[k]}</svg>`;
const NAVS = [['inicio', 'Inicio'], ['pedidos', 'Pedidos'], ['cuentas', 'Cuentas'], ['productos', 'Productos'], ['casas', 'Casas'], ['clientes', 'Clientes'], ['descuentos', 'Descuentos'], ['perfil', 'Mi perfil']];
const EYE = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.500-7 10-7 10 7 10 7-3.500 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>';
const EYEOFF = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3l18 18M10.600 5.100A10 10 0 0 1 12 5c6.500 0 10 7 10 7a17 17 0 0 1-3.200 4M6.600 6.600C3.600 8.500 2 12 2 12s3.500 7 10 7a10 10 0 0 0 4.400-1M9.900 9.900a3 3 0 0 0 4.200 4.200"/></svg>';
const fdate = iso => new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' }).replace('.', '');
const ini = n => (n || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
const kfmt = n => n >= 1000 ? '$' + (Math.round(n / 100) / 10).toString().replace('.0', '') + 'k' : (n ? '$' + n : '');

/* ---------- login: el atelier ---------- */
const first = () => ((S.cuenta && S.cuenta.nombre) || 'Diego').trim().split(' ')[0];
/* pétalos que caen: perfumería */
const PET = ['#FF4D6A', '#E8203F', '#FFB3C1', '#9C0F26', '#F4D9A8', '#D9B25F'];
function petalSet(n, W, H) { return Array.from({ length: n }, () => petal(W, H, true)); }
function petal(W, H, any) { return { x: Math.random() * W, y: any ? Math.random() * H : -30, s: 8 + Math.random() * 16, r: Math.random() * 6, vr: (Math.random() - .5) * .03, ph: Math.random() * 6, fl: Math.random() * 6, v: .35 + Math.random() * .8, c: PET[Math.floor(Math.random() * PET.length)], a: .5 + Math.random() * .4 }; }
function drawPetal(c, p, t) {
  c.save(); c.translate(p.x + Math.sin(t * .012 + p.ph) * 26, p.y); c.rotate(p.r + Math.sin(t * .01 + p.ph) * .5); c.scale(Math.cos(t * .018 + p.fl) * .8 + .2, 1);
  c.globalAlpha = p.a; c.fillStyle = p.c; const s = p.s;
  c.beginPath(); c.moveTo(0, -s); c.bezierCurveTo(s * .95, -s * .55, s * .8, s * .6, 0, s); c.bezierCurveTo(-s * .8, s * .6, -s * .95, -s * .55, 0, -s); c.fill();
  c.globalAlpha = p.a * .35; c.strokeStyle = '#fff'; c.lineWidth = .8; c.beginPath(); c.moveTo(0, -s * .7); c.lineTo(0, s * .7); c.stroke(); c.restore();
}
function petalCanvas(cv, n, spd) {
  const c = cv.getContext('2d'); let W = 0, H = 0, ps = [], mist = [], t = 0;
  const rs = () => { W = cv.width = cv.offsetWidth; H = cv.height = cv.offsetHeight; if (!ps.length) ps = petalSet(n, W, H); };
  rs(); addEventListener('resize', rs);
  const boke = Array.from({ length: 16 }, () => ({ x: Math.random(), y: Math.random(), r: 10 + Math.random() * 40, v: .0003 + Math.random() * .0006, a: .05 + Math.random() * .1 }));
  const loop = () => {
    if (!cv.isConnected) return; t++; c.clearRect(0, 0, W, H);
    boke.forEach(b => { b.y -= b.v; if (b.y < -.1) { b.y = 1.1; b.x = Math.random(); } c.fillStyle = 'rgba(255,224,160,' + b.a + ')'; c.beginPath(); c.arc(b.x * W, b.y * H, b.r, 0, 7); c.fill(); });
    ps.forEach((p, i) => { p.y += p.v * (spd || 1); p.r += p.vr; if (p.y > H + 30) ps[i] = petal(W, H); drawPetal(c, p, t); });
    mist = mist.filter(m => m.life > 0);
    mist.forEach(m => {
      m.x += m.vx; m.y += m.vy; m.vx *= .97; m.vy = m.vy * .97 - .012; m.life -= m.d; m.r += .28;
      const g = c.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.r), al = m.a * Math.max(0, m.life);
      g.addColorStop(0, 'rgba(' + m.g + ',' + al + ')'); g.addColorStop(1, 'rgba(' + m.g + ',0)'); c.fillStyle = g; c.beginPath(); c.arc(m.x, m.y, m.r, 0, 7); c.fill();
    });
    requestAnimationFrame(loop);
  };
  loop();
  return { spray(x, y, k, pw) { pw = pw || 1; for (let i = 0; i < k; i++) { const a = -Math.PI / 2 + (Math.random() - .5) * 1.5, v = (1 + Math.random() * 3) * pw; mist.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, r: 2 + Math.random() * 7 * pw, a: .6, life: 1, d: .010 + Math.random() * .014, g: Math.random() < .5 ? '255,226,160' : '255,244,226' }); } } };
}
function renderLogin() {
  $('#pl').innerHTML = `<div class="lx" id="lx"><canvas id="lxc"></canvas><div class="lx-spot"></div><div class="lx-eif" aria-hidden="true">${EIFFEL_SVG("rgba(255,226,170,.5)")}</div><div class="lx-fog" id="lxFog"></div>
  <a class="lx-back" href="#tienda">&larr; Volver a la tienda</a>
  <div class="lx-wrap" id="lxWrap">
   <div class="bt-cap" id="btCap"><i class="bt-top"></i><i class="bt-collar"></i></div>
   <div class="bt-body" id="lxCard">
    <div class="bt-liq" id="btLiq"><svg viewBox="0 0 400 30" preserveAspectRatio="none" class="wv"><path d="M0 14 Q50 0 100 14 T200 14 T300 14 T400 14 V30 H0Z"/></svg><svg viewBox="0 0 400 30" preserveAspectRatio="none" class="wv w2"><path d="M0 14 Q50 28 100 14 T200 14 T300 14 T400 14 V30 H0Z"/></svg><div class="fill"></div></div>
    <div class="bt-glint"></div><div class="bt-shine"></div>
    <div class="bt-in">
     <img class="crest" src="img/sello.png" alt="">
     <small class="ey">ATELIER PRIVADO</small>
     <h2>Hola, <i>${esc(first())}</i></h2>
     <form id="lform" novalidate>
      <div class="fl"><input id="lu" autocomplete="username" autocapitalize="none" placeholder=" "><label for="lu">Usuario</label><i></i></div>
      <div class="fl"><input id="lp" type="password" autocomplete="current-password" placeholder=" " style="padding-right:46px"><label for="lp">Contraseña</label><button type="button" class="eye" id="eye" aria-label="Mostrar contraseña">${EYE}</button><i></i></div>
      <label class="lchk"><input type="checkbox" id="lrem"><span></span>Recordarme en este equipo</label>
      <div class="err" id="lerr" role="alert"></div>
      <button class="lx-btn" type="submit"><span>Abrir el frasco</span></button>
      ${S.cuenta.clave === 'elfrances' ? `<div class="hint">Demo: usuario <b>${esc(S.cuenta.usuario)}</b> &middot; contraseña <b>elfrances</b></div>` : ''}
     </form>
    </div>
    <div class="bt-base"><img src="img/onytek.png" alt="Onytek"><span>Tecnología con propósito, ejecución con precisión.</span></div>
    <div class="lx-ok" id="lxOk"><div><small>ACCESO AUTORIZADO</small><b>Bienvenido, <i>${esc(first())}</i></b></div></div>
   </div>
  </div></div>${footHTML(true)}`;
  const lx = $('#lx'), card = $('#lxWrap'), lu = $('#lu'), lp = $('#lp'), liq = $('#btLiq');
  const fx = petalCanvas($('#lxc'), 42, 1);
  const lvl = v => liq.style.setProperty('--lv', Math.max(.12, Math.min(.96, v)));
  lvl(.14);
  const prog = () => lvl(.14 + Math.min(1, lu.value.length / 5) * .3 + Math.min(1, lp.value.length / 8) * .45);
  const nozzle = () => { const r = $('#btCap .bt-top').getBoundingClientRect(), o = $('#lxc').getBoundingClientRect(); return [r.left + r.width / 2 - o.left, r.top - o.top]; };
  const puff = () => { const [x, y] = nozzle(); fx.spray(x, y, 5, .6); const c = $('#btCap'); c.classList.remove('pf'); void c.offsetWidth; c.classList.add('pf'); };
  lu.oninput = () => { prog(); puff(); }; lp.oninput = () => { prog(); puff(); };
  setTimeout(() => { if (lx.isConnected) { const [x, y] = nozzle(); fx.spray(x, y, 40, 1.2); } }, 900);
  $('#eye').onclick = () => { const sh = lp.type === 'password'; lp.type = sh ? 'text' : 'password'; $('#eye').innerHTML = sh ? EYEOFF : EYE; $('#eye').setAttribute('aria-label', sh ? 'Ocultar contraseña' : 'Mostrar contraseña'); $('#btCap').classList.toggle('open', sh); };
  $('#lform').onsubmit = e => {
    e.preventDefault();
    const u = lu.value.trim().toLowerCase(), p = lp.value, er = $('#lerr');
    if (u === S.cuenta.usuario.toLowerCase() && p === S.cuenta.clave) {
      session = { usuario: S.cuenta.usuario }; saveSession($('#lrem').checked);
      lvl(.96); $('#btCap').classList.add('open'); const [x, y] = nozzle();
      setTimeout(() => { fx.spray(x, y, 260, 1.9); lx.classList.add('go'); card.classList.add('ok'); }, 700);
      setTimeout(() => { renderPanel(); }, 2700);
    } else { er.textContent = 'Usuario o contraseña incorrectos.'; card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake'); }
  };
}

/* ---------- shell ---------- */
function titleOf() {
  if (PV.view === 'inicio') return `Hola, <i>${esc(first())}</i>`;
  return ({ pedidos: 'Pedidos', cuentas: 'Cuentas', productos: 'Productos', casas: 'Casas', perfil: 'Mi perfil', clientes: 'Clientes', descuentos: 'Descuentos' })[PV.view];
}
function renderApp() {
  const pend = S.pedidos.filter(o => o.estado === 'nuevo').length;
  const side = NAVS.map(([k, l]) => `<button class="nv${PV.view === k ? ' on' : ''}" data-act="pgo" data-v="${k}">${ni(k)}<span>${l}</span>${k === 'pedidos' && pend ? `<span class="n">${pend}</span>` : ''}</button>`).join('');
  const bn = ['inicio', 'pedidos', 'cuentas', 'productos'].map(k => `<button class="${PV.view === k ? 'on' : ''}" data-act="pgo" data-v="${k}">${ni(k)}<span>${NAVS.find(n => n[0] === k)[1]}</span></button>`).join('') +
    `<button class="${['casas', 'clientes', 'descuentos', 'perfil'].includes(PV.view) ? 'on' : ''}" data-act="pmas">${ni('mas')}<span>Más</span></button>`;
  $('#pa').innerHTML = `<div class="app"><aside class="side"><div class="lg2"><img src="img/sello.png" alt=""><div><b>El Francés</b><small>PANEL DE DIEGO</small></div></div>${side}<div class="sp"></div>
   <div class="me"><button class="meb" data-act="pgo" data-v="perfil">${avatarHTML('mav')}<span><b>${esc(S.cuenta.nombre)}</b><small>Ver mi perfil</small></span></button><button class="sm" style="margin-top:8px" data-act="resetDemo">Reiniciar datos de ejemplo</button></div></aside>
   <div class="main"><div class="top"><h2>${titleOf()}</h2><button class="tb av" data-act="pgo" data-v="perfil" aria-label="Mi perfil">${avatarHTML('tav')}</button><a class="tb" href="#tienda">${SVGI.bag}<span class="t">Ver tienda</span></a><button class="tb out" data-act="logout"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4M16 8l4 4-4 4M20 12H9"/></svg><span class="t">Cerrar sesión</span></button></div>
   <div class="content" id="pcont"></div>${footHTML(true)}</div></div>
   <nav class="bnav" aria-label="Menú del panel">${bn}</nav><button class="fabp" data-act="newOrder" aria-label="Nuevo pedido">+</button>`;
  renderView();
}
function renderView() {
  const c = $('#pcont'); if (!c) return;
  c.innerHTML = ({ inicio: vInicio, pedidos: vPedidos, cuentas: vCuentas, productos: vProductos, casas: vCasas, perfil: vPerfil, clientes: vClientes, descuentos: vDescuentos })[PV.view]();
  c.scrollTop = 0; scrollTo({ top: 0 });
  afterView();
}
function afterView() {
  $$('.bar i').forEach((i, k) => setTimeout(() => { i.style.height = i.dataset.h + '%'; }, 120 + k * 80));
  const pg = $('.ring .pg'); if (pg) setTimeout(() => { pg.style.strokeDashoffset = pg.dataset.o; }, 200);
  if (PV.view === 'inicio') $$('.kpi b[data-v]').forEach(b => countUp(b, Number(b.dataset.v), 900));
  $$('.kpi').forEach((k, i) => { k.style.animationDelay = i * 80 + 'ms'; });
}
ACT.pgo = el => { PV.view = el.dataset.v; closeOv('ov-pm'); renderApp(); };
ACT.logout = () => { session = null; saveSession(false); toast('Sesión cerrada. Hasta pronto, Diego'); renderPanel(); };
ACT.resetDemo = () => { resetDemo(); toast('Datos de ejemplo restablecidos'); renderPanel(); };

/* ---------- ventana genérica ---------- */
function pm(title, body, ok, onOk, noForm) {
  $('#pmBody').innerHTML = `<h3 style="font-size:28px;margin:0 46px 16px 0">${title}</h3><form id="pmForm" novalidate>${body}${noForm ? '' : `<div class="acts"><button type="button" class="btn btn-line" style="color:var(--cream)" data-act="pmClose">Cancelar</button><button class="btn btn-gold" type="submit">${ok}</button></div>`}</form>`;
  $('#pmForm').onsubmit = e => { e.preventDefault(); if (onOk && onOk($('#pmForm').elements) === false) return; closeOv('ov-pm'); };
  openOv('ov-pm');
}
ACT.pmClose = () => closeOv('ov-pm');
ACT.pmas = () => pm('Más opciones', ['casas', 'clientes', 'descuentos', 'perfil'].map(k => `<button type="button" class="nv" style="border:1.5px solid rgba(217,178,95,.5);margin-bottom:10px" data-act="pgo" data-v="${k}">${ni(k)}<span>${NAVS.find(n => n[0] === k)[1]}</span></button>`).join('') + `<button type="button" class="nv" style="border:1.5px solid rgba(217,178,95,.5)" data-act="resetDemo">Reiniciar datos de ejemplo</button>`, '', null, true);

/* ---------- INICIO ---------- */
function series(per) {
  const now = new Date(), out = [], sum = (d, e) => S.pagos.filter(p => { const t = new Date(p.fecha); return t >= d && t < e; }).reduce((a, b) => a + b.monto, 0);
  if (per === 'dia') for (let i = 6; i >= 0; i--) { const d = startOfDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)), e = new Date(d); e.setDate(e.getDate() + 1); out.push({ l: i === 0 ? 'Hoy' : d.toLocaleDateString('es-CO', { weekday: 'short' }).replace('.', ''), v: sum(d, e) }); }
  else if (per === 'semana') for (let i = 5; i >= 0; i--) { const e = startOfDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1 - i * 7)), d = new Date(e); d.setDate(d.getDate() - 7); out.push({ l: i === 0 ? 'Esta' : '-' + i + ' sem', v: sum(d, e) }); }
  else for (let i = 5; i >= 0; i--) { const d = new Date(now.getFullYear(), now.getMonth() - i, 1), e = new Date(now.getFullYear(), now.getMonth() - i + 1, 1); out.push({ l: d.toLocaleDateString('es-CO', { month: 'short' }).replace('.', ''), v: sum(d, e) }); }
  return out;
}
function chartHTML() {
  const s = series(PV.per), mx = Math.max(1, ...s.map(x => x.v));
  return `<div class="bars">${s.map(x => `<div class="bar"><i data-h="${Math.max(x.v ? 6 : 0, x.v / mx * 100)}"><em>${kfmt(x.v)}</em></i><span>${x.l}</span></div>`).join('')}</div>`;
}
ACT.per = el => { PV.per = el.dataset.p; renderView(); };
const perSeg = () => `<div class="seg2">${[['dia', 'Día'], ['semana', 'Semana'], ['mes', 'Mes']].map(([k, l]) => `<button class="${PV.per === k ? 'on' : ''}" data-act="per" data-p="${k}">${l}</button>`).join('')}</div>`;
function pagoItem(g) { const c = cli(g.cliente); return `<div class="li"><div class="av">${ini(c ? c.nombre : '?')}</div><div class="mid"><b>${esc(c ? c.nombre : 'Cliente')}</b><small>${fdate(g.fecha)} &middot; ${g.pedido ? 'Pago de pedido' : esc(g.nota || 'Pago')}</small></div><div class="amt pos money">+${fmt(g.monto)}</div></div>`; }
function deudorItem(d) {
  const c = cli(d.cliente);
  const msg = `Hola ${c.nombre.split(' ')[0]} 👋 Te escribo de El Francés. Tienes un saldo pendiente de 💰 ${fmt(d.monto)}. ¿Cuándo te queda bien pagarlo? 🙏 Gracias ✨`;
  return `<div class="li"><div class="av">${ini(c.nombre)}</div><div class="mid"><b>${esc(c.nombre)}</b><small>${d.pedidos} pedido${d.pedidos > 1 ? 's' : ''} sin pagar</small></div><div class="amt neg money">${fmt(d.monto)}</div>
   <a class="sm wa" target="_blank" rel="noopener" href="${waLink(msg)}">${SVGI.wa.replace('width="22" height="22"', 'width="16" height="16"')} Cobrar</a><button class="sm" data-act="payCli" data-id="${c.id}">Abonar</button></div>`;
}
function rutaHTML() {
  const pend = pendientesRuta(), meta = S.meta, ok = pend >= 6, ped = S.pedidos.filter(o => o.estado === 'nuevo' || o.estado === 'preparando');
  return `<div class="route"><div class="ring"><svg viewBox="0 0 160 160"><defs><linearGradient id="rg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#D9B25F"/><stop offset="1" stop-color="#C8102E"/></linearGradient></defs><circle class="tr" cx="80" cy="80" r="70"/><circle class="pg" cx="80" cy="80" r="70" data-o="${440 * (1 - Math.min(1, pend / meta))}"/></svg><div class="ct"><div><b>${pend}</b><small>de ${meta} esencias</small></div></div></div>
  <div style="flex:1;min-width:220px"><p style="margin:0 0 10px;font-size:19px">${ok ? '<b style="color:#1E7A45">Ya vale la pena ir al centro.</b>' : `Faltan <b>${Math.max(0, 6 - pend)}</b> esencia${6 - pend === 1 ? '' : 's'} para que valga la pena la ruta.`}</p>
  <p style="margin:0 0 14px;opacity:.85">${ped.length} pedido${ped.length === 1 ? '' : 's'} esperando entrega en Cali. Domicilio gratis, por rutas.</p>
  <button class="btn ${ok ? 'btn-gold' : 'btn-line'}" style="${ok ? '' : 'color:#8A5E1C'}" data-act="armRuta">Armar ruta del centro</button></div></div>`;
}
function sparkSVG(v) { const mx = Math.max(1, ...v), pts = v.map((x, i) => (i * 100 / (v.length - 1)).toFixed(1) + ',' + (30 - x / mx * 26).toFixed(1)).join(' '); return `<svg class="sp" viewBox="0 0 100 32" preserveAspectRatio="none" aria-hidden="true"><polyline points="${pts}" fill="none" stroke="#D9B25F" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg>`; }
function atelierHero(np, qe) {
  const f = new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });
  const msg = np ? `Tienes <b>${np}</b> ${np === 1 ? 'pedido' : 'pedidos'} por preparar (<b>${qe}</b> ${qe === 1 ? 'esencia' : 'esencias'}). Que cada frasco salga perfecto.` : 'Todo entregado. Tu atelier está al día.';
  setTimeout(() => { const cv = $('#atc'); if (cv) petalCanvas(cv, 14, .6); }, 50);
  return `<section class="atl"><canvas id="atc"></canvas><div class="atl-t"><small>${esc(f)}</small><h3>Hola, <i>${esc(first())}</i></h3><p>${msg}</p><div class="atl-b"><button class="btn btn-gold" style="min-height:46px" data-act="pgo" data-v="pedidos">Ver pedidos</button><button class="atl-l" data-act="pgo" data-v="cuentas">Ver cuentas</button></div></div>
   <div class="atl-f" aria-hidden="true"><span class="pf p1"></span><span class="pf p2"></span><span class="pf p3"></span><div class="atl-bt">${bottleSVG({ color: '#E8203F', level: .8, size: 1, label: 'Frasco' })}</div></div></section>`;
}
function vInicio() {
  const m0 = new Date(); m0.setDate(1); m0.setHours(0, 0, 0, 0);
  const ing = sumPagos(m0), deb = totalDeudas(), nd = deudoresList().length;
  const porEnt = S.pedidos.filter(o => o.estado !== 'entregado'), qEnt = porEnt.reduce((a, o) => a + lociones(o), 0);
  const vend = S.pedidos.filter(o => new Date(o.fecha) >= m0).reduce((a, o) => a + lociones(o), 0);
  return atelierHero(porEnt.length, qEnt) + `<div class="kpis">
   <div class="kpi"><small>Ingresos del mes</small><b data-v="${ing}">${fmt(0)}</b><span>Lo que ya entró a tu bolsillo</span>${sparkSVG(series('dia').map(x => x.v))}</div>
   <div class="kpi"><small>Te deben</small><b data-v="${deb}">${fmt(0)}</b><span>${nd} cliente${nd === 1 ? '' : 's'} con saldo</span></div>
   <div class="kpi"><small>Por entregar</small><b>${qEnt}</b><span>${porEnt.length} pedidos &middot; esencias</span></div>
   <div class="kpi"><small>Vendidas este mes</small><b>${vend}</b><span>esencias en pedidos</span></div></div>
  <div class="pan"><h3>Ingresos ${perSeg()}</h3>${chartHTML()}</div>
  <div class="cols"><div class="pan"><h3>Ruta del centro</h3>${rutaHTML()}</div>
   <div class="pan"><h3>Quién te debe <button class="sm" data-act="goCuentas">Ver todo</button></h3>${deudoresList().slice(0, 3).map(deudorItem).join('') || '<p>Nadie te debe. Qué belleza.</p>'}</div></div>
  <div class="pan" style="margin-top:20px"><h3>Últimos pagos</h3>${[...S.pagos].sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, 5).map(pagoItem).join('')}</div>`;
}
ACT.goCuentas = () => { PV.view = 'cuentas'; renderApp(); };
ACT.armRuta = () => {
  const ped = S.pedidos.filter(o => o.estado === 'nuevo' || o.estado === 'preparando'), q = ped.reduce((a, o) => a + lociones(o), 0);
  if (!ped.length) { toast('No hay pedidos pendientes'); return; }
  pm('Armar ruta del centro', `<p style="margin:0 0 12px">Estos pedidos pasan a <b>En ruta</b>: ${q} esencia${q === 1 ? '' : 's'} en total.</p>${ped.map(o => `<div class="li"><div class="av">${ini(cli(o.cliente).nombre)}</div><div class="mid"><b>${esc(cli(o.cliente).nombre)}</b><small>${lociones(o)} esencia(s) &middot; ${fmt(o.total)}</small></div></div>`).join('')}`, 'Salir a la ruta', () => { ped.forEach(o => o.estado = 'ruta'); save(); toast('Ruta armada. ¡Buen viaje, Diego!'); renderApp(); });
};

/* ---------- PEDIDOS ---------- */
const SIG = { nuevo: 'preparando', preparando: 'ruta', ruta: 'entregado' };
function pedidoCard(o) {
  const c = cli(o.cliente) || { nombre: 'Cliente' }, d = debe(o);
  return `<div class="pan" style="padding:18px"><div class="li" style="border:0;padding:0"><div class="av">${ini(c.nombre)}</div><div class="mid"><b>${esc(c.nombre)} ${o.web ? '<span class="tag" style="background:#D9B25F;color:#14100E;margin-left:6px">Web</span>' : ''}</b><small>${fdate(o.fecha)} &middot; ${lociones(o)} esencia(s)${o.codigo ? ' &middot; código ' + esc(o.codigo) : ''}</small></div><span class="st-p st-${o.estado}">${ESTADOS[o.estado]}</span></div>
   <div style="margin:10px 0 12px;opacity:.9;font-size:15px">${o.items.map(i => `${i.qty}x ${esc(i.nombre)} <span style="opacity:.7">(${TAM[i.tam].corto}, ${i.envase === 'nuevo' ? 'nuevo' : 'recarga'}${i.especial ? ', especial' : ''})</span>`).join('<br>')}</div>
   <div class="li" style="border:0;padding:0"><div class="mid"><span class="amt money">${fmt(o.total)}</span> <small>${d > 0 ? ` &middot; <b style="color:#FF8A9A">debe ${fmt(d)}</b>` : ' &middot; <b style="color:#1E7A45">pagado</b>'}</small></div>
   ${d > 0 ? `<button class="sm" data-act="payOrd" data-id="${o.id}">Registrar pago</button>` : ''}${SIG[o.estado] ? `<button class="sm" data-act="nextSt" data-id="${o.id}">Pasar a ${ESTADOS[SIG[o.estado]]}</button>` : ''}</div></div>`;
}
function vPedidos() {
  const f = PV.fped, fl = S.pedidos.filter(o => f === 'todos' || (f === 'cobrar' ? debe(o) > 0 : o.estado === f));
  const chips = [['todos', 'Todos'], ['nuevo', 'Nuevos'], ['preparando', 'Preparando'], ['ruta', 'En ruta'], ['entregado', 'Entregados'], ['cobrar', 'Por cobrar']];
  return `<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px;align-items:center">${chips.map(([k, l]) => `<button class="chip${f === k ? ' on' : ''}" data-act="fped" data-f="${k}">${l}</button>`).join('')}<span style="flex:1"></span><button class="btn btn-gold" style="min-height:44px" data-act="newOrder">+ Nuevo pedido</button></div>
  ${fl.map(pedidoCard).join('') || '<div class="pan">No hay pedidos aquí.</div>'}`;
}
ACT.fped = el => { PV.fped = el.dataset.f; renderView(); };
ACT.nextSt = el => { const o = S.pedidos.find(x => x.id === el.dataset.id); o.estado = SIG[o.estado]; save(); toast('Pedido de ' + cli(o.cliente).nombre + ': ' + ESTADOS[o.estado]); renderApp(); };
ACT.payOrd = el => {
  const o = S.pedidos.find(x => x.id === el.dataset.id), c = cli(o.cliente);
  pm('Registrar pago', `<p style="margin:0 0 12px">${esc(c.nombre)} debe <b>${fmt(debe(o))}</b> de este pedido.</p><div class="field"><label for="pmMonto">Monto recibido</label><input id="pmMonto" name="monto" inputmode="numeric" value="${debe(o)}"></div>`, 'Guardar pago', f => {
    const m = Math.min(debe(o), Math.max(0, parseInt(String(f.monto.value).replace(/\D/g, ''), 10) || 0)); if (!m) { toast('Escribe un monto'); return false; }
    o.abonado += m; S.pagos.push({ id: uid('g'), fecha: new Date().toISOString(), cliente: o.cliente, pedido: o.id, monto: m, nota: '' }); save(); toast('Pago de ' + fmt(m) + ' registrado'); renderApp();
  });
};
ACT.newOrder = () => {
  const cs = S.clientes.map(c => `<option value="${c.id}">${esc(c.nombre)}</option>`).join('');
  const ps = S.productos.filter(p => p.activo).map(p => `<option value="${p.id}">${esc(p.n)}</option>`).join('');
  pm('Nuevo pedido', `<div class="field"><label>Cliente</label><select name="cli">${cs}</select></div><div class="field"><label>Esencia</label><select name="pro">${ps}</select></div>
   <div class="row2"><div class="field"><label>Presentación</label><select name="tam">${Object.keys(TAM).map(k => `<option value="${k}">${TAM[k].nombre}</option>`).join('')}</select></div><div class="field"><label>Envase</label><select name="env"><option value="nuevo">Envase nuevo</option><option value="recarga">Recarga</option></select></div></div>
   <div class="row2"><div class="field"><label>Cantidad</label><input name="qty" type="number" min="1" value="1"></div><div class="field"><label>Abono hoy (opcional)</label><input name="abo" inputmode="numeric" placeholder="0"></div></div>`, 'Guardar pedido', f => {
    const p = prod(f.pro.value), tam = f.tam.value, env = f.env.value, qty = Math.max(1, parseInt(f.qty.value, 10) || 1), pr = priceOf(tam, env), tot = pr * qty;
    const ab = Math.min(tot, parseInt(String(f.abo.value).replace(/\D/g, ''), 10) || 0), id = uid('o');
    S.pedidos.unshift({ id, cliente: f.cli.value, fecha: new Date().toISOString(), items: [{ prod: p.id, nombre: p.n, tam, envase: env, qty, precio: pr }], estado: 'nuevo', abonado: ab, total: tot, codigo: '' });
    if (ab) S.pagos.push({ id: uid('g'), fecha: new Date().toISOString(), cliente: f.cli.value, pedido: id, monto: ab, nota: '' });
    save(); toast('Pedido guardado: ' + fmt(tot)); PV.view = 'pedidos'; renderApp();
  });
};

/* ---------- CUENTAS ---------- */
function vCuentas() {
  const s = series(PV.per), tot = s.reduce((a, b) => a + b.v, 0), pagos = [...S.pagos].sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, 12), dl = deudoresList();
  return `<div class="kpis"><div class="kpi"><small>Ingresos (${PV.per === 'dia' ? '7 días' : PV.per === 'semana' ? '6 semanas' : '6 meses'})</small><b>${fmt(tot)}</b><span>Pagos recibidos</span></div>
   <div class="kpi"><small>Total que te deben</small><b>${fmt(totalDeudas())}</b><span>${dl.length} cliente(s)</span></div></div>
  <div class="pan"><h3>Ingresos ${perSeg()}</h3>${chartHTML()}</div>
  <div class="cols"><div class="pan"><h3>Quién te debe <button class="sm" data-act="payNew">+ Registrar pago</button></h3>${dl.map(deudorItem).join('') || '<p>Nadie te debe.</p>'}</div>
  <div class="pan"><h3>Quién ya pagó</h3>${pagos.map(pagoItem).join('')}</div></div>`;
}
ACT.payCli = el => payModal(el.dataset.id);
ACT.payNew = () => payModal(null);
function payModal(cid) {
  const cs = S.clientes.map(c => `<option value="${c.id}"${c.id === cid ? ' selected' : ''}>${esc(c.nombre)}</option>`).join('');
  pm('Registrar pago', `<div class="field"><label>Cliente</label><select name="cli">${cs}</select></div><div class="field"><label>Monto recibido</label><input name="monto" inputmode="numeric" placeholder="Ej. 20000"></div><div class="field"><label>Nota (opcional)</label><input name="nota" placeholder="Ej. Nequi"></div>`, 'Guardar pago', f => {
    let m = parseInt(String(f.monto.value).replace(/\D/g, ''), 10) || 0; if (!m) { toast('Escribe un monto'); return false; }
    const total = m, cid2 = f.cli.value;
    S.pedidos.filter(o => o.cliente === cid2 && debe(o) > 0).sort((a, b) => new Date(a.fecha) - new Date(b.fecha)).forEach(o => { const a = Math.min(debe(o), m); if (a > 0) { o.abonado += a; m -= a; S.pagos.push({ id: uid('g'), fecha: new Date().toISOString(), cliente: cid2, pedido: o.id, monto: a, nota: f.nota.value }); } });
    if (m > 0) S.pagos.push({ id: uid('g'), fecha: new Date().toISOString(), cliente: cid2, pedido: null, monto: m, nota: f.nota.value || 'Pago adelantado' });
    save(); toast('Pago de ' + fmt(total) + ' registrado'); burst(innerWidth / 2, innerHeight / 2, 14); renderApp();
  });
}

/* ---------- PRODUCTOS ---------- */
function vProductos() {
  return `<div class="pan"><h3>Lista de precios</h3><table class="ptbl"><thead><tr><th>Presentación</th><th>Envase nuevo</th><th>Recarga</th></tr></thead><tbody>${Object.keys(TAM).map(k => `<tr><td>${TAM[k].nombre}</td><td><input data-pk="${k}" data-pe="nuevo" inputmode="numeric" value="${S.prices[k].nuevo}" aria-label="Precio ${TAM[k].nombre} nuevo"></td><td><input data-pk="${k}" data-pe="recarga" inputmode="numeric" value="${S.prices[k].recarga}" aria-label="Precio ${TAM[k].nombre} recarga"></td></tr>`).join('')}</tbody></table>
   <div class="acts"><button class="btn btn-gold" style="min-height:44px" data-act="savePrices">Guardar precios</button></div></div>
  <div style="display:flex;justify-content:space-between;align-items:center;margin:0 0 14px;gap:10px;flex-wrap:wrap"><h3 style="font-size:26px">Tu catálogo (${S.productos.length} esencias)</h3><button class="btn btn-gold" style="min-height:44px" data-act="prodEdit" data-id="">+ Nueva esencia</button></div>
  <div class="pgrid">${S.productos.map(p => { const d = dest(p.d) || { nombre: '?' }; return `<div class="pp${p.activo ? '' : ' off'}"><div class="th">${bottleSVG({ color: p.color, level: .8, size: 1 })}</div><div style="flex:1;min-width:0"><b style="font-family:var(--serif);font-size:18px;display:block">${esc(p.n)}</b><small>${esc(d.nombre)} &middot; ${esc(p.g)}</small><div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap"><button class="sm" data-act="prodEdit" data-id="${p.id}">Editar</button><button class="sm" data-act="prodTog" data-id="${p.id}">${p.activo ? 'Ocultar' : 'Mostrar'}</button></div></div></div>`; }).join('')}</div>`;
}
ACT.savePrices = () => {
  $$('input[data-pk]').forEach(i => { S.prices[i.dataset.pk][i.dataset.pe] = parseInt(String(i.value).replace(/\D/g, ''), 10) || 0; });
  save(); toast('Precios guardados. La tienda ya los usa'); renderApp();
};
ACT.prodTog = el => { const p = prod(el.dataset.id); p.activo = !p.activo; save(); toast(p.n + (p.activo ? ' visible en la tienda' : ' oculta')); renderView(); };
ACT.prodEdit = el => {
  const p = el.dataset.id ? prod(el.dataset.id) : null;
  const ds = S.destinos.map(d => `<option value="${d.id}"${p && p.d === d.id ? ' selected' : ''}>${esc(d.nombre)}</option>`).join('');
  pm(p ? 'Editar esencia' : 'Nueva esencia', `<div class="field"><label>Nombre de la inspiración</label><input name="n" value="${esc(p ? p.n : '')}" required></div>
   <div class="row2"><div class="field"><label>Casa</label><select name="d">${ds}</select></div><div class="field"><label>Para</label><select name="g">${['Hombre', 'Mujer'].map(g => `<option${p && p.g === g ? ' selected' : ''}>${g}</option>`).join('')}</select></div></div>
   <div class="field"><label>Color del líquido</label><input name="c" type="color" value="${p ? p.color : '#C68A2E'}" style="padding:4px"></div>`, 'Guardar', f => {
    const n = f.n.value.trim(); if (!n) { toast('Ponle un nombre a la esencia'); return false; }
    const data = { n, d: f.d.value, g: f.g.value, color: f.c.value };
    if (p) Object.assign(p, data); else S.productos.push({ id: uid('p'), ...data, activo: true });
    save(); toast(p ? 'Esencia actualizada' : 'Esencia creada. Ya aparece en el catálogo'); renderApp();
  });
};

/* ---------- CASAS ---------- */
function vCasas() {
  return `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;gap:10px;flex-wrap:wrap"><p style="margin:0;max-width:560px;opacity:.9">Las casas son las marcas de inspiración de tu carta. Crea las que quieras y aparecen como filtro en la tienda.</p><button class="btn btn-gold" style="min-height:44px" data-act="casaNew">+ Nueva casa</button></div>
  <div class="dgrid">${[...S.destinos].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')).map(d => `<div class="dg" style="--c:${d.color}"><h4>${esc(d.nombre)}</h4><small>${S.productos.filter(p => p.d === d.id).length} esencia(s)</small></div>`).join('')}</div>`;
}
ACT.casaNew = () => pm('Nueva casa', `<div class="field"><label>Nombre de la marca</label><input name="n" placeholder="Ej. Hermès"></div>`, 'Crear casa', f => {
  const n = f.n.value.trim(); if (!n) { toast('Escribe el nombre de la casa'); return false; }
  S.destinos.push({ id: uid('d'), nombre: n, lema: 'Casa de inspiración', color: '#C68A2E' });
  save(); toast('Casa creada. Ya sale como filtro en la tienda'); renderApp();
});

/* ---------- CLIENTES ---------- */
function vClientes() {
  return `<div style="display:flex;justify-content:flex-end;margin-bottom:14px"><button class="btn btn-gold" style="min-height:44px" data-act="cliNew">+ Nuevo cliente</button></div><div class="pan">${S.clientes.map(c => {
    const ps = S.pedidos.filter(o => o.cliente === c.id), d = ps.reduce((a, o) => a + debe(o), 0), ing = S.pagos.filter(g => g.cliente === c.id).reduce((a, g) => a + g.monto, 0);
    return `<div class="li"><div class="av">${ini(c.nombre)}</div><div class="mid"><b>${esc(c.nombre)}</b><small>${esc(c.nota || '')} &middot; ${ps.length} pedido(s) &middot; ha pagado ${fmt(ing)}</small></div>${d > 0 ? `<div class="amt neg money">${fmt(d)}</div>` : '<span class="tag" style="background:rgba(30,122,69,.14);color:#1E7A45">Al día</span>'}</div>`;
  }).join('')}</div>`;
}
ACT.cliNew = () => pm('Nuevo cliente', `<div class="field"><label>Nombre</label><input name="n"></div><div class="field"><label>Nota</label><input name="t" placeholder="Ej. Compañero de trabajo"></div>`, 'Guardar', f => { if (!f.n.value.trim()) { toast('Escribe el nombre'); return false; } S.clientes.push({ id: uid('c'), nombre: f.n.value.trim(), nota: f.t.value.trim() }); save(); toast('Cliente guardado'); renderApp(); });

/* ---------- DESCUENTOS ---------- */
function vDescuentos() {
  return `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;gap:10px;flex-wrap:wrap"><p style="margin:0;max-width:560px;opacity:.9">Códigos que tus clientes escriben en la bolsa. Úsalos para clientes frecuentes o promociones.</p><button class="btn btn-gold" style="min-height:44px" data-act="codeNew">+ Nuevo código</button></div>
  <div class="pan">${S.codigos.map((c, i) => `<div class="li"><div class="av" style="font-size:15px">${c.pct}%</div><div class="mid"><b style="letter-spacing:.14em">${esc(c.code)}</b><small>${c.activo ? 'Activo' : 'Pausado'}</small></div><button class="sm" data-act="codeTog" data-i="${i}">${c.activo ? 'Pausar' : 'Activar'}</button><button class="sm rd" data-act="codeDel" data-i="${i}">Quitar</button></div>`).join('') || '<p>No tienes códigos.</p>'}</div>`;
}
ACT.codeTog = el => { const c = S.codigos[Number(el.dataset.i)]; c.activo = !c.activo; save(); renderView(); };
ACT.codeDel = el => { S.codigos.splice(Number(el.dataset.i), 1); save(); toast('Código eliminado'); renderView(); };
ACT.codeNew = () => pm('Nuevo código', `<div class="field"><label>Código</label><input name="c" placeholder="Ej. AMIGOS15" style="text-transform:uppercase"></div><div class="field"><label>Descuento (%)</label><input name="p" type="number" min="1" max="90" value="10"></div>`, 'Crear código', f => {
  const c = f.c.value.trim().toUpperCase(); if (!c) { toast('Escribe el código'); return false; }
  S.codigos.push({ code: c, pct: Math.max(1, Math.min(90, parseInt(f.p.value, 10) || 10)), activo: true }); save(); toast('Código ' + c + ' creado'); renderView();
});


/* ---------- PERFIL ---------- */
function avatarHTML(cls) { const c = S.cuenta; return c.foto ? `<img class="${cls}" src="${c.foto}" alt="">` : `<span class="${cls}">${esc(ini(c.nombre))}</span>`; }
function vPerfil() {
  const c = S.cuenta;
  const pw = (id, l, ac) => `<div class="field"><label for="${id}">${l}</label><div class="pw"><input id="${id}" type="password" autocomplete="${ac}" style="padding-right:54px"><button type="button" class="eye" data-act="eyeF" data-t="${id}" aria-label="Mostrar">${EYE}</button></div></div>`;
  return `<div class="cols"><div class="pan prof"><h3>Mi perfil</h3>
   <div class="phot"><div class="ph-av">${avatarHTML('pbig')}</div><div><button class="btn btn-gold" style="min-height:44px" data-act="photoPick">Cambiar foto</button> ${c.foto ? '<button class="sm" data-act="photoDel">Quitar</button>' : ''}<p style="margin:8px 0 0;font-size:14px;opacity:.8">JPG o PNG. Se ajusta sola a un círculo.</p></div><input type="file" id="phFile" accept="image/*" hidden></div>
   <div class="field"><label for="pfNombre">Nombre completo</label><input id="pfNombre" value="${esc(c.nombre)}" autocomplete="name"></div>
   <div class="field"><label>Usuario</label><input value="${esc(c.usuario)}" disabled></div>
   <div class="acts"><button class="btn btn-gold" style="min-height:46px" data-act="saveProf">Guardar perfil</button></div></div>
  <div class="pan prof"><h3>Cambiar contraseña</h3>${pw('pwA', 'Contraseña actual', 'current-password')}${pw('pwN', 'Nueva contraseña (mínimo 6)', 'new-password')}${pw('pwR', 'Repite la nueva contraseña', 'new-password')}
   <div class="err2" id="pwErr" role="alert"></div><div class="acts"><button class="btn btn-gold" style="min-height:46px" data-act="savePw">Actualizar contraseña</button></div></div></div>`;
}
ACT.eyeF = el => { const i = $('#' + el.dataset.t), sh = i.type === 'password'; i.type = sh ? 'text' : 'password'; el.innerHTML = sh ? EYEOFF : EYE; };
ACT.photoPick = () => { const f = $('#phFile'); f.onchange = () => {
  const file = f.files && f.files[0]; if (!file) return;
  const rd = new FileReader(); rd.onload = () => { const im = new Image(); im.onload = () => {
    const n = Math.min(im.width, im.height), cv = document.createElement('canvas'); cv.width = cv.height = 320;
    cv.getContext('2d').drawImage(im, (im.width - n) / 2, (im.height - n) / 2, n, n, 0, 0, 320, 320);
    S.cuenta.foto = cv.toDataURL('image/jpeg', .86); save(); toast('Foto actualizada'); renderApp();
  }; im.onerror = () => toast('No pude leer esa imagen'); im.src = rd.result; }; rd.readAsDataURL(file); }; f.click(); };
ACT.photoDel = () => { S.cuenta.foto = ''; save(); toast('Foto quitada'); renderApp(); };
ACT.saveProf = () => { const n = $('#pfNombre').value.trim(); if (!n) { toast('Escribe tu nombre completo'); return; } S.cuenta.nombre = n; save(); toast('Perfil guardado'); renderApp(); };
ACT.savePw = () => {
  const a = $('#pwA').value, n = $('#pwN').value, r = $('#pwR').value, er = $('#pwErr');
  const bad = a !== S.cuenta.clave ? 'La contraseña actual no es correcta.' : n.length < 6 ? 'La nueva contraseña debe tener mínimo 6 caracteres.' : n !== r ? 'Las contraseñas nuevas no coinciden.' : '';
  if (bad) { er.textContent = bad; er.classList.add('on'); return; }
  S.cuenta.clave = n; save(); er.classList.remove('on'); toast('Contraseña actualizada'); burstEl($('[data-act=savePw]'), 14); renderView();
};

function renderPanel() {
  if (!session) { $('#pa').style.display = 'none'; $('#pl').style.display = ''; renderLogin(); }
  else { $('#pl').style.display = 'none'; $('#pa').style.display = ''; renderApp(); }
}
