import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRightIcon, CheckCircleIcon, ShieldIcon, SparklesIcon, UserIcon, WalletIcon } from '../components/Icons';
import IntroSequence from '../components/intro/IntroSequence';
import { useIntro } from '../context/IntroContext';
import { BRAND } from '../lib/constants';

const STEPS = [
  {
    n: '01',
    title: 'Create Profile',
    body: 'Tell us who you are — student, veteran, healthcare worker, senior and more. Takes under a minute.',
    Icon: UserIcon,
  },
  {
    n: '02',
    title: 'Get Matched',
    body: 'Our eligibility engine filters thousands of offers down to the ones you personally qualify for.',
    Icon: SparklesIcon,
  },
  {
    n: '03',
    title: 'Save Money',
    body: 'Claim deals in one tap, track your savings, and get alerts before anything expires.',
    Icon: WalletIcon,
  },
];

const SAMPLE_CARDS = [
  { brand: 'Apple', deal: 'Save up to 10% on Mac and iPad', why: 'You qualify as a Student', cat: 'Tech' },
  { brand: 'Pittsburgh Regional Transit', deal: 'Free bus rides for CMU students', why: 'You qualify as a CMU Affiliate', cat: 'Transport' },
  { brand: 'Headspace', deal: 'Free Plus subscription', why: 'You qualify as a Healthcare Worker', cat: 'Health' },
];

const ease = [0.22, 1, 0.36, 1];

export default function LandingPage() {
  const { introActive, justFinished } = useIntro();
  // Only animate the hero in when it is being revealed by the intro; otherwise render it settled.
  const reveal = justFinished ? { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 } } : {};

  return (
    <div>
      {introActive && <IntroSequence />}

      {/* Hero */}
      <section className="relative overflow-hidden bg-navy text-white dark:bg-gradient-to-b dark:from-ink-card dark:to-ink">
        <div className="pointer-events-none absolute inset-0 opacity-30" aria-hidden="true">
          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-accent/40 blur-3xl" />
          <div className="absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-sky-400/30 blur-3xl" />
        </div>
        <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-28">
          <motion.div {...reveal} transition={{ duration: 0.55, ease }}>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/90">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" /> Personalized eligibility engine
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Discounts You <span className="text-accent">Actually</span> Qualify For
            </h1>
            <p className="mt-5 max-w-xl text-lg text-white/80">
              Stop paying full price. {BRAND} only shows you the deals that match who you are — no digging, no
              disappointment at checkout.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/register" className="btn-accent px-6 py-3 text-base">
                Find My Discounts <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <Link
                to="/login"
                className="btn border border-white/30 px-6 py-3 text-base text-white hover:bg-white/10 focus-visible:ring-white dark:focus-visible:ring-offset-ink"
              >
                I already have an account
              </Link>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/70">
              {['Free forever', 'We never sell your data', 'Pittsburgh & online deals'].map((t) => (
                <li key={t} className="inline-flex items-center gap-1.5">
                  <CheckCircleIcon className="h-4 w-4 text-accent" /> {t}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Preview cards */}
          <motion.div
            className="relative hidden lg:block"
            aria-hidden="true"
            {...reveal}
            transition={{ duration: 0.55, delay: 0.12, ease }}
          >
            <div className="space-y-4">
              {SAMPLE_CARDS.map((c, i) => (
                <div
                  key={c.brand}
                  className="rounded-2xl border border-white/10 bg-white p-5 text-slate-800 shadow-card-hover dark:bg-ink-card dark:text-slate-100"
                  style={{ transform: `translateX(${i * 18}px)` }}
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{c.cat}</p>
                  <p className="mt-1 font-semibold text-navy dark:text-white">{c.brand}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{c.deal}</p>
                  <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-accent-700 dark:text-accent-400">
                    <CheckCircleIcon className="h-4 w-4" /> {c.why}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Expires Dec 31</span>
                    <span className="rounded-lg bg-navy px-3 py-1.5 text-xs font-semibold text-white dark:bg-navy-300 dark:text-ink">Claim</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-navy dark:text-white">How it works</h2>
          <p className="mt-3 text-slate-600 dark:text-slate-400">
            Three steps between you and discounts you don&apos;t have to second-guess.
          </p>
        </div>
        <ol className="mt-12 grid gap-6 md:grid-cols-3">
          {STEPS.map(({ n, title, body, Icon }, i) => (
            <li key={n} className="card relative p-6">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-navy-50 text-navy dark:bg-navy-500/20 dark:text-navy-200">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-xs font-bold tracking-widest text-slate-500 dark:text-slate-400">STEP {n}</span>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{body}</p>
              {i < STEPS.length - 1 && (
                <ArrowRightIcon className="absolute -right-4 top-1/2 hidden h-5 w-5 -translate-y-1/2 text-slate-300 dark:text-slate-600 md:block" />
              )}
            </li>
          ))}
        </ol>
      </section>

      {/* Trust */}
      <section className="border-y border-slate-200 bg-white dark:border-ink-border dark:bg-ink-card/50">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-accent-700 dark:text-accent-400">
              <ShieldIcon className="h-5 w-5" /> Privacy first
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-navy dark:text-white">We never sell your data.</h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400">
              Your profile is only used to match you with discounts. We store the bare minimum — your name, email,
              the eligibility tags you choose, and your location preference. Nothing else.
            </p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {[
              'No ad tracking or data brokers',
              'No document uploads required',
              'Delete your profile anytime',
              'Open about what we store',
            ].map((t) => (
              <li
                key={t}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-ink-border dark:bg-ink-card dark:text-slate-200"
              >
                <CheckCircleIcon className="h-5 w-5 flex-none text-accent" /> {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6">
        <h2 className="text-3xl font-bold tracking-tight text-navy dark:text-white">Ready to stop guessing?</h2>
        <p className="mx-auto mt-3 max-w-xl text-slate-600 dark:text-slate-400">
          Build your profile in under a minute and see every discount you qualify for in Pittsburgh and online.
        </p>
        <Link to="/register" className="btn-primary mt-8 px-6 py-3 text-base">
          Find My Discounts <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </section>
    </div>
  );
}
