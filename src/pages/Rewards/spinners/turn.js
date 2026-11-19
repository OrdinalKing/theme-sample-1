import { useCallback, useState } from 'react';
import { useTimers } from '../../../hooks/useTimers.js';

export const prefersReducedMotion = () =>
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Spin length, cut short for visitors who ask for reduced motion. */
export const motionMs = (ms) => (prefersReducedMotion() ? Math.min(ms, 450) : ms);

/**
 * Put `el` straight on its last keyframe, then animate into it from the first.
 * The end state lives in the element's own style, so nothing snaps back when
 * the animation finishes and the next spin starts from where this one stopped.
 * (Web Animations, so the global reduced-motion CSS rule doesn't cut it off;
 * callers shorten `duration` with motionMs instead.)
 */
export function playFrames(el, frames, options) {
  if (!el) return;
  el.style.transform = frames[frames.length - 1].transform;
  if (typeof el.animate === 'function') el.animate(frames, options);
}

/**
 * One turn of any spinner. `go(prize, ms, then)` books the turn with the page
 * via `onSpin` (which hands back the page's reveal callback), then after `ms`
 * runs `then` and reveals the prize. Timers die with the component.
 */
export function useTurn(onSpin) {
  const timers = useTimers();
  const [spinning, setSpinning] = useState(false);
  const go = useCallback(
    (prize, ms, then) => {
      const reveal = onSpin(prize);
      setSpinning(true);
      timers.timeout(() => {
        setSpinning(false);
        if (then) then();
        reveal();
      }, ms);
    },
    [onSpin, timers]
  );
  return { spinning, go, timers };
}
