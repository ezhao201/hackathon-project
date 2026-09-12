import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <p className="text-sm font-semibold text-accent-700 dark:text-accent-400">404</p>
      <h1 className="mt-2 text-3xl font-bold text-navy dark:text-white">Page not found</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">That page doesn&apos;t exist — but your discounts do.</p>
      <Link to="/" className="btn-primary mt-6">
        Back home
      </Link>
    </div>
  );
}
