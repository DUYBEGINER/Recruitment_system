import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../../hook/useAuth';

/**
 * HRRoute - Bảo vệ các trang dành cho Employer (TPNS/HR)
 * Chỉ cho phép truy cập khi đã đăng nhập VÀ có role TPNS hoặc HR
 */
const HRRoute = ({ children }) => {
  const { user, authenticate, loading } = useAuth();

  // Đợi check session xong
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang kiểm tra quyền...</p>
        </div>
      </div>
    );
  }

  // Chưa đăng nhập -> redirect về employee login
  if (!authenticate) {
    console.log("HRRoute - Not authenticated, redirecting to /employee-login");
    return <Navigate to="/employee-login" replace />;
  }

  // Đã đăng nhập nhưng không phải TPNS/HR -> redirect về home
  const isEmployer = user?.role === 'TPNS' || user?.role === 'HR';
  if (!isEmployer) {
    console.log("HRRoute - Not employer role, redirecting to /");
    return <Navigate to="/" replace />;
  }

  // Là TPNS/HR -> cho phép truy cập
  console.log(`HRRoute - ${user.role} access granted`);
  return children;
};

export default HRRoute;
