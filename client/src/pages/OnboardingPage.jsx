import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileForm from '../components/ProfileForm';
import { LockIcon, ShieldIcon } from '../components/Icons';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

export default function OnboardingPage() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    try {
      const data = await api.user.updateProfile(payload);
      setUser(data.user);
      navigate('/feed', { replace: true });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-accent-700">Step 1 of 1 · Profile setup</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-navy">
          Hi {user?.name?.split(' ')[0]}, let&apos;s build your profile
        </h1>
        <p className="mt-2 text-slate-600">
          This is how we know which discounts you qualify for. Answer honestly — it only takes a minute.
        </p>
      </div>

      <div className="mb-6 flex items-start gap-3 rounded-xl border border-accent-200 bg-accent-50 p-4">
        <ShieldIcon className="mt-0.5 h-5 w-5 flex-none text-accent-700" />
        <div className="text-sm text-accent-700">
          <p className="font-semibold">We never sell your data.</p>
          <p className="mt-0.5 text-accent-700/90">
            We store only your name, email, the eligibility tags you select and your location preference — nothing
            else. Your profile is used solely to match you with discounts.
          </p>
        </div>
      </div>

      <div className="card p-6 sm:p-8">
        <ProfileForm user={user} onSubmit={handleSubmit} submitLabel="Show my discounts" submitting={submitting} />
      </div>

      <p className="mt-6 inline-flex items-center gap-1.5 text-xs text-slate-500">
        <LockIcon className="h-3.5 w-3.5" /> Your selections are private and never shared with brands.
      </p>
    </div>
  );
}
