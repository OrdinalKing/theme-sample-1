import { useLayoutEffect, useRef, useState } from 'react';
import { SLOT_SYMBOLS } from '../../../data/rewards.js';
import { pickOne, pickWeighted, randomInt } from '../../../utils/random.js';
import { motionMs, playFrames, useTurn } from './turn.js';
import SpinButton from './SpinButton.jsx';

const SYMBOL_ART = {
  coin: (
    <>
      <circle cx="24" cy="24" r="15" fill="#d9a441" stroke="#f2d293" strokeWidth="2" />
      <circle cx="24" cy="24" r="9.5" fill="none" stroke="#7a5e27" strokeWidth="2" />
      <path d="M24 18.5v11" stroke="#7a5e27" strokeWidth="2.6" strokeLinecap="round" />
    </>
  ),
  bar: (
    <>
      <path d="M17 13h14l3 7H14z" fill="#f2d293" />
      <path
        d="M14 20h20l5 14H9z"
        fill="#d9a441"
        stroke="#f2d293"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M18 27h12" stroke="#7a5e27" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  safe: (
    <>
      <rect
        x="9"
        y="10"
        width="30"
        height="28"
        rx="4"
        fill="#1c2733"
        stroke="#7c8a99"
        strokeWidth="1.6"
      />
      <circle cx="23" cy="24" r="7" fill="none" stroke="#d9a441" strokeWidth="2" />
      <circle cx="23" cy="24" r="2" fill="#d9a441" />
      <path d="M34 20v8" stroke="#d9a441" strokeWidth="2.4" strokeLinecap="round" />
    </>
  ),
  key: (
    <>
      <circle cx="15.5" cy="24" r="7" fill="none" stroke="#63e6d2" strokeWidth="3" />
      <path
        d="M22.5 24H40M35 24v6M39.5 24v4.5"
        stroke="#63e6d2"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </>
  ),
  star: (
    <path
      d="M24 9L28.1 19.3L39.2 20.1L30.7 27.2L33.4 37.9L24 32L14.6 37.9L17.3 27.2L8.8 20.1L19.9 19.3Z"
      fill="#e6ecf2"
      stroke="#ffffff"
      strokeWidth="1"
      strokeLinejoin="round"
    />
  ),
};

const REEL_MS = [1700, 2300, 2900];

/** The middle-row symbols that pay out this prize. */
function stopsFor(prize) {
  if (prize.combo) return prize.combo;
  if (prize.match === 'pair') {
    const stops = ['coin', 'coin', 'coin'];
    stops[randomInt(0, 2)] = pickOne(SLOT_SYMBOLS.filter((s) => s !== 'coin'));
    return stops;
  }
  const stops = [];
  while (stops.length < 3) stops.push(pickOne(SLOT_SYMBOLS.filter((s) => !stops.includes(s))));
  return stops;
}

const winsFor = (prize, stops) =>
  prize.combo ? [true, true, true] : stops.map((s) => prize.match === 'pair' && s === 'coin');

function ReelSymbol({ name, win }) {
  return (
    <div className={win ? 'sym win' : 'sym'}>
      <svg viewBox="0 0 48 48" aria-hidden="true">
        {SYMBOL_ART[name]}
      </svg>
    </div>
  );
}

/** Three reels that stop one after another; match symbols on the middle row. */
export default function SlotReels({ variant, left, onSpin }) {
  const { prizes } = variant;
  const reels = useRef([]);
  const [strips, setStrips] = useState(() =>
    [0, 1, 2].map(() => [pickOne(SLOT_SYMBOLS), pickOne(SLOT_SYMBOLS), pickOne(SLOT_SYMBOLS)])
  );
  const [run, setRun] = useState(null);
  const [wins, setWins] = useState([false, false, false]);
  const { spinning, go } = useTurn(onSpin);

  // After a new strip renders, slide it from its first three symbols to its last three.
  useLayoutEffect(() => {
    if (!run) return;
    reels.current.forEach((el, r) => {
      const n = run.lengths[r];
      playFrames(
        el,
        [{ transform: 'translateY(0%)' }, { transform: `translateY(-${((n - 3) / n) * 100}%)` }],
        {
          duration: run.ms[r],
          easing: 'cubic-bezier(0.25, 0.85, 0.35, 1.04)',
        }
      );
    });
  }, [run]);

  const spin = () => {
    if (left < 1 || spinning) return;
    const prize = prizes[pickWeighted(prizes)];
    const stops = stopsFor(prize);
    const next = strips.map((strip, r) => [
      ...strip.slice(-3),
      ...Array.from({ length: 16 + r * 6 }, () => pickOne(SLOT_SYMBOLS)),
      pickOne(SLOT_SYMBOLS),
      stops[r],
      pickOne(SLOT_SYMBOLS),
    ]);
    const ms = REEL_MS.map(motionMs);
    setStrips(next);
    setWins([false, false, false]);
    setRun({ ms, lengths: next.map((strip) => strip.length) });
    go(prize, ms[2] + 200, () => setWins(winsFor(prize, stops)));
  };

  return (
    <>
      <div className={`slots${spinning ? ' is-spinning' : ''}`}>
        <div className="slots-head" aria-hidden="true">
          <span>Aurum</span>
          <b>Coin Reels</b>
          <span>Daily</span>
        </div>
        <div className="reels">
          {strips.map((strip, r) => (
            <div className="reel-window" key={r}>
              <div className="reel-strip" ref={(el) => (reels.current[r] = el)}>
                {strip.map((name, k) => (
                  <ReelSymbol key={k} name={name} win={k === strip.length - 2 && wins[r]} />
                ))}
              </div>
            </div>
          ))}
          <div className="payline" aria-hidden="true" />
        </div>
        <div className="lever" aria-hidden="true">
          <i className="lever-arm" />
          <b className="lever-knob" />
        </div>
      </div>
      <SpinButton label={variant.action} left={left} spinning={spinning} onClick={spin} />
    </>
  );
}
