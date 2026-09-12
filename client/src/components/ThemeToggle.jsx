import { useTheme } from '../context/ThemeContext';
import { MoonIcon, SunIcon } from './Icons';

export default function ThemeToggle({ className = '' }) {
  const { isDark, toggle } = useTheme();
  return (
    <button
      type="button"
      onClick={toggle}
      className={`grid h-10 w-10 place-items-center rounded-full text-slate-600 transition hover:bg-slate-100 hover:text-navy focus:outline-none focus-visible:ring-2 focus-visible:ring-navy dark:text-slate-300 dark:hover:bg-ink-muted dark:hover:text-white dark:focus-visible:ring-navy-300 ${className}`}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      {isDark ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
    </button>
  );
}
