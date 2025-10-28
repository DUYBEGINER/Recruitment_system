import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import jobAPI from "../../api/jobAPI";
import applicationAPI from "../../api/applicationAPI";
import useAuth from "../../hook/useAuth";
import { 
  BriefcaseIcon, 
  CurrencyDollarIcon,
  UserGroupIcon,
  AcademicCapIcon,
  ClockIcon
} from "@heroicons/react/24/outline";
import ApplicationModal from "../ApplicationModal/ApplicationModal";
import "./JobDetail.css";

export default function JobDetail() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();
  const { user, authenticate } = useAuth();

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await jobAPI.getJobById(id);
        console.log("Loaded job:", res.data);
        setJob(res.data);
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
      navigate('/login');
      return;
    }
    setShowModal(true);
  };

  const handleSubmitApplication = async (formData) => {
    try {
      const response = await applicationAPI.submitApplication(formData);
      
      if (response.success) {
        setMessage({ type: 'success', text: 'Nộp hồ sơ thành công! Chúng tôi sẽ liên hệ với bạn sớm.' });
        setShowModal(false);
        
        // Tự động ẩn thông báo sau 5s
        setTimeout(() => {
          setMessage(null);
        }, 5000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Có lỗi xảy ra khi nộp hồ sơ' });
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
            <div className="section-content" style={{ whiteSpace: 'pre-line' }}>
              {job.description || "Không có mô tả"}
            </div>
          </section>

          <section className="section">
            <h4 className="section-title-red">YÊU CẦU</h4>
            <div className="section-content" style={{ whiteSpace: 'pre-line' }}>
              {job.requirements || "Không có"}
            </div>
          </section>

          <section className="section">
            <h4 className="section-title-red">KỸ NĂNG</h4>
            <div className="section-content" style={{ whiteSpace: 'pre-line' }}>
              {job.skills || "Không có"}
            </div>
          </section>

          <section className="section">
            <h4 className="section-title-red">QUYỀN LỢI</h4>
            <div className="section-content" style={{ whiteSpace: 'pre-line' }}>
              {job.benefits || "Không có"}
            </div>
          </section>

          <div className="sticky-actions">
            <button className="btn-apply primary" onClick={handleApplyClick}>ỨNG TUYỂN NGAY</button>
            
            {message && (
              <div className={`apply-message ${message.type}`}>{message.text}</div>
            )}
          </div>
        </main>

        <aside className="job-body-right">
          <div className="info-panel">
            <h4 className="info-title">THÔNG TIN CÔNG VIỆC</h4>
            <ul className="info-list">
              <li>
                <div className="info-item-label">
                  <ClockIcon className="info-icon" />
                  <strong>Hình thức</strong>
                </div>
                <span>{job.employmentType || "Không rõ"}</span>
              </li>
              <li>
                <div className="info-item-label">
                  <AcademicCapIcon className="info-icon" />
                  <strong>Cấp bậc</strong>
                </div>
                <span>{job.experienceLevel || "Không yêu cầu"}</span>
              </li>
              <li>
                <div className="info-item-label">
                  <CurrencyDollarIcon className="info-icon" />
                  <strong>Mức lương</strong>
                </div>
                <span>
                  {job.salaryMin && job.salaryMax 
                    ? `${Number(job.salaryMin).toLocaleString()} - ${Number(job.salaryMax).toLocaleString()} VNĐ`
                    : "Thỏa thuận"}
                </span>
              </li>
              <li>
                <div className="info-item-label">
                  <UserGroupIcon className="info-icon" />
                  <strong>Số lượng</strong>
                </div>
                <span>{job.quantity || 1} người</span>
              </li>
            </ul>
          </div>
        </aside>
      </div>

      {/* Application Modal */}
      <ApplicationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        jobTitle={job?.title || ''}
        jobId={id}
        onSubmitSuccess={handleSubmitApplication}
      />
    </div>
  );
}
