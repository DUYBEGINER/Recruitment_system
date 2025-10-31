import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Filter, Download, Eye, UserCheck, UserX, Clock } from "lucide-react";
import { message, Modal, Select, Spin } from "antd";
import { API_URL } from "../../data/API_URL";
import AdminLayout from "../../layout/AdminLayout";
import applicationAPI from "../../api/applicationAPI";
import jobAPI from "../../api/jobAPI";
import useAuth from "../../hook/useAuth";

/** Badge trạng thái */
const StatusBadge = ({ status }) => {
  const map = {
    submitted:    { text: "Đã nộp",        cls: "bg-gray-100 text-gray-700 border-gray-200", icon: Clock },
    reviewing:    { text: "Đang xem xét",  cls: "bg-blue-100 text-blue-700 border-blue-200", icon: Eye },
    accepted:     { text: "Chấp nhận",     cls: "bg-green-100 text-green-700 border-green-200", icon: UserCheck },
    rejected:     { text: "Từ chối",       cls: "bg-red-100 text-red-700 border-red-200", icon: UserX },
  };
  const config = map[status] || { text: status, cls: "bg-gray-100 text-gray-700 border-gray-200", icon: Clock };
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.cls}`}>
      <Icon size={12} />
      {config.text}
    </span>
  );
};

/** Hàng trong bảng */
const ApplicationRow = ({ application, onStatusChange, basePath }) => {
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  const handleStatusChange = async (newStatus) => {
    setIsChangingStatus(true);
    try {
      const result = await applicationAPI.updateStatus(application.id, newStatus);
      if (result.success) {
        message.success("Cập nhật trạng thái thành công!");
        onStatusChange();
      } else {
        message.error(result.message || "Không thể cập nhật trạng thái");
      }
    } catch {
      message.error("Lỗi khi cập nhật trạng thái");
    } finally {
      setIsChangingStatus(false);
    }
  };

  return (
    <tr className="border-b last:border-0 hover:bg-slate-50">
      <td className="px-4 py-3">
        <div>
          <div className="font-medium text-slate-800">{application.candidate_name || "N/A"}</div>
          <div className="text-sm text-slate-500">{application.candidate_email || "N/A"}</div>
        </div>
      </td>
      <td className="px-4 py-3 text-slate-600">{application.candidate_phone || "-"}</td>
      <td className="px-4 py-3">
        <StatusBadge status={application.status} />
      </td>
      <td className="px-4 py-3 text-slate-600">
        {new Date(application.submitted_at).toLocaleDateString("vi-VN")}
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          <Link
            to={`${basePath}/applications/${application.id}`}
            className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm border-slate-200 text-slate-600 hover:bg-slate-50"
            title="Xem chi tiết"
          >
            <Eye size={16} /> Chi tiết
          </Link>
          
          {application.cv_url && (
            <a
              href={`${API_URL}${application.cv_url}`}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm border-blue-200 text-blue-600 hover:bg-blue-50"
              title="Tải CV"
            >
              <Download size={16} /> CV
            </a>
          )}
          
          <Select
            value={application.status}
            onChange={handleStatusChange}
            loading={isChangingStatus}
            disabled={isChangingStatus}
            className="w-40"
            size="small"
            options={[
              { value: "submitted", label: "Đã nộp" },
              { value: "reviewing", label: "Đang xem xét" },
              { value: "accepted", label: "Chấp nhận" },
              { value: "rejected", label: "Từ chối" },
            ]}
          />
        </div>
      </td>
    </tr>
  );
};

export default function Applications() {
  const { jobId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  const basePath = useMemo(() => {
    return user?.role === "TPNS" ? "/TPNS" : "/HR";
  }, [user]);

  // Load job info
  useEffect(() => {
    const loadJob = async () => {
      try {
        const result = await jobAPI.getJobByIdEmployer(jobId);
        if (result.success) {
          setJob(result.data);
        } else {
          message.error("Không thể tải thông tin công việc");
          navigate(`${basePath}/jobs`);
        }
      } catch {
        message.error("Lỗi khi tải thông tin công việc");
        navigate(`${basePath}/jobs`);
      }
    };
    loadJob();
  }, [jobId, basePath, navigate]);

  // Load applications
  useEffect(() => {
    const loadApplications = async () => {
      setLoading(true);
      try {
        const result = await applicationAPI.getApplicationsByJob(jobId);
        if (result.success) {
          setApplications(result.data || []);
        } else {
          message.error(result.message || "Không thể tải danh sách hồ sơ");
        }
      } catch {
        message.error("Lỗi khi tải danh sách hồ sơ");
      } finally {
        setLoading(false);
      }
    };
    loadApplications();
  }, [jobId]);

  // Reload function for status updates
  const reloadApplications = async () => {
    setLoading(true);
    try {
      const result = await applicationAPI.getApplicationsByJob(jobId);
      if (result.success) {
        setApplications(result.data || []);
      }
    } catch {
      message.error("Lỗi khi tải danh sách hồ sơ");
    } finally {
      setLoading(false);
    }
  };

  // Filter applications
  const filteredApplications = useMemo(() => {
    if (statusFilter === "all") return applications;
    return applications.filter((app) => app.status === statusFilter);
  }, [applications, statusFilter]);

  // Stats
  const stats = useMemo(() => {
    return {
      total: applications.length,
      submitted: applications.filter((a) => a.status === "submitted").length,
      reviewing: applications.filter((a) => a.status === "reviewing").length,
      accepted: applications.filter((a) => a.status === "accepted").length,
      rejected: applications.filter((a) => a.status === "rejected").length,
    };
  }, [applications]);

  return (
    <AdminLayout>
      <div className="mx-auto max-w-7xl space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to={`${basePath}/jobs`}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              <ArrowLeft size={16} />
              Quay lại
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Hồ sơ ứng tuyển
              </h1>
              {job && (
                <p className="text-sm text-slate-600 mt-1">
                  Công việc: <span className="font-medium">{job.title}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="text-sm text-slate-600">Tổng số</div>
            <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="text-sm text-gray-600">Đã nộp</div>
            <div className="text-2xl font-bold text-gray-900">{stats.submitted}</div>
          </div>
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="text-sm text-blue-600">Đang xem xét</div>
            <div className="text-2xl font-bold text-blue-900">{stats.reviewing}</div>
          </div>
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <div className="text-sm text-green-600">Chấp nhận</div>
            <div className="text-2xl font-bold text-green-900">{stats.accepted}</div>
          </div>
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="text-sm text-red-600">Từ chối</div>
            <div className="text-2xl font-bold text-red-900">{stats.rejected}</div>
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-3">
          <Filter size={16} className="text-slate-600" />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            className="w-48"
            options={[
              { value: "all", label: "Tất cả trạng thái" },
              { value: "submitted", label: "Đã nộp" },
              { value: "reviewing", label: "Đang xem xét" },
              { value: "accepted", label: "Chấp nhận" },
              { value: "rejected", label: "Từ chối" },
            ]}
          />
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Spin size="large" />
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              Chưa có hồ sơ nào
            </div>
          ) : (
            <table className="w-full">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                    Ứng viên
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                    Số điện thoại
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                    Trạng thái
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                    Ngày nộp
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.map((application) => (
                  <ApplicationRow
                    key={application.id}
                    application={application}
                    basePath={basePath}
                    onStatusChange={reloadApplications}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
