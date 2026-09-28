import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import { Spinner } from './components/common/Spinner';

// Each route's page is its own chunk, fetched on demand instead of bundled
// into the initial load — e.g. a signed-out visitor never downloads the
// (heavier) authenticated dashboard code until they actually sign in.
const HomePage = lazy(() => import('./pages/Home').then((m) => ({ default: m.HomePage })));
const SigninPage = lazy(() => import('./pages/Signin').then((m) => ({ default: m.SigninPage })));
const SignupPage = lazy(() => import('./pages/Signup').then((m) => ({ default: m.SignupPage })));
const ForgotPasswordPage = lazy(() =>
  import('./pages/ForgotPassword').then((m) => ({ default: m.ForgotPasswordPage })),
);
const ResetPasswordPage = lazy(() =>
  import('./pages/ResetPassword').then((m) => ({ default: m.ResetPasswordPage })),
);
const DashboardPage = lazy(() => import('./pages/Dashboard').then((m) => ({ default: m.DashboardPage })));
const PublicBrainPage = lazy(() =>
  import('./pages/PublicBrain').then((m) => ({ default: m.PublicBrainPage })),
);
const PublicContentPage = lazy(() =>
  import('./pages/PublicContent').then((m) => ({ default: m.PublicContentPage })),
);

const FullPageSpinner: React.FC = () => (
  <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
    <Spinner />
  </div>
);

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <FullPageSpinner />;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/signin" replace />;
};

const PublicOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <FullPageSpinner />;
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Suspense fallback={<FullPageSpinner />}>
              <Routes>
                {/* Marketing home page */}
                <Route
                  path="/"
                  element={
                    <PublicOnlyRoute>
                      <HomePage />
                    </PublicOnlyRoute>
                  }
                />

                {/* Public Authentication Routes */}
                <Route
                  path="/signin"
                  element={
                    <PublicOnlyRoute>
                      <SigninPage />
                    </PublicOnlyRoute>
                  }
                />
                <Route
                  path="/signup"
                  element={
                    <PublicOnlyRoute>
                      <SignupPage />
                    </PublicOnlyRoute>
                  }
                />
                <Route
                  path="/forgot-password"
                  element={
                    <PublicOnlyRoute>
                      <ForgotPasswordPage />
                    </PublicOnlyRoute>
                  }
                />
                {/* Not gated by PublicOnlyRoute: a reset link must work even if
                    this browser still has an old/stale session logged in. */}
                <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

                {/* Protected App Workspace */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />

                {/* Shared Public Routes */}
                <Route path="/share/:hash/:contentId" element={<PublicContentPage />} />
                <Route path="/share/:hash" element={<PublicBrainPage />} />

                {/* Fallback Root Redirect */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;
