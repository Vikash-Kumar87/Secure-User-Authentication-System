import { Navigate, Outlet } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';

export default function ProtectedRoute({ user, authLoading }) {
  if (authLoading) {
    return (
      <div className="mx-auto flex min-h-screen max-w-5xl items-center justify-center px-4">
        <LoadingSpinner text="Checking session..." />
      </div>
    );
  }

  if (!user || !user.emailVerified) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
