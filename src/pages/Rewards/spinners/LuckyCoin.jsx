import { useRef, useState } from 'react';
import BrandMark from '../../../components/BrandMark.jsx';
import { pickWeighted } from '../../../utils/random.js';
import { spinTo } from './geometry.js';
import { motionMs, playFrames, useTurn } from './turn.js';
import SpinButton from './SpinButton.jsx';

const EDGES = [-3, -1.5, 0, 1.5, 3];
const toss = (y, deg) => `translateY(${y}px) rotateX(${deg}deg)`;

/** One fair coin, tossed end over end. */
export default function LuckyCoin({ variant, left, onSpin }) {
  const { prizes } = variant;
  const heads = prizes.find((p) => p.face === 'heads');
  const tails = prizes.find((p) => p.face === 'tails');
  const coin = useRef(null);
  const shadow = useRef(null);
  const angle = useRef(0);
  const [face, setFace] = useState(null);
  const { spinning, go } = useTurn(onSpin);

  const spin = () => {
    if (left < 1 || spinning) return;
    const p = prizes[pickWeighted(prizes)];
    const from = angle.current;
    const to = spinTo(from, p.face === 'heads' ? 0 : 180, 6);
    angle.current = to;
    const mid = from + (to - from) * 0.55;
    const ms = motionMs(2600);
    playFrames(
      coin.current,
      [
        { transform: toss(0, from), easing: 'cubic-bezier(0.2, 0.7, 0.4, 1)' },
        { transform: toss(-140, mid), offset: 0.42, easing: 'cubic-bezier(0.6, 0, 0.85, 0.5)' },
        { transform: toss(0, to - 16), offset: 0.84, easing: 'ease-out' },
        { transform: toss(-12, to - 4), offset: 0.92, easing: 'ease-in' },
        { transform: toss(0, to) },
      ],
      { duration: ms }
    );
    playFrames(
      shadow.current,
      [
        { transform: 'scale(1)', opacity: 1 },
        { transform: 'scale(0.45)', opacity: 0.35, offset: 0.42 },
        { transform: 'scale(1)', opacity: 1, offset: 0.84 },
        { transform: 'scale(0.9)', opacity: 0.85, offset: 0.92 },
        { transform: 'scale(1)', opacity: 1 },
      ],
      { duration: ms }
    );
    setFace(null);
    go(p, ms + 120, () => setFace(p.face));
  };

  return (
    <>
      <div className={`coin-stage${spinning ? ' is-spinning' : ''}`}>
        <div className="coin" ref={coin} aria-hidden="true">
          {EDGES.map((z) => (
            <i key={z} className="coin-edge" style={{ transform: `translateZ(${z}px)` }} />
          ))}
          <div className="coin-face heads">
            <BrandMark />
            <b>Heads</b>
            <small>{heads.title}</small>
          </div>
          <div className="coin-face tails">
            <strong>{tails.value}</strong>
            <b>Tails</b>
            <small>{tails.unit}</small>
          </div>
        </div>
        <i className="coin-shadow" ref={shadow} aria-hidden="true" />
      </div>
      <div className={`readout${face ? ' is-done' : ''}`} aria-hidden="true">
        <span className={face === 'heads' ? 'pick' : ''}>Heads · {heads.value}</span>
        <i>or</i>
        <span className={face === 'tails' ? 'pick' : ''}>Tails · {tails.value} pts</span>
      </div>
      <SpinButton label={variant.action} left={left} spinning={spinning} onClick={spin} />
    </>
  );
}
