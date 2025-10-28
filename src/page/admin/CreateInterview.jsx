import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Calendar,
  Video,
  MapPin,
  Phone,
  User,
  Briefcase,
  Mail,
  Clock,
  FileText,
  ArrowLeft,
  CheckCircle
} from "lucide-react";
import { DatePicker, Select, Input, message, Spin } from "antd";
import AdminLayout from "../../layout/AdminLayout";
import interviewAPI from "../../api/interviewAPI";
import applicationAPI from "../../api/applicationAPI";
import useAuth from "../../hook/useAuth";
import dayjs from "dayjs";

const { TextArea } = Input;

export default function CreateInterview() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const applicationId = searchParams.get('application_id');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [application, setApplication] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    schedule_time: null,
    method: 'online',
    location: '',
    notes: ''
  });

  const basePath = user?.role === "TPNS" ? "/TPNS" : "/HR";

  // Load application data
  const loadApplicationData = async () => {
    setLoading(true);
    try {
      const result = await applicationAPI.getApplicationById(applicationId);
      if (result.success) {
        setApplication(result.data);
      } else {
        message.error(result.message || "Không thể tải thông tin hồ sơ");
        navigate(`${basePath}/applications`);
      }
    } catch (error) {
      console.error("Error loading application:", error);
      message.error("Lỗi khi tải thông tin hồ sơ");
      navigate(`${basePath}/applications`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (applicationId) {
      loadApplicationData();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate
    if (!formData.schedule_time) {
      message.error("Vui lòng chọn thời gian phỏng vấn");
      return;
    }
    if (!formData.method) {
      message.error("Vui lòng chọn phương thức phỏng vấn");
      return;
    }
    if (!formData.location?.trim()) {
      message.error("Vui lòng nhập địa điểm hoặc link meeting");
      return;
    }

    setSubmitting(true);
    try {
      const interviewData = {
        application_id: applicationId ? parseInt(applicationId) : undefined,
        schedule_time: formData.schedule_time.toISOString(),
        method: formData.method,
        location: formData.location.trim(),
        notes: formData.notes?.trim() || null
      };

      const result = await interviewAPI.createInterview(interviewData);

      if (result.success) {
        // Hiển thị thông báo về email
        if (result.emailSent) {
          message.success("Tạo lịch phỏng vấn và gửi email thông báo thành công!");
          // Nếu có preview URL (test email), log ra console
          if (result.emailPreview) {
            console.log('Email preview:', result.emailPreview);
            message.info("Email preview: " + result.emailPreview, 5);
          }
        } else {
          message.warning("Tạo lịch phỏng vấn thành công nhưng không thể gửi email thông báo");
        }
        
        navigate(`${basePath}/interviews`);
      } else {
        message.error(result.message || "Không thể tạo lịch phỏng vấn");
      }
    } catch (error) {
      console.error("Error creating interview:", error);
      message.error(error.response?.data?.message || "Lỗi khi tạo lịch phỏng vấn");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  // Không cho chọn ngày trong quá khứ
  const disabledDate = (current) => {
    return current && current < dayjs().startOf('day');
  };

  // Disabled hours trong quá khứ cho hôm nay
  const disabledDateTime = () => {
    const now = dayjs();
    const selectedDate = formData.schedule_time;
    
    if (selectedDate && selectedDate.isSame(now, 'day')) {
      return {
        disabledHours: () => {
          const hours = [];
          for (let i = 0; i < now.hour(); i++) {
            hours.push(i);
          }
          return hours;
        },
        disabledMinutes: (hour) => {
          if (hour === now.hour()) {
            const minutes = [];
            for (let i = 0; i <= now.minute(); i++) {
              minutes.push(i);
            }
            return minutes;
          }
          return [];
        }
      };
    }
    return {};
  };

  if (loading) {
    return (
      <AdminLayout title="Tạo lịch phỏng vấn">
        <div className="flex items-center justify-center h-96">
          <Spin size="large" tip="Đang tải..." />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Tạo lịch phỏng vấn">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleCancel}
              className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft size={20} className="text-slate-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Calendar size={28} className="text-blue-600" />
                Tạo lịch phỏng vấn
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Thiết lập lịch phỏng vấn cho ứng viên
              </p>
            </div>
          </div>
        </div>

        {/* Application Info */}
        {application && (
          <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white rounded-lg shadow-sm">
                <User size={24} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-600 mb-1">Thông tin ứng viên</p>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{application.candidate_name}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <Mail size={16} className="text-slate-500" />
                    <span>{application.candidate_email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <Phone size={16} className="text-slate-500" />
                    <span>{application.candidate_phone || 'Chưa cập nhật'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <Briefcase size={16} className="text-slate-500" />
                    <span>{application.job_title}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <MapPin size={16} className="text-slate-500" />
                    <span>{application.job_location}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="space-y-6">
            {/* Thời gian phỏng vấn */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <Clock size={16} className="inline mr-2" />
                Thời gian phỏng vấn <span className="text-red-500">*</span>
              </label>
              <DatePicker
                showTime={{
                  format: 'HH:mm',
                  minuteStep: 15
                }}
                format="DD/MM/YYYY HH:mm"
                className="w-full"
                size="large"
                placeholder="Chọn ngày và giờ phỏng vấn"
                disabledDate={disabledDate}
                disabledTime={disabledDateTime}
                showNow={false}
                value={formData.schedule_time}
                onChange={(date) => setFormData({ ...formData, schedule_time: date })}
              />
              <p className="mt-1 text-xs text-slate-500">
                Chọn thời gian phỏng vấn phù hợp (ít nhất 30 phút kể từ bây giờ)
              </p>
            </div>

            {/* Phương thức phỏng vấn */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Phương thức phỏng vấn <span className="text-red-500">*</span>
              </label>
              <Select
                size="large"
                className="w-full"
                value={formData.method}
                onChange={(value) => setFormData({ ...formData, method: value })}
              >
                <Select.Option value="online">
                  <div className="flex items-center gap-2 py-1">
                    <Video size={18} className="text-purple-600" />
                    <div>
                      <div className="font-medium text-slate-900">Trực tuyến (Video call)</div>
                      <div className="text-xs text-slate-500">Google Meet, Zoom, Teams...</div>
                    </div>
                  </div>
                </Select.Option>
                <Select.Option value="offline">
                  <div className="flex items-center gap-2 py-1">
                    <MapPin size={18} className="text-indigo-600" />
                    <div>
                      <div className="font-medium text-slate-900">Tại văn phòng</div>
                      <div className="text-xs text-slate-500">Phỏng vấn trực tiếp</div>
                    </div>
                  </div>
                </Select.Option>
              </Select>
            </div>

            {/* Địa điểm / Link */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <MapPin size={16} className="inline mr-2" />
                {formData.method === 'online' ? 'Link meeting' : 'Địa điểm'} <span className="text-red-500">*</span>
              </label>
              <Input
                size="large"
                placeholder={
                  formData.method === 'online' 
                    ? 'VD: https://meet.google.com/abc-defg-hij' 
                    : 'VD: Phòng họp A - Tầng 3'
                }
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>

            {/* Ghi chú */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <FileText size={16} className="inline mr-2" />
                Ghi chú
              </label>
              <TextArea
                rows={4}
                placeholder="Ghi chú thêm về buổi phỏng vấn (tùy chọn)..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
              <p className="mt-1 text-xs text-slate-500">
                VD: Yêu cầu chuẩn bị, tài liệu cần mang theo, nội dung phỏng vấn...
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end mt-8 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={handleCancel}
              disabled={submitting}
              className="px-6 py-2.5 rounded-lg border-2 border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/30"
            >
              {submitting ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Đang tạo...
                </>
              ) : (
                <>
                  <CheckCircle size={18} />
                  Tạo lịch phỏng vấn
                </>
              )}
            </button>
          </div>
        </form>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-900 font-medium mb-2">💡 Lưu ý:</p>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Thời gian phỏng vấn nên được sắp xếp ít nhất 24h trước</li>
            <li>Với phỏng vấn online, hãy gửi link meeting rõ ràng cho ứng viên</li>
            <li>Với phỏng vấn tại văn phòng, cung cấp địa chỉ chi tiết</li>
            <li>Hệ thống sẽ tự động gửi email thông báo cho ứng viên</li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
}
