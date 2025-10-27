import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../../hook/useAuth';

/**
 * AuthRoute - Bảo vệ các trang login/register
 * Nếu đã đăng nhập thì redirect về home
 * Nếu chưa đăng nhập thì cho phép truy cập
 */
const AuthRoute = ({ children }) => {
  const { user, authenticate, loading } = useAuth();

  // Đợi check session xong
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang kiểm tra...</p>
        </div>
      </div>
    );
  }

  // Nếu đã đăng nhập, redirect về trang phù hợp
  if (authenticate && user) {
    console.log("AuthRoute - Already authenticated, redirecting");
    
    // Nếu là TPNS hoặc HR thì về dashboard HR
    if (user.role === 'TPNS' || user.role === 'HR') {
      return <Navigate to="/HR/jobs" replace />;
    }
    
    // Nếu là candidate thì về home
    return <Navigate to="/" replace />;
  }

  // Chưa đăng nhập -> cho phép truy cập login/register
  console.log("AuthRoute - Not authenticated, allowing access");
  return children;
};

export default AuthRoute;
