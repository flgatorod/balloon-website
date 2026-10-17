// ============================================================================
//  PRICES, PRODUCTS AND SHOP SETTINGS — this is the one file to edit.
//  The website and the checkout server both read from here, so a customer
//  always pays exactly what the page showed them.
//  All prices are in dollars.
// ============================================================================

export const CONFIG = {
  businessName: 'To The Balloon and Backdrop',

  // Where pickups happen and deliveries start from. After changing baseZip,
  // run `npm run zips` to rebuild the delivery-distance table.
  baseZip: '20155',
  pickupArea: 'Gainesville, VA', // shown to customers; exact address goes in the confirmation

  // Sales tax. Northern Virginia (Prince William, Fairfax, Loudoun) is 6%.
  // Confirm with the CPA what is taxable for decor + installation.
  taxRate: 0.06,
  taxDelivery: false, // VA generally doesn't tax separately stated delivery charges

  // Delivery & setup fee by straight-line distance from baseZip.
  deliveryZones: [
    { maxMiles: 10, fee: 35, label: 'Within 10 miles' },
    { maxMiles: 20, fee: 55, label: '10–20 miles' },
    { maxMiles: 30, fee: 75, label: '20–30 miles' },
    { maxMiles: 40, fee: 100, label: '30–40 miles' },
  ],

  // Dates she is not taking orders (YYYY-MM-DD).
  blackoutDates: [],

  timeWindows: ['Morning (8–11am)', 'Midday (11am–2pm)', 'Afternoon (2–5pm)', 'Evening (5–7pm)'],
};

// Latex colors customers can pick. `chrome: true` draws a metallic sheen.
export const COLORS = [
  { id: 'white', name: 'White', hex: '#FFFFFF' },
  { id: 'ivory', name: 'Pearl ivory', hex: '#F3EBDD' },
  { id: 'blush', name: 'Blush', hex: '#F4C6CF' },
  { id: 'rose', name: 'Rose', hex: '#E58AA0' },
  { id: 'hotpink', name: 'Hot pink', hex: '#E0457B' },
  { id: 'coral', name: 'Coral', hex: '#F2735E' },
  { id: 'peach', name: 'Peach', hex: '#F7B58A' },
  { id: 'butter', name: 'Butter yellow', hex: '#FFD66B' },
  { id: 'sage', name: 'Sage', hex: '#A9BFA0' },
  { id: 'emerald', name: 'Emerald', hex: '#2F7D5B' },
  { id: 'babyblue', name: 'Baby blue', hex: '#A9CFEA' },
  { id: 'royal', name: 'Royal blue', hex: '#2F55B4' },
  { id: 'lilac', name: 'Lilac', hex: '#C6B2E0' },
  { id: 'purple', name: 'Purple', hex: '#7B4FA6' },
  { id: 'black', name: 'Black', hex: '#1F1A22' },
  { id: 'gold', name: 'Gold chrome', hex: '#C9A24A', chrome: true },
  { id: 'silver', name: 'Silver chrome', hex: '#BFC3C9', chrome: true },
  { id: 'rosegold', name: 'Rose gold chrome', hex: '#D79C8C', chrome: true },
];

// category: 'pickup' = she makes it, customer picks it up (delivery optional)
//           'install' = she delivers and sets it up (delivery required)
// leadDays: how many days' notice she needs.
// image: put a photo in site/images/ and set e.g. 'images/garland-pink.jpg'.
//        Until then, the site draws an illustration in the chosen colors.
export const CATALOG = [
  {
    id: 'balloon-bouquet',
    name: 'Helium balloon bouquet',
    category: 'pickup',
    art: 'bouquet',
    leadDays: 2,
    maxQty: 10,
    blurb: 'Hand-tied helium bouquet with ribbon and a weight. Floats about 12–24 hours indoors.',
    defaultColors: ['blush', 'white', 'gold'],
    options: [
      { id: 'size', type: 'select', label: 'Size', choices: [
        { id: '5', label: '5 balloons', price: 35 },
        { id: '7', label: '7 balloons', price: 48 },
        { id: '10', label: '10 balloons', price: 65 },
      ] },
      { id: 'colors', type: 'colors', label: 'Colors', min: 1, max: 3, included: 3, extraPrice: 0 },
      { id: 'numbers', type: 'text', label: '34-inch foil numbers or letters', placeholder: 'e.g. 30', maxLength: 4, pricePerChar: 18, hint: '$18 each' },
      { id: 'addons', type: 'multi', label: 'Extras', choices: [
        { id: 'confetti', label: 'Confetti-filled hero balloon', price: 12 },
        { id: 'tassel', label: 'Tassel tail', price: 10 },
      ] },
    ],
  },
  {
    id: 'grab-and-go-garland',
    name: 'Grab-and-go garland',
    category: 'pickup',
    art: 'garland',
    leadDays: 3,
    maxQty: 4,
    blurb: 'Organic-style garland, ready to hang with command hooks or fishing line. Great for mantels, doorways and dessert tables.',
    defaultColors: ['sage', 'ivory', 'gold'],
    options: [
      { id: 'length', type: 'select', label: 'Length', choices: [
        { id: '6', label: '6 ft', price: 130 },
        { id: '8', label: '8 ft', price: 170 },
        { id: '10', label: '10 ft', price: 210 },
      ] },
      { id: 'colors', type: 'colors', label: 'Colors', min: 1, max: 5, included: 3, extraPrice: 10, hint: '3 colors included, $10 each after' },
      { id: 'addons', type: 'multi', label: 'Extras', choices: [
        { id: 'chrome', label: 'Chrome accent balloons', price: 20 },
        { id: 'greenery', label: 'Faux greenery', price: 25 },
        { id: 'foil', label: 'Foil star and heart accents', price: 15 },
      ] },
    ],
  },
  {
    id: 'balloon-columns',
    name: 'Balloon columns',
    category: 'pickup',
    art: 'columns',
    leadDays: 3,
    maxQty: 4,
    blurb: 'About 5 ft tall on a weighted base. Pairs nicely on either side of a door, stage or cake table.',
    defaultColors: ['royal', 'silver'],
    options: [
      { id: 'set', type: 'select', label: 'Set', choices: [
        { id: 'single', label: 'Single column', price: 95 },
        { id: 'pair', label: 'Pair of columns', price: 170 },
      ] },
      { id: 'colors', type: 'colors', label: 'Colors', min: 1, max: 3, included: 2, extraPrice: 10, hint: '2 colors included, $10 each after' },
      { id: 'topper', type: 'select', label: 'Topper', choices: [
        { id: 'none', label: 'No topper', price: 0 },
        { id: 'star', label: 'Foil star', price: 10 },
        { id: 'jumbo', label: '24-inch jumbo balloon', price: 15 },
      ] },
      { id: 'vinyl', type: 'text', label: 'Custom name on the base', placeholder: 'e.g. Class of 2027', maxLength: 24, flatPrice: 25, hint: '$25' },
    ],
  },
  {
    id: 'table-centerpiece',
    name: 'Table centerpiece',
    category: 'pickup',
    art: 'centerpiece',
    leadDays: 3,
    maxQty: 30,
    blurb: 'Low balloon cluster that guests can see over. Priced per table.',
    defaultColors: ['peach', 'butter', 'white'],
    options: [
      { id: 'size', type: 'select', label: 'Size', choices: [
        { id: 'small', label: 'Small (about 12 in)', price: 25 },
        { id: 'large', label: 'Large (about 20 in)', price: 38 },
      ] },
      { id: 'colors', type: 'colors', label: 'Colors', min: 1, max: 3, included: 3, extraPrice: 0 },
    ],
  },
  {
    id: 'organic-garland-install',
    name: 'Organic garland, installed',
    category: 'install',
    art: 'garland',
    leadDays: 5,
    maxQty: 3,
    blurb: 'Full, mixed-size garland built on site at your home or venue — along a wall, staircase, mantel or table.',
    defaultColors: ['hotpink', 'blush', 'rose', 'gold'],
    options: [
      { id: 'length', type: 'select', label: 'Length', choices: [
        { id: '10', label: '10 ft', price: 300 },
        { id: '15', label: '15 ft', price: 440 },
        { id: '20', label: '20 ft', price: 580 },
        { id: '25', label: '25 ft', price: 720 },
      ] },
      { id: 'colors', type: 'colors', label: 'Colors', min: 1, max: 5, included: 4, extraPrice: 10, hint: '4 colors included, $10 each after' },
      { id: 'addons', type: 'multi', label: 'Extras', choices: [
        { id: 'chrome', label: 'Chrome accent balloons', price: 30 },
        { id: 'greenery', label: 'Faux greenery', price: 35 },
        { id: 'florals', label: 'Faux florals', price: 45 },
        { id: 'teardown', label: 'Teardown and pickup after the event', price: 50 },
      ] },
    ],
  },
  {
    id: 'signature-backdrop',
    name: 'Signature backdrop',
    category: 'install',
    art: 'backdrop',
    leadDays: 7,
    maxQty: 1,
    blurb: 'Round fabric backdrop wrapped in an organic garland. The photo spot for birthdays, showers and graduations.',
    defaultColors: ['lilac', 'white', 'purple', 'silver'],
    options: [
      { id: 'size', type: 'select', label: 'Backdrop size', choices: [
        { id: '6.5', label: '6.5 ft round', price: 395 },
        { id: '7.5', label: '7.5 ft round', price: 455 },
      ] },
      { id: 'fabric', type: 'select', label: 'Backdrop fabric', choices: [
        { id: 'white', label: 'White', price: 0 },
        { id: 'blush', label: 'Blush', price: 0 },
        { id: 'sage', label: 'Sage', price: 0 },
        { id: 'black', label: 'Black', price: 0 },
        { id: 'shimmer', label: 'Gold shimmer wall', price: 40 },
      ] },
      { id: 'colors', type: 'colors', label: 'Balloon colors', min: 1, max: 5, included: 4, extraPrice: 10, hint: '4 colors included, $10 each after' },
      { id: 'vinyl', type: 'text', label: 'Custom name or message', placeholder: 'e.g. Happy 1st Birthday Mia', maxLength: 32, flatPrice: 45, hint: '$45' },
      { id: 'addons', type: 'multi', label: 'Extras', choices: [
        { id: 'pedestals', label: 'Set of 3 pedestals', price: 60 },
        { id: 'neon', label: 'Neon sign rental', price: 50 },
        { id: 'teardown', label: 'Teardown and pickup after the event', price: 50 },
      ] },
    ],
  },
  {
    id: 'entry-arch',
    name: 'Entry arch',
    category: 'install',
    art: 'arch',
    leadDays: 7,
    maxQty: 2,
    blurb: 'A full arch over a doorway, walkway or stage. Built on a frame and secured on site.',
    defaultColors: ['emerald', 'gold', 'white'],
    options: [
      { id: 'size', type: 'select', label: 'Size', choices: [
        { id: 'small', label: '8 ft framed arch', price: 350 },
        { id: 'door', label: 'Single door (about 20 ft)', price: 550 },
        { id: 'double', label: 'Double door (about 30 ft)', price: 750 },
      ] },
      { id: 'style', type: 'select', label: 'Style', choices: [
        { id: 'classic', label: 'Classic (uniform pattern)', price: 0 },
        { id: 'organic', label: 'Organic (mixed sizes)', price: 100 },
      ] },
      { id: 'colors', type: 'colors', label: 'Colors', min: 1, max: 5, included: 4, extraPrice: 10, hint: '4 colors included, $10 each after' },
      { id: 'addons', type: 'multi', label: 'Extras', choices: [
        { id: 'teardown', label: 'Teardown and pickup after the event', price: 50 },
      ] },
    ],
  },
  {
    id: 'full-party-setup',
    name: 'Full party setup',
    category: 'install',
    art: 'backdrop',
    leadDays: 10,
    maxQty: 1,
    blurb: 'Signature backdrop, a pair of balloon columns and a 10 ft installed garland — the whole room in one order, for less than buying them separately.',
    defaultColors: ['babyblue', 'white', 'royal', 'silver'],
    options: [
      { id: 'package', type: 'select', label: 'Package', choices: [
        { id: 'standard', label: 'Backdrop + 2 columns + 10 ft garland', price: 795 },
        { id: 'plus', label: 'Adds 3 pedestals and 6 centerpieces', price: 985 },
      ] },
      { id: 'fabric', type: 'select', label: 'Backdrop fabric', choices: [
        { id: 'white', label: 'White', price: 0 },
        { id: 'blush', label: 'Blush', price: 0 },
        { id: 'sage', label: 'Sage', price: 0 },
        { id: 'black', label: 'Black', price: 0 },
        { id: 'shimmer', label: 'Gold shimmer wall', price: 40 },
      ] },
      { id: 'colors', type: 'colors', label: 'Balloon colors', min: 1, max: 5, included: 4, extraPrice: 10, hint: '4 colors included, $10 each after' },
      { id: 'vinyl', type: 'text', label: 'Custom name or message', placeholder: 'e.g. Oh Baby', maxLength: 32, flatPrice: 45, hint: '$45' },
      { id: 'addons', type: 'multi', label: 'Extras', choices: [
        { id: 'neon', label: 'Neon sign rental', price: 50 },
        { id: 'teardown', label: 'Teardown and pickup after the event', price: 75 },
      ] },
    ],
  },
];

// ============================================================================
//  Pricing logic below — no need to edit.
// ============================================================================

const cents = (dollars) => Math.round(dollars * 100);
export const formatMoney = (c) =>
  '$' + (c / 100).toLocaleString('en-US', { minimumFractionDigits: c % 100 ? 2 : 0, maximumFractionDigits: 2 });

export const getProduct = (id) => CATALOG.find((p) => p.id === id);
export const getColor = (id) => COLORS.find((c) => c.id === id);

/** Lowest possible price, for "from $X" on product cards. */
export function startingPrice(product) {
  let total = 0;
  for (const opt of product.options) {
    if (opt.type === 'select') total += cents(Math.min(...opt.choices.map((c) => c.price)));
  }
  return total;
}

/** Default selections for a product (first choice of each select, its default colors). */
export function defaultSelections(product) {
  const sel = {};
  for (const opt of product.options) {
    if (opt.type === 'select') sel[opt.id] = opt.choices[0].id;
    else if (opt.type === 'colors') sel[opt.id] = (product.defaultColors || []).slice(0, opt.max);
    else if (opt.type === 'multi') sel[opt.id] = [];
    else if (opt.type === 'text') sel[opt.id] = '';
  }
  return sel;
}

/**
 * Price one product with the customer's selections.
 * Returns { unit, lines: [{label, amount}], summary, errors } — amounts in cents.
 */
export function priceItem(product, selections = {}) {
  const errors = [];
  const lines = [];
  const summary = [];
  let unit = 0;

  for (const opt of product.options) {
    const v = selections[opt.id];
    if (opt.type === 'select') {
      const choice = opt.choices.find((c) => c.id === v);
      if (!choice) { errors.push(`Choose a ${opt.label.toLowerCase()}.`); continue; }
      unit += cents(choice.price);
      if (choice.price) lines.push({ label: `${opt.label}: ${choice.label}`, amount: cents(choice.price) });
      summary.push(choice.label);
    } else if (opt.type === 'colors') {
      const ids = Array.isArray(v) ? [...new Set(v)].filter(getColor) : [];
      if (ids.length < opt.min) errors.push(`Pick at least ${opt.min} color${opt.min > 1 ? 's' : ''}.`);
      if (ids.length > opt.max) errors.push(`Pick up to ${opt.max} colors.`);
      const extra = Math.max(0, Math.min(ids.length, opt.max) - opt.included) * cents(opt.extraPrice || 0);
      if (extra) { unit += extra; lines.push({ label: `Extra colors (${ids.length - opt.included})`, amount: extra }); }
      if (ids.length) summary.push(ids.map((id) => getColor(id).name).join(', '));
    } else if (opt.type === 'multi') {
      const ids = Array.isArray(v) ? [...new Set(v)] : [];
      for (const id of ids) {
        const choice = opt.choices.find((c) => c.id === id);
        if (!choice) { errors.push(`Unknown extra "${id}".`); continue; }
        unit += cents(choice.price);
        lines.push({ label: choice.label, amount: cents(choice.price) });
        summary.push(choice.label);
      }
    } else if (opt.type === 'text') {
      const text = typeof v === 'string' ? v.trim() : '';
      if (text.length > opt.maxLength) errors.push(`${opt.label} can be up to ${opt.maxLength} characters.`);
      if (!text) continue;
      let amount = 0;
      if (opt.pricePerChar) amount = text.replace(/\s/g, '').length * cents(opt.pricePerChar);
      else if (opt.flatPrice) amount = cents(opt.flatPrice);
      unit += amount;
      lines.push({ label: `${opt.label}: “${text}”`, amount });
      summary.push(`${opt.label}: “${text}”`);
    }
  }
  return { unit, lines, summary: summary.join(' · '), errors };
}

// ---- dates (all as YYYY-MM-DD strings, in the shop's time zone) ----
export function todayInShopTz(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(now);
}
export function addDays(ymd, days) {
  const d = new Date(ymd + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function deliveryZoneFor(zip, zipMiles) {
  const miles = zipMiles[String(zip || '').trim()];
  if (miles === undefined) return null;
  const zone = CONFIG.deliveryZones.find((z) => miles <= z.maxMiles);
  return zone ? { ...zone, miles } : null;
}

/**
 * Price a whole order.
 * order = { items: [{ productId, selections, qty }],
 *           fulfillment: { method: 'pickup'|'delivery', zip, eventDate } }
 * Returns totals in cents plus a list of problems to fix before checkout.
 */
export function priceOrder(order, { zipMiles = {}, today = todayInShopTz() } = {}) {
  const errors = [];
  const items = [];
  let subtotal = 0;
  let leadDays = 0;
  let needsDelivery = false;

  for (const raw of order.items || []) {
    const product = getProduct(raw.productId);
    if (!product) { errors.push('An item in your cart is no longer available.'); continue; }
    const qty = Math.floor(Number(raw.qty) || 0);
    if (qty < 1 || qty > product.maxQty) errors.push(`${product.name}: quantity must be 1–${product.maxQty}.`);
    const priced = priceItem(product, raw.selections);
    priced.errors.forEach((e) => errors.push(`${product.name}: ${e}`));
    const lineTotal = priced.unit * qty;
    subtotal += lineTotal;
    leadDays = Math.max(leadDays, product.leadDays);
    if (product.category === 'install') needsDelivery = true;
    items.push({ product, qty, unit: priced.unit, total: lineTotal, summary: priced.summary, lines: priced.lines });
  }
  if (!items.length) errors.push('Your cart is empty.');

  const f = order.fulfillment || {};
  const method = needsDelivery ? 'delivery' : f.method === 'delivery' ? 'delivery' : 'pickup';
  let delivery = 0;
  let zone = null;
  if (method === 'delivery') {
    if (!f.zip) errors.push('Enter the ZIP code for delivery.');
    else {
      zone = deliveryZoneFor(f.zip, zipMiles);
      if (!zone) errors.push(`We don't deliver to ${f.zip} through the website yet — message us for a quote.`);
      else delivery = cents(zone.fee);
    }
  }

  const earliestDate = addDays(today, leadDays);
  if (!f.eventDate) errors.push('Choose your event date.');
  else if (!/^\d{4}-\d{2}-\d{2}$/.test(f.eventDate)) errors.push('Event date is not valid.');
  else if (f.eventDate < earliestDate) errors.push(`The earliest date for this order is ${earliestDate} (we need ${leadDays} days' notice).`);
  else if (CONFIG.blackoutDates.includes(f.eventDate)) errors.push('We are fully booked that day — please pick another date.');

  const taxable = subtotal + (CONFIG.taxDelivery ? delivery : 0);
  const tax = Math.round(taxable * CONFIG.taxRate);
  const total = subtotal + delivery + tax;

  return { items, subtotal, delivery, zone, tax, total, method, needsDelivery, leadDays, earliestDate, errors };
}
