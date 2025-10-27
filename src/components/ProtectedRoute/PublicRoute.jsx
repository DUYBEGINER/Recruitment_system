import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../../hook/useAuth';

/**
 * PublicRoute - Cho phép truy cập trang công khai
 * Nhưng nếu là Employer (TPNS/HR) đã đăng nhập thì redirect về /HR/jobs
 */
const PublicRoute = ({ children }) => {
  const { user, authenticate, loading } = useAuth();

  // Đợi check session xong
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  // Nếu đã đăng nhập và là Employer (TPNS/HR) -> redirect về HR dashboard
  if (authenticate && user) {
    const isEmployer = user.role === 'TPNS' || user.role === 'HR';
    if (isEmployer) {
      console.log("PublicRoute - Employer detected, redirecting to /HR/jobs");
      return <Navigate to="/HR/jobs" replace />;
    }
  }

  // Cho phép truy cập (guest hoặc candidate)
  return children;
};

export default PublicRoute;
