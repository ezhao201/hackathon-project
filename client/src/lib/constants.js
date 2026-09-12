export const ELIGIBILITY_OPTIONS = [
  {
    tag: 'Student',
    label: 'Student',
    hint: 'Verify with a .edu email address',
    icon: '🎓',
  },
  { tag: 'Veteran', label: 'Veteran / Military', hint: 'Active duty, reserves or veterans', icon: '🎖️' },
  { tag: 'Senior', label: 'Senior Citizen (65+)', hint: 'Age-based discounts', icon: '🌿' },
  { tag: 'Healthcare Worker', label: 'Healthcare Worker', hint: 'Nurses, doctors, techs and staff', icon: '🩺' },
  { tag: 'Teacher', label: 'Teacher / Educator', hint: 'K-12, university and educators', icon: '📚' },
  { tag: 'Low-income', label: 'Low-income (SNAP / EBT eligible)', hint: 'Assistance-based programs', icon: '🤝' },
  { tag: 'CMU Affiliate', label: 'CMU / Local University Affiliate', hint: 'Students, faculty and staff', icon: '🏛️' },
];

export const CATEGORY_OPTIONS = [
  { name: 'Food', icon: '🍽️' },
  { name: 'Tech', icon: '💻' },
  { name: 'Transport', icon: '🚌' },
  { name: 'Entertainment', icon: '🎬' },
  { name: 'Health', icon: '💚' },
];

export const CATEGORY_STYLES = {
  Food: 'bg-orange-50 text-orange-700 ring-orange-200',
  Tech: 'bg-sky-50 text-sky-700 ring-sky-200',
  Transport: 'bg-violet-50 text-violet-700 ring-violet-200',
  Entertainment: 'bg-pink-50 text-pink-700 ring-pink-200',
  Health: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  General: 'bg-slate-100 text-slate-700 ring-slate-200',
};

export const CATEGORY_COLORS = {
  Food: '#F97316',
  Tech: '#0EA5E9',
  Transport: '#8B5CF6',
  Entertainment: '#EC4899',
  Health: '#22C55E',
  General: '#64748B',
};

export const ELIGIBILITY_LABELS = {
  Student: 'Students Only',
  Veteran: 'Veterans / Military',
  Senior: 'Seniors 65+',
  'Healthcare Worker': 'Healthcare Workers',
  Teacher: 'Teachers / Educators',
  'Low-income': 'SNAP / EBT Eligible',
  'CMU Affiliate': 'CMU Affiliates',
};

export function formatDate(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatMoney(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n || 0);
}
