import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PageSpinner from './PageSpinner';

/**
 * Requires a logged-in user. If `requireOnboarded`, users who haven't finished
 * profile setup are redirected to onboarding first.
 */
export default function ProtectedRoute({ requireOnboarded = true }) {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) return <PageSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (requireOnboarded && !user.onboarded && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }
  return <Outlet />;
}
