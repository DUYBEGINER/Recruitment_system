// WorkingEnvironmentSection.js
import React, { useState, useEffect } from 'react';
import './WorkingEnvironmentSection.css'; 

// Dùng các icon placeholder (có thể thay thế bằng Font Awesome hoặc SVG)
const statIcon = (iconClass) => <span className="stat-icon"><i className={`fa ${iconClass}`} aria-hidden="true"></i></span>;

// Dùng mảng các đối tượng để quản lý ảnh và số thứ tự
const images = [
    { 
        id: 1, 
        src: 'https://sck.com.vn/wp-content/uploads/2021/03/4-4.jpg', 
        alt: 'Phòng hội nghị Viettel', 
        number: '02.' // Trong mẫu, ảnh này là 02.
    },
    { 
        id: 2, 
        src: 'https://plus.unsplash.com/premium_photo-1661764256397-af154e87b1b3?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8Y29tcGFueXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60', 
        alt: 'Tòa nhà Viettel', 
        number: '03.' // Trong mẫu, ảnh này là 03.
    },
    { 
        id: 3, 
        src: 'https://sck.com.vn/wp-content/uploads/2021/03/7-2.jpg', 
        alt: 'Văn phòng làm việc', 
        number: '01.' // Trong mẫu, ảnh này là 01.
    }
];

const WorkingEnvironmentSection = () => {
    // State để theo dõi index của ảnh đang hiển thị
    const [activeIndex, setActiveIndex] = useState(0); 

    // Hàm chuyển đến ảnh tiếp theo
    const nextSlide = () => {
        setActiveIndex((prevIndex) => (prevIndex + 1) % images.length);
    };

    // Hàm xử lý khi click vào ảnh gallery
    const goToSlide = (index) => {
        setActiveIndex(index);
    };

    // useEffect để tự động chuyển slide sau mỗi khoảng thời gian
    useEffect(() => {
        const interval = setInterval(nextSlide, 5000); // Tự động chuyển sau 5 giây
        return () => clearInterval(interval); // Cleanup khi component unmount
    }, [activeIndex]); // Chạy lại khi activeIndex thay đổi

    // Lấy ảnh chính hiện tại và các ảnh phụ
    const mainImage = images[activeIndex];


    // Xử lý các ảnh phụ để hiển thị 2 ảnh còn lại trong gallery, ưu tiên ảnh tiếp theo sau ảnh chính
    const getTwoSideImages = () => {
        let tempSideImages = [...images];
        tempSideImages.splice(activeIndex, 1); // Loại bỏ ảnh chính khỏi mảng tạm
        
        // Sắp xếp lại để ảnh tiếp theo (ví dụ: nếu active là 0, ảnh 1 sẽ là 03. tiếp theo)
        // và ảnh cuối cùng trong danh sách sẽ là ảnh đầu tiên (ví dụ: nếu active là 0, ảnh cuối (01.) sẽ là 01. ở dưới cùng)
        const firstSideImageIndex = activeIndex === images.length - 1 ? 0 : activeIndex + 1;
        const secondSideImageIndex = activeIndex === images.length - 1 ? 1 : 
                                     activeIndex === images.length - 2 ? 0 : activeIndex + 2;

        const orderedSideImages = [images[firstSideImageIndex], images[secondSideImageIndex]].filter(Boolean); // Lọc bỏ undefined nếu có
        return orderedSideImages.slice(0, 2); // Chỉ lấy 2 ảnh
    };

    const twoSideImages = getTwoSideImages();


    return (
        <section className="working-env-section">
            <div className="working-env-container">
                
                {/* 1. Phần Nội dung và Thống kê bên trái */}
                <div className="content-side">
                    <h2 className="section-title">NƠI LÀM VIỆC BẠN ĐANG TÌM KIẾM</h2>
                    
                    <p className="intro-text">
                        Tập đoàn Công nghiệp - Viễn thông Quân đội (Viettel) là nhà cung cấp dịch vụ toàn cầu, luôn đi đầu trong đổi mới sáng tạo và luôn lắng nghe thấu hiểu để đem tới những tiện ích và giá trị tốt nhất cho khách hàng.
                    </p>

                    {/* Danh sách Thống kê/Giá trị */}
                    <ul className="stats-list">
                        <li>
                            {statIcon('fa-trophy')} 
                            <p><strong>Thương hiệu giá trị nhất:</strong> Việt Nam</p>
                        </li>
                        <li>
                            {statIcon('fa-globe')} 
                            <p><strong>Top 30 công ty viễn thông toàn cầu</strong></p>
                        </li>
                        <li>
                            {statIcon('fa-users')} 
                            <p><strong>50,000+ nhân viên</strong></p>
                        </li>
                        <li>
                            {statIcon('fa-globe')} 
                            <p><strong>11 quốc gia trải dài từ Châu Á, Châu Mỹ, Châu Phi</strong></p>
                        </li>
                        <li>
                            {statIcon('fa-star')} 
                            <p><strong>Top 3 Nơi làm việc tốt nhất Việt Nam 2021</strong><br /><small>(theo khảo sát độc lập Anphabe)</small></p>
                        </li>
                    </ul>

                    <p className="bottom-note">
                        Bên cạnh viễn thông, Viettel còn tham gia vào lĩnh vực nghiên cứu sản xuất công nghệ cao, phát triển ứng dụng, bộ chính sách, xây lắp công trình, thương mại và nhiều lĩnh vực khác.
                    </p>

                    <button className="btn btn-red-primary">TÌM HIỂU THÊM</button>
                </div>
                
                {/* 2. Phần Carousel/Slider Ảnh bên phải */}
                <div className="image-side-carousel">
                    <div className="image-main">
                        <img src={mainImage.src} alt={mainImage.alt} className="main-image" />
                        <span className="image-number">{mainImage.number}</span>
                    </div>
                    
                    <div className="image-gallery">
                        {/* Render 2 ảnh phụ */}
                        {twoSideImages.map((image) => (
                            <div 
                                key={image.id} 
                                className={`gallery-item ${image.id === images[activeIndex].id ? '' : 'inactive'}`} // Mặc định tất cả đều inactive để CSS làm mờ
                                onClick={() => goToSlide(images.findIndex(img => img.id === image.id))}
                            >
                                <img src={image.src} alt={image.alt} />
                                <span className="image-number">{image.number}</span>
                            </div>
                        ))}
                        {/* Nút mũi tên */}
                        <button className="carousel-arrow" onClick={nextSlide}>→</button> 
                    </div>
                </div>

            </div>
        </section>
    );
};

export default WorkingEnvironmentSection;