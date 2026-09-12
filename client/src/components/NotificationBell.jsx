import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { BellIcon, ClockIcon } from './Icons';
import { formatDate } from '../lib/constants';

export default function NotificationBell({ refreshKey = 0 }) {
  const [alerts, setAlerts] = useState([]);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    api.discounts
      .alerts()
      .then((data) => !cancelled && setAlerts(data.items))
      .catch(() => !cancelled && setAlerts([]));
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  useEffect(() => {
    if (!open) return undefined;
    const onClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const count = alerts.length;

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative grid h-10 w-10 place-items-center rounded-full text-slate-600 transition hover:bg-slate-100 hover:text-navy focus:outline-none focus-visible:ring-2 focus-visible:ring-navy dark:text-slate-300 dark:hover:bg-ink-muted dark:hover:text-white dark:focus-visible:ring-navy-300"
        aria-label={`Expiry alerts${count ? `, ${count} expiring soon` : ''}`}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <BellIcon className="h-5 w-5" />
        {count > 0 && (
          <span
            data-testid="alert-count"
            className="absolute -right-0.5 -top-0.5 grid h-5 min-w-[1.25rem] place-items-center rounded-full bg-accent px-1 text-[11px] font-bold text-white ring-2 ring-white dark:ring-ink"
          >
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-40 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card-hover dark:border-ink-border dark:bg-ink-card"
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-ink-border">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Expiring within 7 days</h3>
            <span className="text-xs text-slate-600 dark:text-slate-400">{count} deal{count === 1 ? '' : 's'}</span>
          </div>
          {count === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-slate-600 dark:text-slate-400">
              Nothing expiring soon. You&apos;re all caught up.
            </p>
          ) : (
            <ul className="max-h-80 divide-y divide-slate-100 overflow-y-auto dark:divide-ink-border">
              {alerts.map((a) => (
                <li key={a.id} className="px-4 py-3">
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-0.5 grid h-8 w-8 flex-none place-items-center rounded-full ${
                        a.daysUntilExpiry <= 2 ? 'bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-300' : 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300'
                      }`}
                    >
                      <ClockIcon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{a.title}</p>
                      <p className="truncate text-xs text-slate-600 dark:text-slate-400">{a.description}</p>
                      <p className={`mt-1 text-xs font-medium ${a.daysUntilExpiry <= 2 ? 'text-red-600 dark:text-red-300' : 'text-amber-700 dark:text-amber-300'}`}>
                        {a.daysUntilExpiry === 0
                          ? 'Expires today'
                          : a.daysUntilExpiry === 1
                            ? 'Expires tomorrow'
                            : `Expires in ${a.daysUntilExpiry} days`}{' '}
                        · {formatDate(a.expiry)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="border-t border-slate-100 bg-slate-50 px-4 py-2.5 text-center dark:border-ink-border dark:bg-ink-muted">
            <Link
              to="/feed?sort=expiring"
              onClick={() => setOpen(false)}
              className="text-sm font-medium text-navy hover:underline dark:text-navy-200"
            >
              View all expiring deals
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
