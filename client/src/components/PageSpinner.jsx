export default function PageSpinner({ label = 'Loading…' }) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center" role="status" aria-live="polite">
      <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-navy dark:border-slate-600 dark:border-t-navy-300" />
        {label}
      </div>
    </div>
  );
}
