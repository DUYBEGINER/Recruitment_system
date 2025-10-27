import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import MainLayout from "../layout/MainLayout";
import { validateSignup } from "../utils/validatorInput";
import { useMessage } from "../context/MessageProvider";
import { registerRequest } from "../api/authAPI";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function RegisterPage() {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({}); // <-- lỗi theo từng field

  const message = useMessage();
  const navigate = useNavigate();

  // helper áp dụng class theo trạng thái lỗi
  const inputClass = (hasError) =>
    `w-full border rounded-lg px-4 py-2 focus:ring-2 outline-none ${
      hasError
        ? "border-red-500 focus:ring-red-400"
        : "border-gray-300 focus:ring-red-500"
    }`;

  // Khi gõ: cập nhật form + validate riêng field đó để clear lỗi sớm
  const handleChange = (e) => {
    const { name, value } = e.target;
    const next = { ...formData, [name]: value };
    setFormData(next);

    // Re-validate và chỉ cập nhật lỗi của field đang sửa
    const nextErrors = validateSignup(next).errors;
    setErrors((prev) => ({
      ...prev,
      // full_name dùng key "displayName" trong validator của bạn
      ...(name === "full_name"
        ? { displayName: nextErrors.displayName }
        : { [name]: nextErrors[name] }),
    }));
  };

  // Submit: validate toàn bộ, set lỗi theo field
  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = validateSignup(formData);
    if (result.valid) {
      try {
        // Call API đăng ký
        const result = await registerRequest(formData);
        console.log("Kết quả đăng ký:", result);
        message.success(result.message || "Đăng ký thành công!");
        setErrors({});
        navigate("/login");
      } catch (err) {
        console.error("Lỗi đăng ký:", err);
        message.error(err.message || "Lỗi server khi đăng ký");
      }
    } else {
      setErrors(result.errors);
      message.error("Lỗi đăng kí! Vui lòng kiểm tra lại thông tin.");
    }
  };

  return (
    <MainLayout>
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md border-t-4 border-red-600">
          <h2 className="text-2xl font-bold text-center text-red-600 mb-6">
            Đăng ký tài khoản
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Họ và tên */}
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Họ và tên
              </label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className={inputClass(Boolean(errors.displayName))}
                placeholder="Nhập họ và tên"
              />
              {errors.displayName && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.displayName}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={inputClass(Boolean(errors.email))}
                placeholder="example@gmail.com"
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Số điện thoại */}
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Số điện thoại
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={inputClass(Boolean(errors.phone))}
                placeholder="Nhập số điện thoại"
              />
              {errors.phone && (
                <p className="text-red-600 text-sm mt-1">{errors.phone}</p>
              )}
            </div>

            {/* Mật khẩu */}
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={inputClass(Boolean(errors.password)) + " pr-10"}
                  placeholder="Nhập mật khẩu"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-500 hover:text-red-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-600 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {/* Nhập lại mật khẩu */}
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Nhập lại mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={
                    inputClass(Boolean(errors.confirmPassword)) + " pr-10"
                  }
                  placeholder="Nhập lại mật khẩu"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-2.5 text-gray-500 hover:text-red-600"
                >
                  {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-red-600 text-white font-semibold rounded-lg py-2 hover:bg-red-700 transition"
            >
              Đăng ký
            </button>

            <p className="text-center text-sm text-gray-600 mt-4">
              Đã có tài khoản?{" "}
              <Link
                to="/login"
                className="text-red-600 font-medium hover:underline"
              >
                Đăng nhập
              </Link>
            </p>
          </form>
        </div>
      </div>
    </MainLayout>
  );
}

export default RegisterPage;
