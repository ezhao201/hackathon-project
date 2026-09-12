import { useState } from 'react';
import { CATEGORY_OPTIONS, ELIGIBILITY_OPTIONS } from '../lib/constants';
import { CheckCircleIcon, CheckIcon, MapPinIcon } from './Icons';
import Alert from './Alert';

const DEFAULT_LOCATION = 'Pittsburgh, PA (CMU area)';

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
        <legend className="text-base font-semibold text-slate-900">Which of these describe you?</legend>
        <p className="mt-1 text-sm text-slate-500">Select all that apply. You can change these anytime.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {ELIGIBILITY_OPTIONS.map((opt) => {
            const checked = eligibility.includes(opt.tag);
            return (
              <label
                key={opt.tag}
                className={`group relative flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                  checked ? 'border-navy bg-navy-50/60 ring-1 ring-navy' : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
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
                  <span className="block text-sm font-semibold text-slate-800">{opt.label}</span>
                  <span className="block text-xs text-slate-500">{opt.hint}</span>
                </span>
                <span
                  className={`grid h-5 w-5 flex-none place-items-center rounded-md border transition ${
                    checked ? 'border-navy bg-navy text-white' : 'border-slate-300 bg-white'
                  }`}
                  aria-hidden="true"
                >
                  {checked && <CheckIcon className="h-3.5 w-3.5" />}
                </span>
              </label>
            );
          })}
        </div>

        {studentSelected && (
          <div className="mt-4 rounded-xl border border-dashed border-navy-200 bg-navy-50/40 p-4">
            {studentVerified ? (
              <p className="inline-flex items-center gap-2 text-sm font-medium text-accent-700">
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
                <p className="mt-1.5 text-xs text-slate-500">
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
        <label htmlFor="location" className="text-base font-semibold text-slate-900">
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
        <p className="mt-1.5 text-xs text-slate-500">Online deals are always included. Default is Pittsburgh, PA / CMU area.</p>
      </div>

      {/* Categories */}
      <fieldset>
        <legend className="text-base font-semibold text-slate-900">Preferred categories</legend>
        <p className="mt-1 text-sm text-slate-500">We&apos;ll highlight these first in your feed.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {CATEGORY_OPTIONS.map((c) => {
            const checked = categories.includes(c.name);
            return (
              <label
                key={c.name}
                className={`cursor-pointer select-none rounded-full border px-4 py-2 text-sm font-medium transition ${
                  checked
                    ? 'border-accent bg-accent-50 text-accent-700 ring-1 ring-accent'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <input type="checkbox" className="sr-only" checked={checked} onChange={() => toggle(categories, setCategories, c.name)} />
                <span aria-hidden="true" className="mr-1.5">
                  {c.icon}
                </span>
                {c.name}
              </label>
            );
          })}
        </div>
      </fieldset>

      <button type="submit" className="btn-primary w-full py-3 sm:w-auto sm:px-8" disabled={submitting}>
        {submitting ? 'Saving…' : submitLabel}
      </button>
    </form>
  );
}
