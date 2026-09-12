import { useState } from 'react';
import { CATEGORY_STYLES, formatDate } from '../lib/constants';
import { CheckCircleIcon, ClockIcon, ExternalLinkIcon, InfoIcon, LockIcon, MapPinIcon, TagIcon } from './Icons';

function ExpiryLabel({ discount }) {
  if (discount.isExpired) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400">
        <ClockIcon className="h-3.5 w-3.5" /> Expired {formatDate(discount.expiry)}
      </span>
    );
  }
  const urgent = discount.expiringSoon;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${urgent ? 'text-amber-600' : 'text-slate-500'}`}>
      <ClockIcon className="h-3.5 w-3.5" />
      {urgent
        ? discount.daysUntilExpiry === 0
          ? 'Expires today'
          : `Expires in ${discount.daysUntilExpiry}d`
        : `Expires ${formatDate(discount.expiry)}`}
    </span>
  );
}

/**
 * Card used in the feed and search results.
 * Ineligible discounts render grayed out with a tooltip explaining why.
 */
export default function DiscountCard({ discount, onClaim }) {
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState('');
  const ineligible = !discount.eligible;
  const disabled = ineligible || discount.isExpired || discount.claimed;

  const handleClaim = async () => {
    if (disabled || !onClaim) return;
    setClaiming(true);
    setError('');
    try {
      await onClaim(discount);
    } catch (err) {
      setError(err.message);
    } finally {
      setClaiming(false);
    }
  };

  const hasExternalLink = discount.link && discount.link !== '#';

  return (
    <article
      className={`card group relative flex flex-col p-5 transition ${
        ineligible ? 'opacity-60 grayscale' : 'hover:-translate-y-0.5 hover:shadow-card-hover'
      } ${discount.isExpired && !ineligible ? 'opacity-75' : ''}`}
      aria-label={`${discount.brand}: ${discount.description}`}
    >
      {ineligible && (
        <div className="absolute right-4 top-4 z-10">
          <div className="group/tip relative">
            <span
              tabIndex={0}
              className="chip cursor-help bg-slate-200 text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-navy"
              aria-describedby={`why-${discount.id}`}
            >
              <LockIcon className="h-3 w-3" /> Not eligible <InfoIcon className="h-3 w-3" />
            </span>
            <div
              id={`why-${discount.id}`}
              role="tooltip"
              className="pointer-events-none absolute right-0 top-full z-20 mt-2 w-64 rounded-lg bg-slate-900 px-3 py-2 text-xs leading-relaxed text-white opacity-0 shadow-lg transition group-hover/tip:opacity-100 group-focus-within/tip:opacity-100"
            >
              {discount.ineligibleReason}
              <span className="absolute -top-1 right-4 h-2 w-2 rotate-45 bg-slate-900" />
            </div>
          </div>
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className={`chip ring-1 ${CATEGORY_STYLES[discount.category] || CATEGORY_STYLES.General}`}>{discount.category}</span>
          <h3 className="mt-3 truncate text-base font-semibold text-slate-900">{discount.brand}</h3>
          {discount.title !== discount.brand && <p className="truncate text-xs text-slate-500">{discount.title}</p>}
        </div>
      </div>

      <p className="mt-2 text-lg font-bold leading-snug text-navy">{discount.description}</p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="chip bg-accent-50 text-accent-700" title={discount.eligibility.join(', ')}>
          <TagIcon className="h-3 w-3" /> {discount.eligibilityLabel}
        </span>
        <span className="chip bg-slate-100 text-slate-600">
          <MapPinIcon className="h-3 w-3" /> {discount.location}
        </span>
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <ExpiryLabel discount={discount} />
        <div className="flex items-center gap-2">
          {hasExternalLink && !ineligible && (
            <a
              href={discount.link}
              target="_blank"
              rel="noreferrer noopener"
              className="btn-ghost h-9 w-9 !p-0"
              aria-label={`Open ${discount.brand} offer`}
              title="Open offer"
            >
              <ExternalLinkIcon className="h-4 w-4" />
            </a>
          )}
          {discount.claimed ? (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-accent-50 px-3 py-2 text-sm font-semibold text-accent-700">
              <CheckCircleIcon className="h-4 w-4" /> Claimed
            </span>
          ) : (
            <button
              type="button"
              className="btn-primary h-9 px-4"
              disabled={disabled || claiming}
              onClick={handleClaim}
              title={ineligible ? discount.ineligibleReason : discount.isExpired ? 'This deal has expired' : 'Claim this deal'}
            >
              {claiming ? 'Claiming…' : discount.isExpired ? 'Expired' : 'Claim'}
            </button>
          )}
        </div>
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </article>
  );
}
