import { Moon, Sun, User } from "lucide-react"
import { Button } from "antd"
import useAuth from "../../hook/useAuth"
import { useNavigate } from "react-router-dom"

const AdminHeader = ({ title = "ADMIN" }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate("/employee-login", { replace: true })
  }

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 px-8 py-4 sticky top-0 z-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>

        <div className="flex items-center gap-4">
          {/* User Info */}
          {user && (
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-800 rounded-lg">
              <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {user.full_name || user.username}
              </span>
              {user.role && (
                <span className={`ml-2 text-xs px-2 py-1 rounded-full font-semibold ${
                  user.role === 'TPNS' 
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' 
                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                }`}>
                  {user.role === 'TPNS' ? 'Trưởng phòng NS' : 'HR'}
                </span>
              )}
            </div>
          )}
          
          {/* Logout Button */}
          <button
            variant="outline"
            onClick={handleLogout}
            className="border border-red-200 rounded-lg px-4 py-2 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950 bg-transparent transition-colors"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </header>
  )
}

export default AdminHeader
