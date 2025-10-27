import React, { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Pencil, Eye, Send, Lock, CheckCircle, XCircle } from "lucide-react";
import { message, Modal } from "antd";
import AdminLayout from "../../layout/AdminLayout";
import jobAPI from "../../api/jobAPI";
import useAuth from "../../hook/useAuth";

/** Badge trạng thái */
const StatusBadge = ({ status }) => {
  const map = {
    draft:     { text: "Nháp",        cls: "bg-gray-100 text-gray-700 border-gray-200" },
    pending:   { text: "Chờ duyệt",   cls: "bg-amber-100 text-amber-800 border-amber-200" },
    reject:    { text: "Bị từ chối",  cls: "bg-red-100 text-red-700 border-red-200" },
    approve:   { text: "Đã duyệt",    cls: "bg-green-100 text-green-700 border-green-200" },
    close:     { text: "Đã đóng",     cls: "bg-slate-100 text-slate-700 border-slate-200" },
  };
  const { text, cls } = map[status] || { text: status, cls: "bg-gray-100 text-gray-700 border-gray-200" };
  return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${cls}`}>{text}</span>;
};

/** Hành động được phép theo trạng thái và role */
const getActionsByStatus = (status, role, isOwner) => {
  // TPNS có quyền approve/reject pending jobs
  if (role === 'TPNS') {
    switch (status) {
      case "draft":
      case "reject":
        return ["VIEW", "EDIT", "SUBMIT"];
      case "pending":
        return ["VIEW", "APPROVE", "REJECT"];
      case "approve":
        return ["VIEW", "EDIT", "CLOSE"];
      case "close":
        return ["VIEW", "EDIT"]; // TPNS có thể mở lại tin đã đóng
      default:
        return ["VIEW"];
    }
  }
  
  // HR chỉ thao tác với tin của mình
  if (role === 'HR') {
    if (!isOwner) return ["VIEW"]; // Không phải tin của mình → chỉ xem
    
    switch (status) {
      case "draft":
      case "reject":
        return ["VIEW", "EDIT", "SUBMIT"];
      case "pending":
        return ["VIEW"]; // Đang chờ duyệt → không sửa được
      case "approve":
        return ["VIEW", "EDIT", "CLOSE"];
      case "close":
        return ["VIEW", "EDIT"]; // HR có thể mở lại tin đã đóng của mình
      default:
        return ["VIEW"];
    }
  }
  
  return ["VIEW"];
};

/** Hàng trong bảng */
const JobRow = ({ job, onAction, userRole, userId, basePath }) => {
  const isOwner = job.employer_id === userId;
  const actions = getActionsByStatus(job.status, userRole, isOwner);
  
  return (
    <tr className="border-b last:border-0">
      <td className="px-4 py-3 font-medium text-slate-800">{job.title}</td>
      <td className="px-4 py-3 text-slate-600">{job.location || "-"}</td>
      <td className="px-4 py-3 text-slate-600">{job.job_type || "-"}</td>
      <td className="px-4 py-3"><StatusBadge status={job.status} /></td>
      <td className="px-4 py-3 text-slate-600">0</td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          <Link
            to={`${basePath}/jobs/${job.id}`}
            className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm border-red-200 text-red-600 hover:bg-red-50"
            title="Xem chi tiết"
          >
            <Eye size={16} /> Xem
          </Link>

          {actions.includes("EDIT") && (
            <Link
              to={`${basePath}/jobs/${job.id}/edit`}
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

          {actions.includes("APPROVE") && (
            <button
              onClick={() => onAction("APPROVE", job)}
              className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm border-green-200 text-green-700 hover:bg-green-50"
              title="Phê duyệt"
            >
              <CheckCircle size={16} /> Duyệt
            </button>
          )}

          {actions.includes("REJECT") && (
            <button
              onClick={() => onAction("REJECT", job)}
              className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm border-red-200 text-red-700 hover:bg-red-50"
              title="Từ chối"
            >
              <XCircle size={16} /> Từ chối
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
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState("ALL");

  // Xác định base path theo role
  const basePath = user?.role === 'TPNS' ? '/TPNS' : '/HR';

  // Fetch jobs từ API
  const fetchJobs = async () => {
    try {
      const params = {};
      if (tab !== "ALL") params.status = tab.toLowerCase();
      
      // HR chỉ xem tin của mình
      if (user?.role === 'HR') {
        params.employer_id = user.id;
      }
      
      // TPNS chỉ xem tin pending (chờ duyệt)
      if (user?.role === 'TPNS') {
        params.status = 'pending';
      }
      
      const response = await jobAPI.getJobs(params);
      if (response.success) {
        setJobs(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      message.error('Lỗi khi tải danh sách tin tuyển dụng!');
    }
  };

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const filtered = useMemo(() => {
    let rows = [...jobs];
    if (q.trim()) {
      const t = q.toLowerCase();
      rows = rows.filter((j) => (j.title + j.location).toLowerCase().includes(t));
    }
    return rows;
  }, [jobs, q]);

  // Handler hành động
  const handleAction = async (action, job) => {
    try {
      let response;
      
      switch (action) {
        case "SUBMIT":
          response = await jobAPI.submitForApproval(job.id);
          message.success('Đã gửi tin để phê duyệt!');
          break;
          
        case "APPROVE":
          response = await jobAPI.approveJob(job.id);
          message.success('Đã phê duyệt tin tuyển dụng!');
          break;
          
        case "REJECT":
          // Show modal nhập lý do
          Modal.confirm({
            title: 'Từ chối tin tuyển dụng',
            content: (
              <div>
                <p className="mb-2">Bạn có chắc muốn từ chối tin này?</p>
                <textarea 
                  id="reject-reason"
                  className="w-full border rounded p-2" 
                  placeholder="Lý do từ chối (tùy chọn)"
                  rows={3}
                />
              </div>
            ),
            onOk: async () => {
              const reason = document.getElementById('reject-reason')?.value || '';
              await jobAPI.rejectJob(job.id, reason);
              message.success('Đã từ chối tin tuyển dụng!');
              fetchJobs();
            },
          });
          return;
          
        case "CLOSE":
          response = await jobAPI.closeJob(job.id);
          message.success('Đã đóng tin tuyển dụng!');
          break;
          
        default:
          return;
      }
      
      if (response?.success) {
        fetchJobs(); // Refresh danh sách
      }
    } catch (error) {
      console.error('Action error:', error);
      message.error(error.response?.data?.message || 'Có lỗi xảy ra!');
    }
  };

  return (
    <AdminLayout title="Quản lý tin tuyển dụng">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h2 className="text-xl font-semibold text-slate-900">
          {user?.role === 'TPNS' ? 'Tin chờ phê duyệt' : 'Danh sách tin tuyển dụng'}
        </h2>
        {user?.role === 'HR' && (
          <Link
            to={`${basePath}/createjob`}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white font-semibold hover:bg-red-700"
          >
            <Plus size={18} /> Tạo tin tuyển dụng
          </Link>
        )}
      </div>

      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* Chỉ HR mới có filter tabs */}
        {user?.role === 'HR' && (
          <div className="flex flex-wrap gap-2">
            {[
              { k: "ALL",     label: "Tất cả" },
              { k: "DRAFT",   label: "Nháp" },
              { k: "PENDING", label: "Chờ duyệt" },
              { k: "REJECT",  label: "Bị từ chối" },
              { k: "APPROVE", label: "Đã duyệt" },
              { k: "CLOSE",   label: "Đã đóng" },
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
        )}

        <div className={`relative w-full ${user?.role === 'HR' ? 'md:w-80' : 'md:w-96'}`}>
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
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  {user?.role === 'TPNS' 
                    ? 'Không có tin nào cần phê duyệt.' 
                    : 'Không có bản ghi nào.'}
                </td>
              </tr>
            ) : (
              filtered.map((job) => (
                <JobRow 
                  key={job.id} 
                  job={job} 
                  onAction={handleAction}
                  userRole={user?.role}
                  userId={user?.id}
                  basePath={basePath}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
