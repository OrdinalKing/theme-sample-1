import { useCallback, useState } from 'react';

/**
 * useState for an object, with a `patch` that merges a partial update.
 * `patch` also accepts a function of the previous state that returns the partial.
 */
export function usePatchState(initial) {
  const [state, setState] = useState(initial);
  const patch = useCallback(
    (partial) =>
      setState((prev) => ({
        ...prev,
        ...(typeof partial === 'function' ? partial(prev) : partial),
      })),
    []
  );
  return [state, patch];
}
