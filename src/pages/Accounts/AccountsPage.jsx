import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import VaultLayout from '../../components/VaultLayout.jsx';
import SafeIcon from '../../components/SafeIcon.jsx';
import { ACCOUNTS } from '../../data/accounts.js';
import { VARIANTS } from '../../data/rewards.js';
import { selectRewards, spinsLeftFor, todayISO } from '../../store/rewardsSlice.js';
import { money } from '../../utils/format.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import './AccountsPage.css';

function VaultCard({ account: a }) {
  const pct = a.goal ? Math.min(a.balance / a.goal, 1) : 0;
  return (
    <Link to={`/history?account=${a.id}`} className={a.locked ? 'safe locked' : 'safe'}>
      <SafeIcon locked={!!a.locked} className="safeicon" hinges />
      <div>
        <h2 className="name">{a.name}</h2>
        <p className="num">{a.num}</p>
        <div className="bal fig">{money(a.balance)}</div>
        <p className="rate">
          {a.apy.toFixed(2)}% a year <em>paid monthly</em>
        </p>
        {a.goal ? (
          <div className="goal">
            <div className="goalbar">
              <i style={{ width: `${(pct * 100).toFixed(1)}%` }} />
            </div>
            <div className="goalmeta">
              <span>{Math.round(pct * 100)}% of your goal</span>
              <b>{money(a.goal)}</b>
            </div>
          </div>
        ) : (
          <div className="lockline">
            <svg viewBox="0 0 24 24">
              <rect x="4" y="10" width="16" height="10" rx="2" />
              <path d="M8 10V7a4 4 0 018 0v3" />
            </svg>
            {a.locked}
          </div>
        )}
        <span className="open-link">See this vault's history</span>
      </div>
    </Link>
  );
}

function RewardsBanner() {
  const rewards = useSelector(selectRewards);
  const today = todayISO();
  const left = VARIANTS.reduce((n, v) => n + spinsLeftFor(rewards, v.id, today), 0);
  return (
    <Link to="/rewards" className="rewards-cta">
      <span className="gift" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <rect x="4" y="10" width="16" height="10" rx="1.5" />
          <rect x="3" y="7" width="18" height="3" rx="1" />
          <path d="M12 7v13M12 7C10.5 4 7 3.6 7 5.6 7 7 12 7 12 7zM12 7c1.5-3 5-3.4 5-1.4C17 7 12 7 12 7z" />
        </svg>
      </span>
      <span className="cta-text">
        <b>Daily rewards</b>
        <small>
          {left
            ? `${left} free turn${left === 1 ? '' : 's'} waiting across ${VARIANTS.length} spinners`
            : 'All spun for today. New turns at midnight.'}
        </small>
      </span>
      <span className="cta-go">
        {left ? 'Spin now' : 'See rewards'}
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </Link>
  );
}

export default function AccountsPage() {
  useDocumentTitle('Aurum Savings — Your vaults');
  const total = ACCOUNTS.reduce((sum, a) => sum + a.balance, 0);

  return (
    <VaultLayout className="accounts-page">
      <div className="top">
        <div>
          <h1>Good evening, Rina.</h1>
          <p>Four vaults open under your name.</p>
        </div>
        <div className="session">
          <svg viewBox="0 0 24 24">
            <path d="M12 3l7 3v6c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6z" />
            <path d="M9 12l2 2 4-4" />
          </svg>
          <span>
            Verified by face and fingerprint at <b>21:04</b>
          </span>
        </div>
      </div>

      <section className="totals">
        <div>
          <span>Total saved</span>
          <strong>{money(total)}</strong>
        </div>
        <div>
          <span>Interest earned this year</span>
          <strong className="up">+$3,284.16</strong>
        </div>
        <div>
          <span>Next interest payment</span>
          <strong style={{ fontSize: 20 }}>1 Oct</strong>
        </div>
      </section>

      <RewardsBanner />

      <p className="wall-label">Your vaults</p>
      <div className="wall">
        {ACCOUNTS.map((a) => (
          <VaultCard key={a.id} account={a} />
        ))}
        <button
          className="newvault"
          onClick={() => window.alert('Opening a vault starts with a face check.')}
        >
          <svg viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
          <span>
            Open a new vault
            <br />
            <small style={{ color: 'var(--muted)' }}>Takes one face check</small>
          </span>
        </button>
      </div>
    </VaultLayout>
  );
}
