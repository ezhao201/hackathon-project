import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BRAND_MARK_LAYOUT_ID, BrandMark, BrandWordmark } from '../Logo';
import { useIntro } from '../../context/IntroContext';

/*
 * Timeline (seconds). Everything hangs off one clock so the whole thing lands in ~3s.
 *  0.00  wordmark appears, small and quiet
 *  0.35  identity tags stagger in around it (80ms apart)
 *  0.70  a thin line + travelling dot converges from each tag to the center
 *  0.95  "Scanning eligibility..."   1.30  "47 programs checked"   1.65  "12 matches found ✓"
 *  1.05  dollar figure steps $0 → $1,247 (150ms per step)
 *  1.85  three matched cards slide in          2.45  they slide away
 *  2.60  overlay begins to dissolve into the hero; the ✓ keeps its layoutId
 *  2.95  unmount → navbar logo mark mounts with the same layoutId and the ✓ morphs into it
 */
const T = {
  tags: 0.35,
  lines: 0.7,
  status: [0.95, 1.3, 1.65],
  dollar: 1.05,
  cardsIn: 1.85,
  cardsOut: 2.45,
  resolve: 2.6,
  done: 2.95,
};

const TAGS = [
  { label: 'Student', icon: '🎓', x: 20, y: 24 },
  { label: 'Pittsburgh', icon: '📍', x: 79, y: 22 },
  { label: 'Age 18', icon: '🎂', x: 12, y: 52 },
  { label: 'CMU', icon: '🏫', x: 87, y: 54 },
  { label: 'Cardholder', icon: '💳', x: 26, y: 80 },
  { label: 'Employee', icon: '💼', x: 74, y: 82 },
];

const STATUS = ['Scanning eligibility...', '47 programs checked', '12 matches found'];
const DOLLARS = [0, 184, 427, 683, 921, 1247];

const CARDS = [
  { name: 'Spotify Student', detail: 'Save $72/year' },
  { name: 'Student Transit', detail: 'Save $180/year' },
  { name: 'Apple Education', detail: 'Education pricing' },
];

const ease = [0.22, 1, 0.36, 1];

export default function IntroSequence() {
  const { finishIntro } = useIntro();
  const [statusIdx, setStatusIdx] = useState(-1);
  const [dollarIdx, setDollarIdx] = useState(0);
  const [showCards, setShowCards] = useState(false);
  const [resolving, setResolving] = useState(false);
  const timers = useRef([]);

  useEffect(() => {
    const at = (sec, fn) => timers.current.push(setTimeout(fn, sec * 1000));
    T.status.forEach((t, i) => at(t, () => setStatusIdx(i)));
    DOLLARS.forEach((_, i) => at(T.dollar + i * 0.15, () => setDollarIdx(i)));
    at(T.cardsIn, () => setShowCards(true));
    at(T.cardsOut, () => setShowCards(false));
    at(T.resolve, () => setResolving(true));
    at(T.done, finishIntro);
    return () => timers.current.forEach(clearTimeout);
  }, [finishIntro]);

  const skip = () => {
    timers.current.forEach(clearTimeout);
    finishIntro();
  };

  const fadeOut = resolving ? { opacity: 0 } : {};
  const matched = statusIdx === 2;

  return (
    <motion.div
      className="fixed inset-0 z-50 overflow-hidden bg-slate-50 text-navy dark:bg-ink dark:text-white"
      role="dialog"
      aria-label="Intro animation"
      initial={{ opacity: 1 }}
      animate={{ opacity: resolving ? 0 : 1 }}
      transition={{ duration: 0.4, ease }}
    >
      {/* Converging lines (SVG in percent space; strokes stay 1px regardless of aspect ratio) */}
      <motion.svg
        className="pointer-events-none absolute inset-0 h-full w-full text-navy/35 dark:text-white/30"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
        animate={fadeOut}
        transition={{ duration: 0.25 }}
      >
        {TAGS.map((t, i) => (
          <motion.line
            key={t.label}
            x1={t.x}
            y1={t.y}
            x2={50}
            y2={50}
            stroke="currentColor"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: [0, 1, 1, 0.35] }}
            transition={{ delay: T.lines + i * 0.06, duration: 0.5, ease }}
          />
        ))}
      </motion.svg>

      {/* Travelling dots along each line */}
      {TAGS.map((t, i) => (
        <motion.span
          key={`dot-${t.label}`}
          aria-hidden="true"
          className="pointer-events-none absolute h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-navy dark:bg-white"
          initial={{ left: `${t.x}%`, top: `${t.y}%`, opacity: 0 }}
          animate={{ left: '50%', top: '50%', opacity: [0, 1, 1, 0] }}
          transition={{ delay: T.lines + i * 0.06 + 0.05, duration: 0.55, ease }}
        />
      ))}

      {/* Identity tags */}
      {TAGS.map((t, i) => (
        <motion.span
          key={t.label}
          className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-card dark:border-ink-border dark:bg-ink-card dark:text-slate-200 sm:text-sm"
          style={{ left: `${t.x}%`, top: `${t.y}%` }}
          initial={{ opacity: 0, scale: 0.85, y: 6 }}
          animate={resolving ? { opacity: 0, scale: 0.95 } : { opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: resolving ? 0 : T.tags + i * 0.08, duration: 0.3, ease }}
        >
          <span aria-hidden="true" className="mr-1">
            {t.icon}
          </span>
          {t.label}
        </motion.span>
      ))}

      {/* Center stack */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={resolving ? { opacity: 0, scale: 0.98 } : { opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease }}
        >
          <BrandWordmark className="text-2xl sm:text-3xl" />
        </motion.div>

        {/* Status line — the ✓ is the brand mark and morphs into the navbar logo at the end */}
        <div className="mt-6 flex h-7 items-center justify-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 sm:text-base">
          <AnimatePresence mode="wait" initial={false}>
            {statusIdx >= 0 && (
              <motion.span
                key={statusIdx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: resolving ? 0 : 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18, ease }}
              >
                {STATUS[statusIdx]}
              </motion.span>
            )}
          </AnimatePresence>
          {matched && (
            <motion.span initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.25, ease }}>
              <BrandMark className="h-6 w-6" layoutId={BRAND_MARK_LAYOUT_ID} />
            </motion.span>
          )}
        </div>

        {/* Dollar figure */}
        <motion.div
          className="mt-5"
          initial={{ opacity: 0, y: 10 }}
          animate={resolving ? { opacity: 0 } : { opacity: 1, y: 0 }}
          transition={{ delay: resolving ? 0 : T.dollar, duration: 0.3, ease }}
        >
          <p className="text-5xl font-extrabold tabular-nums tracking-tight sm:text-6xl">
            ${DOLLARS[dollarIdx].toLocaleString()}
          </p>
          <p className="mt-1 text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400">potential annual savings</p>
        </motion.div>

        {/* Matched cards */}
        <div className="mt-7 flex h-14 flex-wrap items-start justify-center gap-2">
          <AnimatePresence>
            {showCards &&
              CARDS.map((c, i) => (
                <motion.div
                  key={c.name}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-xs shadow-card dark:border-ink-border dark:bg-ink-card sm:text-sm"
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, y: -10, transition: { duration: 0.22, delay: i * 0.04 } }}
                  transition={{ delay: i * 0.1, duration: 0.3, ease }}
                >
                  <span className="grid h-5 w-5 flex-none place-items-center rounded-full bg-accent text-white" aria-hidden="true">
                    <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </span>
                  <span>
                    <span className="font-semibold text-slate-800 dark:text-slate-100">{c.name}</span>
                    <span className="text-slate-500 dark:text-slate-400"> — {c.detail}</span>
                  </span>
                </motion.div>
              ))}
          </AnimatePresence>
        </div>
      </div>

      <button
        type="button"
        onClick={skip}
        className="absolute right-4 top-4 rounded-full border border-slate-200 bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-slate-600 backdrop-blur transition hover:border-navy hover:text-navy focus:outline-none focus-visible:ring-2 focus-visible:ring-navy dark:border-ink-border dark:bg-ink-card/80 dark:text-slate-300 dark:hover:border-navy-300 dark:hover:text-white sm:right-6 sm:top-6"
      >
        Skip →
      </button>
    </motion.div>
  );
}
