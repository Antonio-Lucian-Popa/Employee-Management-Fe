import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import type { UserRole, SubscriptionPlan } from '@/types';
import { FullPageLoader } from '@/components/Loader';

interface ProtectedRouteProps {
  children: ReactNode;
  roles?: UserRole[];
  plans?: SubscriptionPlan[];
}

export function ProtectedRoute({ children, roles, plans }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const { hasAccess } = useSubscriptionStore();

  if (isLoading) {
    return <FullPageLoader />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/403" replace />;
  }

  if (plans && !hasAccess(plans)) {
    return <Navigate to="/settings/subscription" replace />;
  }

  return <>{children}</>;
}
