import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { authApi } from '@/api/endpoints';
import { ProtectedRoute } from './ProtectedRoute';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { VerifyEmailPage } from '@/pages/VerifyEmailPage';
import { InvitationPage } from '@/pages/InvitationPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { AttendancePage } from '@/pages/AttendancePage';
import { LeavesPage } from '@/pages/LeavesPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { UsersPage } from '@/pages/UsersPage';
import { SubscriptionPage } from '@/pages/SubscriptionPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { BillingSuccessPage } from '@/pages/BillingSuccessPage';
import { BillingCancelPage } from '@/pages/BillingCancelPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { UnauthorizedPage } from '@/pages/UnauthorizedPage';
import { FullPageLoader } from '@/components/Loader';
import Onboarding from '@/pages/Onboarding';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <>{children}</>;
}

export function AppRouter() {
  const { setUser, setLoading, isLoading } = useAuthStore();
  const { setPlan } = useSubscriptionStore();

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await authApi.me();
        setUser(response.data);
        setPlan(response.data.tenantId as any);
      } catch {
        localStorage.removeItem('accessToken');
        setUser(null);
      }
    };

    initAuth();
  }, [setUser, setLoading, setPlan]);

  if (isLoading) {
    return <FullPageLoader />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <AuthGuard>
              <AuthLayout>
                <LoginPage />
              </AuthLayout>
            </AuthGuard>
          }
        />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/oauth-success" element={<DashboardPage />} />
        <Route
          path="/register"
          element={
            <AuthGuard>
              <AuthLayout>
                <RegisterPage />
              </AuthLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/verify-email"
          element={
            <AuthLayout>
              <VerifyEmailPage />
            </AuthLayout>
          }
        />
        <Route
          path="/invite/:token"
          element={
            <InvitationPage />
          }
        />
        <Route path="/billing/success" element={<BillingSuccessPage />} />
        <Route path="/billing/cancel" element={<BillingCancelPage />} />

        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/leaves" element={<LeavesPage />} />
          <Route
            path="/reports/monthly"
            element={
              <ProtectedRoute plans={['PRO', 'ENTERPRISE', 'TRIAL']}>
                <ReportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute roles={['OWNER', 'ADMIN']}>
                <UsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings/subscription"
            element={
              <ProtectedRoute roles={['OWNER']}>
                <SubscriptionPage />
              </ProtectedRoute>
            }
          />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/403" element={<UnauthorizedPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
