import React, { useState } from 'react';
import { XMarkIcon, DocumentArrowUpIcon } from '@heroicons/react/24/outline';
import './ApplicationModal.css';

export default function ApplicationModal({ isOpen, onClose, jobTitle, jobId, onSubmitSuccess }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    coverLetter: '',
  });
  const [cvFile, setCvFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Kiểm tra định dạng file
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        setError('Chỉ chấp nhận file PDF, DOC hoặc DOCX');
        return;
      }
      // Kiểm tra kích thước file (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File không được vượt quá 5MB');
        return;
      }
      setCvFile(file);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate
    if (!formData.fullName.trim()) {
      setError('Vui lòng nhập họ tên');
      return;
    }
    if (!formData.email.trim()) {
      setError('Vui lòng nhập email');
      return;
    }
    if (!formData.phone.trim()) {
      setError('Vui lòng nhập số điện thoại');
      return;
    }
    if (!cvFile) {
      setError('Vui lòng tải lên CV của bạn');
      return;
    }

    setSubmitting(true);

    try {
      const form = new FormData();
      form.append('jobId', jobId);
      form.append('fullName', formData.fullName);
      form.append('email', formData.email);
      form.append('phone', formData.phone);
      form.append('coverLetter', formData.coverLetter);
      form.append('cv', cvFile);

      // Call API
      await onSubmitSuccess(form);

      // Reset form
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        coverLetter: '',
      });
      setCvFile(null);
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi nộp hồ sơ');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="application-modal-overlay" onClick={onClose}>
      <div className="application-modal" onClick={(e) => e.stopPropagation()}>
        <div className="application-modal-header">
          <h2 className="application-modal-title">Ứng tuyển vị trí</h2>
          <button className="application-modal-close" onClick={onClose}>
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="application-modal-job-info">
          <p className="job-title-apply">{jobTitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="application-form">
          <div className="form-group">
            <label htmlFor="fullName" className="form-label">
              Họ và tên <span className="required">*</span>
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              className="form-input"
              placeholder="Nguyễn Văn A"
              value={formData.fullName}
              onChange={handleInputChange}
              disabled={submitting}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email <span className="required">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-input"
                placeholder="example@email.com"
                value={formData.email}
                onChange={handleInputChange}
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone" className="form-label">
                Số điện thoại <span className="required">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                className="form-input"
                placeholder="0912345678"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={submitting}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="cv" className="form-label">
              CV của bạn <span className="required">*</span>
            </label>
            <div className="file-upload-wrapper">
              <input
                type="file"
                id="cv"
                name="cv"
                className="file-input"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                disabled={submitting}
              />
              <label htmlFor="cv" className="file-upload-label">
                <DocumentArrowUpIcon className="w-6 h-6" />
                <span>
                  {cvFile ? cvFile.name : 'Chọn file CV (PDF, DOC, DOCX - Max 5MB)'}
                </span>
              </label>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="coverLetter" className="form-label">
              Thư giới thiệu
            </label>
            <textarea
              id="coverLetter"
              name="coverLetter"
              className="form-textarea"
              placeholder="Viết vài dòng giới thiệu về bản thân..."
              rows="4"
              value={formData.coverLetter}
              onChange={handleInputChange}
              disabled={submitting}
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
              disabled={submitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={submitting}
            >
              {submitting ? 'Đang gửi...' : 'Nộp hồ sơ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
