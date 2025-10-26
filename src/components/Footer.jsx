import { Facebook, Youtube, Linkedin, Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white text-gray-700">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Cột 1: Logo + Tên công ty */}
        <div className="md:col-span-2">
          <h2 className="text-red-600 text-2xl font-bold mb-1">viettel</h2>
          <p className="font-semibold mb-2">
            TẬP ĐOÀN CÔNG NGHIỆP - VIỄN THÔNG QUÂN ĐỘI
          </p>
          <a
            href="mailto:Tuyendung@viettel.com.vn"
            className="text-red-500 hover:underline block mb-2"
          >
            Tuyendung@viettel.com.vn
          </a>
          <p className="text-gray-500 text-sm leading-relaxed">
            Lô D26 Khu đô thị mới Cầu Giấy, Phường Yên Hòa, Quận Cầu Giấy, Hà Nội, Việt Nam
          </p>
        </div>

        {/* Cột 2: Liên kết */}
        <div>
          <ul className="space-y-2 font-semibold text-sm">
            <li><a href="#" className="hover:text-red-600">VỀ CHÚNG TÔI</a></li>
            <li><a href="#" className="hover:text-red-600">TUYỂN DỤNG</a></li>
            <li><a href="#" className="hover:text-red-600">ĐÃI NGỘ</a></li>
          </ul>
        </div>

        {/* Cột 3: Mạng xã hội + logo chứng nhận */}
        <div className="flex flex-col space-y-4">
          <div>
            <p className="font-semibold text-sm mb-2">Theo dõi chúng tôi</p>
            <div className="flex space-x-3 text-gray-500">
              <a href="#" className="hover:text-red-600"><Facebook size={20} /></a>
              <a href="#" className="hover:text-red-600"><Youtube size={20} /></a>
              <a href="#" className="hover:text-red-600"><Linkedin size={20} /></a>
              <a href="#" className="hover:text-red-600"><Instagram size={20} /></a>
            </div>
          </div>

          {/* Logo bộ công thương */}
          <div>
            <img
              src="https://www.tncstore.vn/static/version1719981613/frontend/TNC/default/vi_VN/images/bo-cong-thuong.png"
              alt="Đã thông báo Bộ Công Thương"
              className="h-10 mt-2"
            />
          </div>
        </div>
      </div>

      {/* Dòng cuối */}
      <div className="text-center text-sm text-gray-500">
        © VIETTEL 2022 |{" "}
        <a href="#" className="hover:text-red-600">CHÍNH SÁCH BẢO MẬT</a> |{" "}
        <a href="#" className="hover:text-red-600">ĐIỀU KHOẢN SỬ DỤNG</a>
      </div>
    </footer>
  );
}
