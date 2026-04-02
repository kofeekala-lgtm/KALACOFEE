import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  user: any;
  allowedRoles?: string[];
  children: ReactNode;
}

/**
 * A wrapper component that protects routes based on authentication and roles.
 */
export default function ProtectedRoute({ 
  user, 
  allowedRoles, 
  children 
}: ProtectedRouteProps) {
  const location = useLocation();

  // 1. Not logged in -> Redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Role not authorized -> Redirect to dashboard or unauthorized
  if (allowedRoles && !allowedRoles.includes(user.role_name)) {
    console.warn(`User with role ${user.role_name} tried to access unauthorized route: ${location.pathname}`);
    
    // For now, redirect to /admin (POS) as the default "safe" place
    return <Navigate to="/admin" replace />;
  }

  // 3. Authorized -> Render children
  return <>{children}</>;
}
