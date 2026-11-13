/* ===================== ARRANQUE ===================== */
const LEGAL = {
  'Términos y condiciones': 'Los pedidos se confirman por WhatsApp con Diego. Los precios están en pesos colombianos. El domicilio es gratis en Cali y se entrega por rutas. (Texto de ejemplo: el definitivo lo redactará el cliente.)',
  'Política de privacidad': 'Usamos tu nombre y barrio solo para entregar tu pedido. No vendemos tus datos. (Texto de ejemplo: el definitivo lo redactará el cliente.)',
  'Cambios y garantía': 'Si hay un problema con tu esencia, escríbele a Diego por WhatsApp y lo resolvemos. (Texto de ejemplo.)',
  'Envíos': 'Solo Cali. Domicilio gratis. Diego sale a repartir cuando completa la ruta, por eso la entrega puede tardar uno o dos días. (Texto de ejemplo.)'
};
function footHTML() {
  return `<footer class="foot"><img class="fl" src="img/horizontal.png" alt="Perfumería El Francés">
  <div class="legal">${Object.keys(LEGAL).map(k => `<button data-act="legal" data-k="${k}">${k}</button>`).join('')}</div>
  <div class="copy">&copy; ${new Date().getFullYear()} Perfumería El Francés &middot; Cali, Colombia &middot; Todos los derechos reservados</div>
  <div class="dev"><b>DESARROLLADO POR</b><img src="img/onytek.png" alt="Onytek"><em>Tecnología con propósito, ejecución con precisión.</em></div></footer>`;
}
ACT.legal = el => { const k = el.dataset.k; $('#legalBody').innerHTML = `<h3>${esc(k)}</h3><p>${esc(LEGAL[k])}</p><p style="opacity:.7;font-size:14px">Versión de prueba.</p>`; openOv('ov-legal'); };
ACT.closeLegal = () => closeOv('ov-legal');
ACT.go = (el, e) => { e.preventDefault(); const w = $('#wipe'); w.className = ''; void w.offsetWidth; w.className = 'on'; setTimeout(() => { location.hash = el.dataset.to; }, 650); setTimeout(() => { w.className = 'off'; }, 800); };

function route() {
  const h = (location.hash || '').replace('#', '');
  const v = h === 'tienda' ? 'store' : h === 'panel' ? 'panel' : 'welcome';
  $$('.view').forEach(x => x.classList.toggle('on', x.id === 'v-' + v));
  $$('.ov.on').forEach(o => o.classList.remove('on')); $$('.dr.on').forEach(o => o.classList.remove('on')); $('#scrim').classList.remove('on'); document.body.style.overflow = '';
  scrollTo({ top: 0 });
  if (v === 'store') { renderStore(); }
  if (v === 'panel') { renderPanel(); }
  if (v === 'welcome') { welcomeFx(); }
  const m = $('#hMin'); if (m) m.textContent = fmt(minPrice()); const m2 = $('#hMinH'); if (m2) m2.textContent = fmt(minPrice());
}
function welcomeFx() { particles($('#pc')); }

document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]'); if (!el) return;
  const fn = ACT[el.dataset.act]; if (fn) fn(el, e);
});

(function init() {
  S = load(); session = loadSession();
  $('#ldE').innerHTML = EIFFEL_SVG('#D9B25F').replace('<svg', '<svg class="eif"');
  $('#fWel').innerHTML = footHTML(); $('#fStore').innerHTML = footHTML();
  addEventListener('scroll', () => { const n = $('#nav'); if (n) n.classList.toggle('sc', scrollY > 10); }, { passive: true });
  addEventListener('hashchange', route);
  route();
  setTimeout(() => $('#loader').classList.add('go'), 2100);
  setTimeout(() => $('#loader').classList.add('gone'), 3200);
})();
