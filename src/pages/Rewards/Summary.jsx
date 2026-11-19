import { useEffect, useState } from 'react';
import { DateTime } from 'luxon';
import { VARIANTS } from '../../data/rewards.js';
import { spinsLeftFor, streakOf } from '../../store/rewardsSlice.js';
import { useTimers } from '../../hooks/useTimers.js';
import { money } from '../../utils/format.js';

const shortDate = (iso) => DateTime.fromISO(iso).toFormat('d LLL');

/** Time to local midnight, when every spinner gets its turn back. Calls onRollover with the new date. */
export function Countdown({ today, onRollover }) {
  const timers = useTimers();
  const [now, setNow] = useState(() => DateTime.local());

  useEffect(() => {
    const id = timers.interval(() => setNow(DateTime.local()), 1000);
    return () => timers.clear(id);
  }, [timers]);

  const day = now.toISODate();
  useEffect(() => {
    if (day !== today) onRollover(day);
  }, [day, today, onRollover]);

  return (
    <div className="countdown">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 7.5V12l3 2" strokeLinecap="round" />
      </svg>
      <span>
        New spins in <b className="fig">{now.endOf('day').diff(now).toFormat('hh:mm:ss')}</b>
      </span>
    </div>
  );
}

export default function Summary({ rewards, today }) {
  const left = VARIANTS.reduce((n, v) => n + spinsLeftFor(rewards, v.id, today), 0);
  const active = rewards.boosts.filter((b) => b.until >= today);
  const boostPct = active.reduce((sum, b) => sum + b.pct, 0);
  const latest = active.reduce((max, b) => (b.until > max ? b.until : max), '');
  const streak = streakOf(rewards.days, today);
  const spun = new Set(rewards.days);
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = DateTime.fromISO(today).minus({ days: 6 - i });
    return { iso: d.toISODate(), label: d.toFormat('ccccc'), long: d.toFormat('cccc d LLL') };
  });

  return (
    <section className="summary">
      <div className="stat">
        <span>Turns left today</span>
        <strong className="fig">{left}</strong>
        <em>across {VARIANTS.length} spinners</em>
      </div>
      <div className="stat">
        <span>Reward points</span>
        <strong className="fig">{rewards.points.toLocaleString('en-US')}</strong>
        <em>from daily spins</em>
      </div>
      <div className="stat">
        <span>Cash back earned</span>
        <strong className="fig up">{money(rewards.cash)}</strong>
        <em>paid with interest</em>
      </div>
      <div className="stat">
        <span>Interest boost</span>
        <strong className="fig up">{active.length ? `+${boostPct.toFixed(2)}%` : '—'}</strong>
        <em>
          {active.length === 0
            ? 'none active'
            : active.length === 1
            ? `until ${shortDate(latest)}`
            : `${active.length} boosts, last ends ${shortDate(latest)}`}
        </em>
      </div>
      <div className="streak">
        <span>
          {streak ? (
            <>
              <b className="fig">{streak}</b>-day streak
            </>
          ) : (
            'Start a streak today'
          )}
        </span>
        <ol>
          {week.map((d) => {
            const done = spun.has(d.iso);
            return (
              <li
                key={d.iso}
                className={`${done ? 'done' : ''}${d.iso === today ? ' today' : ''}`}
                title={`${d.long}${done ? ': spun' : ''}`}
              >
                <i aria-hidden="true">
                  {done && (
                    <svg viewBox="0 0 24 24">
                      <path d="M6 12.5l4 4 8-9" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </i>
                <small>{d.label}</small>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
