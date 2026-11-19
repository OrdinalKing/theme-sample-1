import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import VaultLayout from '../../components/VaultLayout.jsx';
import SafeIcon from '../../components/SafeIcon.jsx';
import Sparkline from './Sparkline.jsx';
import { ACCOUNTS, ACCOUNTS_BY_ID } from '../../data/accounts.js';
import { formatDay, money, signed } from '../../utils/format.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import './HistoryPage.css';

const AUTH = {
  face: {
    label: 'Face',
    cls: '',
    icon: (
      <>
        <path d="M4 8V5a1 1 0 011-1h3M20 8V5a1 1 0 00-1-1h-3M4 16v3a1 1 0 001 1h3M20 16v3a1 1 0 01-1 1h-3" />
        <circle cx="9.5" cy="10.5" r=".9" />
        <circle cx="14.5" cy="10.5" r=".9" />
        <path d="M9.5 15c1.6 1.2 3.4 1.2 5 0" />
      </>
    ),
  },
  print: {
    label: 'Fingerprint',
    cls: '',
    icon: (
      <path d="M12 3c-4.4 0-7 3.2-7 7 0 4-.4 7-2 10M12 3c4.4 0 7 3.2 7 7 0 4 .4 7 2 10M12 7.5c-2.4 0-4 1.8-4 4 0 4.5-.4 7-2 9.5M12 7.5c2.4 0 4 1.8 4 4 0 4.5.4 7 2 9.5M12 12v9" />
    ),
  },
  system: {
    label: 'Automatic',
    cls: 'key',
    icon: (
      <>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v4l3 2" strokeLinecap="round" />
      </>
    ),
  },
  blocked: {
    label: 'Blocked',
    cls: 'key',
    icon: (
      <>
        <rect x="4" y="10" width="16" height="10" rx="2" />
        <path d="M8 10V7a4 4 0 018 0v3" />
      </>
    ),
  },
};

const GLYPH = {
  in: <path d="M12 19V5M6 13l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />,
  out: <path d="M12 5v14M6 11l6-6 6 6" strokeLinecap="round" strokeLinejoin="round" />,
};

const FILTERS = [
  { f: 'all', label: 'Everything' },
  { f: 'in', label: 'Money in' },
  { f: 'out', label: 'Money out' },
];

function LedgerRow({ tx }) {
  const au = AUTH[tx.auth];
  return (
    <div className={`row ${tx.c}`}>
      <span className="glyph">
        <svg viewBox="0 0 24 24">{GLYPH[tx.c]}</svg>
      </span>
      <div>
        <p className="what">{tx.t}</p>
        <div className="meta">
          <span className={au.cls ? `auth ${au.cls}` : 'auth'}>
            <svg viewBox="0 0 24 24">{au.icon}</svg>
            {au.label}
          </span>
          <span>{tx.note}</span>
        </div>
      </div>
      <div className="amount">
        <div className="val fig">{tx.a === 0 ? '—' : signed(tx.a, tx.c)}</div>
        <div className="after">Balance {money(tx.after)}</div>
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const [params, setParams] = useSearchParams();
  const requested = params.get('account');
  const current = ACCOUNTS_BY_ID[requested] ? requested : 'reserve';
  const account = ACCOUNTS_BY_ID[current];
  const [filter, setFilter] = useState('all');

  useDocumentTitle(`Aurum Savings — ${account.name}`);

  const inSum = account.tx.filter((t) => t.c === 'in').reduce((s, t) => s + t.a, 0);
  const trend = account.trend;
  const growth = (((trend[trend.length - 1] - trend[0]) / trend[0]) * 100).toFixed(1);

  const { groups, count } = useMemo(() => {
    // Walk back from today's balance to get the balance after each entry.
    const withAfter = [];
    let running = account.balance;
    for (const [i, t] of account.tx.entries()) {
      withAfter.push({ ...t, after: running, key: i });
      running = t.c === 'in' ? running - t.a : running + t.a;
    }
    const rows = withAfter.filter((t) => filter === 'all' || t.c === filter);
    const byDay = [];
    for (const t of rows) {
      const day = formatDay(t.d);
      const last = byDay[byDay.length - 1];
      if (last && last.day === day) last.rows.push(t);
      else byDay.push({ day, rows: [t] });
    }
    return { groups: byDay, count: rows.length };
  }, [account, filter]);

  return (
    <VaultLayout className="history-page">
      <Link className="back" to="/accounts">
        <svg viewBox="0 0 24 24">
          <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        All vaults
      </Link>

      <div className="switch">
        {ACCOUNTS.map((a) => (
          <button
            key={a.id}
            aria-current={a.id === current}
            onClick={() => setParams({ account: a.id }, { replace: true })}
          >
            <SafeIcon locked={!!a.locked} size={20} />
            <span>{a.name}</span>
          </button>
        ))}
      </div>

      <section className="head">
        <SafeIcon locked={!!account.locked} size={96} />
        <div>
          <h1>{account.name}</h1>
          <p className="num">{account.num}</p>
          {account.locked && (
            <p className="num" style={{ color: 'var(--muted)' }}>
              {account.locked}
            </p>
          )}
        </div>
        <div>
          <div className="bal fig">{money(account.balance)}</div>
          <div className="sub">
            Added in the last 6 months <b>+{money(inSum)}</b>
          </div>
        </div>
      </section>

      <section className="trend">
        <div className="trend-top">
          <span>Balance over 12 months</span>
          <span style={{ color: 'var(--brass-soft)' }}>+{growth}%</span>
        </div>
        <Sparkline values={trend} />
      </section>

      <div className="bar">
        <div className="filters">
          {FILTERS.map(({ f, label }) => (
            <button key={f} aria-pressed={filter === f} onClick={() => setFilter(f)}>
              {label}
            </button>
          ))}
        </div>
        <span className="count">
          {count} of {account.tx.length} entries
        </span>
      </div>

      <div>
        {count === 0 ? (
          <div className="empty">
            No {filter === 'in' ? 'money in' : 'money out'} on this vault yet.
            <br />
            Move some savings and it will show up here.
          </div>
        ) : (
          groups.map((g) => (
            <div className="daygroup" key={g.day}>
              <p className="day">{g.day}</p>
              {g.rows.map((t) => (
                <LedgerRow key={t.key} tx={t} />
              ))}
            </div>
          ))
        )}
      </div>
    </VaultLayout>
  );
}
