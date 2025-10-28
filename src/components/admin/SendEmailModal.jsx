import React, { useState } from "react";
import { Modal, Form, Input, message } from "antd";
import { Mail, Send } from "lucide-react";
import emailAPI from "../../api/emailAPI";

const { TextArea } = Input;

/**
 * Modal gửi email cho ứng viên
 */
export default function SendEmailModal({ visible, onClose, candidateEmail, candidateName }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const emailData = {
        to: candidateEmail,
        subject: values.subject,
        message: values.message,
        candidateName: candidateName
      };

      const result = await emailAPI.sendEmail(emailData);
      
      if (result.success) {
        message.success('Gửi email thành công!');
        
        // Nếu là test email (Ethereal), hiển thị preview URL
        if (result.data?.previewURL) {
          Modal.info({
            title: 'Email đã được gửi (Test Mode)',
            content: (
              <div>
                <p>Email đã được gửi thành công trong chế độ test.</p>
                <p>Bạn có thể xem email tại:</p>
                <a 
                  href={result.data.previewURL} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700"
                >
                  {result.data.previewURL}
                </a>
                <p className="mt-2 text-sm text-slate-600">
                  <strong>Lưu ý:</strong> Để gửi email thật, vui lòng cấu hình EMAIL_USER và EMAIL_PASSWORD trong file .env
                </p>
              </div>
            ),
            width: 600
          });
        }
        
        form.resetFields();
        onClose();
      } else {
        message.error(result.message || 'Không thể gửi email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      message.error(error.response?.data?.message || 'Lỗi khi gửi email');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <Mail size={20} className="text-blue-600" />
          <span>Gửi email cho ứng viên</span>
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={700}
    >
      <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start gap-2">
          <Mail size={16} className="text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm text-slate-600">Người nhận:</p>
            <p className="font-semibold text-slate-900">{candidateName}</p>
            <p className="text-sm text-blue-600">{candidateEmail}</p>
          </div>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          subject: `[PDD Tuyển Dụng] Thông báo từ ${candidateName || 'ứng viên'}`
        }}
      >
        <Form.Item
          label="Tiêu đề email"
          name="subject"
          rules={[
            { required: true, message: 'Vui lòng nhập tiêu đề email' },
            { min: 5, message: 'Tiêu đề phải có ít nhất 5 ký tự' }
          ]}
        >
          <Input
            placeholder="VD: Thông báo về kết quả ứng tuyển"
            size="large"
          />
        </Form.Item>

        <Form.Item
          label="Nội dung email"
          name="message"
          rules={[
            { required: true, message: 'Vui lòng nhập nội dung email' },
            { min: 20, message: 'Nội dung phải có ít nhất 20 ký tự' }
          ]}
        >
          <TextArea
            rows={10}
            placeholder={`Xin chào ${candidateName || 'bạn'},\n\nChúng tôi xin thông báo...\n\nTrân trọng,\nPhòng Nhân sự`}
            showCount
            maxLength={2000}
          />
        </Form.Item>

        <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 mb-4">
          <p className="text-sm text-amber-800">
            <strong>💡 Mẹo:</strong> Email sẽ được gửi với định dạng chuyên nghiệp, 
            bao gồm logo công ty và thông tin liên hệ.
          </p>
        </div>

        <div className="flex gap-3 justify-end">
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
                Đang gửi...
              </>
            ) : (
              <>
                <Send size={16} />
                Gửi email
              </>
            )}
          </button>
        </div>
      </Form>
    </Modal>
  );
}
