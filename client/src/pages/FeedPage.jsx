import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import DiscountCard from '../components/DiscountCard';
import EmptyState from '../components/EmptyState';
import PageSpinner from '../components/PageSpinner';
import Toast from '../components/Toast';
import Alert from '../components/Alert';
import { CheckCircleIcon } from '../components/Icons';
import { useAuth } from '../context/AuthContext';
import { useClaim } from '../hooks/useClaim';
import { api } from '../lib/api';
import { ELIGIBILITY_OPTIONS, QUALIFY_PHRASES } from '../lib/constants';

const FILTERS = ['All', 'Food', 'Tech', 'Transport', 'Entertainment', 'Health'];
const SORTS = [
  { value: 'newest', label: 'Newest' },
  { value: 'expiring', label: 'Expiring Soon' },
  { value: 'popular', label: 'Most Popular' },
];

const optionLabel = (tag) => ELIGIBILITY_OPTIONS.find((o) => o.tag === tag)?.label || tag;

function NoResults({ category, suggestions, includeExpired, onShowExpired, hasTags }) {
  const top = suggestions.slice(0, 2);
  const scope = category === 'All' ? 'discounts' : `${category} discounts`;

  let body;
  if (!hasTags) {
    body = 'Add eligibility tags to your profile to unlock personalized discounts.';
  } else if (top.length) {
    const hint = top
      .map((s) => `${optionLabel(s.tag)} (${s.count} deal${s.count === 1 ? '' : 's'})`)
      .join(' or ');
    body = `No ${scope} match your profile — try adding ${hint} in your eligibility settings.`;
  } else if (!includeExpired) {
    body = `No live ${scope} match your profile right now. Some expired deals may still be worth a look.`;
  } else {
    body = `No ${scope} match your profile right now. Try another category or check back soon.`;
  }

  return (
    <EmptyState
      icon="🪄"
      title={category === 'All' ? 'No matching discounts yet' : `No ${category} discounts for you right now`}
      body={body}
      action={
        <div className="flex flex-wrap justify-center gap-2">
          <Link to="/profile" className="btn-primary">
            Update eligibility
          </Link>
          {!includeExpired && (
            <button type="button" className="btn-outline" onClick={onShowExpired}>
              Show expired deals
            </button>
          )}
        </div>
      }
    />
  );
}

export default function FeedPage() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const category = FILTERS.includes(params.get('category')) ? params.get('category') : 'All';
  const sort = SORTS.some((s) => s.value === params.get('sort')) ? params.get('sort') : 'newest';
  const includeExpired = params.get('expired') === '1';

  const [items, setItems] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { claim, toast, dismiss } = useClaim(setItems);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    api.discounts
      .feed({ category, sort, includeExpired })
      .then((data) => {
        if (cancelled) return;
        setItems(data.items);
        setSuggestions(data.meta.suggestions || []);
      })
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [category, sort, includeExpired]);

  const update = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => (v == null || v === '' ? next.delete(k) : next.set(k, v)));
    setParams(next, { replace: true });
  };

  // Preferred categories float to the top without breaking the chosen sort within groups.
  const ordered = useMemo(() => {
    const prefs = new Set(user?.categories || []);
    if (prefs.size === 0 || category !== 'All') return items;
    return [...items].sort((a, b) => Number(prefs.has(b.category)) - Number(prefs.has(a.category)));
  }, [items, user?.categories, category]);

  // Already-claimed deals sit below a divider so "still actionable" is obvious at a glance.
  const active = ordered.filter((d) => !d.claimed);
  const claimed = ordered.filter((d) => d.claimed);

  const tags = user?.eligibility || [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-navy dark:text-white">Your discounts</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Showing only deals you qualify for as{' '}
            {tags.length ? (
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {tags.map((t) => QUALIFY_PHRASES[t] || t).join(', ')}
              </span>
            ) : (
              <span className="font-medium text-slate-800 dark:text-slate-200">a general member</span>
            )}
            .{' '}
            <Link to="/profile" className="font-medium text-navy hover:underline dark:text-navy-200">
              Edit profile
            </Link>
          </p>
        </div>
        <label className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-navy focus:ring-navy dark:border-slate-600 dark:bg-ink-card"
            checked={includeExpired}
            onChange={(e) => update({ expired: e.target.checked ? '1' : null })}
          />
          Show expired deals
        </label>
      </div>

      {/* Filter + sort bar */}
      <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="-mx-4 overflow-x-auto px-4 py-1 md:mx-0 md:px-0" role="tablist" aria-label="Filter by category">
          <div className="flex w-max gap-2">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                role="tab"
                aria-selected={category === f}
                onClick={() => update({ category: f === 'All' ? null : f })}
                className={category === f ? 'pill-active' : 'pill-idle'}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="sort" className="text-sm text-slate-600 dark:text-slate-400">
            Sort by
          </label>
          <select id="sort" className="input w-auto py-2" value={sort} onChange={(e) => update({ sort: e.target.value })}>
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6">
        {error && <Alert className="mb-4">{error}</Alert>}
        {loading ? (
          <PageSpinner label="Matching discounts to your profile…" />
        ) : ordered.length === 0 ? (
          <NoResults
            category={category}
            suggestions={suggestions}
            includeExpired={includeExpired}
            onShowExpired={() => update({ expired: '1' })}
            hasTags={tags.length > 0}
          />
        ) : (
          <>
            <p className="mb-3 text-xs text-slate-600 dark:text-slate-400">
              {active.length} deal{active.length === 1 ? '' : 's'} to claim
              {claimed.length ? ` · ${claimed.length} claimed` : ''}
              {user?.categories?.length && category === 'All' ? ' · your preferred categories are shown first' : ''}
            </p>
            {active.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {active.map((d) => (
                  <DiscountCard key={d.id} discount={d} onClaim={claim} />
                ))}
              </div>
            ) : (
              <p className="card px-5 py-6 text-center text-sm text-slate-600 dark:text-slate-400">
                You&apos;ve claimed everything here. Nice work — check back for new deals.
              </p>
            )}

            {claimed.length > 0 && (
              <section aria-labelledby="claimed-heading" className="mt-10">
                <div className="mb-4 flex items-center gap-3">
                  <h2
                    id="claimed-heading"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400"
                  >
                    <CheckCircleIcon className="h-4 w-4 text-accent" /> Claimed
                  </h2>
                  <span className="h-px flex-1 bg-slate-200 dark:bg-ink-border" aria-hidden="true" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {claimed.map((d) => (
                    <DiscountCard key={d.id} discount={d} onClaim={claim} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      <Toast message={toast} onDismiss={dismiss} />
    </div>
  );
}
