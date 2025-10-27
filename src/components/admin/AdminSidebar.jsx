import { Link, useLocation } from "react-router-dom"
import { Home, Book, Users, Upload } from "lucide-react"

const AdminSidebar = () => {
  const location = useLocation()

  const navItems = [
    { path: "/HR", label: "Dashboard", icon: Home },
    { path: "/HR/jobs", label: "Quản lí tin tuyển dụng", icon: Book },
    { path: "/HR/upload", label: "Test Upload File", icon: Upload },
  ]

  return (
    <aside className="w-64 bg-gray-800 min-h-screen max-h-screen flex flex-col sticky top-0 z-20">
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        {/* <img src="/logo.png" alt="Logo" className="w-10 h-10"/> */}
        <span className="font-semibold text-lg text-white">PDD Tuyển Dụng</span>
      </div>

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
    </aside>
  )
}

export default AdminSidebar