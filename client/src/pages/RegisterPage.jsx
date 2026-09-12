import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthShell from '../components/AuthShell';
import Alert from '../components/Alert';
import { CheckCircleIcon } from '../components/Icons';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isEdu = /\.edu$/i.test(form.email.trim());

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register(form);
      navigate('/onboarding', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="We only ask for what we need to match you with discounts."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-navy hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Alert>{error}</Alert>
        <div>
          <label htmlFor="name" className="label">
            Full name
          </label>
          <input id="name" name="name" className="input" value={form.name} onChange={onChange} autoComplete="name" required />
        </div>
        <div>
          <label htmlFor="email" className="label">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="input"
            value={form.email}
            onChange={onChange}
            autoComplete="email"
            placeholder="you@andrew.cmu.edu"
            required
          />
          {isEdu ? (
            <p className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-accent-700">
              <CheckCircleIcon className="h-4 w-4" /> .edu email detected — you&apos;ll be tagged Student verified.
            </p>
          ) : (
            <p className="mt-1.5 text-xs text-slate-500">Use a .edu email to auto-verify student status.</p>
          )}
        </div>
        <div>
          <label htmlFor="password" className="label">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            className="input"
            value={form.password}
            onChange={onChange}
            autoComplete="new-password"
            minLength={8}
            required
          />
          <p className="mt-1.5 text-xs text-slate-500">At least 8 characters.</p>
        </div>
        <button type="submit" className="btn-primary w-full py-3" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Continue to profile setup'}
        </button>
      </form>
    </AuthShell>
  );
}
