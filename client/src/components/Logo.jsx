import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BRAND } from '../lib/constants';
import { useIntro } from '../context/IntroContext';

export const BRAND_MARK_LAYOUT_ID = 'brand-mark';

/** The navy square + green check used as the logo mark and as the intro's final checkmark. */
export function BrandMark({ className = 'h-8 w-8', layoutId, ...rest }) {
  return (
    <motion.span
      layoutId={layoutId}
      className={`grid place-items-center rounded-lg bg-navy dark:bg-navy-300 ${className}`}
      transition={{ type: 'spring', stiffness: 260, damping: 28 }}
      {...rest}
    >
      <svg viewBox="0 0 24 24" className="h-[62%] w-[62%]" fill="none" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 12.5l4 4 8-9" />
      </svg>
    </motion.span>
  );
}

export function BrandWordmark({ light = false, className = '' }) {
  const [head, tail] = [BRAND.replace(/Discount$/, ''), BRAND.endsWith('Discount') ? 'Discount' : ''];
  return (
    <span className={`font-bold tracking-tight ${light ? 'text-white' : 'text-navy dark:text-white'} ${className}`}>
      {head}
      <span className="text-accent">{tail}</span>
    </span>
  );
}

export default function Logo({ to = '/', light = false, className = '' }) {
  const { introActive } = useIntro();
  return (
    <Link to={to} className={`inline-flex items-center gap-2 ${className}`} aria-label={`${BRAND} home`}>
      {/* While the intro is on screen its checkmark owns the layoutId; once it finishes the mark morphs here. */}
      <BrandMark layoutId={introActive ? undefined : BRAND_MARK_LAYOUT_ID} />
      <BrandWordmark light={light} className="text-lg" />
    </Link>
  );
}
