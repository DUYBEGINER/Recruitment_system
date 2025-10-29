import { Link, useLocation } from "react-router-dom"
import { Book, Users, Upload, UserCheck, Calendar } from "lucide-react"
import useAuth from "../../hook/useAuth"

const AdminSidebar = () => {
  const location = useLocation()
  const { user } = useAuth()

  // Xác định base path theo role: TPNS → /TPNS, HR → /HR
  const basePath = user?.role === 'TPNS' ? '/TPNS' : '/HR'

  // Danh sách menu chung cho tất cả employer
  const commonNavItems = [
    { path: `${basePath}/jobs`, label: "Quản lí tin tuyển dụng", icon: Book },
    { path: `${basePath}/candidates`, label: "Quản lý ứng viên", icon: UserCheck },
    { path: `${basePath}/interviews`, label: "Lịch phỏng vấn", icon: Calendar },
  ]

  // Menu chỉ dành cho HR
  const hrOnlyItems = [
    { path: `${basePath}/createjob`, label: "Tạo tin tuyển dụng", icon: Upload },
  ]

  // Kết hợp menu dựa vào role
  const navItems = user?.role === 'TPNS' 
    ? [...commonNavItems]
    : [...commonNavItems, ...hrOnlyItems]

  return (
    <aside className="w-64 bg-gray-800 min-h-screen max-h-screen flex flex-col sticky top-0 z-20">
      {/* Logo */}
      <div className="p-6 flex items-center gap-3 border-b border-gray-700">
        <span className="font-semibold text-lg text-white">PDD Tuyển Dụng</span>
      </div>

      {/* User Role Badge */}
      {user && (
        <div className="px-6 py-4 border-b border-gray-700">
          <p className="text-xs text-gray-400 mb-1">Vai trò</p>
          <div className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
            user.role === 'TPNS' 
              ? 'bg-purple-900 text-purple-300' 
              : 'bg-blue-900 text-blue-300'
          }`}>
            {user.role === 'TPNS' ? 'Trưởng phòng NS' : 'Nhân viên HR'}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                isActive ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-slate-700"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <p className="text-xs text-gray-500 text-center">
          © 2025 PDD Tuyển Dụng
        </p>
      </div>
    </aside>
  )
}

export default AdminSidebar