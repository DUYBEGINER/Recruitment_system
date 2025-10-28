import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../../hook/useAuth';

/**
 * PrivateRoute - Bảo vệ các trang cần đăng nhập (cho Candidate)
 * Chỉ cho phép truy cập khi đã đăng nhập và KHÔNG phải HR
 */
const PrivateRoute = ({ children }) => {
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

  // Chưa đăng nhập -> redirect về login
  if (!authenticate) {
    console.log("PrivateRoute - Not authenticated, redirecting to /login");
    return <Navigate to="/login" replace />;
  }

  // Nếu là TPNS hoặc HR thì không cho vào trang candidate
  const isEmployer = user?.role === 'TPNS' || user?.role === 'HR';
  if (isEmployer) {
    console.log("PrivateRoute - Employer user, redirecting to /HR/jobs");
    return <Navigate to="/HR/jobs" replace />;
  }

  // Candidate đã đăng nhập -> cho phép truy cập
  console.log("PrivateRoute - Allowing access for authenticated candidate");
  return children;
};

export default PrivateRoute;