import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { prefersReducedMotion } from '../lib/constants';

const SESSION_KEY = 'kemm_intro_seen';
const IntroContext = createContext({ introActive: false, finishIntro: () => {}, justFinished: false });

function shouldPlay() {
  try {
    if (sessionStorage.getItem(SESSION_KEY)) return false;
  } catch {
    return false;
  }
  return !prefersReducedMotion();
}

/**
 * Tracks whether the once-per-session intro is on screen. The navbar logo reads this so the
 * intro's final checkmark can morph into the logo mark via a shared Framer Motion layoutId.
 */
export function IntroProvider({ children }) {
  const [introActive, setIntroActive] = useState(shouldPlay);
  const [justFinished, setJustFinished] = useState(false);

  const finishIntro = useCallback(() => {
    try {
      sessionStorage.setItem(SESSION_KEY, '1');
    } catch {
      /* ignore */
    }
    setIntroActive(false);
    setJustFinished(true);
  }, []);

  const value = useMemo(() => ({ introActive, finishIntro, justFinished }), [introActive, finishIntro, justFinished]);
  return <IntroContext.Provider value={value}>{children}</IntroContext.Provider>;
}

export function useIntro() {
  return useContext(IntroContext);
}
