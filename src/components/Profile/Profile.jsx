import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hook/useAuth';
import applicationAPI from '../../api/applicationAPI';
import './Profile.css';

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('info'); // 'info' hoặc 'applications'
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load applications khi chuyển sang tab "Hồ sơ đã ứng tuyển"
  useEffect(() => {
    const isCandidate = !user?.role || user?.role === 'candidate';
    if (activeTab === 'applications' && isCandidate) {
      loadApplications();
    }
  }, [activeTab, user]);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const response = await applicationAPI.getMyApplications();
      if (response.success) {
        setApplications(response.data || []);
      } else {
        console.error('Failed to load applications:', response.message);
      }
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Hiển thị loading nếu đang check auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  // Không hiển thị gì nếu chưa có user (đang redirect)
  if (!user) {
    return null;
  }

  // Hàm render badge status với màu sắc
  const renderStatusBadge = (status) => {
    const statusConfig = {
      submitted: { text: 'Đã nộp', color: '#3498db' },
      reviewing: { text: 'Đang xét duyệt', color: '#f39c12' },
      accepted: { text: 'Đã chấp nhận', color: '#27ae60' },
      rejected: { text: 'Đã từ chối', color: '#e74c3c' }
    };

    const config = statusConfig[status] || { text: status, color: '#95a5a6' };

    return (
      <span 
        className="status-badge" 
        style={{ backgroundColor: config.color }}
      >
        {config.text}
      </span>
    );
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format salary
  const formatSalary = (min, max) => {
    if (!min && !max) return 'Thỏa thuận';
    if (!max) return `Từ ${min.toLocaleString('vi-VN')} VNĐ`;
    if (!min) return `Lên đến ${max.toLocaleString('vi-VN')} VNĐ`;
    return `${min.toLocaleString('vi-VN')} - ${max.toLocaleString('vi-VN')} VNĐ`;
  };

  // Kiểm tra xem user có phải là candidate không
  // Candidate: không có role hoặc role === 'candidate' hoặc role === null/undefined
  // Employer: role === 'HR' hoặc 'TPNS'
  const isCandidate = !user?.role || user?.role === 'candidate';
  const isEmployer = user?.role === 'HR' || user?.role === 'TPNS';

  console.log('👤 User info:', user);
  console.log('🔑 User role:', user?.role);
  console.log('✅ Is candidate?', isCandidate);
  console.log('🏢 Is employer?', isEmployer);

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Hồ sơ của tôi</h1>
        <p>Xin chào, {user?.full_name || user?.email}!</p>
      </div>

      {/* Tabs Navigation */}
      <div className="profile-tabs">
        <button
          className={`tab-button ${activeTab === 'info' ? 'active' : ''}`}
          onClick={() => setActiveTab('info')}
        >
          📋 Thông tin cá nhân
        </button>
        {isCandidate && (
          <button
            className={`tab-button ${activeTab === 'applications' ? 'active' : ''}`}
            onClick={() => setActiveTab('applications')}
          >
            📄 Hồ sơ đã ứng tuyển
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div className="profile-content">
        {/* Tab: Thông tin cá nhân */}
        {activeTab === 'info' && (
          <div className="info-tab">
            <div className="info-card">
              <h2>Thông tin cơ bản</h2>
              <div className="info-grid">
                <div className="info-item">
                  <label>Họ và tên:</label>
                  <p>{user?.full_name || 'Chưa cập nhật'}</p>
                </div>
                <div className="info-item">
                  <label>Email:</label>
                  <p>{user?.email || 'Chưa cập nhật'}</p>
                </div>
                <div className="info-item">
                  <label>Số điện thoại:</label>
                  <p>{user?.phone || 'Chưa cập nhật'}</p>
                </div>
                {user?.role === 'candidate' && user?.cv_url && (
                  <div className="info-item full-width">
                    <label>CV hiện tại:</label>
                    <a 
                      href={`http://localhost:5000${user.cv_url}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="cv-link"
                    >
                      📎 Xem CV
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Hồ sơ đã ứng tuyển */}
        {activeTab === 'applications' && (
          <div className="applications-tab">
            <div className="applications-header">
              <h2>Danh sách hồ sơ đã ứng tuyển</h2>
              <p className="applications-count">
                Tổng số: <strong>{applications.length}</strong> hồ sơ
              </p>
            </div>

            {loading ? (
              <div className="loading">Đang tải...</div>
            ) : applications.length === 0 ? (
              <div className="empty-state">
                <p>📭 Bạn chưa ứng tuyển vị trí nào.</p>
                <a href="/jobs" className="browse-jobs-btn">
                  Tìm việc ngay
                </a>
              </div>
            ) : (
              <div className="applications-list">
                {applications.map((app) => (
                  <div key={app.id} className="application-card">
                    <div className="application-header">
                      <h3>{app.job_title}</h3>
                      {renderStatusBadge(app.status)}
                    </div>
                    
                    <div className="application-info">
                      <div className="info-row">
                        <span className="icon">🏢</span>
                        <span>{app.company_name || 'Không rõ công ty'}</span>
                      </div>
                      <div className="info-row">
                        <span className="icon">📍</span>
                        <span>{app.job_location}</span>
                      </div>
                      <div className="info-row">
                        <span className="icon">💼</span>
                        <span>{app.job_type} • {app.level}</span>
                      </div>
                      <div className="info-row">
                        <span className="icon">💰</span>
                        <span>{formatSalary(app.salary_min, app.salary_max)}</span>
                      </div>
                      <div className="info-row">
                        <span className="icon">🕒</span>
                        <span>Nộp lúc: {formatDate(app.submitted_at)}</span>
                      </div>
                    </div>

                    <div className="application-actions">
                      {app.cv_url && (
                        <a 
                          href={`http://localhost:5000${app.cv_url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-view-cv"
                        >
                          📎 Xem CV đã nộp
                        </a>
                      )}
                      <a 
                        href={`/jobs/${app.job_id}`}
                        className="btn-view-job"
                      >
                        👁️ Xem tin tuyển dụng
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
