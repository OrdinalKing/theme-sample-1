import { useState } from 'react';
import { pickWeighted } from '../../../utils/random.js';
import PrizeGlyph from '../PrizeGlyph.jsx';
import { posMod } from './geometry.js';
import { prefersReducedMotion, useTurn } from './turn.js';
import SpinButton from './SpinButton.jsx';

// Grid cell (0–8, row by row) for each step round the edge, clockwise from top left.
const RING = [0, 1, 2, 5, 8, 7, 6, 3];

/** A light chases round the eight outer squares of a 3×3 board and slows to a stop. */
export default function LuckyGrid({ variant, left, onSpin }) {
  const { prizes } = variant;
  const [lit, setLit] = useState(null);
  const [landed, setLanded] = useState(false);
  const { spinning, go, timers } = useTurn(onSpin);

  const spin = () => {
    if (left < 1 || spinning) return;
    const target = pickWeighted(prizes);
    const start = lit ?? RING.length - 1;
    const offset = posMod(target - start, RING.length) || RING.length;
    const quick = prefersReducedMotion();
    const steps = quick ? offset : RING.length * 4 + offset;
    let t = 0;
    for (let s = 1; s <= steps; s++) {
      t += quick ? 40 : 42 + 380 * (s / steps) ** 3;
      const idx = (start + s) % RING.length;
      timers.timeout(() => setLit(idx), t);
    }
    setLanded(false);
    go(prizes[target], t + 350, () => setLanded(true));
  };

  const cellClass = (p) => {
    if (lit === null) return '';
    if (p === lit) return landed ? ' lit won' : ' lit';
    if (!spinning) return '';
    if (p === posMod(lit - 1, RING.length)) return ' trail1';
    if (p === posMod(lit - 2, RING.length)) return ' trail2';
    return '';
  };

  const won = landed && lit !== null ? prizes[lit] : null;

  return (
    <>
      <div className={`lucky-grid${spinning ? ' is-spinning' : ''}`}>
        {Array.from({ length: 9 }, (_, g) => {
          if (g === 4) {
            return (
              <div
                key={g}
                className={`cell center${won ? ` t-${won.tier}` : ''}`}
                aria-hidden="true"
              >
                {won ? (
                  <>
                    <small>You won</small>
                    <strong>{won.value}</strong>
                    <small>{won.unit}</small>
                  </>
                ) : (
                  <>
                    <strong>{spinning ? '•••' : 'GO'}</strong>
                    <small>{spinning ? 'Slowing down' : '8 prizes'}</small>
                  </>
                )}
              </div>
            );
          }
          const p = RING.indexOf(g);
          const prize = prizes[p];
          return (
            <div key={g} className={`cell t-${prize.tier}${cellClass(p)}`} aria-hidden="true">
              <PrizeGlyph kind={prize.kind} />
              <strong>{prize.value}</strong>
              <small>{prize.unit}</small>
            </div>
          );
        })}
      </div>
      <SpinButton label={variant.action} left={left} spinning={spinning} onClick={spin} />
    </>
  );
}
