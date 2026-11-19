import { useEffect, useMemo, useRef } from 'react';

/**
 * setTimeout / setInterval that are all cleared automatically when the
 * component unmounts, so an animation sequence never fires on a page
 * the user has already left.
 */
export function useTimers() {
  const ids = useRef(new Set());

  useEffect(() => {
    const active = ids.current;
    return () => {
      active.forEach((id) => {
        clearTimeout(id);
        clearInterval(id);
      });
      active.clear();
    };
  }, []);

  return useMemo(
    () => ({
      timeout(fn, ms) {
        const id = setTimeout(() => {
          ids.current.delete(id);
          fn();
        }, ms);
        ids.current.add(id);
        return id;
      },
      interval(fn, ms) {
        const id = setInterval(fn, ms);
        ids.current.add(id);
        return id;
      },
      clear(id) {
        clearTimeout(id);
        clearInterval(id);
        ids.current.delete(id);
      },
    }),
    []
  );
}
