// Daily reward spinners: the prizes each one can pay and their odds.
// Every prize has a relative `weight` (its odds within one spinner) plus the
// strings the spinners print: `value` + `unit` on the artwork, `title` in text.

const fmt = (n) => n.toLocaleString('en-US');

export const points = (n) => ({
  kind: 'points',
  amount: n,
  value: fmt(n),
  unit: 'points',
  title: `${fmt(n)} Aurum points`,
});
export const cash = (n) => ({
  kind: 'cash',
  amount: n,
  value: `$${n}`,
  unit: 'cash back',
  title: `$${n} cash back`,
});
export const boost = (pct) => ({
  kind: 'boost',
  amount: pct,
  days: 30,
  value: `+${pct.toFixed(2)}%`,
  unit: 'interest',
  title: `+${pct.toFixed(2)}% interest for 30 days`,
});
export const freeSpin = () => ({
  kind: 'spin',
  amount: 1,
  value: '+1',
  unit: 'free spin',
  title: 'A free spin',
});

/** How special a prize looks: 'top' is drawn in brass, 'rare' in teal. */
export function tierOf(p) {
  if (p.kind === 'cash') return p.amount >= 5 ? 'top' : p.amount >= 2 ? 'rare' : 'common';
  if (p.kind === 'boost') return p.amount >= 0.15 ? 'top' : 'rare';
  if (p.kind === 'spin') return 'rare';
  return p.amount >= 250 ? 'top' : p.amount >= 100 ? 'rare' : 'common';
}

/** A prize ready for a spinner: odds weight, tier and any spinner-specific extras. */
export const entry = (prize, weight, extra) => ({
  ...prize,
  weight,
  tier: tierOf(prize),
  ...extra,
});

const slices = (list) => list.map((p) => entry(p, 1));

/** Odds rows for the table beside a spinner; identical prizes are merged into one row. */
function oddsRows(list, spot) {
  const total = list.reduce((sum, p) => sum + p.weight, 0);
  const rows = [];
  for (const p of list) {
    const row = rows.find((r) => r.title === p.title && r.hint === p.hint);
    if (row) {
      row.weight += p.weight;
      row.count += 1;
    } else {
      rows.push({
        kind: p.kind,
        tier: p.tier,
        title: p.title,
        hint: p.hint,
        weight: p.weight,
        count: 1,
      });
    }
  }
  return rows.map((r) => ({
    ...r,
    hint: r.hint || (spot ? `${r.count} of ${list.length} ${spot}s` : ''),
    pct: (r.weight / total) * 100,
  }));
}

const range = (prize, from, to) =>
  entry(prize, to - from + 1, {
    range: [from, to],
    hint: `Numbers ${String(from).padStart(2, '0')}–${String(to).padStart(2, '0')}`,
  });

const SYMBOL_NAMES = { coin: 'Coin', bar: 'Gold bar', safe: 'Safe', key: 'Key', star: 'Star' };
const three = (prize, weight, symbol) =>
  entry(prize, weight, {
    combo: [symbol, symbol, symbol],
    hint: `${SYMBOL_NAMES[symbol]} × 3`,
  });

const wheelPrizes = slices([
  points(25),
  points(50),
  cash(1),
  points(25),
  freeSpin(),
  points(75),
  points(25),
  cash(2),
  points(50),
  boost(0.05),
  points(100),
  cash(5),
]);

const needlePrizes = [
  entry(points(25), 30),
  entry(points(50), 22),
  entry(points(100), 14),
  entry(cash(1), 12),
  entry(freeSpin(), 8),
  entry(boost(0.05), 7),
  entry(cash(5), 7),
];

const baseRing = slices([20, 40, 60, 80, 100, 150].map(points));
const multRing = [1, 2, 1, 3, 1, 2, 1, 5, 1, 2];

const multTier = (m) => (m >= 5 ? 'top' : m >= 3 ? 'rare' : 'common');
function multRows() {
  const counts = {};
  multRing.forEach((m) => (counts[m] = (counts[m] || 0) + 1));
  return Object.keys(counts).map((m) => ({
    kind: 'mult',
    tier: multTier(Number(m)),
    title: `Times ${m}`,
    hint: `${counts[m]} of ${multRing.length} slices`,
    pct: (counts[m] / multRing.length) * 100,
  }));
}

const dialPrizes = [
  range(points(25), 0, 29),
  range(points(50), 30, 49),
  range(points(100), 50, 64),
  range(cash(2), 65, 76),
  range(boost(0.05), 77, 86),
  range(freeSpin(), 87, 93),
  range(cash(10), 94, 97),
  range(boost(0.25), 98, 99),
];

const slotPrizes = [
  three(cash(20), 2, 'bar'),
  three(cash(5), 6, 'safe'),
  three(boost(0.1), 7, 'key'),
  three(freeSpin(), 9, 'star'),
  three(points(150), 14, 'coin'),
  entry(points(40), 27, { match: 'pair', hint: 'Any two coins' }),
  entry(points(10), 35, { match: 'none', hint: 'No match' }),
];

const gridPrizes = [
  entry(points(30), 20),
  entry(cash(1), 12),
  entry(points(60), 17),
  entry(freeSpin(), 8),
  entry(points(120), 12),
  entry(boost(0.1), 6),
  entry(points(30), 20),
  entry(cash(10), 5),
];

const tickerPrizes = [
  entry(points(20), 30),
  entry(points(50), 24),
  entry(points(100), 16),
  entry(cash(2), 12),
  entry(boost(0.05), 8),
  entry(freeSpin(), 5),
  entry(cash(10), 3.5),
  entry(cash(50), 1.5),
];

const coinPrizes = [
  entry(cash(2), 1, { face: 'heads', hint: 'Heads' }),
  entry(points(50), 1, { face: 'tails', hint: 'Tails' }),
];

export const SLOT_SYMBOLS = Object.keys(SYMBOL_NAMES);

export const VARIANTS = [
  {
    id: 'wheel',
    name: 'Prize Wheel',
    tagline: 'Twelve equal slices under one brass pointer.',
    how: 'Every slice is equally likely, so a prize printed on three slices comes up three times as often.',
    action: 'Spin the wheel',
    prizes: wheelPrizes,
    odds: [{ rows: oddsRows(wheelPrizes, 'slice') }],
  },
  {
    id: 'needle',
    name: 'Odds Needle',
    tagline: 'The board stays still. The needle spins.',
    how: 'Each wedge is drawn as wide as its odds: a wedge twice the size is twice as likely to stop the needle.',
    action: 'Flick the needle',
    prizes: needlePrizes,
    odds: [
      {
        rows: oddsRows(needlePrizes).map((r) => ({
          ...r,
          hint: `${Math.round(r.pct * 3.6)}° of the board`,
        })),
      },
    ],
  },
  {
    id: 'double',
    name: 'Multiplier Wheel',
    tagline: 'Two rings turning opposite ways.',
    how: 'The inner wheel picks your base points and the outer ring multiplies them, up to 750 points in one turn.',
    action: 'Spin both rings',
    rings: { base: baseRing, mult: multRing },
    odds: [
      { title: 'Inner wheel: base points', rows: oddsRows(baseRing, 'slice') },
      { title: 'Outer ring: multiplier', rows: multRows() },
    ],
  },
  {
    id: 'dial',
    name: 'Vault Dial',
    tagline: 'Turn the combination. The last number decides.',
    how: 'The dial turns right, left, then right again. The band the final number lands in sets your prize, and each band is as wide as its odds.',
    action: 'Turn the dial',
    prizes: dialPrizes,
    odds: [{ rows: oddsRows(dialPrizes) }],
  },
  {
    id: 'slots',
    name: 'Coin Reels',
    tagline: 'Three reels. Match them on the middle row.',
    how: 'Three of a kind pays the matching prize, any two coins pay 40 points, and every other line still pays 10.',
    action: 'Pull the lever',
    prizes: slotPrizes,
    odds: [{ rows: oddsRows(slotPrizes) }],
  },
  {
    id: 'grid',
    name: 'Lucky Grid',
    tagline: 'A light races round eight squares and slows to a stop.',
    how: 'The light loops the board a few times before it settles. Squares are not equally likely; the odds are below.',
    action: 'Start the lights',
    prizes: gridPrizes,
    odds: [{ rows: oddsRows(gridPrizes, 'square') }],
  },
  {
    id: 'ticker',
    name: 'Prize Ticker',
    tagline: 'A reel of prize cards rolls past the marker.',
    how: 'Cards appear on the reel as often as they can be won. Rarer prizes have brighter edges.',
    action: 'Roll the ticker',
    prizes: tickerPrizes,
    odds: [{ rows: oddsRows(tickerPrizes) }],
  },
  {
    id: 'coin',
    name: 'Lucky Coin',
    tagline: 'Heads or tails, fifty-fifty.',
    how: 'One fair flip. Heads pays $2 cash back, tails pays 50 points.',
    action: 'Flip the coin',
    prizes: coinPrizes,
    odds: [{ rows: oddsRows(coinPrizes) }],
  },
];

export const VARIANTS_BY_ID = Object.fromEntries(VARIANTS.map((v) => [v.id, v]));
