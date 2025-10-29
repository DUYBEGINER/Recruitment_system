import React, { useEffect, useState } from "react";
import "./JobListing.css";
import { useNavigate } from "react-router-dom";
import jobAPI from "../../api/jobAPI";

export default function JobListing() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 6;
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  // Filter states
  const [searchText, setSearchText] = useState("");
  const [selectedEmployers, setSelectedEmployers] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [selectedJobTypes, setSelectedJobTypes] = useState([]);
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [filtersAppliedAt, setFiltersAppliedAt] = useState(0);

  // Filter options - có thể lấy từ API hoặc define cố định
  const locationOptions = [
    'Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 
    'Cần Thơ', 'Bình Dương', 'Đồng Nai', 'Khác'
  ];

  const jobTypeOptions = [
    'Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'
  ];

  const levelOptions = [
    'Intern', 'Fresher', 'Junior', 'Middle', 'Senior', 'Leader', 'Manager'
  ];

  const buildParams = () => {
    const params = {
      page,
      limit,
    };

    if (searchText && searchText.trim()) params.search = searchText.trim();
    if (selectedEmployers.length) params.employerIds = selectedEmployers.join(',');
    if (selectedLocations.length) params.locations = selectedLocations.join(',');
    if (selectedJobTypes.length) params.jobTypes = selectedJobTypes.join(',');
    if (selectedLevels.length) params.levels = selectedLevels.join(',');

    return params;
  };

  const loadJobs = async () => {
    try {
      const params = buildParams();
      console.log('🔍 Request params:', params);
      
      const response = await jobAPI.getJobs(params);
      console.log('📦 Full response:', response);
      console.log('✅ Success:', response?.success);
      console.log('📋 Data:', response?.data);
      console.log('📄 Pagination:', response?.pagination);

      if (response?.success) {
        // response.data là array của jobs
        const jobsData = Array.isArray(response.data) ? response.data : [];
        console.log('🎯 Jobs array:', jobsData);
        console.log('📊 Jobs count:', jobsData.length);
        setJobs(jobsData);
        
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages || 1);
        }
      } else {
        console.warn('⚠️ Response not successful or no data');
        setJobs([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("❌ Load jobs failed:", error);
      setJobs([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filtersAppliedAt]);

  if (loading) return <p>Đang tải...</p>;

  return (
    <div className="jobs-container">
      <div className="jobs-content">
        <h2 className="section-title">VỊ TRÍ KHÁC</h2>

        <div className="job-cards-grid">
          {jobs.map((job) => (
            <div key={job.id} className="job-card">
              <div className="job-card-content">
                <h3 className="job-title">{job.title}</h3>

                <p className="job-deadline">
                  Ngày hết hạn: {job.deadline?.split("T")[0] || "Không rõ"}
                </p>

                <p className="job-company">{job.companyName}</p>
                <p className="job-location">{job.location}</p>
              </div>

              <div className="job-card-footer">
                <button className="btn-more" onClick={() => navigate(`/jobs/${job.id}`)}>XEM THÊM</button>
              </div>
            </div>
          ))}
        </div>

        {/* Phân trang */}
        <div className="pagination">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            ‹
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={page === i + 1 ? "active" : ""}
            >
              {i + 1}
            </button>
          ))}

          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            ›
          </button>
        </div>
      </div>

      <div className="filter-sidebar">
        <h3 className="filter-title">LỌC KẾT QUẢ</h3>

        <div className="filter-panel">
          {/* Loại hình công việc (job_type) */}
          <div className="filter-section">
            <div className="filter-header">
              <h4 className="filter-title-heading">Loại hình công việc</h4>
              <span className="tat-ca" onClick={() => setSelectedJobTypes([])} style={{cursor: 'pointer'}}>Tất cả</span>
            </div>
            <div className="filter-list-scroll-mock">
              {jobTypeOptions.map((type) => (
                <label key={type} className="checkbox-container">
                  {type}
                  <input
                    type="checkbox"
                    checked={selectedJobTypes.includes(type)}
                    onChange={(e) => {
                      setSelectedJobTypes(prev => 
                        e.target.checked ? [...prev, type] : prev.filter(x => x !== type)
                      );
                    }}
                  />
                  <span className="checkmark"></span>
                </label>
              ))}
            </div>
          </div>

          <hr className="divider" />

          {/* Khu vực (location) */}
          <div className="filter-section">
            <div className="filter-header">
              <h4 className="filter-title-heading">Tìm theo khu vực</h4>
              <span className="tat-ca" onClick={() => setSelectedLocations([])} style={{cursor: 'pointer'}}>Tất cả</span>
            </div>
            <div className="filter-list-scroll-mock">
              {locationOptions.map((location) => (
                <label key={location} className="checkbox-container">
                  {location}
                  <input
                    type="checkbox"
                    checked={selectedLocations.includes(location)}
                    onChange={(e) => {
                      setSelectedLocations(prev => 
                        e.target.checked ? [...prev, location] : prev.filter(x => x !== location)
                      );
                    }}
                  />
                  <span className="checkmark"></span>
                </label>
              ))}
            </div>
          </div>

          <hr className="divider" />

          {/* Cấp bậc (level) */}
          <div className="filter-section">
            <div className="filter-header">
              <h4 className="filter-title-heading">Cấp bậc</h4>
              <span className="tat-ca" onClick={() => setSelectedLevels([])} style={{cursor: 'pointer'}}>Tất cả</span>
            </div>
            <div className="filter-list-scroll-mock">
              {levelOptions.map((level) => (
                <label key={level} className="checkbox-container">
                  {level}
                  <input
                    type="checkbox"
                    checked={selectedLevels.includes(level)}
                    onChange={(e) => {
                      setSelectedLevels(prev => 
                        e.target.checked ? [...prev, level] : prev.filter(x => x !== level)
                      );
                    }}
                  />
                  <span className="checkmark"></span>
                </label>
              ))}
            </div>
          </div>

          <div className="filter-actions">
            <button
              className="btn-apply-filters"
              onClick={() => {
                // apply filters: reset to page 1 and bump counter
                setPage(1);
                setFiltersAppliedAt((s) => s + 1);
              }}
            >
              Áp dụng
            </button>
            <button
              className="btn-reset-filters"
              onClick={() => {
                setSearchText("");
                setSelectedEmployers([]);
                setSelectedLocations([]);
                setSelectedJobTypes([]);
                setSelectedLevels([]);
                setPage(1);
                setFiltersAppliedAt((s) => s + 1);
              }}
            >
              Đặt lại
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
