import React, { useState } from "react";
import { Modal, Form, DatePicker, Select, Input, message } from "antd";
import { Calendar } from "lucide-react";
import interviewAPI from "../../api/interviewAPI";
import dayjs from "dayjs";

const { TextArea } = Input;

/**
 * Modal tạo lịch phỏng vấn cho ứng viên
 */
export default function CreateInterviewModal({ visible, onClose, applicationId, candidateName, onSuccess }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const interviewData = {
        application_id: applicationId,
        schedule_time: values.schedule_time.toISOString(),
        method: values.method,
        location: values.location,
        notes: values.notes
      };

      const result = await interviewAPI.createInterview(interviewData);
      
      if (result.success) {
        // Hiển thị thông báo về email
        if (result.emailSent) {
          message.success("Tạo lịch phỏng vấn và gửi email thông báo thành công!");
          // Nếu có preview URL (test email), log ra console
          if (result.emailPreview) {
            console.log('Email preview:', result.emailPreview);
          }
        } else {
          message.warning("Tạo lịch phỏng vấn thành công nhưng không thể gửi email thông báo");
        }
        
        form.resetFields();
        onSuccess && onSuccess(result.data);
        onClose();
      } else {
        message.error(result.message || "Không thể tạo lịch phỏng vấn");
      }
    } catch (error) {
      console.error("Error creating interview:", error);
      message.error("Lỗi khi tạo lịch phỏng vấn");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  // Không cho chọn ngày trong quá khứ
  const disabledDate = (current) => {
    return current && current < dayjs().startOf('day');
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <Calendar size={20} className="text-blue-600" />
          <span>Tạo lịch phỏng vấn</span>
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={600}
    >
      {candidateName && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-slate-600">Ứng viên:</p>
          <p className="text-lg font-semibold text-slate-900">{candidateName}</p>
        </div>
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          method: "online"
        }}
      >
        <Form.Item
          label="Thời gian phỏng vấn"
          name="schedule_time"
          rules={[
            { required: true, message: 'Vui lòng chọn thời gian phỏng vấn' }
          ]}
        >
          <DatePicker
            showTime
            format="DD/MM/YYYY HH:mm"
            className="w-full"
            placeholder="Chọn ngày và giờ phỏng vấn"
            disabledDate={disabledDate}
            showNow={false}
          />
        </Form.Item>

        <Form.Item
          label="Phương thức phỏng vấn"
          name="method"
          rules={[
            { required: true, message: 'Vui lòng chọn phương thức phỏng vấn' }
          ]}
        >
          <Select placeholder="Chọn phương thức">
            <Select.Option value="online">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-purple-500"></span>
                Trực tuyến (Video call)
              </div>
            </Select.Option>
            <Select.Option value="offline">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-indigo-500"></span>
                Tại văn phòng
              </div>
            </Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Địa điểm / Link meeting"
          name="location"
          rules={[
            { required: true, message: 'Vui lòng nhập địa điểm hoặc link meeting' }
          ]}
        >
          <Input
            placeholder="VD: https://meet.google.com/... hoặc Phòng họp A - Tầng 3"
          />
        </Form.Item>

        <Form.Item
          label="Ghi chú"
          name="notes"
        >
          <TextArea
            rows={4}
            placeholder="Ghi chú thêm về buổi phỏng vấn (tùy chọn)"
          />
        </Form.Item>

        <div className="flex gap-3 justify-end mt-6">
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin">⏳</span>
                Đang tạo...
              </>
            ) : (
              <>
                <Calendar size={16} />
                Tạo lịch phỏng vấn
              </>
            )}
          </button>
        </div>
      </Form>
    </Modal>
  );
}
