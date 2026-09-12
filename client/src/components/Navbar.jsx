import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import NotificationBell from './NotificationBell';
import { LogOutIcon, MenuIcon, UserIcon, XIcon } from './Icons';

const NAV_LINKS = [
  { to: '/feed', label: 'My Discounts' },
  { to: '/search', label: 'Search' },
  { to: '/dashboard', label: 'Savings' },
];

export default function Navbar({ alertsKey }) {
  const { user, isAuthenticated, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  const linkClass = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition ${
      isActive ? 'bg-navy-50 text-navy' : 'text-slate-600 hover:bg-slate-100 hover:text-navy'
    }`;

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo to={isAuthenticated ? '/feed' : '/'} />

        {isAuthenticated ? (
          <>
            <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
              {NAV_LINKS.map((l) => (
                <NavLink key={l.to} to={l.to} className={linkClass}>
                  {l.label}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-1 sm:gap-2">
              <NotificationBell refreshKey={alertsKey} />
              <Link
                to="/profile"
                className="hidden items-center gap-2 rounded-full py-1 pl-1 pr-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 md:flex"
              >
                <span className="grid h-8 w-8 place-items-center rounded-full bg-navy text-xs font-bold text-white">
                  {user?.name?.[0]?.toUpperCase() || <UserIcon className="h-4 w-4" />}
                </span>
                <span className="max-w-[8rem] truncate">{user?.name}</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="hidden h-10 w-10 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-navy md:grid"
                aria-label="Log out"
              >
                <LogOutIcon className="h-5 w-5" />
              </button>
              <button
                type="button"
                className="grid h-10 w-10 place-items-center rounded-full text-slate-600 hover:bg-slate-100 md:hidden"
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="Toggle menu"
                aria-expanded={menuOpen}
              >
                {menuOpen ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/login" className="btn-ghost">
              Log in
            </Link>
            <Link to="/register" className="btn-primary">
              Get started
            </Link>
          </div>
        )}
      </div>

      {isAuthenticated && menuOpen && (
        <nav className="border-t border-slate-200 bg-white px-4 py-3 md:hidden" aria-label="Mobile">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} className={linkClass} onClick={() => setMenuOpen(false)}>
                {l.label}
              </NavLink>
            ))}
            <NavLink to="/profile" className={linkClass} onClick={() => setMenuOpen(false)}>
              Profile
            </NavLink>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              <LogOutIcon className="h-4 w-4" /> Log out
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}
