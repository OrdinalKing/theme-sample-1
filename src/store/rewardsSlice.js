import { createSlice, nanoid } from '@reduxjs/toolkit';
import { DateTime } from 'luxon';

// Daily reward spins, saved in localStorage so turns and winnings survive a reload.
// A spin is booked the moment it starts (so leaving mid-spin can't re-roll it)
// and pays out when its animation ends, or on the next visit if that never happens.

const STORAGE_KEY = 'aurum-rewards-v1';
const LOG_LIMIT = 50;
const DAYS_KEPT = 60;

export const todayISO = () => DateTime.local().toISODate();

const fresh = () => ({
  points: 0,
  cash: 0,
  boosts: [], // { pct, until: 'YYYY-MM-DD' }
  day: null, // the date `used` and `extra` belong to
  used: {}, // spinner id -> turns taken on `day`
  extra: {}, // spinner id -> free spins won on `day`
  days: [], // dates with at least one spin, newest first
  log: [], // { id, variant, day, at, prize, pending }
});

// Works on Immer drafts and on the plain object built while loading.
function payOut(state, entry) {
  const { prize } = entry;
  if (prize.kind === 'points') state.points += prize.amount;
  else if (prize.kind === 'cash') state.cash = Math.round((state.cash + prize.amount) * 100) / 100;
  else if (prize.kind === 'boost') {
    const until = DateTime.fromISO(entry.day).plus({ days: prize.days }).toISODate();
    state.boosts.push({ pct: prize.amount, until });
  } else if (prize.kind === 'spin' && state.day === entry.day) {
    state.extra[entry.variant] = (state.extra[entry.variant] || 0) + 1;
  }
  entry.pending = false;
}

function load() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
    if (!saved || !Array.isArray(saved.log)) return fresh();
    const state = { ...fresh(), ...saved };
    state.log.forEach((e) => e.pending && payOut(state, e));
    const today = todayISO();
    state.boosts = state.boosts.filter((b) => b.until >= today);
    return state;
  } catch {
    return fresh();
  }
}

const rewardsSlice = createSlice({
  name: 'rewards',
  initialState: load,
  reducers: {
    spinStarted: {
      reducer(state, { payload }) {
        if (state.day !== payload.day) {
          state.day = payload.day;
          state.used = {};
          state.extra = {};
        }
        state.used[payload.variant] = (state.used[payload.variant] || 0) + 1;
        if (!state.days.includes(payload.day)) {
          state.days.unshift(payload.day);
          state.days.splice(DAYS_KEPT);
        }
        state.log.unshift({ ...payload, pending: true });
        state.log.splice(LOG_LIMIT);
      },
      prepare(variant, prize) {
        const now = DateTime.local();
        const { kind, amount, days, title, value, unit, tier, note } = prize;
        return {
          payload: {
            id: nanoid(),
            variant,
            day: now.toISODate(),
            at: now.toISO(),
            prize: { kind, amount, days, title, value, unit, tier, note },
          },
        };
      },
    },
    spinRevealed(state, { payload: id }) {
      const entry = state.log.find((e) => e.id === id);
      if (entry && entry.pending) payOut(state, entry);
    },
    pendingSettled(state) {
      state.log.forEach((e) => e.pending && payOut(state, e));
    },
    /** Demo helper: gives every spinner its daily turn back. */
    todaySpinsReset(state) {
      state.used = {};
      state.extra = {};
    },
  },
  selectors: {
    selectRewards: (state) => state,
  },
});

export const { spinStarted, spinRevealed, pendingSettled, todaySpinsReset } = rewardsSlice.actions;
export const { selectRewards } = rewardsSlice.selectors;
export default rewardsSlice.reducer;

export const usedOn = (rewards, variant, day) =>
  rewards.day === day ? rewards.used[variant] || 0 : 0;

/** Turns a spinner has left on `day`: one free turn plus any free spins won. */
export function spinsLeftFor(rewards, variant, day) {
  if (rewards.day !== day) return 1;
  return Math.max(0, 1 + (rewards.extra[variant] || 0) - (rewards.used[variant] || 0));
}

/** Days in a row with a spin. A streak isn't broken until today ends without one. */
export function streakOf(days, today) {
  const spun = new Set(days);
  let d = DateTime.fromISO(today);
  if (!spun.has(today)) d = d.minus({ days: 1 });
  let n = 0;
  while (spun.has(d.toISODate())) {
    n += 1;
    d = d.minus({ days: 1 });
  }
  return n;
}

/** Saves the rewards state whenever it changes. */
export function persistRewards(store) {
  let last = store.getState().rewards;
  store.subscribe(() => {
    const next = store.getState().rewards;
    if (next === last) return;
    last = next;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Storage full or blocked (private mode): rewards still work for this visit.
    }
  });
}
