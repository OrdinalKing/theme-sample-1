import { useRef, useState } from 'react';
import { pickWeighted, randomInt } from '../../../utils/random.js';
import { polar, sector, spinTo } from './geometry.js';
import { motionMs, playFrames, useTurn } from './turn.js';
import SpinButton from './SpinButton.jsx';

const STEP = 3.6; // degrees per number, 0–99 round the dial
const NUMBERS = Array.from({ length: 100 }, (_, n) => n);
const RIDGES = Array.from({ length: 48 }, (_, i) => i * 7.5);
const EASE = 'cubic-bezier(0.45, 0.05, 0.3, 1)';
// Right turn, pause, left turn, pause, right turn (ms before reduced-motion scaling).
const SEGMENTS = [1900, 260, 1500, 260, 1700];

const rotate = (deg) => `rotate(${deg}deg)`;
const two = (n) => (n === null ? '––' : String(n).padStart(2, '0'));

/** A safe's combination dial. Three turns; the band under the last number pays out. */
export default function VaultDial({ variant, left, onSpin }) {
  const { prizes } = variant;
  const rotor = useRef(null);
  const angle = useRef(0);
  const [combo, setCombo] = useState([null, null, null]);
  const [landed, setLanded] = useState(null);
  const { spinning, go, timers } = useTurn(onSpin);

  const spin = () => {
    if (left < 1 || spinning) return;
    const i = pickWeighted(prizes);
    const [lo, hi] = prizes[i].range;
    const nums = [randomInt(0, 99), randomInt(0, 99), randomInt(lo, hi)];

    const r0 = angle.current;
    const r1 = spinTo(r0, -STEP * nums[0], 2, 1);
    const r2 = spinTo(r1, -STEP * nums[1], 1, -1);
    const r3 = spinTo(r2, -STEP * nums[2], 1, 1);
    angle.current = r3;

    const total = motionMs(SEGMENTS.reduce((a, b) => a + b, 0));
    const scale = total / SEGMENTS.reduce((a, b) => a + b, 0);
    const seg = SEGMENTS.map((ms) => ms * scale);
    let t = 0;
    const at = seg.map((ms) => (t += ms) / total);
    playFrames(
      rotor.current,
      [
        { transform: rotate(r0), offset: 0, easing: EASE },
        { transform: rotate(r1), offset: at[0], easing: 'linear' },
        { transform: rotate(r1), offset: at[1], easing: EASE },
        { transform: rotate(r2), offset: at[2], easing: 'linear' },
        { transform: rotate(r2), offset: at[3], easing: EASE },
        { transform: rotate(r3), offset: 1 },
      ],
      { duration: total }
    );

    setCombo([null, null, null]);
    setLanded(null);
    timers.timeout(() => setCombo([nums[0], null, null]), seg[0]);
    timers.timeout(() => setCombo([nums[0], nums[1], null]), seg[0] + seg[1] + seg[2]);
    go(prizes[i], total + 150, () => {
      setCombo(nums);
      setLanded(i);
    });
  };

  return (
    <>
      <div
        className={`wheel vault-dial${spinning ? ' is-spinning' : ''}${
          landed !== null ? ' is-open' : ''
        }`}
      >
        <div className="rotor" ref={rotor}>
          <svg viewBox="-200 -200 400 400" aria-hidden="true">
            <defs>
              <radialGradient id="vault-dial-face" cx="40%" cy="35%" r="75%">
                <stop offset="0" stopColor="#24313e" />
                <stop offset="1" stopColor="#0d141c" />
              </radialGradient>
            </defs>
            <circle className="face" r="184" fill="url(#vault-dial-face)" />
            {prizes.map((p, i) => (
              <path
                key={i}
                className={`band t-${p.tier}${landed === i ? ' is-landed' : ''}`}
                d={sector(118, 132, p.range[0] * STEP - STEP / 2, p.range[1] * STEP + STEP / 2)}
              />
            ))}
            {NUMBERS.map((n) => {
              const a = n * STEP;
              const len = n % 10 === 0 ? 18 : n % 5 === 0 ? 12 : 7;
              const [x1, y1] = polar(182, a);
              const [x2, y2] = polar(182 - len, a);
              return (
                <line
                  key={n}
                  className={n % 10 === 0 ? 'tick major' : 'tick'}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                />
              );
            })}
            {NUMBERS.filter((n) => n % 10 === 0).map((n) => (
              <text key={n} className="num" transform={`rotate(${n * STEP})`} y="-144">
                {n}
              </text>
            ))}
            <circle className="knob-ring" r="104" />
            {RIDGES.map((a) => {
              const [x1, y1] = polar(94, a);
              const [x2, y2] = polar(104, a);
              return <line key={a} className="ridge" x1={x1} y1={y1} x2={x2} y2={y2} />;
            })}
            <circle className="knob" r="88" />
            <circle className="knob-inner" r="56" />
            <path className="knob-grip" d="M0 -84V-62" />
          </svg>
        </div>
        <svg
          className="wheel-overlay"
          viewBox="-200 -200 400 400"
          overflow="visible"
          aria-hidden="true"
        >
          <circle className="bezel" r="192" />
          <path className="pointer" d="M-10 -203L10 -203L0 -184Z" />
        </svg>
      </div>

      <div className={`readout combo${landed !== null ? ' is-done' : ''}`} aria-hidden="true">
        <span>{two(combo[0])}</span>
        <i>–</i>
        <span>{two(combo[1])}</span>
        <i>–</i>
        <b>{two(combo[2])}</b>
      </div>
      <SpinButton label={variant.action} left={left} spinning={spinning} onClick={spin} />
    </>
  );
}
