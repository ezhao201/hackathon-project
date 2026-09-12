import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { useAlertsRefresh } from '../context/AlertsContext';

export default function Layout() {
  const { key } = useAlertsRefresh();
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar alertsKey={key} />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 text-xs text-slate-500 sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} KEMMDiscount · Discounts You Actually Qualify For</p>
          <p className="inline-flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" /> We never sell your data.
          </p>
        </div>
      </footer>
    </div>
  );
}
