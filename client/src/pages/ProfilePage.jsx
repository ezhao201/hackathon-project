import { useState } from 'react';
import ProfileForm from '../components/ProfileForm';
import Alert from '../components/Alert';
import { ShieldIcon } from '../components/Icons';
import { useAuth } from '../context/AuthContext';
import { useAlertsRefresh } from '../context/AlertsContext';
import { api } from '../lib/api';

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const { refresh } = useAlertsRefresh();
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    setSaved(false);
    try {
      const data = await api.user.updateProfile(payload);
      setUser(data.user);
      refresh();
      setSaved(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight text-navy">Your profile</h1>
      <p className="mt-2 text-slate-600">Update your eligibility and preferences. Your feed updates instantly.</p>

      <div className="card mt-6 p-5">
        <dl className="grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-slate-500">Name</dt>
            <dd className="font-medium text-slate-800">{user.name}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Email</dt>
            <dd className="font-medium text-slate-800">{user.email}</dd>
          </div>
        </dl>
        <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-slate-500">
          <ShieldIcon className="h-4 w-4 text-accent" /> This is everything we store about you, plus the selections below.
        </p>
      </div>

      {saved && (
        <Alert kind="success" className="mt-6">
          Profile saved. Your discount feed has been updated.
        </Alert>
      )}

      <div className="card mt-6 p-6 sm:p-8">
        <ProfileForm key={user.id} user={user} onSubmit={handleSubmit} submitLabel="Save changes" submitting={submitting} />
      </div>
    </div>
  );
}
