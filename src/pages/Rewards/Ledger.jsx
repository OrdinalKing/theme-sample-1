import { DateTime } from 'luxon';
import { VARIANTS_BY_ID } from '../../data/rewards.js';
import PrizeGlyph from './PrizeGlyph.jsx';

function when(entry, today) {
  const t = DateTime.fromISO(entry.at);
  const yesterday = DateTime.fromISO(today).minus({ days: 1 }).toISODate();
  const day =
    entry.day === today ? 'Today' : entry.day === yesterday ? 'Yesterday' : t.toFormat('d LLL');
  return `${day}, ${t.toFormat('HH:mm')}`;
}

/** The most recent prizes paid, newest first. Spins still animating are left out. */
export default function Ledger({ log, today }) {
  const rows = log.filter((e) => !e.pending).slice(0, 12);
  return (
    <section className="ledger">
      <p className="section-label">Recent rewards</p>
      {rows.length === 0 ? (
        <div className="empty">Nothing won yet. Your first spin of the day is waiting above.</div>
      ) : (
        <ul>
          {rows.map((e) => (
            <li key={e.id} className={`t-${e.prize.tier}`}>
              <span className="l-glyph">
                <PrizeGlyph kind={e.prize.kind} />
              </span>
              <div>
                <b>{e.prize.title}</b>
                <span>
                  {VARIANTS_BY_ID[e.variant] ? VARIANTS_BY_ID[e.variant].name : 'Spinner'}
                  {e.prize.note ? ` · ${e.prize.note}` : ''}
                </span>
              </div>
              <time dateTime={e.at}>{when(e, today)}</time>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
