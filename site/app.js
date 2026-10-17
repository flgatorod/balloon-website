import {
  CONFIG, COLORS, CATALOG, getProduct, getColor, priceItem, priceOrder,
  defaultSelections, startingPrice, formatMoney, todayInShopTz, deliveryZoneFor,
} from './pricing.js';
import { ZIP_MILES } from './zip-miles.js';
import { balloonArt } from './art.js';

const main = document.getElementById('main');
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const FABRIC = { white: '#FFFFFF', blush: '#F6D3DA', sage: '#CBD8C4', black: '#1F1A22', shimmer: '#E9D59C' };

// ---------- saved state (cart + checkout form) ----------
const store = {
  get(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } },
  set(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* private mode: keep in memory */ } },
};
let cart = store.get('bb-cart', []);
let checkout = store.get('bb-checkout', { method: 'pickup', zip: '', address: '', city: '', eventDate: '', timeWindow: CONFIG.timeWindows[0], notes: '' });
const saveCart = () => { store.set('bb-cart', cart); updateCount(); };
const saveCheckout = () => store.set('bb-checkout', checkout);
function updateCount() {
  document.getElementById('cart-count').textContent = cart.reduce((n, i) => n + i.qty, 0);
}

function toast(html) {
  const t = document.getElementById('toast');
  t.innerHTML = html;
  t.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => t.classList.remove('show'), 3200);
}

// ---------- art helpers ----------
function artFor(product, selections, seed) {
  if (product.image) return `<img src="${esc(product.image)}" alt="${esc(product.name)}" loading="lazy">`;
  const colorOpt = product.options.find((o) => o.type === 'colors');
  const ids = (colorOpt && selections[colorOpt.id]) || product.defaultColors || [];
  const colors = ids.map(getColor).filter(Boolean);
  const fabric = FABRIC[selections.fabric] || '#FFFFFF';
  const label = (selections.vinyl || '').trim();
  return balloonArt(product.art, colors, { seed: seed ?? product.id.length * 13, fabric, label });
}

// ---------- views ----------
function viewShop(filter = 'all') {
  const heroColors = ['hotpink', 'blush', 'butter', 'lilac', 'gold', 'white', 'coral'].map(getColor);
  const items = CATALOG.filter((p) => filter === 'all' || p.category === filter);
  main.innerHTML = `
    <section class="hero">
      <div class="hero-art"><div class="float">${balloonArt('garland', heroColors, { seed: 11 })}</div></div>
      <h1>Balloons for the party you’re planning</h1>
      <p>Pick a design, choose your colors, and see your price right away. Grab it from us in ${esc(CONFIG.pickupArea)} or we’ll deliver and set it up.</p>
    </section>
    <div class="filters" role="group" aria-label="Show">
      ${[['all', 'Everything'], ['pickup', 'Ready for pickup'], ['install', 'We set it up']]
        .map(([id, label]) => `<button class="chip" data-filter="${id}" aria-pressed="${filter === id}">${label}</button>`).join('')}
    </div>
    <div class="grid">
      ${items.map((p) => `
        <a class="card" href="#/p/${p.id}">
          <div class="card-media">${artFor(p, defaultSelections(p))}</div>
          <span class="tag ${p.category}">${p.category === 'install' ? 'Delivered and set up' : 'Pickup or delivery'}</span>
          <h3>${esc(p.name)}</h3>
          <span class="from">From ${formatMoney(startingPrice(p))}</span>
        </a>`).join('')}
    </div>`;
  main.querySelectorAll('[data-filter]').forEach((b) =>
    b.addEventListener('click', () => { history.replaceState(null, '', b.dataset.filter === 'all' ? '#/' : `#/?show=${b.dataset.filter}`); viewShop(b.dataset.filter); }));
}

function optionHtml(product, opt, sel) {
  if (opt.type === 'select') {
    const base = Math.min(...opt.choices.map((c) => c.price));
    const isBase = product.options.indexOf(opt) === product.options.findIndex((o) => o.type === 'select');
    return `<fieldset><legend>${esc(opt.label)}</legend><div class="pills">
      ${opt.choices.map((c) => `
        <label class="pill"><input type="radio" name="${opt.id}" value="${c.id}" ${sel[opt.id] === c.id ? 'checked' : ''}>
          <span>${esc(c.label)}<small>${isBase ? formatMoney(c.price * 100) : c.price > base ? '+' + formatMoney((c.price - base) * 100) : 'Included'}</small></span></label>`).join('')}
    </div></fieldset>`;
  }
  if (opt.type === 'colors') {
    return `<fieldset><legend>${esc(opt.label)} <span class="hint">${esc(opt.hint || `Up to ${opt.max}`)}</span></legend>
      <div class="swatches" data-colors="${opt.id}">
        ${COLORS.map((c) => `<button type="button" class="swatch" data-color="${c.id}" aria-pressed="false" aria-label="${esc(c.name)}">
          <span class="b ${c.chrome ? 'chrome' : ''}" style="background:${c.hex}"></span><span class="n">${esc(c.name)}</span></button>`).join('')}
      </div><p class="picked" data-picked="${opt.id}"></p></fieldset>`;
  }
  if (opt.type === 'multi') {
    return `<fieldset><legend>${esc(opt.label)}</legend><div class="checks">
      ${opt.choices.map((c) => `<label class="check"><input type="checkbox" name="${opt.id}" value="${c.id}" ${sel[opt.id].includes(c.id) ? 'checked' : ''}>
        <span>${esc(c.label)}</span><span class="price">+${formatMoney(c.price * 100)}</span></label>`).join('')}
    </div></fieldset>`;
  }
  if (opt.type === 'text') {
    return `<div class="field"><label for="opt-${opt.id}">${esc(opt.label)} <span class="hint">${esc(opt.hint || '')}, optional</span></label>
      <input class="input" id="opt-${opt.id}" name="${opt.id}" maxlength="${opt.maxLength}" placeholder="${esc(opt.placeholder || '')}" value="${esc(sel[opt.id])}" autocomplete="off"></div>`;
  }
  return '';
}

function viewProduct(id, editIndex = null) {
  const product = getProduct(id);
  if (!product) return viewShop();
  const editing = editIndex !== null && cart[editIndex]?.productId === id;
  const sel = editing ? structuredClone(cart[editIndex].selections) : defaultSelections(product);
  let qty = editing ? cart[editIndex].qty : 1;

  main.innerHTML = `
    <a class="back" href="#/">← All designs</a>
    <div class="product">
      <div class="product-media" id="media"></div>
      <form id="pform" novalidate>
        <h1>${esc(product.name)}</h1>
        <p class="blurb">${esc(product.blurb)}</p>
        <p class="lead">${product.category === 'install' ? 'We deliver and set up' : 'Pickup, or add delivery at checkout'} · Book at least ${product.leadDays} days ahead</p>
        ${product.options.map((o) => optionHtml(product, o, sel)).join('')}
        <fieldset><legend>Quantity</legend>
          <div class="qty"><button type="button" data-q="-1" aria-label="One fewer">−</button><output id="qty">${qty}</output><button type="button" data-q="1" aria-label="One more">+</button></div>
        </fieldset>
        <ul class="errors" id="perrors"></ul>
        <div class="buybar">
          <div><div class="total" id="ptotal"></div><div class="each" id="peach"></div></div>
          <button class="btn" type="submit" style="margin-left:auto">${editing ? 'Save changes' : 'Add to cart'}</button>
        </div>
      </form>
    </div>`;

  const form = document.getElementById('pform');
  const media = document.getElementById('media');

  function refresh() {
    const priced = priceItem(product, sel);
    media.innerHTML = artFor(product, sel, 5) + (product.image ? '' : '<span class="note">Illustration in your colors</span>');
    document.getElementById('qty').textContent = qty;
    document.getElementById('ptotal').textContent = formatMoney(priced.unit * qty);
    document.getElementById('peach').textContent = qty > 1 ? `${formatMoney(priced.unit)} each · before tax` : 'Before tax and delivery';
    for (const opt of product.options.filter((o) => o.type === 'colors')) {
      const chosen = sel[opt.id];
      form.querySelectorAll(`[data-colors="${opt.id}"] .swatch`).forEach((b) => {
        const i = chosen.indexOf(b.dataset.color);
        b.setAttribute('aria-pressed', i >= 0);
        b.disabled = i < 0 && chosen.length >= opt.max;
        b.querySelector('.order')?.remove();
        if (i >= 0) b.querySelector('.b').insertAdjacentHTML('beforeend', `<span class="order">${i + 1}</span>`);
      });
      const extra = Math.max(0, chosen.length - opt.included);
      form.querySelector(`[data-picked="${opt.id}"]`).textContent = chosen.length
        ? `${chosen.length} of ${opt.max}: ${chosen.map((c) => getColor(c).name).join(', ')}${extra && opt.extraPrice ? ` (+${formatMoney(extra * opt.extraPrice * 100)})` : ''}`
        : 'Tap a balloon to choose a color.';
    }
    return priced;
  }

  form.addEventListener('change', (e) => {
    const opt = product.options.find((o) => o.id === e.target.name);
    if (!opt) return;
    if (opt.type === 'select') sel[opt.id] = e.target.value;
    if (opt.type === 'multi') sel[opt.id] = [...form.querySelectorAll(`input[name="${opt.id}"]:checked`)].map((i) => i.value);
    refresh();
  });
  form.addEventListener('input', (e) => {
    const opt = product.options.find((o) => o.id === e.target.name && o.type === 'text');
    if (opt) { sel[opt.id] = e.target.value; refresh(); }
  });
  form.addEventListener('click', (e) => {
    const sw = e.target.closest('.swatch');
    if (sw) {
      const optId = sw.parentElement.dataset.colors;
      const list = sel[optId];
      const i = list.indexOf(sw.dataset.color);
      if (i >= 0) list.splice(i, 1); else list.push(sw.dataset.color);
      refresh();
    }
    const q = e.target.closest('[data-q]');
    if (q) { qty = Math.min(product.maxQty, Math.max(1, qty + Number(q.dataset.q))); refresh(); }
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const priced = refresh();
    const errs = document.getElementById('perrors');
    errs.innerHTML = priced.errors.map((x) => `<li>${esc(x)}</li>`).join('');
    if (priced.errors.length) return;
    const entry = { productId: product.id, selections: structuredClone(sel), qty };
    if (editing) cart[editIndex] = entry; else cart.push(entry);
    saveCart();
    if (editing) { location.hash = '#/cart'; return; }
    toast(`Added to cart <a href="#/cart">View cart</a>`);
  });
  refresh();
}

function fulfillmentFromState() {
  return { method: checkout.method, zip: checkout.zip, eventDate: checkout.eventDate };
}

function viewCart() {
  if (!cart.length) {
    main.innerHTML = `<div class="empty">
      <div class="hero-art">${balloonArt('bouquet', ['lilac', 'blush', 'butter'].map(getColor), { seed: 3 })}</div>
      <h1>Your cart is empty</h1><p>Choose a design to get started.</p>
      <p><a class="btn" href="#/">Browse designs</a></p></div>`;
    return;
  }
  const today = todayInShopTz();
  main.innerHTML = `
    <div class="cart">
      <section>
        <h1>Your order</h1>
        <div id="lines"></div>
        <h2>Pickup or delivery</h2>
        <div id="method"></div>
        <div id="delivery-fields">
          <div class="field"><label for="zip">Delivery ZIP code</label><input class="input" id="zip" inputmode="numeric" maxlength="5" autocomplete="postal-code" value="${esc(checkout.zip)}"><span class="zone" id="zone"></span></div>
          <div class="field"><label for="address">Street address</label><input class="input" id="address" autocomplete="street-address" value="${esc(checkout.address)}"></div>
          <div class="field"><label for="city">City</label><input class="input" id="city" autocomplete="address-level2" value="${esc(checkout.city)}"></div>
        </div>
        <h2>Event details</h2>
        <div class="field"><label for="eventDate">Event date</label><input class="input" type="date" id="eventDate" value="${esc(checkout.eventDate)}"></div>
        <div class="field"><label for="timeWindow" id="timeLabel">Time</label>
          <select class="input" id="timeWindow">${CONFIG.timeWindows.map((t) => `<option ${checkout.timeWindow === t ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select></div>
        <div class="field"><label for="notes">Anything we should know? <span class="hint">optional</span></label>
          <textarea class="input" id="notes" maxlength="480" placeholder="Theme, venue details, stairs, gate codes, inspiration photos to text you…">${esc(checkout.notes)}</textarea></div>
      </section>
      <aside class="summary-box" aria-live="polite">
        <h2 style="margin:0">Summary</h2>
        <dl id="totals"></dl>
        <ul class="errors" id="cerrors"></ul>
        <button class="btn wide" id="pay" type="button">Pay securely</button>
        <p class="fine">You’ll enter card, Apple Pay or Google Pay details on Stripe’s secure checkout page. We never see your card number.</p>
      </aside>
    </div>`;

  const $ = (id) => document.getElementById(id);
  ['zip', 'address', 'city', 'eventDate', 'timeWindow', 'notes'].forEach((k) =>
    $(k).addEventListener('input', () => { checkout[k] = $(k).value; saveCheckout(); render(); }));

  function render() {
    const order = priceOrder({ items: cart, fulfillment: fulfillmentFromState() }, { zipMiles: ZIP_MILES, today });
    $('eventDate').min = order.earliestDate;

    $('lines').innerHTML = order.items.map((it, i) => `
      <div class="line">
        <div class="line-media">${artFor(it.product, cart[i].selections)}</div>
        <div>
          <h3>${esc(it.product.name)}</h3>
          <p class="summary">${esc(it.summary)}</p>
          <div class="line-row">
            <div class="qty"><button type="button" data-line="${i}" data-q="-1" aria-label="One fewer">−</button><output>${it.qty}</output><button type="button" data-line="${i}" data-q="1" aria-label="One more">+</button></div>
            <span class="amt">${formatMoney(it.total)}</span>
          </div>
          <button class="linkbtn" data-edit="${i}">Edit</button> &nbsp; <button class="linkbtn" data-remove="${i}">Remove</button>
        </div>
      </div>`).join('');

    $('method').innerHTML = order.needsDelivery
      ? `<p class="notice">Your order includes setup, so we’ll deliver to your event. The delivery fee is based on distance from ${esc(CONFIG.pickupArea)}.</p>`
      : `<div class="seg" role="radiogroup" aria-label="Pickup or delivery">
          ${[['pickup', 'Pickup', `Free · ${CONFIG.pickupArea}`], ['delivery', 'Delivery', 'Fee by distance']].map(([v, l, s]) => `
            <label class="pill"><input type="radio" name="method" value="${v}" ${order.method === v ? 'checked' : ''}><span>${l}<small>${esc(s)}</small></span></label>`).join('')}
        </div>`;
    $('method').querySelectorAll('input[name="method"]').forEach((r) =>
      r.addEventListener('change', () => { checkout.method = r.value; saveCheckout(); render(); }));

    $('delivery-fields').hidden = order.method !== 'delivery';
    $('timeLabel').textContent = order.method === 'delivery' ? 'Setup time' : 'Pickup time';
    const z = checkout.zip.length === 5 ? deliveryZoneFor(checkout.zip, ZIP_MILES) : null;
    $('zone').textContent = checkout.zip.length === 5 ? (z ? `${z.label} · ${formatMoney(z.fee * 100)} delivery` : 'Outside our online delivery area — message us for a quote.') : '';

    $('totals').innerHTML = `
      <dt>Items</dt><dd>${formatMoney(order.subtotal)}</dd>
      <dt>${order.method === 'delivery' ? 'Delivery and setup' : 'Pickup'}</dt><dd>${order.method === 'delivery' ? (order.zone ? formatMoney(order.delivery) : '—') : 'Free'}</dd>
      <dt>Sales tax (${+(CONFIG.taxRate * 100).toFixed(2)}%)</dt><dd>${formatMoney(order.tax)}</dd>
      <dt class="grand">Total</dt><dd class="grand">${formatMoney(order.total)}</dd>`;

    const extra = [];
    if (order.method === 'delivery' && !checkout.address.trim()) extra.push('Enter the street address for delivery.');
    const errs = [...order.errors, ...extra];
    $('cerrors').innerHTML = errs.map((x) => `<li>${esc(x)}</li>`).join('');
    $('pay').disabled = errs.length > 0;
    $('pay').textContent = errs.length ? 'Pay securely' : `Pay ${formatMoney(order.total)}`;
    return errs;
  }

  main.onclick = onCartClick;
  function onCartClick(e) {
    const q = e.target.closest('[data-q][data-line]');
    if (q) {
      const item = cart[q.dataset.line];
      const p = getProduct(item.productId);
      item.qty = Math.min(p.maxQty, Math.max(1, item.qty + Number(q.dataset.q)));
      saveCart(); render();
    }
    const rm = e.target.closest('[data-remove]');
    if (rm) { cart.splice(Number(rm.dataset.remove), 1); saveCart(); viewCart(); }
    const ed = e.target.closest('[data-edit]');
    if (ed) { location.hash = `#/p/${cart[ed.dataset.edit].productId}?edit=${ed.dataset.edit}`; }
  }

  $('pay').addEventListener('click', async () => {
    if (render().length) return;
    const btn = $('pay');
    btn.disabled = true; btn.textContent = 'Opening secure checkout…';
    try {
      const res = await fetch('/.netlify/functions/create-checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart, fulfillment: { ...checkout } }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) throw new Error((data.errors || [data.error]).filter(Boolean).join(' ') || 'Checkout is not connected yet.');
      location.href = data.url;
    } catch (err) {
      $('cerrors').innerHTML = `<li>${esc(err.message === 'Failed to fetch' ? 'Checkout is not connected yet.' : err.message)}</li>`;
      btn.disabled = false; btn.textContent = 'Try again';
    }
  });
  render();
}

function viewThanks() {
  cart = []; saveCart();
  main.innerHTML = `<div class="empty">
    <div class="hero-art">${balloonArt('arch', ['hotpink', 'butter', 'lilac', 'white'].map(getColor), { seed: 9 })}</div>
    <h1>Thank you — your order is in</h1>
    <p>A receipt is on its way to your email. We’ll reach out to confirm the details for your date.</p>
    <p><a class="btn ghost" href="#/">Back to the shop</a></p></div>`;
}

// ---------- router ----------
function route() {
  const [path, query = ''] = location.hash.replace(/^#/, '').split('?');
  const params = new URLSearchParams(query);
  const parts = path.split('/').filter(Boolean);
  main.onclick = null;
  document.getElementById('toast').classList.remove('show');
  if (parts[0] === 'p') viewProduct(parts[1], params.has('edit') ? Number(params.get('edit')) : null);
  else if (parts[0] === 'cart') viewCart();
  else if (parts[0] === 'thanks') viewThanks();
  else viewShop(params.get('show') || 'all');
  window.scrollTo(0, 0);
  main.focus({ preventScroll: true });
}
document.getElementById('pickup-area').textContent = CONFIG.pickupArea;
window.addEventListener('hashchange', route);
updateCount();
route();
