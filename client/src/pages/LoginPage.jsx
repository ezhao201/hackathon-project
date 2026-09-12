import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthShell from '../components/AuthShell';
import Alert from '../components/Alert';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const user = await login(form);
      const dest = user.onboarded ? location.state?.from || '/feed' : '/onboarding';
      navigate(dest, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to see the discounts waiting for you."
      footer={
        <>
          New here?{' '}
          <Link to="/register" className="font-semibold text-navy hover:underline dark:text-navy-200">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Alert>{error}</Alert>
        <div>
          <label htmlFor="email" className="label">
            Email
          </label>
          <input id="email" name="email" type="email" className="input" value={form.email} onChange={onChange} autoComplete="email" required />
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
            autoComplete="current-password"
            required
          />
        </div>
        <button type="submit" className="btn-primary w-full py-3" disabled={submitting}>
          {submitting ? 'Logging in…' : 'Log in'}
        </button>
        <button
          type="button"
          className="btn-outline w-full"
          disabled={submitting}
          onClick={() => setForm({ email: 'demo@andrew.cmu.edu', password: 'password123' })}
        >
          Use demo account
        </button>
        <p className="text-center text-xs text-slate-600 dark:text-slate-400">
          Demo: <span className="font-mono">demo@andrew.cmu.edu</span> / <span className="font-mono">password123</span>
        </p>
      </form>
    </AuthShell>
  );
}
