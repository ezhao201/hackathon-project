import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import DiscountCard from '../components/DiscountCard';
import EmptyState from '../components/EmptyState';
import Toast from '../components/Toast';
import Alert from '../components/Alert';
import { SearchIcon, TrendingUpIcon, XIcon } from '../components/Icons';
import { useClaim } from '../hooks/useClaim';
import { api } from '../lib/api';

const SUGGESTIONS = ['laptop', 'Spotify', 'bus', 'gym', 'grocery', 'museum'];

/** Shown before a query is typed so the page has content on first load. */
function PopularThisWeek({ items, setItems, onClaim }) {
  useEffect(() => {
    let cancelled = false;
    api.discounts
      .feed({ sort: 'popular' })
      .then((data) => !cancelled && setItems(data.items.slice(0, 4)))
      .catch(() => !cancelled && setItems([]));
    return () => {
      cancelled = true;
    };
  }, [setItems]);

  if (!items || items.length === 0) return null;
  return (
    <section aria-labelledby="popular-heading" className="mt-12">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h2 id="popular-heading" className="inline-flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-white">
            <TrendingUpIcon className="h-4 w-4 text-accent" /> Popular this week
          </h2>
          <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">The most-claimed deals you qualify for right now.</p>
        </div>
        <Link to="/feed?sort=popular" className="text-sm font-medium text-navy hover:underline dark:text-navy-200">
          See all
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((d) => (
          <DiscountCard key={d.id} discount={d} onClaim={onClaim} />
        ))}
      </div>
    </section>
  );
}

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const initial = params.get('q') || '';
  const [query, setQuery] = useState(initial);
  const [results, setResults] = useState(null);
  const [popular, setPopular] = useState(null);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { claim, toast, dismiss } = useClaim(setResults);
  const { claim: claimPopular, toast: popularToast, dismiss: dismissPopular } = useClaim(setPopular);

  const submitted = params.get('q') || '';

  useEffect(() => {
    if (!submitted.trim()) {
      setResults(null);
      setMeta(null);
      return undefined;
    }
    let cancelled = false;
    setLoading(true);
    setError('');
    api.discounts
      .search(submitted)
      .then((data) => {
        if (cancelled) return;
        setResults(data.items);
        setMeta(data.meta);
      })
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [submitted]);

  // Debounce typing into the URL so results update as you type.
  useEffect(() => {
    const t = setTimeout(() => {
      const trimmed = query.trim();
      if (trimmed !== submitted) setParams(trimmed ? { q: trimmed } : {}, { replace: true });
    }, 300);
    return () => clearTimeout(t);
  }, [query, submitted, setParams]);

  const onSubmit = (e) => {
    e.preventDefault();
    setParams(query.trim() ? { q: query.trim() } : {}, { replace: true });
  };

  const eligible = results?.filter((r) => r.eligible) || [];
  const ineligible = results?.filter((r) => !r.eligible) || [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-bold tracking-tight text-navy dark:text-white">Search discounts</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Look up a product or store. Deals you can&apos;t use are grayed out — hover to see why.
        </p>
        <form onSubmit={onSubmit} className="relative mt-6" role="search">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            inputMode="search"
            enterKeyHint="search"
            className="input py-3.5 pl-12 pr-12 text-base shadow-card"
            placeholder='Try "laptop" or "Spotify"'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search discounts"
            autoFocus
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-navy dark:hover:bg-ink-muted dark:hover:text-slate-200"
              aria-label="Clear search"
            >
              <XIcon className="h-4 w-4" />
            </button>
          )}
        </form>
        {!submitted && (
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {SUGGESTIONS.map((s) => (
              <button key={s} type="button" onClick={() => setQuery(s)} className="pill-idle px-3 py-1.5">
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {!submitted && <PopularThisWeek items={popular} setItems={setPopular} onClaim={claimPopular} />}

      <div className="mt-8">
        {error && <Alert className="mb-4">{error}</Alert>}
        {loading && <p className="text-center text-sm text-slate-600 dark:text-slate-400">Searching…</p>}

        {!loading && submitted && results && results.length === 0 && (
          <EmptyState
            title={`No results for “${submitted}”`}
            body="Try a broader term like a category (food, tech) or a brand name."
          />
        )}

        {!loading && results && results.length > 0 && (
          <>
            <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
              <span className="font-semibold text-slate-800 dark:text-slate-100">{meta?.eligible}</span> of {meta?.total} result
              {meta?.total === 1 ? '' : 's'} for “{submitted}” match your profile.
            </p>
            {eligible.length > 0 && (
              <section aria-labelledby="eligible-heading">
                <h2 id="eligible-heading" className="mb-3 text-sm font-semibold uppercase tracking-wide text-accent-700 dark:text-accent-400">
                  You qualify
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {eligible.map((d) => (
                    <DiscountCard key={d.id} discount={d} onClaim={claim} />
                  ))}
                </div>
              </section>
            )}
            {ineligible.length > 0 && (
              <section aria-labelledby="ineligible-heading" className={eligible.length ? 'mt-10' : ''}>
                <h2 id="ineligible-heading" className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                  Not eligible
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {ineligible.map((d) => (
                    <DiscountCard key={d.id} discount={d} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      <Toast message={toast || popularToast} onDismiss={toast ? dismiss : dismissPopular} />
    </div>
  );
}
