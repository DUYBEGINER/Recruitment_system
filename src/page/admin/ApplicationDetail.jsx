import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  FileText, 
  Briefcase,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  UserCheck
} from "lucide-react";
import { message, Modal, Select, Spin, Card, Tag, Button } from "antd";
import { API_URL } from "../../data/API_URL";
import AdminLayout from "../../layout/AdminLayout";
import applicationAPI from "../../api/applicationAPI";
import CreateInterviewModal from "../../components/admin/CreateInterviewModal";
import SendEmailModal from "../../components/admin/SendEmailModal";
import useAuth from "../../hook/useAuth";

/** Badge trạng thái */
const StatusBadge = ({ status }) => {
  const map = {
    pending:      { text: "Chờ xử lý",     cls: "bg-gray-100 text-gray-700 border-gray-200", icon: Clock },
    reviewing:    { text: "Đang xem xét",  cls: "bg-blue-100 text-blue-700 border-blue-200", icon: Eye },
    shortlisted:  { text: "Vào vòng sau",  cls: "bg-purple-100 text-purple-700 border-purple-200", icon: UserCheck },
    interviewed:  { text: "Đã phỏng vấn", cls: "bg-indigo-100 text-indigo-700 border-indigo-200", icon: UserCheck },
    accepted:     { text: "Chấp nhận",     cls: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle },
    rejected:     { text: "Từ chối",       cls: "bg-red-100 text-red-700 border-red-200", icon: XCircle },
  };
  const config = map[status] || { text: status, cls: "bg-gray-100 text-gray-700 border-gray-200", icon: Clock };
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold border ${config.cls}`}>
      <Icon size={16} />
      {config.text}
    </span>
  );
};

export default function ApplicationDetail() {
  const { applicationId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [interviewModalVisible, setInterviewModalVisible] = useState(false);
  const [emailModalVisible, setEmailModalVisible] = useState(false);

  const basePath = user?.role === "TPNS" ? "/TPNS" : "/HR";

  // Load application detail
  useEffect(() => {
    const loadApplication = async () => {
      setLoading(true);
      try {
        const result = await applicationAPI.getApplicationById(applicationId);
        if (result.success) {
          setApplication(result.data);
        } else {
          message.error(result.message || "Không thể tải thông tin ứng viên");
          navigate(`${basePath}/jobs`);
        }
      } catch {
        message.error("Lỗi khi tải thông tin ứng viên");
        navigate(`${basePath}/jobs`);
      } finally {
        setLoading(false);
      }
    };
    loadApplication();
  }, [applicationId, basePath, navigate]);

  // Update status
  const handleStatusChange = async (newStatus) => {
    Modal.confirm({
      title: "Xác nhận thay đổi trạng thái",
      content: `Bạn có chắc muốn thay đổi trạng thái thành "${getStatusText(newStatus)}"?`,
      okText: "Xác nhận",
      cancelText: "Hủy",
      onOk: async () => {
        setUpdating(true);
        try {
          const result = await applicationAPI.updateStatus(applicationId, newStatus);
          if (result.success) {
            message.success("Cập nhật trạng thái thành công!");
            setApplication({ ...application, status: newStatus });
          } else {
            message.error(result.message || "Không thể cập nhật trạng thái");
          }
        } catch {
          message.error("Lỗi khi cập nhật trạng thái");
        } finally {
          setUpdating(false);
        }
      },
    });
  };

  const getStatusText = (status) => {
    const map = {
      pending: "Chờ xử lý",
      reviewing: "Đang xem xét",
      shortlisted: "Vào vòng sau",
      interviewed: "Đã phỏng vấn",
      accepted: "Chấp nhận",
      rejected: "Từ chối",
    };
    return map[status] || status;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Spin size="large" />
        </div>
      </AdminLayout>
    );
  }

  if (!application) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-lg text-slate-600">Không tìm thấy thông tin ứng viên</p>
            <Link
              to={`${basePath}/jobs`}
              className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <ArrowLeft size={16} />
              Quay lại danh sách công việc
            </Link>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mx-auto max-w-5xl space-y-6 p-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Link
              to={`${basePath}/jobs/${application.job_id}/applications`}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              <ArrowLeft size={16} />
              Quay lại
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Hồ sơ ứng tuyển
              </h1>
              <p className="text-slate-600 mt-1">
                Mã hồ sơ: #{application.id}
              </p>
            </div>
          </div>
          
          <StatusBadge status={application.status} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Candidate Info Card */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <User size={20} className="text-blue-600" />
                Thông tin ứng viên
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <User size={18} className="text-slate-400 mt-1" />
                  <div>
                    <div className="text-sm text-slate-500">Họ tên</div>
                    <div className="text-lg font-semibold text-slate-900">
                      {application.candidate_name || "N/A"}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail size={18} className="text-slate-400 mt-1" />
                  <div>
                    <div className="text-sm text-slate-500">Email</div>
                    <a 
                      href={`mailto:${application.candidate_email}`}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {application.candidate_email || "N/A"}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone size={18} className="text-slate-400 mt-1" />
                  <div>
                    <div className="text-sm text-slate-500">Số điện thoại</div>
                    <a 
                      href={`tel:${application.candidate_phone}`}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {application.candidate_phone || "N/A"}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar size={18} className="text-slate-400 mt-1" />
                  <div>
                    <div className="text-sm text-slate-500">Ngày nộp hồ sơ</div>
                    <div className="text-slate-900 font-medium">
                      {new Date(application.submitted_at).toLocaleString("vi-VN")}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Job Info Card */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Briefcase size={20} className="text-blue-600" />
                Vị trí ứng tuyển
              </h2>
              
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-slate-500">Tên công việc</div>
                  <Link 
                    to={`${basePath}/jobs/${application.job_id}`}
                    className="text-lg font-semibold text-blue-600 hover:text-blue-700"
                  >
                    {application.job_title}
                  </Link>
                </div>

                {application.job_location && (
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-slate-400" />
                    <span className="text-slate-700">{application.job_location}</span>
                  </div>
                )}

                {(application.salary_min || application.salary_max) && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500">Mức lương:</span>
                    <span className="text-slate-900 font-medium">
                      {application.salary_min && application.salary_max
                        ? `${application.salary_min.toLocaleString()} - ${application.salary_max.toLocaleString()} VNĐ`
                        : application.salary_min
                        ? `Từ ${application.salary_min.toLocaleString()} VNĐ`
                        : `Lên đến ${application.salary_max.toLocaleString()} VNĐ`}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* CV Card */}
            {application.cv_url && (
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <FileText size={20} className="text-blue-600" />
                  Hồ sơ đính kèm
                </h2>
                
                <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText size={24} className="text-blue-600" />
                    <div>
                      <div className="font-medium text-slate-900">CV_{application.candidate_name}.pdf</div>
                      <div className="text-sm text-slate-500">Hồ sơ ứng tuyển</div>
                    </div>
                  </div>
                  <a
                    href={`${API_URL}${application.cv_url}`}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-blue-600 bg-blue-600 text-white px-4 py-2 hover:bg-blue-700"
                  >
                    <Download size={16} />
                    Tải xuống
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Actions */}
          <div className="space-y-6">
            {/* Status Change Card */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Cập nhật trạng thái
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-600 mb-2 block">
                    Trạng thái hiện tại
                  </label>
                  <StatusBadge status={application.status} />
                </div>

                <div>
                  <label className="text-sm text-slate-600 mb-2 block">
                    Thay đổi trạng thái
                  </label>
                  <Select
                    value={application.status}
                    onChange={handleStatusChange}
                    loading={updating}
                    disabled={updating}
                    className="w-full"
                    size="large"
                    options={[
                      { value: "pending", label: "Chờ xử lý" },
                      { value: "reviewing", label: "Đang xem xét" },
                      { value: "shortlisted", label: "Vào vòng sau" },
                      { value: "interviewed", label: "Đã phỏng vấn" },
                      { value: "accepted", label: "Chấp nhận" },
                      { value: "rejected", label: "Từ chối" },
                    ]}
                  />
                </div>
              </div>
            </div>

            {/* Interview Scheduling Card */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Lịch phỏng vấn
              </h2>
              
              <button
                onClick={() => setInterviewModalVisible(true)}
                className="w-full flex items-center justify-center gap-2 rounded-lg border border-blue-600 bg-blue-600 text-white px-4 py-2.5 hover:bg-blue-700 font-medium"
              >
                <Calendar size={16} />
                Lên lịch phỏng vấn
              </button>

              <p className="text-xs text-slate-500 mt-2 text-center">
                Tạo lịch phỏng vấn cho ứng viên này
              </p>
            </div>

            {/* Quick Contact Card */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Thao tác nhanh
              </h2>
              
              <div className="space-y-3">
                {application.candidate_email && (
                  <button
                    onClick={() => setEmailModalVisible(true)}
                    className="flex items-center gap-2 w-full rounded-lg border border-blue-200 bg-blue-50 text-blue-700 px-4 py-2.5 hover:bg-blue-100 font-medium"
                  >
                    <Mail size={16} />
                    Gửi email
                  </button>
                )}
                
                {application.candidate_phone && (
                  <a
                    href={`tel:${application.candidate_phone}`}
                    className="flex items-center gap-2 w-full rounded-lg border border-green-200 bg-green-50 text-green-700 px-4 py-2.5 hover:bg-green-100 font-medium"
                  >
                    <Phone size={16} />
                    Gọi điện
                  </a>
                )}
                
                <Link
                  to={`${basePath}/jobs/${application.job_id}`}
                  className="flex items-center gap-2 w-full rounded-lg border border-slate-200 bg-white text-slate-700 px-4 py-2.5 hover:bg-slate-50 font-medium"
                >
                  <Briefcase size={16} />
                  Xem tin tuyển dụng
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Interview Modal */}
      <CreateInterviewModal
        visible={interviewModalVisible}
        onClose={() => setInterviewModalVisible(false)}
        applicationId={parseInt(applicationId)}
        candidateName={application?.candidate_name}
        onSuccess={() => {
          message.success("Lịch phỏng vấn đã được tạo thành công!");
        }}
      />

      {/* Send Email Modal */}
      <SendEmailModal
        visible={emailModalVisible}
        onClose={() => setEmailModalVisible(false)}
        candidateEmail={application?.candidate_email}
        candidateName={application?.candidate_name}
      />
    </AdminLayout>
  );
}
