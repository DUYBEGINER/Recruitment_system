import React from 'react';
import { Navigate } from 'react-router-dom';
import  useAuth  from '../hook/useAuth';

const ProtectedRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading && user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log("ProtectedRoute - Not authenticated, redirecting to /");
    return <Navigate to="/" replace />;
  }

  // Check if user is admin - redirect to admin dashboard
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'admin';
  
  if (isAdmin) {
    console.log("ProtectedRoute - Admin trying to access user route, redirecting to /admin");
    return <Navigate to="/admin" replace />;
  }

  console.log("ProtectedRoute - Allowing access for USER");
  return children;
};

export default ProtectedRoute;