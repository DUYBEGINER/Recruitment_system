// HeroSection.js
import React from 'react';
import SearchBar from '../SearchBar/SearchBar';
import './HeroSection.css'; 
import background from "/bg.jpg"; // Đảm bảo đường dẫn này đúng với vị trí ảnh của bạn

const HeroSection = () => {
  return (
    <section className="hero-section">
      <h1 className="hero-text"><span>Show us your way</span></h1>
      {/* SearchBar sẽ nằm trực tiếp trong hero-section, trên mọi lớp khác */}

      <div className="hero-content">
        
        {/* Hình ảnh nền */}
        <div className="hero-bg">
            <img 
                src={background}
                alt="Resume and laptop on desk" 
                className="hero-image"
            />
        </div>
      <div className="top-search-bar-wrapper">
        <SearchBar />
      </div>
      </div>
    </section>
  );
};

export default HeroSection;