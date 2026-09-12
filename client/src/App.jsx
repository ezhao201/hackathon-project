import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AlertsProvider } from './context/AlertsContext';
import { ThemeProvider } from './context/ThemeContext';
import { IntroProvider } from './context/IntroContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import PageSpinner from './components/PageSpinner';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OnboardingPage from './pages/OnboardingPage';
import FeedPage from './pages/FeedPage';
import SearchPage from './pages/SearchPage';
import SavingsDashboardPage from './pages/SavingsDashboardPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

// Send already-authenticated users straight to their feed from public pages.
function PublicOnly({ children }) {
  const { isAuthenticated, loading, user } = useAuth();
  if (loading) return <PageSpinner />;
  if (isAuthenticated) return <Navigate to={user.onboarded ? '/feed' : '/onboarding'} replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AlertsProvider>
            <IntroProvider>
              <Routes>
            <Route element={<Layout />}>
              <Route
                path="/"
                element={
                  <PublicOnly>
                    <LandingPage />
                  </PublicOnly>
                }
              />
              <Route
                path="/login"
                element={
                  <PublicOnly>
                    <LoginPage />
                  </PublicOnly>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicOnly>
                    <RegisterPage />
                  </PublicOnly>
                }
              />

              <Route element={<ProtectedRoute requireOnboarded={false} />}>
                <Route path="/onboarding" element={<OnboardingPage />} />
              </Route>

              <Route element={<ProtectedRoute />}>
                <Route path="/feed" element={<FeedPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/dashboard" element={<SavingsDashboardPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Route>
              </Routes>
            </IntroProvider>
          </AlertsProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
