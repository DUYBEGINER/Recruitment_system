import React, { useState } from "react";
import MainLayout from "../layout/MainLayout";
import { useMessage } from "../context/MessageProvider";
import { loginRequest } from "../api/authAPI";
import { Link } from "react-router-dom";

function LoginPage() {
  // --- State để lưu giá trị các input ---
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const message = useMessage();

  console.log("formData", formData);

  // --- Xử lý khi thay đổi input ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // --- Xử lý submit ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = formData;
    try {
      const result = await loginRequest(email, password);
      console.log("Kết quả đăng nhập:", result);
      message.success(result.message || "Đăng nhập thành công!");
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      message.error(error.message || "Lỗi đăng nhập");
    }
  };

  return (
    <MainLayout>
      <div className="min-h-[calc(80vh)] flex items-center justify-center bg-white">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 border-t-4 border-red-600">
          <h1 className="text-3xl font-bold text-center text-red-600 mb-6">
            Đăng nhập
          </h1>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <label className="block text-red-700 font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="Nhập email của bạn"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
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
                className="w-full px-4 py-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Ghi nhớ đăng nhập + Quên mật khẩu */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-red-600">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="accent-red-600"
                />
                Ghi nhớ đăng nhập
              </label>
              <a href="#" className="text-red-500 hover:underline">
                Quên mật khẩu?
              </a>
            </div>

            {/* Nút đăng nhập */}
            <button
              type="submit"
              className="w-full py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-all duration-300"
            >
              Đăng nhập
            </button>
          </form>

          <p className="text-center text-sm text-red-600 mt-6">
            Chưa có tài khoản?{" "}
            <Link to="/register" className="font-semibold hover:underline">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </MainLayout>
  );
}

export default LoginPage;
