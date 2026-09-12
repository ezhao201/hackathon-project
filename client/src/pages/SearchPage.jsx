import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import DiscountCard from '../components/DiscountCard';
import EmptyState from '../components/EmptyState';
import Toast from '../components/Toast';
import Alert from '../components/Alert';
import { SearchIcon, XIcon } from '../components/Icons';
import { useClaim } from '../hooks/useClaim';
import { api } from '../lib/api';

const SUGGESTIONS = ['laptop', 'Spotify', 'bus', 'gym', 'grocery', 'museum'];

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const initial = params.get('q') || '';
  const [query, setQuery] = useState(initial);
  const [results, setResults] = useState(null);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { claim, toast, dismiss } = useClaim(setResults);

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
        <h1 className="text-3xl font-bold tracking-tight text-navy">Search discounts</h1>
        <p className="mt-1 text-sm text-slate-600">
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
              className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              aria-label="Clear search"
            >
              <XIcon className="h-4 w-4" />
            </button>
          )}
        </form>
        {!submitted && (
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setQuery(s)}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 transition hover:border-navy hover:text-navy"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8">
        {error && <Alert className="mb-4">{error}</Alert>}
        {loading && <p className="text-center text-sm text-slate-500">Searching…</p>}

        {!loading && submitted && results && results.length === 0 && (
          <EmptyState
            title={`No results for “${submitted}”`}
            body="Try a broader term like a category (food, tech) or a brand name."
          />
        )}

        {!loading && results && results.length > 0 && (
          <>
            <p className="mb-4 text-sm text-slate-600">
              <span className="font-semibold text-slate-800">{meta?.eligible}</span> of {meta?.total} result
              {meta?.total === 1 ? '' : 's'} for “{submitted}” match your profile.
            </p>
            {eligible.length > 0 && (
              <section aria-labelledby="eligible-heading">
                <h2 id="eligible-heading" className="mb-3 text-sm font-semibold uppercase tracking-wide text-accent-700">
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
                <h2 id="ineligible-heading" className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
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

      <Toast message={toast} onDismiss={dismiss} />
    </div>
  );
}
