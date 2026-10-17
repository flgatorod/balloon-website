// Draws product illustrations as SVG in whatever colors the customer picks.
// Used until real photos are added (set `image` on a product in pricing.js).

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function balloon(x, y, r, c, rand, oval = 1) {
  const rx = r, ry = r * oval;
  const rot = Math.round((rand() - 0.5) * 40);
  const edge = c.hex.toUpperCase() === '#FFFFFF' || c.hex.toUpperCase() === '#F3EBDD'
    ? ' stroke="rgba(43,24,56,.14)" stroke-width="1"' : '';
  const shine = c.chrome ? 0.75 : 0.42;
  return `<g transform="rotate(${rot} ${x.toFixed(1)} ${y.toFixed(1)})">` +
    `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}" fill="${c.hex}"${edge}/>` +
    (c.chrome ? `<ellipse cx="${(x + rx * 0.25).toFixed(1)}" cy="${(y + ry * 0.3).toFixed(1)}" rx="${(rx * 0.6).toFixed(1)}" ry="${(ry * 0.4).toFixed(1)}" fill="rgba(0,0,0,.14)"/>` : '') +
    `<ellipse cx="${(x - rx * 0.35).toFixed(1)}" cy="${(y - ry * 0.4).toFixed(1)}" rx="${(rx * 0.26).toFixed(1)}" ry="${(ry * 0.16).toFixed(1)}" fill="#fff" opacity="${shine}" transform="rotate(-35 ${(x - rx * 0.35).toFixed(1)} ${(y - ry * 0.4).toFixed(1)})"/>` +
    `</g>`;
}

function along(points, colors, rand, { minR, maxR, density = 1 }) {
  let out = '';
  const pick = () => colors[Math.floor(rand() * colors.length)];
  for (const [x, y] of points) {
    const n = 1 + Math.round(rand() * 1.4 * density);
    for (let i = 0; i < n; i++) {
      const r = minR + rand() * (maxR - minR);
      out += balloon(x + (rand() - 0.5) * maxR * 1.2, y + (rand() - 0.5) * maxR * 1.2, r, pick(), rand);
    }
    if (rand() < 0.5) out += balloon(x + (rand() - 0.5) * maxR * 1.8, y + (rand() - 0.5) * maxR * 1.8, minR * 0.55, pick(), rand);
  }
  return out;
}

const sample = (n, f) => Array.from({ length: n }, (_, i) => f(i / (n - 1)));

export function balloonArt(kind, colors, { seed = 7, fabric = '#ffffff', bg = 'transparent', label = '' } = {}) {
  const rand = rng(seed);
  const cs = colors.length ? colors : [{ hex: '#E6DCEF' }];
  let body = '';

  if (kind === 'garland') {
    const pts = sample(22, (t) => {
      const x = 30 + t * 340;
      const y = 225 - 170 * t + 70 * Math.sin(t * Math.PI);
      return [x, y - 40 * Math.sin(t * Math.PI)];
    });
    body = along(pts, cs, rand, { minR: 12, maxR: 30 });
  } else if (kind === 'arch') {
    const pts = sample(26, (t) => {
      const a = Math.PI * (1 - t);
      return [200 + 150 * Math.cos(a), 285 - 215 * Math.sin(a)];
    });
    body = along(pts, cs, rand, { minR: 12, maxR: 24 });
  } else if (kind === 'bouquet') {
    const tops = [[200, 70], [150, 95], [250, 92], [175, 140], [228, 138], [120, 145], [282, 142]];
    body += tops.map(([x, y]) => `<path d="M${x} ${y + 34} Q ${(x + 200) / 2 + (rand() - 0.5) * 30} ${(y + 260) / 2} 200 258" stroke="rgba(43,24,56,.35)" stroke-width="1.4" fill="none"/>`).join('');
    body += `<rect x="186" y="252" width="28" height="22" rx="7" fill="${cs[0].hex}" stroke="rgba(43,24,56,.2)"/>`;
    body += tops.map(([x, y], i) => balloon(x, y, 30, cs[i % cs.length], rand, 1.18)).join('');
  } else if (kind === 'columns') {
    for (const cx of [115, 285]) {
      body += `<rect x="${cx - 32}" y="268" width="64" height="12" rx="4" fill="rgba(43,24,56,.18)"/>`;
      for (let row = 0; row < 8; row++) {
        const y = 252 - row * 26;
        const c = cs[row % cs.length];
        body += balloon(cx - 13, y, 16, c, rand) + balloon(cx + 13, y, 16, c, rand);
      }
      body += balloon(cx, 34, 24, cs[cs.length - 1], rand, 1.1);
    }
  } else if (kind === 'centerpiece') {
    body += `<rect x="150" y="248" width="100" height="16" rx="6" fill="rgba(43,24,56,.16)"/>`;
    const pts = sample(9, (t) => [140 + t * 120, 215 - Math.sin(t * Math.PI) * 55]);
    body += along(pts, cs, rand, { minR: 12, maxR: 24 });
  } else if (kind === 'backdrop') {
    body += `<rect x="70" y="276" width="260" height="8" rx="4" fill="rgba(43,24,56,.14)"/>`;
    body += `<circle cx="200" cy="150" r="125" fill="${fabric}" stroke="rgba(43,24,56,.12)"/>`;
    if (label) body += `<text x="200" y="158" text-anchor="middle" font-family="Bricolage Grotesque, sans-serif" font-weight="700" font-size="${label.length > 14 ? 18 : 24}" fill="${fabric === '#1F1A22' ? '#fff' : '#2B1838'}">${label.replace(/[<&>"]/g, '')}</text>`;
    const pts = sample(20, (t) => {
      const a = Math.PI * (0.35 + t * 1.05);
      return [200 + 128 * Math.cos(a), 150 + 128 * Math.sin(a)];
    });
    body += along(pts, cs, rand, { minR: 11, maxR: 26 });
    body += along([[318, 268], [335, 250], [300, 275]], cs, rand, { minR: 10, maxR: 20 });
  }

  return `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true" preserveAspectRatio="xMidYMid meet"><rect width="400" height="300" fill="${bg}"/>${body}</svg>`;
}
