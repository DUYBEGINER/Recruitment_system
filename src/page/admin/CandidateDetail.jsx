import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  FileText,
  Briefcase,
  CheckCircle,
  XCircle,
  Clock,
  Eye
} from "lucide-react";
import { message, Spin } from "antd";
import AdminLayout from "../../layout/AdminLayout";
import candidateAPI from "../../api/candidateAPI";
import useAuth from "../../hook/useAuth";

/** Badge trạng thái application */
const StatusBadge = ({ status }) => {
  const map = {
    pending:      { text: "Chờ xử lý",     cls: "bg-gray-100 text-gray-700 border-gray-200", icon: Clock },
    reviewing:    { text: "Đang xem xét",  cls: "bg-blue-100 text-blue-700 border-blue-200", icon: Eye },
    shortlisted:  { text: "Vào vòng sau",  cls: "bg-purple-100 text-purple-700 border-purple-200", icon: CheckCircle },
    interviewed:  { text: "Đã phỏng vấn", cls: "bg-indigo-100 text-indigo-700 border-indigo-200", icon: CheckCircle },
    accepted:     { text: "Chấp nhận",     cls: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle },
    rejected:     { text: "Từ chối",       cls: "bg-red-100 text-red-700 border-red-200", icon: XCircle },
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

export default function CandidateDetail() {
  const { candidateId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [candidate, setCandidate] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const basePath = useMemo(() => {
    return user?.role === "TPNS" ? "/TPNS" : "/HR";
  }, [user]);

  // Load candidate detail
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [candidateResult, applicationsResult] = await Promise.all([
          candidateAPI.getCandidateById(candidateId),
          candidateAPI.getCandidateApplications(candidateId),
        ]);

        if (candidateResult.success) {
          setCandidate(candidateResult.data);
        } else {
          message.error(candidateResult.message || "Không thể tải thông tin ứng viên");
          navigate(`${basePath}/candidates`);
        }

        if (applicationsResult.success) {
          setApplications(applicationsResult.data || []);
        }
      } catch {
        message.error("Lỗi khi tải thông tin ứng viên");
        navigate(`${basePath}/candidates`);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [candidateId, basePath, navigate]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Spin size="large" />
        </div>
      </AdminLayout>
    );
  }

  if (!candidate) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-lg text-slate-600">Không tìm thấy ứng viên</p>
            <Link
              to={`${basePath}/candidates`}
              className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <ArrowLeft size={16} />
              Quay lại danh sách ứng viên
            </Link>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mx-auto max-w-6xl space-y-6 p-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Link
              to={`${basePath}/candidates`}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              <ArrowLeft size={16} />
              Quay lại
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Thông tin ứng viên
              </h1>
              <p className="text-slate-600 mt-1">
                Mã ứng viên: #{candidate.id}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Candidate Info Card */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <User size={20} className="text-blue-600" />
                Thông tin cá nhân
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <User size={18} className="text-slate-400 mt-1" />
                  <div>
                    <div className="text-sm text-slate-500">Họ tên</div>
                    <div className="text-lg font-semibold text-slate-900">
                      {candidate.full_name || "N/A"}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail size={18} className="text-slate-400 mt-1" />
                  <div>
                    <div className="text-sm text-slate-500">Email</div>
                    <a 
                      href={`mailto:${candidate.email}`}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {candidate.email || "N/A"}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone size={18} className="text-slate-400 mt-1" />
                  <div>
                    <div className="text-sm text-slate-500">Số điện thoại</div>
                    <a 
                      href={`tel:${candidate.phone}`}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {candidate.phone || "N/A"}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar size={18} className="text-slate-400 mt-1" />
                  <div>
                    <div className="text-sm text-slate-500">Ngày đăng ký</div>
                    <div className="text-slate-900">
                      {new Date(candidate.created_at).toLocaleString("vi-VN")}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Applications List */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Briefcase size={20} className="text-blue-600" />
                Lịch sử ứng tuyển ({applications.length})
              </h2>
              
              {applications.length === 0 ? (
                <div className="py-8 text-center text-slate-500">
                  Chưa có hồ sơ ứng tuyển nào
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.map((app) => (
                    <div 
                      key={app.id}
                      className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <Link 
                            to={`${basePath}/jobs/${app.job_id}`}
                            className="text-lg font-semibold text-blue-600 hover:text-blue-700"
                          >
                            {app.job_title}
                          </Link>
                          <div className="mt-2 space-y-1">
                            {app.job_location && (
                              <div className="flex items-center gap-2 text-sm text-slate-600">
                                <MapPin size={14} className="text-slate-400" />
                                {app.job_location}
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Calendar size={14} className="text-slate-400" />
                              Nộp ngày: {new Date(app.submitted_at).toLocaleDateString("vi-VN")}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <StatusBadge status={app.status} />
                          <Link
                            to={`${basePath}/applications/${app.id}`}
                            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                          >
                            <Eye size={14} />
                            Xem chi tiết
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Stats */}
          <div className="space-y-6">
            {/* Stats Card */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Thống kê
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Tổng hồ sơ</span>
                  <span className="text-xl font-bold text-slate-900">
                    {candidate.total_applications || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Chờ xử lý</span>
                  <span className="text-xl font-bold text-gray-900">
                    {candidate.pending_count || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Được chấp nhận</span>
                  <span className="text-xl font-bold text-green-700">
                    {candidate.accepted_count || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Bị từ chối</span>
                  <span className="text-xl font-bold text-red-700">
                    {candidate.rejected_count || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Liên hệ nhanh
              </h2>
              
              <div className="space-y-3">
                {candidate.email && (
                  <a
                    href={`mailto:${candidate.email}`}
                    className="flex items-center gap-2 w-full rounded-lg border border-blue-200 bg-blue-50 text-blue-700 px-4 py-2.5 hover:bg-blue-100 font-medium"
                  >
                    <Mail size={16} />
                    Gửi email
                  </a>
                )}
                
                {candidate.phone && (
                  <a
                    href={`tel:${candidate.phone}`}
                    className="flex items-center gap-2 w-full rounded-lg border border-green-200 bg-green-50 text-green-700 px-4 py-2.5 hover:bg-green-100 font-medium"
                  >
                    <Phone size={16} />
                    Gọi điện
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
