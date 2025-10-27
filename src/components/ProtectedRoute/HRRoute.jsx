import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../../hook/useAuth';

/**
 * HRRoute - Bảo vệ các trang dành RIÊNG cho HR
 * Chỉ cho phép truy cập khi đã đăng nhập VÀ có role HR
 * TPNS sẽ KHÔNG được vào các trang này (có routes riêng /TPNS/...)
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

  // Đã đăng nhập nhưng không phải HR -> redirect
  if (user?.role !== 'HR') {
    // Nếu là TPNS thì redirect về /TPNS/jobs
    if (user?.role === 'TPNS') {
      console.log("HRRoute - TPNS role, redirecting to /TPNS/jobs");
      return <Navigate to="/TPNS/jobs" replace />;
    }
    // Các role khác redirect về home
    console.log("HRRoute - Not HR role, redirecting to /");
    return <Navigate to="/" replace />;
  }

  // Là HR -> cho phép truy cập
  console.log("HRRoute - HR access granted");
  return children;
};

export default HRRoute;
