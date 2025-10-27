import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Calendar,
  Video,
  MapPin,
  Phone,
  User,
  Briefcase,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Eye,
  Plus,
  Filter
} from "lucide-react";
import { message, Spin, Modal, Select, DatePicker } from "antd";
import AdminLayout from "../../layout/AdminLayout";
import interviewAPI from "../../api/interviewAPI";
import useAuth from "../../hook/useAuth";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

/** Badge trạng thái lịch phỏng vấn */
const StatusBadge = ({ status }) => {
  const map = {
    scheduled: { text: "Đã lên lịch", cls: "bg-blue-100 text-blue-700 border-blue-200", icon: Clock },
    completed: { text: "Đã hoàn thành", cls: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle },
    cancelled: { text: "Đã hủy", cls: "bg-red-100 text-red-700 border-red-200", icon: XCircle },
    rescheduled: { text: "Đã dời lịch", cls: "bg-orange-100 text-orange-700 border-orange-200", icon: RefreshCw },
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

/** Badge phương thức phỏng vấn */
const MethodBadge = ({ method }) => {
  const map = {
    online: { text: "Trực tuyến", cls: "bg-purple-100 text-purple-700 border-purple-200", icon: Video },
    offline: { text: "Tại văn phòng", cls: "bg-indigo-100 text-indigo-700 border-indigo-200", icon: MapPin },
    phone: { text: "Điện thoại", cls: "bg-teal-100 text-teal-700 border-teal-200", icon: Phone },
  };
  const config = map[method] || { text: method, cls: "bg-gray-100 text-gray-700 border-gray-200", icon: Calendar };
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${config.cls}`}>
      <Icon size={12} />
      {config.text}
    </span>
  );
};

export default function Interviews() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [interviews, setInterviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterVisible, setFilterVisible] = useState(false);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState(null);
  const [methodFilter, setMethodFilter] = useState(null);
  const [dateRange, setDateRange] = useState(null);

  const basePath = useMemo(() => {
    return user?.role === "TPNS" ? "/TPNS" : "/HR";
  }, [user]);

  // Load data
  useEffect(() => {
    loadData();
  }, [statusFilter, methodFilter, dateRange]);

  const loadData = async () => {
    setLoading(true);
    try {
      const filters = {};
      if (statusFilter) filters.status = statusFilter;
      if (methodFilter) filters.method = methodFilter;
      if (dateRange && dateRange[0] && dateRange[1]) {
        filters.from_date = dateRange[0].format('YYYY-MM-DD');
        filters.to_date = dateRange[1].format('YYYY-MM-DD');
      }

      const [interviewsResult, statsResult] = await Promise.all([
        interviewAPI.getInterviews(filters),
        interviewAPI.getInterviewStats(),
      ]);

      if (interviewsResult.success) {
        setInterviews(interviewsResult.data || []);
      }

      if (statsResult.success) {
        setStats(statsResult.data);
      }
    } catch (error) {
      console.error("Error loading interviews:", error);
      message.error("Không thể tải danh sách lịch phỏng vấn");
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setStatusFilter(null);
    setMethodFilter(null);
    setDateRange(null);
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

  return (
    <AdminLayout>
      <div className="mx-auto max-w-7xl space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Quản lý lịch phỏng vấn</h1>
            <p className="text-slate-600 mt-1">
              Quản lý và theo dõi lịch phỏng vấn ứng viên
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setFilterVisible(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Filter size={16} />
              Lọc
            </button>
            <Link
              to={`${basePath}/applications`}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <Plus size={16} />
              Tạo lịch phỏng vấn
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-slate-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Tổng lịch</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">{stats.total || 0}</p>
                </div>
                <div className="rounded-full bg-blue-100 p-3">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Đã lên lịch</p>
                  <p className="mt-2 text-3xl font-bold text-blue-600">{stats.scheduled_count || 0}</p>
                </div>
                <div className="rounded-full bg-blue-100 p-3">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Đã hoàn thành</p>
                  <p className="mt-2 text-3xl font-bold text-green-600">{stats.completed_count || 0}</p>
                </div>
                <div className="rounded-full bg-green-100 p-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Đã hủy</p>
                  <p className="mt-2 text-3xl font-bold text-red-600">{stats.cancelled_count || 0}</p>
                </div>
                <div className="rounded-full bg-red-100 p-3">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Interviews List */}
        <div className="rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Danh sách lịch phỏng vấn ({interviews.length})
            </h2>
          </div>

          {interviews.length === 0 ? (
            <div className="py-12 text-center">
              <Calendar size={48} className="mx-auto text-slate-300" />
              <p className="mt-4 text-slate-600">Chưa có lịch phỏng vấn nào</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {interviews.map((interview) => (
                <div
                  key={interview.id}
                  className="p-6 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      {/* Candidate Info */}
                      <div className="flex items-start gap-3">
                        <div className="rounded-full bg-blue-100 p-2">
                          <User size={18} className="text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">
                            {interview.candidate_name}
                          </h3>
                          <p className="text-sm text-slate-600">{interview.candidate_email}</p>
                        </div>
                      </div>

                      {/* Job Info */}
                      <div className="flex items-center gap-2 text-sm text-slate-700">
                        <Briefcase size={14} className="text-slate-400" />
                        <Link
                          to={`${basePath}/jobs/${interview.job_id}`}
                          className="font-medium text-blue-600 hover:text-blue-700"
                        >
                          {interview.job_title}
                        </Link>
                        {interview.job_location && (
                          <>
                            <span className="text-slate-400">•</span>
                            <span>{interview.job_location}</span>
                          </>
                        )}
                      </div>

                      {/* Schedule Info */}
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2 text-sm text-slate-700">
                          <Calendar size={14} className="text-slate-400" />
                          <span className="font-medium">
                            {dayjs(interview.schedule_time).format('DD/MM/YYYY - HH:mm')}
                          </span>
                        </div>
                        <MethodBadge method={interview.method} />
                        {interview.location && (
                          <div className="flex items-center gap-1 text-sm text-slate-600">
                            <MapPin size={14} className="text-slate-400" />
                            {interview.location}
                          </div>
                        )}
                      </div>

                      {/* Notes */}
                      {interview.notes && (
                        <p className="text-sm text-slate-600 italic">
                          Ghi chú: {interview.notes}
                        </p>
                      )}
                    </div>

                    {/* Right Side - Status & Actions */}
                    <div className="flex flex-col items-end gap-3">
                      <StatusBadge status={interview.status} />
                      <Link
                        to={`${basePath}/interviews/${interview.id}`}
                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
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

      {/* Filter Modal */}
      <Modal
        title="Lọc lịch phỏng vấn"
        open={filterVisible}
        onCancel={() => setFilterVisible(false)}
        footer={[
          <button
            key="clear"
            onClick={handleClearFilters}
            className="px-4 py-2 text-sm text-slate-700 hover:text-slate-900"
          >
            Xóa bộ lọc
          </button>,
          <button
            key="close"
            onClick={() => setFilterVisible(false)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            Đóng
          </button>
        ]}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Trạng thái
            </label>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder="Chọn trạng thái"
              allowClear
              className="w-full"
              options={[
                { label: "Đã lên lịch", value: "scheduled" },
                { label: "Đã hoàn thành", value: "completed" },
                { label: "Đã hủy", value: "cancelled" },
                { label: "Đã dời lịch", value: "rescheduled" }
              ]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Phương thức
            </label>
            <Select
              value={methodFilter}
              onChange={setMethodFilter}
              placeholder="Chọn phương thức"
              allowClear
              className="w-full"
              options={[
                { label: "Trực tuyến", value: "online" },
                { label: "Tại văn phòng", value: "offline" },
                { label: "Điện thoại", value: "phone" }
              ]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Khoảng thời gian
            </label>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              format="DD/MM/YYYY"
              className="w-full"
            />
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}
