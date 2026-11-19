import { useLayoutEffect, useRef, useState } from 'react';
import { pickWeighted, random } from '../../../utils/random.js';
import PrizeGlyph from '../PrizeGlyph.jsx';
import { motionMs, playFrames, useTurn } from './turn.js';
import SpinButton from './SpinButton.jsx';

const CARD = 112;
const GAP = 10;
const STEP = CARD + GAP;
const RUN_UP = 34; // cards that roll past before the winner
const KEEP_BEHIND = 6; // cards kept to the left of the marker between spins

// The strip's left edge sits on the marker, so card `pos` is centred at this offset.
const offset = (pos) => `translateX(${-(pos * STEP + CARD / 2)}px)`;

/** A horizontal reel of prize cards that rolls past a centre marker and slows to a stop. */
export default function PrizeTicker({ variant, left, onSpin }) {
  const { prizes } = variant;
  const strip = useRef(null);
  const nextId = useRef(0);
  const pos = useRef(5);
  const card = (p) => ({ id: nextId.current++, p });
  const randomCard = () => card(prizes[pickWeighted(prizes)]);
  const [cards, setCards] = useState(() => Array.from({ length: 24 }, randomCard));
  const [run, setRun] = useState(null);
  const [landed, setLanded] = useState(null);
  const { spinning, go } = useTurn(onSpin);

  useLayoutEffect(() => {
    if (!run) {
      strip.current.style.transform = offset(pos.current);
      return;
    }
    playFrames(strip.current, [{ transform: offset(run.from) }, { transform: offset(run.to) }], {
      duration: run.ms,
      easing: 'cubic-bezier(0.08, 0.6, 0.12, 1)',
    });
  }, [run]);

  const spin = () => {
    if (left < 1 || spinning) return;
    const i = pickWeighted(prizes);
    // Drop cards that are well off to the left, then queue the run-up and the winner.
    const drop = Math.max(0, Math.floor(pos.current) - KEEP_BEHIND);
    const kept = cards.slice(drop);
    const from = pos.current - drop;
    const winAt = kept.length + RUN_UP;
    const winner = card(prizes[i]);
    const next = [
      ...kept,
      ...Array.from({ length: RUN_UP }, randomCard),
      winner,
      ...Array.from({ length: 6 }, randomCard),
    ];
    const to = winAt + (random() - 0.5) * 0.7;
    pos.current = to;
    const ms = motionMs(6000);
    setCards(next);
    setLanded(null);
    setRun({ from, to, ms });
    go(prizes[i], ms + 150, () => setLanded(winner.id));
  };

  return (
    <>
      <div
        className={`ticker${spinning ? ' is-spinning' : ''}`}
        style={{ '--card': `${CARD}px`, '--gap': `${GAP}px` }}
      >
        <div className="ticker-strip" ref={strip} aria-hidden="true">
          {cards.map(({ id, p }) => (
            <div key={id} className={`tcard t-${p.tier}${landed === id ? ' is-landed' : ''}`}>
              <PrizeGlyph kind={p.kind} />
              <strong>{p.value}</strong>
              <small>{p.unit}</small>
            </div>
          ))}
        </div>
        <div className="ticker-marker" aria-hidden="true" />
      </div>
      <p className="ticker-note">Rarer prizes glow teal and brass. The marker picks the card.</p>
      <SpinButton label={variant.action} left={left} spinning={spinning} onClick={spin} />
    </>
  );
}
