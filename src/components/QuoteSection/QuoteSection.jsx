// QuoteSection.js
import React from 'react';
import './QuoteSection.css'; 

// Giả định bạn đã lưu ảnh người đàn ông có background đỏ trong thư mục assets
// Ví dụ: image_4b6081.jpg
import boss_img from '/boss.jpg'; 

const QuoteSection = () => {
    return (
        <section className="quote-section">
            <div className="quote-container">
                
                {/* Khu vực ảnh và hình lượn sóng đỏ */}
                <div className="quote-image-wrapper">
                    <img 
                        src={boss_img} 
                        alt="Ông Phạm Phúc Duy - Chủ tịch kiêm Tổng giám đốc Tập đoàn " 
                        className="quote-man-image" 
                    />
                    {/* Phần hình lượn sóng đỏ được tạo bằng CSS trong QuoteSection.css */}
                </div>

                {/* Khu vực nội dung */}
                <div className="quote-content">
                    <h2 className="quote-title">LẮNG NGHE <br /> NGƯỜI VIỆT</h2>
                    
                    <blockquote className="quote-text">
                        <span className="quote-icon">“</span>
                        Là môi trường làm việc rất thách thức nhưng đầy khát vọng, Chúng tôi chính là bệ phóng cho các tài năng trẻ Việt Nam.
                    </blockquote>
                    
                    <p className="quote-author">
                        <span className="author-name">ÔNG PHẠM PHÚC DUY</span>
                        <span className="author-title">Chủ tịch kiêm Tổng giám đốc Tập đoàn</span>
                    </p>
                </div>

            </div>
        </section>
    );
};

export default QuoteSection;