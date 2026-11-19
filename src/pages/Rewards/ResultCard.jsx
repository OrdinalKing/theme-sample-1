import { DateTime } from 'luxon';
import PrizeGlyph from './PrizeGlyph.jsx';

function detail(entry, points) {
  const p = entry.prize;
  switch (p.kind) {
    case 'points':
      return `Your points balance is now ${points.toLocaleString('en-US')}.`;
    case 'cash':
      return 'Added to your cash back, paid out with your next interest payment.';
    case 'boost': {
      const until = DateTime.fromISO(entry.day).plus({ days: p.days }).toFormat('d LLLL');
      return `Your vaults earn an extra ${p.amount.toFixed(2)}% a year until ${until}.`;
    }
    case 'spin':
      return 'This spinner has another turn for you. Go again whenever you like.';
    default:
      return '';
  }
}

/** What the last spin paid. Lives inside an aria-live region on the page. */
export default function ResultCard({ entry, points }) {
  const p = entry.prize;
  return (
    <div className={`result t-${p.tier}`}>
      <span className="result-glyph">
        <PrizeGlyph kind={p.kind} />
      </span>
      <div>
        <span className="result-kicker">You won</span>
        <strong className="result-title">
          {p.title}
          {p.note && <em> ({p.note})</em>}
        </strong>
        <p>{detail(entry, points)}</p>
      </div>
    </div>
  );
}
