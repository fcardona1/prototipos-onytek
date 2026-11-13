/* Efectos: frasco animado, chispas, toasts, partículas, revelados, modales */
let _bid = 0;
function bottleSVG(o) {
  const id = 'b' + (++_bid), size = o.size === 2 ? 2 : 1;
  const w = size === 2 ? 92 : 68, x = (120 - w) / 2, top = 70, h = 138;
  const level = o.level == null ? 0.7 : o.level;
  const ly = top + h * (1 - level);
  const col = o.color || '#C68A2E';
  const by = 78, bh = 130, r = x + w;
  const body = (i) => `M${x + i + 11},${by + i} H${r - i - 11} L${r - i},${by + i + 11} V${by + bh - i - 10} Q${r - i},${by + bh - i} ${r - i - 10},${by + bh - i} H${x + i + 10} Q${x + i},${by + bh - i} ${x + i},${by + bh - i - 10} V${by + i + 11} Z`;
  const lw = w - 22, lx = x + 11;
  return `<svg viewBox="0 0 120 224" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(o.label || 'Frasco de esencia')}" data-size="${size}">
<defs>
<linearGradient id="cp${id}" x1="0" x2="1"><stop offset="0" stop-color="#0c0908"/><stop offset=".3" stop-color="#3a2b24"/><stop offset=".5" stop-color="#1a120e"/><stop offset="1" stop-color="#050303"/></linearGradient>
<linearGradient id="gd${id}" x1="0" x2="1"><stop offset="0" stop-color="#8A6A22"/><stop offset=".35" stop-color="#F6E3A3"/><stop offset=".6" stop-color="#D9B25F"/><stop offset="1" stop-color="#7A5B1B"/></linearGradient>
<linearGradient id="lq${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${col}"/><stop offset="1" stop-color="${col}" stop-opacity=".72"/></linearGradient>
<linearGradient id="gl${id}" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset=".16" stop-color="#fff" stop-opacity=".06"/><stop offset=".8" stop-color="#fff" stop-opacity=".04"/><stop offset="1" stop-color="#fff" stop-opacity=".34"/></linearGradient>
<linearGradient id="bs${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".42"/></linearGradient>
<clipPath id="cl${id}"><path d="${body(3)}"/></clipPath>
</defs>
<ellipse cx="60" cy="214" rx="${w / 2 + 10}" ry="4.5" fill="#000" opacity=".28"/>
<g class="cap" style="transform-box:fill-box;transform-origin:50% 100%"><rect x="44" y="9" width="32" height="46" rx="5" fill="url(#cp${id})"/>
<rect x="47" y="12" width="3.500" height="40" rx="1.700" fill="#fff" opacity=".28"/>
<rect x="43" y="50" width="34" height="8" rx="2.500" fill="url(#gd${id})"/></g>
<rect x="50" y="58" width="20" height="21" fill="#e9e4da" fill-opacity=".35" stroke="#fff" stroke-opacity=".5" stroke-width="1"/>
<path d="${body(0)}" fill="#fff" fill-opacity=".14"/>
<g clip-path="url(#cl${id})"><g class="liq" style="transform:translateY(${ly}px)">
<path class="wave" d="M0 4 Q15 -3 30 4 T60 4 T90 4 T120 4 T150 4 T180 4 T210 4 T240 4 V190 H0 Z" fill="url(#lq${id})"/>
<path d="M0 8 Q15 1 30 8 T60 8 T90 8 T120 8 T150 8 T180 8 T210 8 T240 8 V190 H0 Z" fill="#fff" opacity=".14" class="wave" style="animation-duration:5s"/>
</g>
<rect x="${x}" y="${by + bh - 18}" width="${w}" height="18" fill="url(#bs${id})"/>
<rect x="${x}" y="${by}" width="${w}" height="${bh}" fill="url(#gl${id})"/></g>
<rect x="${lx}" y="${by + 40}" width="${lw}" height="${size === 2 ? 50 : 44}" rx="3" fill="#14100E" stroke="#D9B25F" stroke-width="1.100"/>
<rect x="${lx + 3}" y="${by + 43}" width="${lw - 6}" height="${size === 2 ? 44 : 38}" rx="2" fill="none" stroke="#D9B25F" stroke-opacity=".5" stroke-width=".6"/>
<text x="60" y="${by + (size === 2 ? 62 : 59)}" text-anchor="middle" font-family="Pinyon Script,Playfair Display,Georgia,serif" font-size="${size === 2 ? 17 : 14.500}" fill="#F1D38B" textLength="${lw - 10}" lengthAdjust="spacingAndGlyphs">El Francés</text>
<text x="60" y="${by + (size === 2 ? 78 : 71)}" text-anchor="middle" font-family="Jost,Arial,sans-serif" font-size="${size === 2 ? 5.500 : 4.800}" letter-spacing="1.600" fill="#D9B25F">ESENCIA</text>
<path d="${body(0)}" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="1.500"/>
<path d="${body(3)}" fill="none" stroke="#000" stroke-opacity=".18" stroke-width="1"/>
<path d="M${x + 6},${by + 14} V${by + 70}" stroke="#fff" stroke-opacity=".7" stroke-width="2.500" stroke-linecap="round"/>
<circle cx="${r - 8}" cy="${by + 14}" r="1.600" fill="#fff" opacity=".8"/>
</svg>`;
}
function setBottle(host, level, color, size) {
  const svg = $('svg', host); if (!svg) return;
  const top = 70, h = 138;
  const liq = $('.liq', svg); if (liq) liq.style.transform = `translateY(${top + h * (1 - level)}px)`;
  if (color) $$('linearGradient[id^="lq"] stop', svg).forEach(s => s.setAttribute('stop-color', color));
}

/* chispas */
function burst(x, y, n) {
  n = n || 12;
  for (let i = 0; i < n; i++) {
    const s = document.createElement('i'); s.className = 'spark';
    s.style.left = x + 'px'; s.style.top = y + 'px';
    document.body.appendChild(s);
    const a = Math.random() * Math.PI * 2, d = 40 + Math.random() * 90;
    const an = s.animate([
      { transform: 'translate(-50%,-50%) scale(.2) rotate(0)', opacity: 1 },
      { transform: `translate(${Math.cos(a) * d}px,${Math.sin(a) * d + 30}px) scale(${.6 + Math.random()}) rotate(${Math.random() * 360}deg)`, opacity: 0 }
    ], { duration: 700 + Math.random() * 500, easing: 'cubic-bezier(.2,.8,.3,1)' });
    an.onfinish = () => s.remove();
  }
}
function burstEl(el, n) { if (!el) return; const r = el.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2, n); }

/* toast */
function toast(msg) {
  let box = $('#toasts'); if (!box) return;
  const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; box.appendChild(t);
  setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 400); }, 2800);
}

/* números que cuentan */
function countUp(el, to, ms) {
  if (!el) return; ms = ms || 700;
  const from = el._v || 0; el._v = to; const t0 = performance.now();
  const f = t => { const k = Math.min(1, (t - t0) / ms), e = 1 - Math.pow(1 - k, 3); el.textContent = fmt(from + (to - from) * e); if (k < 1) requestAnimationFrame(f); };
  requestAnimationFrame(f);
}

/* partículas (humo dorado) */
function particles(cv) {
  if (!cv) return; const c = cv.getContext('2d'); let W = 0, H = 0, ps = [];
  const rs = () => { W = cv.width = cv.offsetWidth; H = cv.height = cv.offsetHeight; };
  rs(); addEventListener('resize', rs);
  const mk = () => ({ x: Math.random() * W, y: H + 20, r: 1 + Math.random() * 3, vy: .3 + Math.random() * .9, vx: (Math.random() - .5) * .4, a: .2 + Math.random() * .6, ph: Math.random() * 6 });
  for (let i = 0; i < 46; i++) { const p = mk(); p.y = Math.random() * H; ps.push(p); }
  (function loop() {
    if (cv.offsetParent !== null) {
      c.clearRect(0, 0, W, H);
      ps.forEach((p, i) => {
        p.y -= p.vy; p.ph += .02; p.x += p.vx + Math.sin(p.ph) * .3;
        if (p.y < -10) ps[i] = mk();
        c.beginPath(); c.fillStyle = `rgba(217,178,95,${p.a * (p.y / H)})`; c.arc(p.x, p.y, p.r, 0, 7); c.fill();
      });
    }
    requestAnimationFrame(loop);
  })();
}

/* revelado al hacer scroll */
let _io;
function observeReveal(root) {
  if (!_io) _io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); _io.unobserve(e.target); } }), { threshold: .12 });
  $$('.reveal:not(.in)', root || document).forEach(el => _io.observe(el));
}

/* inclinación 3D con el mouse */
function tilt() {} /* sin inclinación: se usa flote suave y destello */

/* modales: solo se cierran con X o Cancelar */
function openOv(id) { const o = $('#' + id); if (o) { o.classList.add('on'); document.body.style.overflow = 'hidden'; } }
function closeOv(id) { const o = $('#' + id); if (o) o.classList.remove('on'); if (!$$('.ov.on').length && !$('.dr.on')) document.body.style.overflow = ''; }
function openDr(id) { $('#' + id).classList.add('on'); $('#scrim').classList.add('on'); document.body.style.overflow = 'hidden'; }
function closeDr(id) { $('#' + id).classList.remove('on'); $('#scrim').classList.remove('on'); if (!$$('.ov.on').length) document.body.style.overflow = ''; }

const EIFFEL_PATHS = `<path d="M30 190 L48 110 L56 60 L65 8 L74 60 L82 110 L100 190"/><path d="M44 130 Q65 112 86 130"/><path d="M38 160 L92 160"/><path d="M47 110 L83 110"/><path d="M56 60 L74 60"/><path d="M48 110 L92 160 M82 110 L38 160 M56 60 L83 110 M74 60 L47 110"/>`;
const EIFFEL_SVG = c => `<svg viewBox="0 0 130 200" fill="none" stroke="${c || 'currentColor'}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${EIFFEL_PATHS}</svg>`;
const BERET_SVG = `<svg viewBox="0 0 80 52"><path d="M6 36C-2 14 22 2 44 3c24 1 40 14 28 32-8 8-36 8-66 1Z" fill="#14100E"/><path d="M10 33c24 6 48 6 62-2" stroke="#C8102E" stroke-width="5" fill="none" stroke-linecap="round"/><rect x="38" y="-2" width="7" height="9" rx="3" fill="#14100E"/></svg>`;
