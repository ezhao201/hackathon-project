export const BRAND = 'KEMMDiscount';

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
  { name: 'Health', icon: '💊' },
];

// Green is reserved for eligibility confirmation, so Health uses teal.
export const CATEGORY_STYLES = {
  Food: 'bg-orange-50 text-orange-700 ring-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:ring-orange-500/30',
  Tech: 'bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-500/30',
  Transport: 'bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-500/30',
  Entertainment: 'bg-pink-50 text-pink-700 ring-pink-200 dark:bg-pink-500/10 dark:text-pink-300 dark:ring-pink-500/30',
  Health: 'bg-teal-50 text-teal-700 ring-teal-200 dark:bg-teal-500/10 dark:text-teal-300 dark:ring-teal-500/30',
  General: 'bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-500/10 dark:text-slate-300 dark:ring-slate-500/30',
};

export const CATEGORY_COLORS = {
  Food: '#F97316',
  Tech: '#0EA5E9',
  Transport: '#8B5CF6',
  Entertainment: '#EC4899',
  Health: '#0EA5A5',
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

// Noun phrases used to build "You qualify as …" sentences on discount cards.
export const QUALIFY_PHRASES = {
  Student: 'a Student',
  Veteran: 'Veteran / Military',
  Senior: 'a Senior (65+)',
  'Healthcare Worker': 'a Healthcare Worker',
  Teacher: 'a Teacher / Educator',
  'Low-income': 'SNAP / EBT eligible',
  'CMU Affiliate': 'a CMU Affiliate',
};

function joinNatural(parts) {
  if (parts.length <= 1) return parts[0] || '';
  if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;
  return `${parts.slice(0, -1).join(', ')}, and ${parts[parts.length - 1]}`;
}

export function qualifySentence(matchedTags = []) {
  if (!matchedTags.length) return 'Open to everyone';
  return `You qualify as ${joinNatural(matchedTags.map((t) => QUALIFY_PHRASES[t] || t))}`;
}

export function requiresSentence(requiredTags = []) {
  if (!requiredTags.length) return 'Open to everyone';
  const labels = requiredTags.map((t) => ELIGIBILITY_LABELS[t] || t);
  return `Requires ${labels.length === 1 ? labels[0] : `one of: ${labels.join(', ')}`}`;
}

export function formatDate(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatMoney(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n || 0);
}

export function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}
