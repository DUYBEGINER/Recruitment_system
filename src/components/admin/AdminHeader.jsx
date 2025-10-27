import { Moon, Sun } from "lucide-react"
import { Button } from "antd"
import useAuth from "../../hook/useAuth"

const AdminHeader = ({ title = "ADMIN" }) => {
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
  }

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 px-8 py-4 sticky top-0 z-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>

        <div className="flex items-center gap-4">
          <button
            variant="outline"
            onClick={handleLogout}
            className="border border-red-200 rounded-lg px-4 py-2 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950 bg-transparent"
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  )
}

export default AdminHeader
