import { Link } from 'react-router-dom';

export default function Logo({ to = '/', light = false, className = '' }) {
  return (
    <Link to={to} className={`inline-flex items-center gap-2 ${className}`} aria-label="KEMMDiscount home">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-navy">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 12.5l4 4 8-9" />
        </svg>
      </span>
      <span className={`text-lg font-bold tracking-tight ${light ? 'text-white' : 'text-navy'}`}>
        KEMM<span className="text-accent">Discount</span>
      </span>
    </Link>
  );
}
