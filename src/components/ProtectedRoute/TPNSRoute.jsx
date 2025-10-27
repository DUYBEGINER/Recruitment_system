import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../../hook/useAuth';

/**
 * TPNSRoute - Bảo vệ các trang dành RIÊNG cho Trưởng phòng nhân sự
 * Chỉ cho phép truy cập khi đã đăng nhập VÀ có role TPNS
 * HR thường sẽ KHÔNG được vào các trang này
 */
const TPNSRoute = ({ children }) => {
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
    console.log("TPNSRoute - Not authenticated, redirecting to /employee-login");
    return <Navigate to="/employee-login" replace />;
  }

  // Đã đăng nhập nhưng không phải TPNS -> redirect về /HR/jobs
  if (user?.role !== 'TPNS') {
    console.log("TPNSRoute - Not TPNS role, redirecting to /HR/jobs");
    return <Navigate to="/" replace />;
  }

  // Là TPNS -> cho phép truy cập
  console.log("TPNSRoute - TPNS access granted");
  return children;
};

export default TPNSRoute;
