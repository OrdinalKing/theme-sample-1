import { useMemo, useRef, useState } from 'react';
import { pickWeighted, random } from '../../../utils/random.js';
import { polar, sector, spinTo } from './geometry.js';
import { motionMs, playFrames, useTurn } from './turn.js';
import SpinButton from './SpinButton.jsx';
import { WheelHub } from './WheelParts.jsx';

const R = 178;
const TICKS = Array.from({ length: 36 }, (_, i) => i * 10);

/** A still board with wedges sized by their odds; the needle does the spinning. */
export default function OddsNeedle({ variant, left, onSpin }) {
  const { prizes } = variant;
  const needle = useRef(null);
  const angle = useRef(0);
  const [landed, setLanded] = useState(null);
  const { spinning, go } = useTurn(onSpin);

  const wedges = useMemo(() => {
    const total = prizes.reduce((sum, p) => sum + p.weight, 0);
    let a = 0;
    return prizes.map((p) => {
      const span = (p.weight / total) * 360;
      const w = { p, a0: a, a1: a + span, mid: a + span / 2, span };
      a += span;
      return w;
    });
  }, [prizes]);

  const spin = () => {
    if (left < 1 || spinning) return;
    const i = pickWeighted(prizes);
    const w = wedges[i];
    const from = angle.current;
    const to = spinTo(from, w.a0 + w.span * (0.15 + 0.7 * random()), 5);
    angle.current = to;
    const ms = motionMs(4800);
    playFrames(
      needle.current,
      [{ transform: `rotate(${from}deg)` }, { transform: `rotate(${to}deg)` }],
      {
        duration: ms,
        easing: 'cubic-bezier(0.2, 0.8, 0.15, 1)',
      }
    );
    setLanded(null);
    go(prizes[i], ms + 120, () => setLanded(i));
  };

  return (
    <>
      <div className={`wheel odds-needle${spinning ? ' is-spinning' : ''}`}>
        <svg className="board" viewBox="-200 -200 400 400" aria-hidden="true">
          <circle className="rim" r="194" />
          {TICKS.map((a) => {
            const [x1, y1] = polar(184, a);
            const [x2, y2] = polar(a % 90 ? 189 : 192, a);
            return <line key={a} className="tick" x1={x1} y1={y1} x2={x2} y2={y2} />;
          })}
          {wedges.map(({ p, a0, a1, mid, span }, i) => (
            <g key={i} className={`slice t-${p.tier} ${i % 2 ? 'odd' : 'even'}`}>
              <path d={sector(0, R, a0, a1)} />
              <g transform={`rotate(${mid})`}>
                <text className={span < 40 ? 'v small' : 'v'} y={span < 40 ? -132 : -126}>
                  {p.value}
                </text>
                {span >= 40 && (
                  <text className="u" y="-109">
                    {p.unit}
                  </text>
                )}
              </g>
            </g>
          ))}
          {landed !== null && (
            <path
              className="landed-outline"
              d={sector(0, R, wedges[landed].a0, wedges[landed].a1)}
            />
          )}
        </svg>
        <div className="rotor" ref={needle}>
          <svg viewBox="-200 -200 400 400" aria-hidden="true">
            <path className="needle-tail" d="M0 0L-9 4L-6 46L0 52L6 46L9 4Z" />
            <path className="needle" d="M0 -166L10 -18L0 6L-10 -18Z" />
            <path className="needle-shine" d="M0 -166L0 6L-10 -18Z" />
          </svg>
        </div>
        <WheelHub size="17%" />
      </div>
      <SpinButton label={variant.action} left={left} spinning={spinning} onClick={spin} />
    </>
  );
}
