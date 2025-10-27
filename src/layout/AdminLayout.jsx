import AdminSidebar from "../components/admin/AdminSidebar"
import AdminHeader from "../components/admin/AdminHeader"

const AdminLayout = ({ children, title }) => {
  return (
    <div className="flex min-h-screen bg-gray-50 ">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader title={title} />
        <main className="flex-1 p-8 ">{children}</main>
      </div>
    </div>
  )
}

export default AdminLayout
