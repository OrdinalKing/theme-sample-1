import PrizeGlyph from './PrizeGlyph.jsx';

const pct = (n) => `${n >= 10 || Number.isInteger(n) ? Math.round(n) : n.toFixed(1)}%`;

/** Every prize a spinner can pay, with its chance per turn. */
export default function OddsTable({ groups }) {
  return groups.map((g, gi) => (
    <div className="odds" key={gi}>
      <p className="odds-title">{g.title || 'Prizes and odds per turn'}</p>
      <ul>
        {g.rows.map((r) => (
          <li key={r.title + r.hint} className={`t-${r.tier}`}>
            <PrizeGlyph kind={r.kind} />
            <span className="o-name">
              {r.title}
              {r.hint && <small>{r.hint}</small>}
            </span>
            <span className="o-pct fig">{pct(r.pct)}</span>
            <i className="o-bar" style={{ width: `${r.pct}%` }} aria-hidden="true" />
          </li>
        ))}
      </ul>
    </div>
  ));
}
