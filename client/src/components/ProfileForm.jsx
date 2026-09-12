import { useEffect, useRef, useState } from 'react';
import { CATEGORY_OPTIONS, ELIGIBILITY_OPTIONS } from '../lib/constants';
import { CheckCircleIcon, CheckIcon, MapPinIcon, SparklesIcon } from './Icons';
import Alert from './Alert';
import { api } from '../lib/api';

const DEFAULT_LOCATION = 'Pittsburgh, PA (CMU area)';

// One "selected" language for every choice on this form: navy border + ring + checkmark.
const selectableBase =
  'group relative flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ' +
  'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-navy has-[:focus-visible]:ring-offset-2 dark:has-[:focus-visible]:ring-offset-ink';
const selectedClasses = 'border-navy bg-navy-50/60 ring-1 ring-navy dark:border-navy-300 dark:bg-navy-500/20 dark:ring-navy-300';
const unselectedClasses =
  'border-slate-200 bg-white hover:border-slate-300 dark:border-ink-border dark:bg-ink-card dark:hover:border-slate-500';

function CheckBox({ checked }) {
  return (
    <span
      className={`grid h-5 w-5 flex-none place-items-center rounded-md border transition ${
        checked ? 'border-navy bg-navy text-white dark:border-navy-300 dark:bg-navy-300 dark:text-ink' : 'border-slate-300 bg-white dark:border-slate-500 dark:bg-ink-card'
      }`}
      aria-hidden="true"
    >
      {checked && <CheckIcon className="h-3.5 w-3.5" />}
    </span>
  );
}

/** Live "N discounts will match" preview for the currently checked eligibility tags. */
function MatchCount({ eligibility }) {
  const [count, setCount] = useState(null);
  const [pending, setPending] = useState(false);
  const latest = useRef(0);

  useEffect(() => {
    const id = ++latest.current;
    setPending(true);
    const t = setTimeout(() => {
      api.discounts
        .matchCount(eligibility)
        .then((data) => id === latest.current && setCount(data.count))
        .catch(() => id === latest.current && setCount(null))
        .finally(() => id === latest.current && setPending(false));
    }, 200);
    return () => clearTimeout(t);
  }, [eligibility]);

  if (count === null && !pending) return null;
  return (
    <p
      className="inline-flex items-center gap-1.5 text-sm text-slate-600 transition-opacity dark:text-slate-300"
      style={{ opacity: pending ? 0.6 : 1 }}
      aria-live="polite"
    >
      <SparklesIcon className="h-4 w-4 text-accent" />
      <span className="tabular-nums font-semibold text-slate-900 dark:text-white">{count ?? '…'}</span>
      {count === 1 ? ' discount will match' : ' discounts will match'}
    </p>
  );
}

/**
 * Shared between onboarding and the profile page.
 * Only eligibility tags, location preference and category preferences are collected.
 */
export default function ProfileForm({ user, onSubmit, submitLabel = 'Save profile', submitting = false }) {
  const [eligibility, setEligibility] = useState(user?.eligibility || []);
  const [studentEmail, setStudentEmail] = useState('');
  const [location, setLocation] = useState(user?.location || DEFAULT_LOCATION);
  const [categories, setCategories] = useState(user?.categories || []);
  const [error, setError] = useState('');

  const accountIsEdu = /\.edu$/i.test(user?.email || '');
  const studentSelected = eligibility.includes('Student');
  const studentVerified = user?.studentVerified || accountIsEdu;
  const studentEmailIsEdu = /\.edu$/i.test(studentEmail.trim());

  const toggle = (list, setList, value) =>
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (studentSelected && !studentVerified && !studentEmailIsEdu) {
      setError('To claim student discounts, enter a valid .edu email address for verification.');
      return;
    }
    try {
      await onSubmit({
        eligibility,
        location: location.trim() || DEFAULT_LOCATION,
        categories,
        studentEmail: studentSelected && !studentVerified ? studentEmail.trim() : undefined,
      });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8" noValidate>
      <Alert>{error}</Alert>

      {/* Eligibility */}
      <fieldset>
        <legend className="text-base font-semibold text-slate-900 dark:text-white">Which of these describe you?</legend>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Select all that apply. You can change these anytime.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {ELIGIBILITY_OPTIONS.map((opt) => {
            const checked = eligibility.includes(opt.tag);
            return (
              <label key={opt.tag} className={`${selectableBase} ${checked ? selectedClasses : unselectedClasses}`}>
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={checked}
                  onChange={() => toggle(eligibility, setEligibility, opt.tag)}
                />
                <span className="text-xl leading-none" aria-hidden="true">
                  {opt.icon}
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-semibold text-slate-800 dark:text-slate-100">{opt.label}</span>
                  <span className="block text-xs text-slate-600 dark:text-slate-400">{opt.hint}</span>
                </span>
                <CheckBox checked={checked} />
              </label>
            );
          })}
        </div>

        {studentSelected && (
          <div className="mt-4 rounded-xl border border-dashed border-navy-200 bg-navy-50/40 p-4 dark:border-navy-400/50 dark:bg-navy-500/10">
            {studentVerified ? (
              <p className="inline-flex items-center gap-2 text-sm font-medium text-accent-700 dark:text-accent-400">
                <CheckCircleIcon className="h-5 w-5" /> Student verified via your .edu email ({user.email}).
              </p>
            ) : (
              <>
                <label htmlFor="studentEmail" className="label">
                  School email for student verification
                </label>
                <input
                  id="studentEmail"
                  type="email"
                  className="input"
                  placeholder="you@andrew.cmu.edu"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                />
                <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400">
                  Must end in <span className="font-mono">.edu</span>. We only record that you were verified — the
                  address itself is never stored.
                </p>
              </>
            )}
          </div>
        )}
      </fieldset>

      {/* Location */}
      <div>
        <label htmlFor="location" className="text-base font-semibold text-slate-900 dark:text-white">
          Where do you want deals?
        </label>
        <div className="relative mt-3">
          <MapPinIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="location"
            className="input pl-10"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder={DEFAULT_LOCATION}
          />
        </div>
        <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400">
          Online deals are always included. Default is Pittsburgh, PA / CMU area.
        </p>
      </div>

      {/* Categories — same selected pattern as the eligibility cards above */}
      <fieldset>
        <legend className="text-base font-semibold text-slate-900 dark:text-white">Preferred categories</legend>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">We&apos;ll highlight these first in your feed.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {CATEGORY_OPTIONS.map((c) => {
            const checked = categories.includes(c.name);
            return (
              <label
                key={c.name}
                className={`inline-flex cursor-pointer select-none items-center gap-2 rounded-full border py-2 pl-3 pr-2.5 text-sm font-medium transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-navy has-[:focus-visible]:ring-offset-2 dark:has-[:focus-visible]:ring-offset-ink ${
                  checked
                    ? 'border-navy bg-navy-50/60 text-navy ring-1 ring-navy dark:border-navy-300 dark:bg-navy-500/20 dark:text-white dark:ring-navy-300'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-ink-border dark:bg-ink-card dark:text-slate-300 dark:hover:border-slate-500'
                }`}
              >
                <input type="checkbox" className="sr-only" checked={checked} onChange={() => toggle(categories, setCategories, c.name)} />
                <span aria-hidden="true">{c.icon}</span>
                {c.name}
                <span
                  className={`grid h-4 w-4 place-items-center rounded-full border transition ${
                    checked ? 'border-navy bg-navy text-white dark:border-navy-300 dark:bg-navy-300 dark:text-ink' : 'border-slate-300 dark:border-slate-500'
                  }`}
                  aria-hidden="true"
                >
                  {checked && <CheckIcon className="h-2.5 w-2.5" />}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button type="submit" className="btn-primary w-full py-3 sm:w-auto sm:px-8" disabled={submitting}>
          {submitting ? 'Saving…' : submitLabel}
        </button>
        <MatchCount eligibility={eligibility} />
      </div>
    </form>
  );
}
