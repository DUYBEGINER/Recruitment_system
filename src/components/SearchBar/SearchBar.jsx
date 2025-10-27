// SearchBar.js
import React from 'react';
import './SearchBar.css'; // File CSS cho component này

const SearchBar = () => {
  return (
    <div className="search-bar-container">
      <div className="search-field job-field">
        <label htmlFor="job-search">Công việc:</label>
        <input type="text" id="job-search" placeholder="Tìm theo tên hoặc kỹ năng" />
      </div>
      <div className="search-field area-field">
        <label htmlFor="area-search">Khu vực:</label>
        <input type="text" id="area-search" placeholder="Tìm theo khu vực" />
      </div>
      <button className="search-button" aria-label="Search">
        {/* SVG Icon cho nút tìm kiếm */}
        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
      </button>
    </div>
  );
};

export default SearchBar;