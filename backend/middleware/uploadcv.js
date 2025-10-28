import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Lấy __dirname trong ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Đảm bảo thư mục CV_Storage tồn tại
const uploadDir = path.join(__dirname, '../CV_Storage');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình multer để lưu file vào thư mục 'CV_Storage'
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    //cb là hàm callback để trả về thư mục lưu file
    //Tham số thứ nhất (error) dùng để truyền lỗi nếu có.
    //Tham số thứ hai là đường dẫn thư mục lưu file
    cb(null, uploadDir); // Lưu vào backend/CV_Storage/
  },
  filename: (req, file, cb) => {
    // Tạo tên file duy nhất với timestamp và random number
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // Giữ nguyên extension của file gốc
    cb(null, 'CV-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter để chỉ chấp nhận các file PDF, DOC, DOCX
const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file PDF, DOC, hoặc DOCX!'));
  }
};

// Cấu hình upload với giới hạn kích thước file 5MB
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: fileFilter
});

export const uploadCV = upload;
export default upload;