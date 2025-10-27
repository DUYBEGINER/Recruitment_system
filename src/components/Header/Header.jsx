import React from "react";
import "./Header.css";
const LOGO_PATH = "/logo-cv.png";

function Header(){
    return(
        <header>
            <div className="logo">
                <img src={LOGO_PATH} alt="logo-tuyen-dung" />
                <h2 className="title"><span>Tuyển Dụng</span></h2>
            </div>
            <nav className="nav">
                <ul>
                    <li><a href="#">Trang chủ</a></li>
                    <li><a href="#">Về chúng tôi</a></li>
                    <li><a href="#">Tuyển dụng</a></li>
                    <li><a href="#">Đãi ngộ</a></li>
                    <li><a href="#">Sự kiện</a></li>
                </ul>
            </nav>
            <div className="actions">
                <button className="btn candidate">ỨNG VIÊN</button>
                <button className="btn employer">NHÂN VIÊN</button>
            </div>
        </header>
    )
}
export default Header;