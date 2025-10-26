import { Globe } from "lucide-react";

export default function Header() {
  return (
    <header className="w-full bg-white shadow-sm fixed top-0 left-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between py-4 px-6">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <span className="text-red-600 font-bold text-xl">viettel</span>
          <span className="text-red-500 font-semibold text-xl">TUYỂN DỤNG</span>
        </div>

        {/* Menu */}
        <nav className="hidden md:flex items-center space-x-6 text-gray-700 font-medium">
          <a href="#" className="hover:text-red-600">Trang chủ</a>
          <a href="#" className="hover:text-red-600">Về chúng tôi</a>
          <a href="#" className="text-red-600 font-semibold">Tuyển dụng</a>
          <a href="#" className="hover:text-red-600">Đãi ngộ</a>
          <a href="#" className="hover:text-red-600">Sự kiện</a>
          <a href="#" className="hover:text-red-600">Liên hệ</a>
        </nav>

        {/* Right side */}
        <div className="flex items-center space-x-3">
          <button className="flex items-center gap-1 border rounded-full px-3 py-1.5 hover:bg-gray-100 transition">
            <Globe className="w-4 h-4" />
          </button>
          <button className="border border-red-500 text-red-600 font-medium rounded-full px-4 py-1.5 hover:bg-red-50 transition">
            ỨNG VIÊN
          </button>
          <button className="border border-red-500 text-white bg-red-500 font-medium rounded-full px-4 py-1.5 hover:bg-red-600 transition">
            NHÂN VIÊN
          </button>
        </div>
      </div>
    </header>
  );
}
