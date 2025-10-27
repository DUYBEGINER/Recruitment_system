import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMessage } from "../context/MessageProvider";
import authAPI from "../api/authAPI";
import useAuth from "../hook/useAuth";

function EmployeeLoginPage() {
  const navigate = useNavigate();
  const message = useMessage();
  
  // --- State để lưu giá trị các input ---
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    rememberMe: false,
  });

  const { setUser, setAuthenticate } = useAuth();
  const [loading, setLoading] = useState(false);

  // --- Xử lý khi thay đổi input ---
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // --- Xử lý submit ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.username.trim()) {
      message.error("Vui lòng nhập tên đăng nhập!");
      return;
    }
    
    if (!formData.password.trim()) {
      message.error("Vui lòng nhập mật khẩu!");
      return;
    }

    try {
      setLoading(true);
      const result = await authAPI.employeeLogin(formData.username, formData.password);
      console.log("Kết quả đăng nhập nhân viên:", result);
      if (result.success) {
        message.success(result.message || "Đăng nhập thành công!");
        
        // Set user và authenticate state
        if (result.data && result.data.user) {
          setUser(result.data.user);
          setAuthenticate(true);
        }
        
        // Chuyển hướng ngay đến trang HR
        navigate("/HR/jobs", { replace: true });
      } else {
        message.error(result.message || "Đăng nhập thất bại!");
      }
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      message.error(error.response?.data?.message || "Lỗi đăng nhập. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 border-t-4 border-red-600">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <span className="text-red-600 font-bold text-2xl">PDD</span>
            <span className="text-red-500 font-semibold text-2xl">TUYỂN DỤNG</span>
          </div>
          <h1 className="text-3xl font-bold text-red-600 mb-2">
            Đăng nhập Nhân viên
          </h1>
          <p className="text-gray-600 text-sm">
            Dành cho HR và quản lý tuyển dụng
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Username */}
          <div>
            <label className="block text-red-700 font-medium mb-2">
              Tên đăng nhập
            </label>
            <input
              type="text"
              name="username"
              placeholder="Nhập tên đăng nhập"
              value={formData.username}
              onChange={handleChange}
              disabled={loading}
              className="w-full px-4 py-3 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              autoComplete="username"
            />
          </div>

          {/* Mật khẩu */}
          <div>
            <label className="block text-red-700 font-medium mb-2">
              Mật khẩu
            </label>
            <input
              type="password"
              name="password"
              placeholder="Nhập mật khẩu"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              className="w-full px-4 py-3 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              autoComplete="current-password"
            />
          </div>

          {/* Ghi nhớ đăng nhập + Quên mật khẩu */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-red-600 cursor-pointer">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                disabled={loading}
                className="accent-red-600 w-4 h-4 cursor-pointer"
              />
              <span>Ghi nhớ đăng nhập</span>
            </label>
            <a href="#" className="text-red-500 hover:underline hover:text-red-600">
              Quên mật khẩu?
            </a>
          </div>

          {/* Nút đăng nhập */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang đăng nhập...
              </>
            ) : (
              "Đăng nhập"
            )}
          </button>
        </form>

        {/* Đường kẻ phân cách */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">hoặc</span>
          </div>
        </div>

        {/* Link về trang ứng viên */}
        <p className="text-center text-sm text-gray-600">
          Bạn là ứng viên?{" "}
          <Link to="/login" className="text-red-600 font-semibold hover:underline hover:text-red-700">
            Đăng nhập tại đây
          </Link>
        </p>

        {/* Back to home */}
        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-gray-500 hover:text-red-600 hover:underline">
            ← Quay về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}

export default EmployeeLoginPage;
