/** The main control under every spinner. `left` is the turns this spinner has left today. */
export default function SpinButton({ label, left, spinning, onClick }) {
  let text = label;
  if (spinning) text = 'Spinning…';
  else if (left < 1) text = 'Spun today · back at midnight';

  return (
    <div className="spin-control">
      <button
        type="button"
        className="spin-btn"
        onClick={onClick}
        disabled={spinning || left < 1}
        aria-busy={spinning}
      >
        {text}
      </button>
      {!spinning && left > 1 && <span className="spin-extra">{left} turns left today</span>}
    </div>
  );
}
