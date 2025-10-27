import React, { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Pencil, Eye, Send, Lock } from "lucide-react";
import AdminLayout from "../../layout/AdminLayout";

/** Badge trạng thái theo quy trình mới */
const StatusBadge = ({ status }) => {
  const map = {
    DRAFT:     { text: "Nháp",        cls: "bg-gray-100 text-gray-700 border-gray-200" },
    PENDING:   { text: "Chờ duyệt",   cls: "bg-amber-100 text-amber-800 border-amber-200" },
    REJECTED:  { text: "Bị từ chối",  cls: "bg-red-100 text-red-700 border-red-200" },
    PUBLISHED: { text: "Đang public", cls: "bg-green-100 text-green-700 border-green-200" },
    CLOSED:    { text: "Đã đóng",     cls: "bg-slate-100 text-slate-700 border-slate-200" },
  };
  const { text, cls } = map[status] || { text: status, cls: "bg-gray-100 text-gray-700 border-gray-200" };
  return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${cls}`}>{text}</span>;
};

/** Hành động được phép theo trạng thái */
const getActionsByStatus = (status) => {
  switch (status) {
    case "DRAFT":
      return ["VIEW", "EDIT", "SUBMIT"];             // gửi duyệt
    case "PENDING":
      return ["VIEW"];                                // đợi duyệt → nếu duyệt thì backend publish luôn
    case "REJECTED":
      return ["VIEW", "EDIT", "SUBMIT"];             // sửa & gửi lại
    case "PUBLISHED":
      return ["VIEW", "EDIT", "CLOSE"];              // có thể đóng
    case "CLOSED":
      return ["VIEW"];                                // chỉ xem
    default:
      return ["VIEW"];
  }
};

/** Hàng trong bảng */
const JobRow = ({ job, onAction }) => {
  const actions = getActionsByStatus(job.status);
  return (
    <tr className="border-b last:border-0">
      <td className="px-4 py-3 font-medium text-slate-800">{job.title}</td>
      <td className="px-4 py-3 text-slate-600">{job.location || "-"}</td>
      <td className="px-4 py-3 text-slate-600">{job.employmentType || "-"}</td>
      <td className="px-4 py-3"><StatusBadge status={job.status} /></td>
      <td className="px-4 py-3 text-slate-600">{job.applications ?? 0}</td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          <Link
            to={`/HR/jobs/${job.id}`}
            className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm border-red-200 text-red-600 hover:bg-red-50"
            title="Xem chi tiết"
          >
            <Eye size={16} /> Xem
          </Link>

          {actions.includes("EDIT") && (
            <Link
              to={`/HR/jobs/${job.id}/edit`}
              className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm border-slate-200 text-slate-600 hover:bg-slate-50"
              title="Chỉnh sửa"
            >
              <Pencil size={16} /> Sửa
            </Link>
          )}

          {actions.includes("SUBMIT") && (
            <button
              onClick={() => onAction("SUBMIT", job)}
              className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm border-amber-200 text-amber-700 hover:bg-amber-50"
              title="Gửi duyệt"
            >
              <Send size={16} /> Gửi duyệt
            </button>
          )}

          {actions.includes("CLOSE") && (
            <button
              onClick={() => onAction("CLOSE", job)}
              className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm border-slate-200 text-slate-700 hover:bg-slate-50"
              title="Đóng tin"
            >
              <Lock size={16} /> Đóng
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

export default function JobsPost() {
  // Demo data: thay bằng dữ liệu API
  const [jobs, setJobs] = useState([
    { id: 1, title: "Frontend Developer",      location: "Hà Nội",  employmentType: "Full-time", status: "DRAFT",     applications: 0  },
    { id: 2, title: "Backend Java (Spring)",   location: "HCM",     employmentType: "Full-time", status: "PENDING",   applications: 0  },
    { id: 3, title: "Data Engineer",           location: "Đà Nẵng", employmentType: "Hybrid",    status: "REJECTED",  applications: 2  },
    { id: 4, title: "Product Manager",         location: "Hà Nội",  employmentType: "Full-time", status: "PUBLISHED", applications: 37 },
    { id: 5, title: "QA Engineer",             location: "HCM",     employmentType: "Full-time", status: "CLOSED",    applications: 45 },
  ]);

  const [q, setQ] = useState("");
  const [tab, setTab] = useState("ALL");

  useEffect(() => {
    // TODO: GET /api/jobposts?status=...&q=...
  }, [q, tab]);

  const filtered = useMemo(() => {
    let rows = [...jobs];
    if (tab !== "ALL") rows = rows.filter((j) => j.status === tab);
    if (q.trim()) {
      const t = q.toLowerCase();
      rows = rows.filter((j) => (j.title + j.location).toLowerCase().includes(t));
    }
    return rows;
  }, [jobs, q, tab]);

  // Handler hành động (demo). Backend thực tế:
  // - SUBMIT: POST /jobposts/{id}/submit-approval  { managerId }
  // - CLOSE : POST /jobposts/{id}/close
  // Việc phê duyệt của manager sẽ gọi API riêng → nếu APPROVE thì server đổi thẳng sang PUBLISHED.
  const handleAction = (action, job) => {
    setJobs((prev) =>
      prev.map((j) => {
        if (j.id !== job.id) return j;
        if (action === "SUBMIT" && (j.status === "DRAFT" || j.status === "REJECTED")) {
          return { ...j, status: "PENDING" };     // gửi duyệt
        }
        if (action === "CLOSE" && j.status === "PUBLISHED") {
          return { ...j, status: "CLOSED" };      // đóng tin
        }
        return j;
      })
    );
  };

  return (
    <AdminLayout title="Quản lý tin tuyển dụng">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h2 className="text-xl font-semibold text-slate-900">Danh sách tin tuyển dụng</h2>
        <Link
          to="/HR/createjob"
          className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white font-semibold hover:bg-red-700"
        >
          <Plus size={18} /> Tạo tin tuyển dụng
        </Link>
      </div>

      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {[
            { k: "ALL",       label: "Tất cả" },
            { k: "DRAFT",     label: "Nháp" },
            { k: "PENDING",   label: "Chờ duyệt" },
            { k: "REJECTED",  label: "Bị từ chối" },
            { k: "PUBLISHED", label: "Public" },
            { k: "CLOSED",    label: "Đã đóng" },
          ].map((t) => (
            <button
              key={t.k}
              onClick={() => setTab(t.k)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm transition
                ${tab === t.k
                  ? "bg-red-600 text-white border-red-700"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-red-50 hover:text-red-700"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm theo chức danh, địa điểm..."
            className="w-full rounded-lg border border-slate-200 bg-white px-10 py-2 outline-none focus:ring-2 focus:ring-red-500"
          />
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-red-50">
            <tr className="text-left text-slate-700">
              <th className="px-4 py-3 font-semibold">Chức danh</th>
              <th className="px-4 py-3 font-semibold">Khu vực</th>
              <th className="px-4 py-3 font-semibold">Hình thức</th>
              <th className="px-4 py-3 font-semibold">Trạng thái</th>
              <th className="px-4 py-3 font-semibold">Hồ sơ</th>
              <th className="px-4 py-3 font-semibold text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">Không có bản ghi nào.</td>
              </tr>
            ) : (
              filtered.map((job) => (
                <JobRow key={job.id} job={job} onAction={handleAction} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
