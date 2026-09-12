export default function Alert({ kind = 'error', children, className = '' }) {
  const styles = {
    error: 'border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300',
    success: 'border-accent-200 bg-accent-50 text-accent-700 dark:border-accent-500/30 dark:bg-accent-500/10 dark:text-accent-300',
    info: 'border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-200',
  };
  if (!children) return null;
  return (
    <div role={kind === 'error' ? 'alert' : 'status'} className={`rounded-lg border px-3.5 py-2.5 text-sm ${styles[kind]} ${className}`}>
      {children}
    </div>
  );
}
