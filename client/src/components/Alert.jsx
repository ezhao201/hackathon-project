export default function Alert({ kind = 'error', children, className = '' }) {
  const styles = {
    error: 'border-red-200 bg-red-50 text-red-700',
    success: 'border-accent-200 bg-accent-50 text-accent-700',
    info: 'border-sky-200 bg-sky-50 text-sky-800',
  };
  if (!children) return null;
  return (
    <div role={kind === 'error' ? 'alert' : 'status'} className={`rounded-lg border px-3.5 py-2.5 text-sm ${styles[kind]} ${className}`}>
      {children}
    </div>
  );
}
