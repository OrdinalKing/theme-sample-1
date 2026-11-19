// Angles are degrees clockwise from 12 o'clock, in SVGs whose origin is the centre.

const r2 = (n) => Math.round(n * 100) / 100;

export function polar(r, deg) {
  const a = (deg * Math.PI) / 180;
  return [r2(r * Math.sin(a)), r2(-r * Math.cos(a))];
}

/** A pie slice (r0 = 0) or ring segment from angle a0 to a1. */
export function sector(r0, r1, a0, a1) {
  const large = a1 - a0 > 180 ? 1 : 0;
  const [x1, y1] = polar(r1, a0);
  const [x2, y2] = polar(r1, a1);
  if (!r0) return `M0 0L${x1} ${y1}A${r1} ${r1} 0 ${large} 1 ${x2} ${y2}Z`;
  const [x3, y3] = polar(r0, a1);
  const [x4, y4] = polar(r0, a0);
  return `M${x1} ${y1}A${r1} ${r1} 0 ${large} 1 ${x2} ${y2}L${x3} ${y3}A${r0} ${r0} 0 ${large} 0 ${x4} ${y4}Z`;
}

export const posMod = (n, m) => ((n % m) + m) % m;

/**
 * A rotation at least `turns` full turns past `from`, clockwise (dir 1) or
 * anticlockwise (dir -1), that ends on `target` (mod 360).
 * A wheel under a fixed top pointer lands on angle θ with target -θ;
 * a needle over a fixed board lands on θ with target θ.
 */
export function spinTo(from, target, turns, dir = 1) {
  return dir > 0
    ? from + turns * 360 + posMod(target - from, 360)
    : from - turns * 360 - posMod(from - target, 360);
}
