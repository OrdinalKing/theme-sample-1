import { useRef, useState } from 'react';
import { entry, points } from '../../../data/rewards.js';
import { random, randomInt } from '../../../utils/random.js';
import { sector, spinTo } from './geometry.js';
import { motionMs, playFrames, useTurn } from './turn.js';
import SpinButton from './SpinButton.jsx';
import { WheelHub, WheelPointer } from './WheelParts.jsx';

const INNER = 138;
const OUTER0 = 146;
const OUTER1 = 190;
const EASE = 'cubic-bezier(0.15, 0.75, 0.12, 1)';

const multTier = (m) => (m >= 5 ? 'top' : m >= 3 ? 'rare' : 'common');
const rotate = (deg) => `rotate(${deg}deg)`;

/** Inner wheel of base points and an outer ring of multipliers, spinning opposite ways. */
export default function MultiplierWheel({ variant, left, onSpin }) {
  const { base, mult } = variant.rings;
  const bs = 360 / base.length;
  const ms = 360 / mult.length;
  const inner = useRef(null);
  const outer = useRef(null);
  const angles = useRef({ inner: 0, outer: 0 });
  const [shown, setShown] = useState({ b: null, m: null });
  const { spinning, go, timers } = useTurn(onSpin);

  const spin = () => {
    if (left < 1 || spinning) return;
    const bi = randomInt(0, base.length - 1);
    const mi = randomInt(0, mult.length - 1);
    const b = base[bi].amount;
    const m = mult[mi];

    const a = angles.current;
    const inTo = spinTo(a.inner, -(bi * bs + (random() - 0.5) * bs * 0.6), 5, 1);
    const outTo = spinTo(a.outer, -(mi * ms + (random() - 0.5) * ms * 0.6), 4, -1);
    const tIn = motionMs(4300);
    const tOut = motionMs(5600);
    playFrames(inner.current, [{ transform: rotate(a.inner) }, { transform: rotate(inTo) }], {
      duration: tIn,
      easing: EASE,
    });
    playFrames(outer.current, [{ transform: rotate(a.outer) }, { transform: rotate(outTo) }], {
      duration: tOut,
      easing: EASE,
    });
    angles.current = { inner: inTo, outer: outTo };

    setShown({ b: null, m: null });
    timers.timeout(() => setShown({ b, m: null }), tIn);
    const prize = entry({ ...points(b * m), note: `${b} × ${m}` }, 1);
    go(prize, tOut + 150, () => setShown({ b, m }));
  };

  const done = shown.b !== null && shown.m !== null;

  return (
    <>
      <div className={`wheel multiplier-wheel${spinning ? ' is-spinning' : ''}`}>
        <div className="rotor" ref={outer}>
          <svg viewBox="-200 -200 400 400" aria-hidden="true">
            <circle className="rim" r="196" />
            {mult.map((m, i) => (
              <g key={i} className={`slice ring t-${multTier(m)} ${i % 2 ? 'odd' : 'even'}`}>
                <path d={sector(OUTER0, OUTER1, i * ms - ms / 2, i * ms + ms / 2)} />
                <text className="v mult" transform={`rotate(${i * ms})`} y="-161">
                  ×{m}
                </text>
              </g>
            ))}
          </svg>
        </div>
        <div className="rotor" ref={inner}>
          <svg viewBox="-200 -200 400 400" aria-hidden="true">
            {base.map((p, i) => (
              <g key={i} className={`slice t-${p.tier} ${i % 2 ? 'odd' : 'even'}`}>
                <path d={sector(0, INNER, i * bs - bs / 2, i * bs + bs / 2)} />
                <g transform={`rotate(${i * bs})`}>
                  <text className="v" y="-98">
                    {p.value}
                  </text>
                  <text className="u" y="-81">
                    points
                  </text>
                </g>
              </g>
            ))}
          </svg>
        </div>
        <WheelPointer>
          <path className="pointer notch" d="M-8 -146L8 -146L0 -133Z" />
        </WheelPointer>
        <WheelHub size="17%" />
      </div>

      <div className={`readout${done ? ' is-done' : ''}`} aria-hidden="true">
        <span>{shown.b ?? '—'}</span>
        <i>×</i>
        <span>{shown.m ?? '—'}</span>
        <i>=</i>
        <b>{done ? (shown.b * shown.m).toLocaleString('en-US') : '—'}</b>
        <small>points</small>
      </div>
      <SpinButton label={variant.action} left={left} spinning={spinning} onClick={spin} />
    </>
  );
}
