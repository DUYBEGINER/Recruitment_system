import { Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hook/useAuth";
import {Link} from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <header className="w-full bg-white shadow-sm fixed top-0 left-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between py-4 px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-red-600 font-bold text-xl">PDD</span>
          <span className="text-red-500 font-semibold text-xl">TUYỂN DỤNG</span>
        </Link>

        {/* Menu */}
        <nav className="hidden md:flex items-center space-x-6 text-gray-700 font-medium">
          <a href="/" className="hover:text-red-600">Trang chủ</a>
          <a href="/" className="hover:text-red-600">Về chúng tôi</a>
          <a href="/job-page" className="hover:text-red-600">Tuyển dụng</a>
          <a href="/" className="hover:text-red-600">Đãi ngộ</a>
          <a href="/" className="hover:text-red-600">Sự kiện</a>
          <a href="/" className="hover:text-red-600">Liên hệ</a>
        </nav>

        {/* Right side */}
        {!user ? (
        <div className="flex items-center space-x-3">
          <button className="flex items-center gap-1 border rounded-full px-3 py-1.5 hover:bg-gray-100 transition">
            <Globe className="w-4 h-4" />
          </button>
          <button onClick={() => {navigate("/login")}} className="border border-red-500 text-red-600 font-medium rounded-full px-4 py-1.5 hover:bg-red-50 transition">
            ỨNG VIÊN
          </button>
          <button onClick={() => {navigate("/employee-login")}} className="border border-red-500 text-white bg-red-500 font-medium rounded-full px-4 py-1.5 hover:bg-red-600 transition">
            NHÂN VIÊN
          </button>
        </div>) : (
        <div className="flex items-center space-x-3">
          <span className="text-gray-700 font-medium">Xin chào, {user.fullname}</span>
          <button onClick={logout} className="border border-red-500 text-red-600 font-medium rounded-full px-4 py-1.5 hover:bg-red-50 transition">
            Đăng xuất
          </button>
        </div>
        )}
      </div>
    </header>
  );
}
