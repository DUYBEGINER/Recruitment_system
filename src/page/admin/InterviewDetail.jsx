import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  User,
  Mail,
  Phone,
  Video,
  MapPin,
  Briefcase,
  FileText,
  Clock,
  Edit,
  Trash2
} from "lucide-react";
import { message, Spin, Modal, Form, Input, Select, DatePicker } from "antd";
import AdminLayout from "../../layout/AdminLayout";
import interviewAPI from "../../api/interviewAPI";
import useAuth from "../../hook/useAuth";
import dayjs from "dayjs";

const { TextArea } = Input;

/** Badge trạng thái */
const StatusBadge = ({ status }) => {
  const map = {
    scheduled: { text: "Đã lên lịch", cls: "bg-blue-100 text-blue-700" },
    completed: { text: "Đã hoàn thành", cls: "bg-green-100 text-green-700" },
    cancelled: { text: "Đã hủy", cls: "bg-red-100 text-red-700" },
    rescheduled: { text: "Đã dời lịch", cls: "bg-orange-100 text-orange-700" },
  };
  const config = map[status] || { text: status, cls: "bg-gray-100 text-gray-700" };
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${config.cls}`}>
      {config.text}
    </span>
  );
};

export default function InterviewDetail() {
  const { interviewId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [form] = Form.useForm();

  const basePath = useMemo(() => {
    return user?.role === "TPNS" ? "/TPNS" : "/HR";
  }, [user]);

  useEffect(() => {
    loadData();
  }, [interviewId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await interviewAPI.getInterviewById(interviewId);
      if (result.success) {
        setInterview(result.data);
        // Set form values
        form.setFieldsValue({
          schedule_time: dayjs(result.data.schedule_time),
          method: result.data.method,
          location: result.data.location,
          notes: result.data.notes,
          status: result.data.status
        });
      } else {
        message.error(result.message || "Không thể tải thông tin lịch phỏng vấn");
        navigate(`${basePath}/interviews`);
      }
    } catch (error) {
      message.error("Lỗi khi tải thông tin lịch phỏng vấn");
      navigate(`${basePath}/interviews`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (values) => {
    try {
      const updateData = {
        schedule_time: values.schedule_time.toISOString(),
        method: values.method,
        location: values.location,
        notes: values.notes,
        status: values.status
      };

      const result = await interviewAPI.updateInterview(interviewId, updateData);
      if (result.success) {
        message.success("Cập nhật lịch phỏng vấn thành công");
        setEditModalVisible(false);
        loadData();
      } else {
        message.error(result.message || "Không thể cập nhật lịch phỏng vấn");
      }
    } catch (error) {
      message.error("Lỗi khi cập nhật lịch phỏng vấn");
    }
  };

  const handleDelete = async () => {
    try {
      const result = await interviewAPI.deleteInterview(interviewId);
      if (result.success) {
        message.success("Xóa lịch phỏng vấn thành công");
        navigate(`${basePath}/interviews`);
      } else {
        message.error(result.message || "Không thể xóa lịch phỏng vấn");
      }
    } catch (error) {
      message.error("Lỗi khi xóa lịch phỏng vấn");
    }
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

  if (!interview) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-lg text-slate-600">Không tìm thấy lịch phỏng vấn</p>
            <Link
              to={`${basePath}/interviews`}
              className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <ArrowLeft size={16} />
              Quay lại danh sách
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
              to={`${basePath}/interviews`}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              <ArrowLeft size={16} />
              Quay lại
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Chi tiết lịch phỏng vấn
              </h1>
              <p className="text-slate-600 mt-1">Mã: #{interview.id}</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setEditModalVisible(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
            >
              <Edit size={16} />
              Chỉnh sửa
            </button>
            <button
              onClick={() => setDeleteModalVisible(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
            >
              <Trash2 size={16} />
              Xóa
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Interview Info */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                  <Calendar size={20} className="text-blue-600" />
                  Thông tin lịch phỏng vấn
                </h2>
                <StatusBadge status={interview.status} />
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Clock size={18} className="text-slate-400 mt-1" />
                  <div>
                    <div className="text-sm text-slate-500">Thời gian</div>
                    <div className="text-lg font-semibold text-slate-900">
                      {dayjs(interview.schedule_time).format('DD/MM/YYYY - HH:mm')}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  {interview.method === 'online' && <Video size={18} className="text-purple-500 mt-1" />}
                  {interview.method === 'offline' && <MapPin size={18} className="text-indigo-500 mt-1" />}
                  {interview.method === 'phone' && <Phone size={18} className="text-teal-500 mt-1" />}
                  <div>
                    <div className="text-sm text-slate-500">Phương thức</div>
                    <div className="text-slate-900 font-medium">
                      {interview.method === 'online' && 'Trực tuyến'}
                      {interview.method === 'offline' && 'Tại văn phòng'}
                      {interview.method === 'phone' && 'Điện thoại'}
                    </div>
                  </div>
                </div>

                {interview.location && (
                  <div className="flex items-start gap-3">
                    <MapPin size={18} className="text-slate-400 mt-1" />
                    <div>
                      <div className="text-sm text-slate-500">Địa điểm</div>
                      <div className="text-slate-900">{interview.location}</div>
                    </div>
                  </div>
                )}

                {interview.notes && (
                  <div className="flex items-start gap-3">
                    <FileText size={18} className="text-slate-400 mt-1" />
                    <div>
                      <div className="text-sm text-slate-500">Ghi chú</div>
                      <div className="text-slate-900">{interview.notes}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Candidate Info */}
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
                      {interview.candidate_name}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail size={18} className="text-slate-400 mt-1" />
                  <div>
                    <div className="text-sm text-slate-500">Email</div>
                    <a
                      href={`mailto:${interview.candidate_email}`}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {interview.candidate_email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone size={18} className="text-slate-400 mt-1" />
                  <div>
                    <div className="text-sm text-slate-500">Số điện thoại</div>
                    <a
                      href={`tel:${interview.candidate_phone}`}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {interview.candidate_phone}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Job Info */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Briefcase size={20} className="text-blue-600" />
                Vị trí ứng tuyển
              </h2>

              <div className="space-y-3">
                <Link
                  to={`${basePath}/jobs/${interview.job_id}`}
                  className="text-lg font-semibold text-blue-600 hover:text-blue-700"
                >
                  {interview.job_title}
                </Link>
                {interview.job_location && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <MapPin size={14} className="text-slate-400" />
                    {interview.job_location}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Liên hệ nhanh
              </h2>

              <div className="space-y-3">
                <a
                  href={`mailto:${interview.candidate_email}`}
                  className="flex items-center gap-2 w-full rounded-lg border border-blue-200 bg-blue-50 text-blue-700 px-4 py-2.5 hover:bg-blue-100 font-medium"
                >
                  <Mail size={16} />
                  Gửi email
                </a>

                <a
                  href={`tel:${interview.candidate_phone}`}
                  className="flex items-center gap-2 w-full rounded-lg border border-green-200 bg-green-50 text-green-700 px-4 py-2.5 hover:bg-green-100 font-medium"
                >
                  <Phone size={16} />
                  Gọi điện
                </a>

                <Link
                  to={`${basePath}/applications/${interview.application_id}`}
                  className="flex items-center gap-2 w-full rounded-lg border border-purple-200 bg-purple-50 text-purple-700 px-4 py-2.5 hover:bg-purple-100 font-medium"
                >
                  <FileText size={16} />
                  Xem hồ sơ
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        title="Chỉnh sửa lịch phỏng vấn"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdate}
          className="mt-4"
        >
          <Form.Item
            label="Thời gian phỏng vấn"
            name="schedule_time"
            rules={[{ required: true, message: 'Vui lòng chọn thời gian' }]}
          >
            <DatePicker
              showTime
              format="DD/MM/YYYY HH:mm"
              className="w-full"
              placeholder="Chọn thời gian"
            />
          </Form.Item>

          <Form.Item
            label="Phương thức"
            name="method"
            rules={[{ required: true, message: 'Vui lòng chọn phương thức' }]}
          >
            <Select placeholder="Chọn phương thức">
              <Select.Option value="online">Trực tuyến</Select.Option>
              <Select.Option value="offline">Tại văn phòng</Select.Option>
              <Select.Option value="phone">Điện thoại</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="Địa điểm" name="location">
            <Input placeholder="Nhập địa điểm hoặc link meeting" />
          </Form.Item>

          <Form.Item label="Ghi chú" name="notes">
            <TextArea rows={4} placeholder="Nhập ghi chú" />
          </Form.Item>

          <Form.Item
            label="Trạng thái"
            name="status"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
          >
            <Select placeholder="Chọn trạng thái">
              <Select.Option value="scheduled">Đã lên lịch</Select.Option>
              <Select.Option value="completed">Đã hoàn thành</Select.Option>
              <Select.Option value="cancelled">Đã hủy</Select.Option>
              <Select.Option value="rescheduled">Đã dời lịch</Select.Option>
            </Select>
          </Form.Item>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => setEditModalVisible(false)}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              Cập nhật
            </button>
          </div>
        </Form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        title="Xác nhận xóa"
        open={deleteModalVisible}
        onCancel={() => setDeleteModalVisible(false)}
        onOk={handleDelete}
        okText="Xóa"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <p>Bạn có chắc chắn muốn xóa lịch phỏng vấn này không?</p>
      </Modal>
    </AdminLayout>
  );
}
