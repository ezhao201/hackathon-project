import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import DiscountCard from '../components/DiscountCard';
import EmptyState from '../components/EmptyState';
import PageSpinner from '../components/PageSpinner';
import Toast from '../components/Toast';
import Alert from '../components/Alert';
import { useAuth } from '../context/AuthContext';
import { useClaim } from '../hooks/useClaim';
import { api } from '../lib/api';
import { ELIGIBILITY_LABELS } from '../lib/constants';

const FILTERS = ['All', 'Food', 'Tech', 'Transport', 'Entertainment', 'Health'];
const SORTS = [
  { value: 'newest', label: 'Newest' },
  { value: 'expiring', label: 'Expiring Soon' },
  { value: 'popular', label: 'Most Popular' },
];

export default function FeedPage() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const category = FILTERS.includes(params.get('category')) ? params.get('category') : 'All';
  const sort = SORTS.some((s) => s.value === params.get('sort')) ? params.get('sort') : 'newest';
  const includeExpired = params.get('expired') === '1';

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { claim, toast, dismiss } = useClaim(setItems);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    api.discounts
      .feed({ category, sort, includeExpired })
      .then((data) => !cancelled && setItems(data.items))
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

  const tags = user?.eligibility || [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-navy">Your discounts</h1>
          <p className="mt-1 text-sm text-slate-600">
            Showing only deals you qualify for as{' '}
            {tags.length ? (
              <span className="font-medium text-slate-800">{tags.map((t) => ELIGIBILITY_LABELS[t] || t).join(', ')}</span>
            ) : (
              <span className="font-medium text-slate-800">a general member</span>
            )}
            .{' '}
            <Link to="/profile" className="font-medium text-navy hover:underline">
              Edit profile
            </Link>
          </p>
        </div>
        <label className="inline-flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-navy focus:ring-navy"
            checked={includeExpired}
            onChange={(e) => update({ expired: e.target.checked ? '1' : null })}
          />
          Show expired deals
        </label>
      </div>

      {/* Filter + sort bar */}
      <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0" role="tablist" aria-label="Filter by category">
          <div className="flex w-max gap-2">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                role="tab"
                aria-selected={category === f}
                onClick={() => update({ category: f === 'All' ? null : f })}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
                  category === f ? 'bg-navy text-white' : 'border border-slate-200 bg-white text-slate-700 hover:border-navy hover:text-navy'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="sort" className="text-sm text-slate-500">
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
          <EmptyState
            icon="🪄"
            title={category === 'All' ? 'No matching discounts yet' : `No ${category} discounts for you right now`}
            body={
              tags.length
                ? 'Try another category, include expired deals, or add more eligibility tags to your profile.'
                : 'Add eligibility tags to your profile to unlock personalized discounts.'
            }
            action={
              <Link to="/profile" className="btn-primary">
                Update profile
              </Link>
            }
          />
        ) : (
          <>
            <p className="mb-3 text-xs text-slate-500">
              {ordered.length} deal{ordered.length === 1 ? '' : 's'}
              {user?.categories?.length && category === 'All' ? ' · your preferred categories are shown first' : ''}
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {ordered.map((d) => (
                <DiscountCard key={d.id} discount={d} onClaim={claim} />
              ))}
            </div>
          </>
        )}
      </div>

      <Toast message={toast} onDismiss={dismiss} />
    </div>
  );
}
