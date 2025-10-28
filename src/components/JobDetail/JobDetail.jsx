import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import jobAPI from "../../api/jobAPI";
import applicationAPI from "../../api/applicationAPI";
import useAuth from "../../hook/useAuth";
import "./JobDetail.css";

export default function JobDetail() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [cvFile, setCvFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    coverLetter: ''
  });
  const navigate = useNavigate();
  const { user, authenticate } = useAuth();

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await jobAPI.getJobById(id);
        // Ensure we're getting the correct data structure
        if (res.success && res.data) {
          setJob(res.data);
          setMessage(null);
        } else {
          setMessage({
            type: 'error',
            text: res.message || 'Không thể tải thông tin tuyển dụng'
          });
          setJob(null);
        }
      } catch (err) {
        console.error("Lỗi load job:", err);
        setMessage({
          type: 'error',
          text: err.response?.data?.message || 'Lỗi khi tải thông tin tuyển dụng'
        });
        setJob(null);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  // Pre-fill form với thông tin user khi mở modal
  useEffect(() => {
    if (showApplyModal && user) {
      setFormData({
        fullName: user.full_name || user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        coverLetter: ''
      });
    }
  }, [showApplyModal, user]);

  if (loading) return <p>Đang tải...</p>;
  if (!job) return <p>Không tìm thấy tin tuyển dụng!</p>;

  const handleApplyClick = () => {
    if (!authenticate || !user) {
      // redirect to login page
      navigate('/login');
      return;
    }
    setShowApplyModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCloseModal = () => {
    setShowApplyModal(false);
    setCvFile(null);
    setMessage(null);
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      coverLetter: ''
    });
  };

  const handleFileChange = (e) => {
    setCvFile(e.target.files?.[0] || null);
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    if (!user) {
      setMessage({ type: 'error', text: 'Bạn cần đăng nhập để nộp hồ sơ.' });
      return;
    }
    
    const candidateId = user.id || user.userId || user.user_id;
    if (!candidateId) {
      setMessage({ type: 'error', text: 'Không xác định được tài khoản ứng viên.' });
      return;
    }

    if (!cvFile) {
      setMessage({ type: 'error', text: 'Vui lòng upload CV của bạn!' });
      return;
    }

    setSubmitting(true);
    setMessage(null);
    
    try {
      const form = new FormData();
      form.append('jobId', id);
      form.append('candidateId', candidateId);
      form.append('fullName', formData.fullName);
      form.append('email', formData.email);
      form.append('phone', formData.phone);
      if (formData.coverLetter) {
        form.append('coverLetter', formData.coverLetter);
      }
      if (cvFile) {
        form.append('file', cvFile);
      }

      const res = await applicationAPI.submitApplication(form);
      
      if (res?.success) {
        setMessage({ type: 'success', text: res.message || 'Nộp hồ sơ thành công!' });
        setTimeout(() => {
          handleCloseModal();
        }, 2000);
      } else {
        setMessage({ type: 'error', text: res?.message || 'Không thể nộp hồ sơ' });
      }
    } catch (err) {
      console.error('Apply error', err);
      const text = err.response?.data?.message || err.message || 'Lỗi khi nộp hồ sơ';
      setMessage({ type: 'error', text });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="job-detail-container">
      <div className="job-top">
        <div className="job-top-left">
          {job.companyLogo && (
            <img src={job.companyLogo} alt="company-logo" className="job-company-logo" />
          )}
          <div className="job-top-meta">
            <h1 className="job-title">{job.title}</h1>
            <p className="company-name">{job.companyName}</p>
            <div className="meta-row">
              <span className="job-location">{job.location}</span>
              <span className="job-deadline-inline">| Ngày hết hạn: {job.deadline?.split("T")[0]}</span>
            </div>
          </div>
        </div>
      </div>

      <nav className="job-tabs">
        <a className="tab active">Chi tiết</a>
      </nav>

      <div className="job-body">
        <main className="job-body-left">
          <section className="section">
            <h4 className="section-title-red">MÔ TẢ CÔNG VIỆC</h4>
            <div className="section-content">{job.description || "Không có mô tả"}</div>
          </section>

          <section className="section">
            <h4 className="section-title-red">YÊU CẦU</h4>
            <div className="section-content">{job.requirements || "Không có"}</div>
          </section>

          <section className="section">
            <h4 className="section-title-red">KỸ NĂNG</h4>
            <div className="section-content">{job.skills || "Không có"}</div>
          </section>

          <section className="section">
            <h4 className="section-title-red">ĐÃI NGỘ</h4>
            <div className="benefits-row">{job.benefits || "Không có"}
            </div>
          </section>

          <div className="sticky-actions">
            <button className="btn-apply primary" onClick={handleApplyClick}>ỨNG TUYỂN NGAY</button>
          </div>
        </main>

        <aside className="job-body-right">
          <div className="info-panel">
            <h4 className="info-title">THÔNG TIN CÔNG VIỆC</h4>
            <ul className="info-list">
              <li><strong>Ngành nghề</strong>: {job.employmentType || "-"}</li>
              <li><strong>Cấp bậc</strong>: {job.experienceLevel || "-"}</li>
              <li><strong>Lương</strong>: {job.salaryMin || 0} - {job.salaryMax || 0}</li>
              <li><strong>Số lượng người cần tuyển</strong>: {job.quantity || 1}</li>
            </ul>
          </div>
        </aside>
      </div>

      {/* Modal ứng tuyển */}
      {showApplyModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Nộp hồ sơ ứng tuyển</h2>
              <button className="modal-close" onClick={handleCloseModal}>&times;</button>
            </div>

            <form className="apply-modal-form" onSubmit={handleSubmitApplication}>
              <div className="form-group">
                <label htmlFor="fullName">Họ và tên <span className="required">*</span></label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Nhập họ và tên của bạn"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email <span className="required">*</span></label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="example@email.com"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Số điện thoại <span className="required">*</span></label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="0123456789"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="cvFile">Upload CV <span className="required">*</span></label>
                <input
                  type="file"
                  id="cvFile"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  required
                />
                <small className="form-hint">Chấp nhận file PDF, DOC, DOCX (tối đa 5MB)</small>
              </div>

              <div className="form-group">
                <label htmlFor="coverLetter">Thư giới thiệu</label>
                <textarea
                  id="coverLetter"
                  name="coverLetter"
                  value={formData.coverLetter}
                  onChange={handleInputChange}
                  placeholder="Giới thiệu về bản thân và lý do bạn phù hợp với vị trí này..."
                  rows="4"
                />
              </div>

              {message && (
                <div className={`form-message ${message.type}`}>
                  {message.text}
                </div>
              )}

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn-cancel" 
                  onClick={handleCloseModal}
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
      )}
    </div>
  );
}
