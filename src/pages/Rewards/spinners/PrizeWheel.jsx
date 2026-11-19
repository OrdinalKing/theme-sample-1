import { useRef, useState } from 'react';
import { pickWeighted, random } from '../../../utils/random.js';
import { polar, sector, spinTo } from './geometry.js';
import { motionMs, playFrames, useTurn } from './turn.js';
import SpinButton from './SpinButton.jsx';
import { WheelHub, WheelPointer } from './WheelParts.jsx';

const R = 178;

/** Classic wheel: equal slices rotate under a fixed pointer. */
export default function PrizeWheel({ variant, left, onSpin }) {
  const { prizes } = variant;
  const slice = 360 / prizes.length;
  const rotor = useRef(null);
  const angle = useRef(0);
  const [landed, setLanded] = useState(null);
  const { spinning, go } = useTurn(onSpin);

  const spin = () => {
    if (left < 1 || spinning) return;
    const i = pickWeighted(prizes);
    const jitter = (random() - 0.5) * slice * 0.7;
    const from = angle.current;
    const to = spinTo(from, -(i * slice + jitter), 6);
    angle.current = to;
    const ms = motionMs(5200);
    playFrames(
      rotor.current,
      [{ transform: `rotate(${from}deg)` }, { transform: `rotate(${to}deg)` }],
      {
        duration: ms,
        easing: 'cubic-bezier(0.15, 0.75, 0.12, 1)',
      }
    );
    setLanded(null);
    go(prizes[i], ms + 120, () => setLanded(i));
  };

  return (
    <>
      <div className={`wheel prize-wheel${spinning ? ' is-spinning' : ''}`}>
        <div className="rotor" ref={rotor}>
          <svg viewBox="-200 -200 400 400" aria-hidden="true">
            <circle className="rim" r="194" />
            {prizes.map((p, i) => (
              <g key={i} className={`slice t-${p.tier} ${i % 2 ? 'odd' : 'even'}`}>
                <path d={sector(0, R, i * slice - slice / 2, i * slice + slice / 2)} />
                <g transform={`rotate(${i * slice})`}>
                  <text className="v" y="-128">
                    {p.value}
                  </text>
                  <text className="u" y="-111">
                    {p.unit}
                  </text>
                </g>
              </g>
            ))}
            {landed !== null && (
              <path
                className="landed-outline"
                d={sector(0, R, landed * slice - slice / 2, landed * slice + slice / 2)}
              />
            )}
            {prizes.map((_, i) => {
              const [x, y] = polar(186, i * slice - slice / 2);
              return <circle key={i} className="bulb" cx={x} cy={y} r="3.4" />;
            })}
          </svg>
        </div>
        <WheelPointer />
        <WheelHub />
      </div>
      <SpinButton label={variant.action} left={left} spinning={spinning} onClick={spin} />
    </>
  );
}
