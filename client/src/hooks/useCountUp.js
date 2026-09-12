import { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '../lib/constants';

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

/**
 * Animates from 0 to `target` once, over `duration` ms.
 * Respects prefers-reduced-motion by jumping straight to the target.
 */
export function useCountUp(target, { duration = 1100, enabled = true } = {}) {
  const [value, setValue] = useState(() => (enabled && !prefersReducedMotion() ? 0 : target));
  const frame = useRef(null);

  useEffect(() => {
    if (!enabled || prefersReducedMotion()) {
      setValue(target);
      return undefined;
    }
    const start = performance.now();
    const from = 0;
    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      setValue(from + (target - from) * easeOutCubic(progress));
      if (progress < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [target, duration, enabled]);

  return value;
}
