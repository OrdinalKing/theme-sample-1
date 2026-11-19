import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useSearchParams } from 'react-router-dom';
import VaultLayout from '../../components/VaultLayout.jsx';
import { VARIANTS, VARIANTS_BY_ID } from '../../data/rewards.js';
import {
  pendingSettled,
  selectRewards,
  spinRevealed,
  spinsLeftFor,
  spinStarted,
  todayISO,
  todaySpinsReset,
  usedOn,
} from '../../store/rewardsSlice.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { SPINNERS } from './spinners/index.js';
import Summary, { Countdown } from './Summary.jsx';
import OddsTable from './OddsTable.jsx';
import ResultCard from './ResultCard.jsx';
import Ledger from './Ledger.jsx';
import VariantIcon from './VariantIcon.jsx';
import './RewardsPage.css';

function pickerState(left, used) {
  if (left < 1) return { cls: 'spent', text: 'Spun today' };
  if (used > 0) return { cls: 'bonus', text: left > 1 ? `${left} free spins` : 'Free spin ready' };
  return { cls: 'ready', text: 'Ready' };
}

export default function RewardsPage() {
  useDocumentTitle('Aurum Savings — Daily rewards');
  const dispatch = useDispatch();
  const rewards = useSelector(selectRewards);
  const [params, setParams] = useSearchParams();
  const requested = params.get('spinner');
  const current = VARIANTS_BY_ID[requested] ? requested : VARIANTS[0].id;
  const variant = VARIANTS_BY_ID[current];
  const Spinner = SPINNERS[current];

  const [today, setToday] = useState(todayISO);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  // A spin cut short (the page was left, or the spinner changed via back/forward)
  // never reached its reveal; pay it out now so nothing is lost or re-rolled.
  useEffect(() => {
    dispatch(pendingSettled());
    setBusy(false);
    setResult(null);
  }, [current, dispatch]);

  const onSpin = useCallback(
    (prize) => {
      const action = spinStarted(current, prize);
      dispatch(action);
      setBusy(true);
      setResult(null);
      return () => {
        dispatch(spinRevealed(action.payload.id));
        setBusy(false);
        setResult(action.payload);
      };
    },
    [current, dispatch]
  );

  const left = spinsLeftFor(rewards, current, today);

  return (
    <VaultLayout className="rewards-page">
      <Link className="back" to="/accounts">
        <svg viewBox="0 0 24 24">
          <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        All vaults
      </Link>

      <div className="top">
        <div>
          <h1>Daily rewards</h1>
          <p>
            {VARIANTS.length} spinners, one free turn on each every day. Points, cash back and
            interest boosts land in your vaults.
          </p>
        </div>
        <Countdown today={today} onRollover={setToday} />
      </div>

      <Summary rewards={rewards} today={today} />

      <p className="section-label">Pick a spinner</p>
      <div className="picker" role="group" aria-label="Spinners">
        {VARIANTS.map((v) => {
          const vLeft = spinsLeftFor(rewards, v.id, today);
          const state = pickerState(vLeft, usedOn(rewards, v.id, today));
          return (
            <button
              key={v.id}
              type="button"
              aria-pressed={v.id === current}
              disabled={busy && v.id !== current}
              onClick={() => setParams({ spinner: v.id }, { replace: true })}
            >
              <VariantIcon id={v.id} />
              <span className="pk-name">{v.name}</span>
              <span className={`pk-state ${state.cls}`}>{state.text}</span>
            </button>
          );
        })}
      </div>

      <section className="stage">
        <div className="stage-art">
          <Spinner key={current} variant={variant} left={left} onSpin={onSpin} />
          <div className="result-slot" aria-live="polite">
            {result && result.variant === current && (
              <ResultCard entry={result} points={rewards.points} />
            )}
          </div>
        </div>
        <aside className="stage-info">
          <div className="info-head">
            <VariantIcon id={current} />
            <div>
              <h2>{variant.name}</h2>
              <p className="tagline">{variant.tagline}</p>
            </div>
          </div>
          <p className="how">{variant.how}</p>
          <OddsTable groups={variant.odds} />
        </aside>
      </section>

      <Ledger log={rewards.log} today={today} />

      <div className="demo">
        <button type="button" onClick={() => dispatch(todaySpinsReset())} disabled={busy}>
          Reset today’s turns
        </button>
        <span>Demo only: gives every spinner its daily turn back. Winnings are kept.</span>
      </div>
    </VaultLayout>
  );
}
