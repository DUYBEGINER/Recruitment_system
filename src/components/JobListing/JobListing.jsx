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

  // Filter states (basic set; expand as needed)
  const [searchText, setSearchText] = useState("");
  const [selectedEmployers, setSelectedEmployers] = useState([]);
  const [filtersAppliedAt, setFiltersAppliedAt] = useState(0); // bump to re-run

  const buildParams = () => {
    const params = {
      page,
      limit,
      status: "approve",
    };

    if (searchText && searchText.trim()) params.search = searchText.trim();
    if (selectedEmployers && selectedEmployers.length) params.employerIds = selectedEmployers.join(',');

    return params;
  };

  const loadJobs = async () => {
    try {
      const params = buildParams();
      const response = await jobAPI.getJobs(params);

      // Backend may respond with different shapes depending on implementation.
      // Support a few common variants to be robust.
      const payload = response?.data || {};
      const data = payload.data || payload.rows || payload.recordset || payload || [];

      // If payload includes metadata use it; otherwise try to compute.
      const totalCount = payload.totalCount || payload.total_count || payload.total || (Array.isArray(data) ? data.length : 0);
      const pages = payload.totalPages || Math.max(1, Math.ceil(totalCount / limit));

      setJobs(Array.isArray(data) ? data : []);
      setTotalPages(pages);
    } catch (error) {
      console.error("⚠️ Load jobs failed:", error);
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
          {/* Đơn vị tuyển dụng */}
          <div className="filter-section">
            <div className="filter-header">
              <h4 className="filter-title-heading">Đơn vị tuyển dụng</h4>
              <span className="tat-ca">Tất cả</span>
            </div>

            <div className="filter-dropdown-mock">
              <input
                aria-label="search-employer"
                placeholder="Tìm nhà tuyển dụng"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>

            <div className="filter-list-scroll-mock">
              {/* Example employers - replace with dynamic list when available */}
              {[
                { id: 1, name: 'Tổng công ty Giải pháp doanh nghiệp Viettel' },
                { id: 2, name: 'Tổng công ty Công nghiệp Công nghệ cao Viettel' },
                { id: 3, name: 'Viện Hàng không vũ trụ Viettel' },
                { id: 4, name: 'Trung tâm Dịch vụ dữ liệu/Trạm' },
              ].map((employer) => (
                <label key={employer.id} className="checkbox-container">
                  {employer.name}
                  <input
                    type="checkbox"
                    checked={selectedEmployers.includes(String(employer.id))}
                    onChange={(e) => {
                      const idStr = String(employer.id);
                      setSelectedEmployers((prev) => {
                        if (e.target.checked) return [...prev, idStr];
                        return prev.filter((x) => x !== idStr);
                      });
                    }}
                  />
                  <span className="checkmark"></span>
                </label>
              ))}
            </div>
          </div>

          <hr className="divider" />

          {/* Other quick filter headers (static placeholders) */}
          <div className="filter-section">
            <div className="filter-header">
              <h4 className="filter-title-heading">Ngành nghề</h4>
              <span className="tat-ca">Tất cả</span>
            </div>
          </div>

          <hr className="divider" />

          <div className="filter-section">
            <div className="filter-header">
              <h4 className="filter-title-heading">Tìm theo khu vực</h4>
              <span className="tat-ca">Tất cả</span>
            </div>
          </div>

          <hr className="divider" />

          <div className="filter-section">
            <div className="filter-header">
              <h4 className="filter-title-heading">Cấp bậc</h4>
              <span className="tat-ca">Tất cả</span>
            </div>
          </div>

          <hr className="divider" />

          <div className="filter-section">
            <div className="filter-header">
              <h4 className="filter-title-heading">Thời gian làm việc</h4>
              <span className="tat-ca">Tất cả</span>
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
