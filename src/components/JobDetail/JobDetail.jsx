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
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [cvFile, setCvFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();
  const { user, authenticate } = useAuth();

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await jobAPI.getJobById(id);
        setJob(res.data.data);
      } catch (err) {
        console.error("Lỗi load job:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  if (loading) return <p>Đang tải...</p>;
  if (!job) return <p>Không tìm thấy tin tuyển dụng!</p>;

  const handleApplyClick = () => {
    if (!authenticate || !user) {
      // redirect to login page
      navigate('/login');
      return;
    }
    setShowApplyForm(true);
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

    setSubmitting(true);
    setMessage(null);
    try {
      const form = new FormData();
      form.append('jobId', id);
  form.append('candidateId', candidateId);
      if (cvFile) form.append('file', cvFile);

      const res = await applicationAPI.submitApplication(form);
      if (res?.data?.success) {
        setMessage({ type: 'success', text: 'Nộp hồ sơ thành công!' });
        setShowApplyForm(false);
        setCvFile(null);
      } else {
        setMessage({ type: 'error', text: res?.data?.message || 'Không thể nộp hồ sơ' });
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
            {showApplyForm && (
              <form className="apply-form" onSubmit={handleSubmitApplication}>
                <label className="file-label">Upload CV (PDF/DOC/DOCX)</label>
                <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
                <div className="apply-actions">
                  <button type="submit" className="btn-apply primary" disabled={submitting}>{submitting ? 'Đang gửi...' : 'Gửi hồ sơ'}</button>
                  <button type="button" className="btn-reset" onClick={() => { setShowApplyForm(false); setCvFile(null); }}>Hủy</button>
                </div>
              </form>
            )}
            {message && (
              <div className={`apply-message ${message.type}`}>{message.text}</div>
            )}
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
    </div>
  );
}
