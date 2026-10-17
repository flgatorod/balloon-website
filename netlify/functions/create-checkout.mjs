// Creates a Stripe Checkout session. Prices are recalculated here from
// site/pricing.js — the browser's numbers are never trusted.
//
// Needs two environment variables in Netlify (Site settings → Environment variables):
//   STRIPE_SECRET_KEY   sk_test_... while testing, sk_live_... when live
//   URL                 set automatically by Netlify (the site's address)
import Stripe from 'stripe';
import { CONFIG, priceOrder } from '../../site/pricing.js';
import { ZIP_MILES } from '../../site/zip-miles.js';

const json = (status, body) => new Response(JSON.stringify(body), {
  status, headers: { 'Content-Type': 'application/json' },
});
const clip = (s, n) => String(s ?? '').replace(/\s+/g, ' ').trim().slice(0, n);

export default async (req) => {
  if (req.method !== 'POST') return json(405, { error: 'Use POST.' });
  if (!process.env.STRIPE_SECRET_KEY) return json(500, { error: 'Checkout is not connected yet (missing Stripe key).' });

  let body;
  try { body = await req.json(); } catch { return json(400, { error: 'Bad request.' }); }

  const items = Array.isArray(body.items) ? body.items.slice(0, 25) : [];
  const f = body.fulfillment || {};
  const order = priceOrder({ items, fulfillment: { method: f.method, zip: f.zip, eventDate: f.eventDate } }, { zipMiles: ZIP_MILES });
  const errors = [...order.errors];
  if (order.method === 'delivery' && !clip(f.address, 200)) errors.push('Enter the street address for delivery.');
  if (errors.length) return json(400, { errors });

  const line_items = order.items.map((it) => ({
    quantity: it.qty,
    price_data: {
      currency: 'usd',
      unit_amount: it.unit,
      product_data: { name: it.product.name, description: clip(it.summary, 480) || undefined },
    },
  }));
  if (order.delivery) {
    line_items.push({ quantity: 1, price_data: { currency: 'usd', unit_amount: order.delivery,
      product_data: { name: 'Delivery and setup', description: `${order.zone.label} (ZIP ${clip(f.zip, 5)})` } } });
  }
  if (order.tax) {
    line_items.push({ quantity: 1, price_data: { currency: 'usd', unit_amount: order.tax,
      product_data: { name: `Sales tax (${+(CONFIG.taxRate * 100).toFixed(2)}%)` } } });
  }

  // Order details she sees in the Stripe dashboard and payment notifications.
  const metadata = {
    fulfillment: order.method,
    event_date: f.eventDate,
    time: clip(f.timeWindow, 60),
    address: order.method === 'delivery' ? clip(`${f.address}, ${f.city || ''} ${f.zip}`, 300) : '',
    notes: clip(f.notes, 480),
    total: (order.total / 100).toFixed(2),
  };
  order.items.forEach((it, i) => { metadata[`item_${i + 1}`] = clip(`${it.qty}× ${it.product.name} — ${it.summary}`, 480); });

  const site = process.env.URL || new URL(req.url).origin;
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items,
      metadata,
      payment_intent_data: {
        metadata,
        description: `${order.method === 'delivery' ? 'Delivery' : 'Pickup'} on ${f.eventDate} — ${order.items.map((i) => i.product.name).join(', ')}`.slice(0, 1000),
      },
      phone_number_collection: { enabled: true },
      billing_address_collection: 'auto',
      custom_text: {
        submit: { message: `${order.method === 'delivery' ? 'Delivery' : 'Pickup'} on ${f.eventDate}, ${clip(f.timeWindow, 60)}. We'll contact you to confirm details.` },
      },
      success_url: `${site}/#/thanks`,
      cancel_url: `${site}/#/cart`,
    });
    return json(200, { url: session.url });
  } catch (err) {
    console.error('Stripe error', err?.message);
    return json(502, { error: 'Payment page could not be opened. Please try again in a moment.' });
  }
};
