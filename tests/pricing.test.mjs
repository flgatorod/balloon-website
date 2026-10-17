import test from 'node:test';
import assert from 'node:assert/strict';
import { getProduct, priceItem, priceOrder, defaultSelections, startingPrice, addDays } from '../site/pricing.js';
import { ZIP_MILES } from '../site/zip-miles.js';

const today = '2026-10-17';

test('garland: base length + extra colors + extras', () => {
  const p = getProduct('grab-and-go-garland');
  const r = priceItem(p, { length: '8', colors: ['sage', 'ivory', 'gold', 'white'], addons: ['greenery'] });
  assert.deepEqual(r.errors, []);
  assert.equal(r.unit, (170 + 10 + 25) * 100);
});

test('bouquet foil numbers priced per character, spaces ignored', () => {
  const p = getProduct('balloon-bouquet');
  const r = priceItem(p, { size: '5', colors: ['blush'], numbers: '3 0', addons: [] });
  assert.equal(r.unit, (35 + 36) * 100);
});

test('too many colors is rejected', () => {
  const p = getProduct('balloon-bouquet');
  const r = priceItem(p, { size: '5', colors: ['blush', 'white', 'gold', 'rose'] });
  assert.ok(r.errors.length);
});

test('every product prices cleanly with defaults', () => {
  for (const id of ['balloon-bouquet', 'grab-and-go-garland', 'balloon-columns', 'table-centerpiece', 'diy-garland-kit', 'themed-party-kit',
    'organic-garland-install', 'signature-backdrop', 'entry-arch', 'full-party-setup']) {
    const p = getProduct(id);
    const r = priceItem(p, defaultSelections(p));
    assert.deepEqual(r.errors, [], id);
    assert.equal(r.unit, startingPrice(p), id);
  }
});

test('pickup order: tax on items, no delivery', () => {
  const p = getProduct('table-centerpiece');
  const o = priceOrder({ items: [{ productId: p.id, selections: defaultSelections(p), qty: 4 }],
    fulfillment: { method: 'pickup', eventDate: addDays(today, 5) } }, { zipMiles: ZIP_MILES, today });
  assert.deepEqual(o.errors, []);
  assert.equal(o.subtotal, 10000);
  assert.equal(o.delivery, 0);
  assert.equal(o.tax, 600);
  assert.equal(o.total, 10600);
});

test('install item forces delivery and uses mileage zone; delivery not taxed', () => {
  const p = getProduct('signature-backdrop');
  const o = priceOrder({ items: [{ productId: p.id, selections: defaultSelections(p), qty: 1 }],
    fulfillment: { method: 'pickup', zip: '20110', eventDate: addDays(today, 10) } }, { zipMiles: ZIP_MILES, today });
  assert.deepEqual(o.errors, []);
  assert.equal(o.method, 'delivery');
  assert.ok(o.delivery > 0);
  assert.equal(o.tax, Math.round(39500 * 0.06));
  assert.equal(o.total, 39500 + o.delivery + o.tax);
});

test('lead time and out-of-area ZIP are enforced', () => {
  const p = getProduct('entry-arch');
  const o = priceOrder({ items: [{ productId: p.id, selections: defaultSelections(p), qty: 1 }],
    fulfillment: { method: 'delivery', zip: '90210', eventDate: addDays(today, 2) } }, { zipMiles: ZIP_MILES, today });
  assert.equal(o.errors.length, 2);
});

test('tampered quantity is rejected', () => {
  const p = getProduct('signature-backdrop');
  const o = priceOrder({ items: [{ productId: p.id, selections: defaultSelections(p), qty: 0 }],
    fulfillment: { method: 'delivery', zip: '20155', eventDate: addDays(today, 10) } }, { zipMiles: ZIP_MILES, today });
  assert.ok(o.errors.some((e) => e.includes('quantity')));
});

test('themed kit: theme presets use real colors and fit the color limit', async () => {
  const { THEMES, COLORS } = await import('../site/pricing.js');
  for (const t of THEMES) {
    assert.ok(t.colors.length <= 4, t.id);
    t.colors.forEach((c) => assert.ok(COLORS.find((x) => x.id === c), `${t.id}:${c}`));
  }
  const p = getProduct('themed-party-kit');
  const r = priceItem(p, { theme: 'dino', size: 'party', colors: THEMES[1].colors, name: 'Leo', addons: ['licensed'] });
  assert.equal(r.unit, (119 + 10 + 18) * 100);
});
