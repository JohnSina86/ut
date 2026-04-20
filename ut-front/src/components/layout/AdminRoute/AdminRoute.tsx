import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Spinner } from '../../ui/Spinner/Spinner';

interface Props {
  children: React.ReactNode;
}

/**
 * Route guard that requires BOTH authentication and the `admin` role.
 * Non-admin users are redirected to the home page rather than the login
 * page, so customers poking around at /admin don't get a confusing
 * "please log in again" prompt.
 */
export const AdminRoute: React.FC<Props> = ({ children }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
        }}
      >
        <Spinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
