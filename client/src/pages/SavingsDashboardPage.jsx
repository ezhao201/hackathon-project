import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import PageSpinner from '../components/PageSpinner';
import Alert from '../components/Alert';
import { AwardIcon, FlameIcon, TagIcon, TrendingUpIcon, WalletIcon } from '../components/Icons';
import { api } from '../lib/api';
import { CATEGORY_COLORS, formatMoney } from '../lib/constants';

function StatCard({ icon: Icon, label, value, hint, accent = false }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span className={`grid h-9 w-9 place-items-center rounded-xl ${accent ? 'bg-accent-50 text-accent-700' : 'bg-navy-50 text-navy'}`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { category, amount } = payload[0].payload;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-card">
      <p className="font-semibold text-slate-800">{category}</p>
      <p className="text-slate-600">{formatMoney(amount)} saved</p>
    </div>
  );
}

export default function SavingsDashboardPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    api.user
      .savings()
      .then((d) => !cancelled && setData(d))
      .catch((err) => !cancelled && setError(err.message));
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Alert>{error}</Alert>
      </div>
    );
  }
  if (!data) return <PageSpinner label="Crunching your savings…" />;

  const { stats, badges, chart, recentClaims } = data;
  const earned = badges.filter((b) => b.earned);
  const monthName = new Date().toLocaleDateString(undefined, { month: 'long' });
  const chartHasData = chart.some((c) => c.amount > 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-navy">Savings dashboard</h1>
          <p className="mt-1 text-sm text-slate-600">Estimated savings from the deals you&apos;ve claimed.</p>
        </div>
        <Link to="/feed" className="btn-outline">
          Find more deals
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={WalletIcon}
          label={`Saved in ${monthName}`}
          value={formatMoney(stats.savedThisMonth)}
          hint={`${stats.claimsThisMonth} deal${stats.claimsThisMonth === 1 ? '' : 's'} claimed this month`}
          accent
        />
        <StatCard icon={TrendingUpIcon} label="Saved all time" value={formatMoney(stats.totalSaved)} hint={`${stats.totalClaims} total claims`} />
        <StatCard
          icon={FlameIcon}
          label="Savings streak"
          value={`${stats.streak} day${stats.streak === 1 ? '' : 's'}`}
          hint={stats.streak > 0 ? 'Claim a deal today to keep it going' : 'Claim a deal to start a streak'}
        />
        <StatCard icon={AwardIcon} label="Badges earned" value={`${earned.length} / ${badges.length}`} hint="Keep saving to unlock more" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        {/* Chart */}
        <section className="card p-5 lg:col-span-3" aria-labelledby="chart-heading">
          <div className="flex items-center justify-between">
            <h2 id="chart-heading" className="text-base font-semibold text-slate-900">
              Savings by category
            </h2>
            <span className="text-xs text-slate-500">Last 30 days</span>
          </div>
          {chartHasData ? (
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chart} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="category" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: '#F1F5F9' }} />
                  <Bar dataKey="amount" radius={[8, 8, 0, 0]} maxBarSize={56}>
                    {chart.map((entry) => (
                      <Cell key={entry.category} fill={CATEGORY_COLORS[entry.category] || '#1E3A5F'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="mt-4 flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 text-center">
              <TagIcon className="h-8 w-8 text-slate-300" />
              <p className="mt-3 text-sm font-medium text-slate-700">No savings in the last 30 days</p>
              <p className="mt-1 text-xs text-slate-500">Claim a deal from your feed to see it here.</p>
              <Link to="/feed" className="btn-primary mt-4">
                Browse my discounts
              </Link>
            </div>
          )}
        </section>

        {/* Badges */}
        <section className="card p-5 lg:col-span-2" aria-labelledby="badges-heading">
          <h2 id="badges-heading" className="text-base font-semibold text-slate-900">
            Badges
          </h2>
          <ul className="mt-4 grid grid-cols-2 gap-3">
            {badges.map((b) => (
              <li
                key={b.id}
                className={`rounded-xl border p-3 text-center transition ${
                  b.earned ? 'border-accent-200 bg-accent-50' : 'border-slate-200 bg-slate-50 opacity-60'
                }`}
                title={b.description}
              >
                <span
                  className={`mx-auto grid h-10 w-10 place-items-center rounded-full ${
                    b.earned ? 'bg-accent text-white' : 'bg-slate-200 text-slate-400'
                  }`}
                >
                  <AwardIcon className="h-5 w-5" />
                </span>
                <p className="mt-2 text-sm font-semibold text-slate-800">{b.name}</p>
                <p className="mt-0.5 text-[11px] leading-tight text-slate-500">{b.description}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Recent claims */}
      <section className="card mt-6 p-5" aria-labelledby="recent-heading">
        <h2 id="recent-heading" className="text-base font-semibold text-slate-900">
          Recent claims
        </h2>
        {recentClaims.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">You haven&apos;t claimed any deals yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {recentClaims.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-800">{c.title}</p>
                  <p className="text-xs text-slate-500">
                    {c.brand} · {c.category} · {new Date(c.claimedAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-sm font-semibold text-accent-700">+{formatMoney(c.amountSaved)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
