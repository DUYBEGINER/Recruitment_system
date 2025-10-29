import { Globe } from "lucide-react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import useAuth from "../hook/useAuth";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  // Helper function để check active link
  const isActive = (path) => location.pathname === path;

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
          <Link 
            to="/" 
            className={`hover:text-red-600 transition-colors ${isActive('/') ? 'text-red-600 font-semibold' : ''}`}
          >
            Trang chủ
          </Link>
          <Link 
            to="/" 
            className={`hover:text-red-600 transition-colors ${isActive('/aboutus') ? 'text-red-600 font-semibold' : ''}`}
          >
            Về chúng tôi
          </Link>
          <Link 
            to="/job-page" 
            className={`hover:text-red-600 transition-colors ${isActive('/job-page') ? 'text-red-600 font-semibold' : ''}`}
          >
            Tuyển dụng
          </Link>
          <Link 
            to="/" 
            className={`hover:text-red-600 transition-colors ${isActive('/benefits') ? 'text-red-600 font-semibold' : ''}`}
          >
            Đãi ngộ
          </Link>
          <Link 
            to="/" 
            className={`hover:text-red-600 transition-colors ${isActive('/events') ? 'text-red-600 font-semibold' : ''}`}
          >
            Sự kiện
          </Link>
          <Link 
            to="/" 
            className={`hover:text-red-600 transition-colors ${isActive('/contact') ? 'text-red-600 font-semibold' : ''}`}
          >
            Liên hệ
          </Link>
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
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <Link
              to="/profile"
              className="text-gray-700 font-medium hover:text-blue-600 transition"
            >
              <span>Xin chào, {user?.full_name || user?.username || user?.email}</span>
              {user.role && (
                <span className="ml-2 text-xs px-2 py-1 rounded-full bg-red-100 text-red-600 font-semibold">
                  {user.role === "TPNS" ? "Trưởng phòng NS" : user.role}
                </span>
              )}
            </Link>
            <button
              onClick={async () => { await logout(); navigate("/", { replace: true }); }}
              className="border border-red-500 text-red-600 font-medium rounded-full px-4 py-1.5 hover:bg-red-50 transition"
            >
              Đăng xuất
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
