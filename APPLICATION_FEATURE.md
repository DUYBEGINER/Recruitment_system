# Tính năng Ứng tuyển (Application Submission)

## 📋 Mô tả

Tính năng cho phép ứng viên nộp hồ sơ ứng tuyển vào các vị trí tuyển dụng thông qua popup form chuyên nghiệp.

## 🗄️ Cấu trúc Database

### Bảng Application

```sql
CREATE TABLE Application (
    id INT IDENTITY(1,1) PRIMARY KEY,
    job_id INT NOT NULL,
    candidate_id INT NOT NULL,
    cv_url NVARCHAR(500),
    status NVARCHAR(50) CHECK (status IN ('submitted', 'reviewing', 'accepted', 'rejected')),
    submitted_at DATETIME DEFAULT GETDATE(),
    cover_letter NVARCHAR(MAX) NULL,
    FOREIGN KEY (job_id) REFERENCES JobPosting(id),
    FOREIGN KEY (candidate_id) REFERENCES Candidate(id)
);
```

### Status values:
- `submitted` - Mới nộp hồ sơ
- `reviewing` - Đang xem xét
- `accepted` - Được chấp nhận
- `rejected` - Bị từ chối

## 🚀 Cài đặt

### 1. Cập nhật Database

Chạy script SQL để cập nhật bảng Application:

```bash
# Mở SQL Server Management Studio và chạy file:
backend/database/update_application_table.sql
```

Script sẽ:
- Thêm cột `cover_letter` (NVARCHAR(MAX), NULL)
- Cập nhật constraint cho cột `status` để bao gồm giá trị 'submitted'

### 2. Cài đặt Dependencies

Đảm bảo các package đã được cài đặt:

```bash
# Frontend
npm install @heroicons/react

# Backend (đã có sẵn)
# multer - để upload file
```

### 3. Kiểm tra Backend

Đảm bảo thư mục `backend/CV_Storage/` tồn tại và có quyền ghi.

## 📁 Files đã tạo/cập nhật

### Frontend

**Components mới:**
- `src/components/ApplicationModal/ApplicationModal.jsx` - Component popup ứng tuyển
- `src/components/ApplicationModal/ApplicationModal.css` - Styles cho modal

**Components đã cập nhật:**
- `src/components/JobDetail/JobDetail.jsx` - Tích hợp ApplicationModal

**API:**
- `src/api/applicationAPI.js` - Thêm function `submitApplication()`

### Backend

**Routes:**
- `backend/routes/applicationRoutes.js` - Thêm route POST `/applications/submit`

**Controllers:**
- `backend/controller/applicationController.js` - Thêm function `submitApplication()`

**Repositories:**
- `backend/repositories/applicationRepository.js` - Thêm:
  - `createApplication()`
  - `checkExistingApplication()`
- `backend/repositories/candidateRepository.js` - Thêm:
  - `getCandidateByEmail()`
  - `createCandidate()`

**Middleware:**
- `backend/middleware/uploadcv.js` - Export `uploadCV` middleware

**Database:**
- `backend/database/update_application_table.sql` - Script cập nhật bảng

## 🎯 Cách sử dụng

### 1. Ứng viên xem chi tiết công việc

Truy cập trang chi tiết công việc: `/jobs/:id`

### 2. Bấm nút "ỨNG TUYỂN NGAY"

- Nếu chưa đăng nhập → Chuyển đến trang login
- Nếu đã đăng nhập → Hiển thị popup ApplicationModal

### 3. Điền thông tin trong popup

**Thông tin bắt buộc:**
- Họ và tên (*)
- Email (*)
- Số điện thoại (*)
- CV (file PDF/DOC/DOCX, max 5MB) (*)

**Thông tin tùy chọn:**
- Thư giới thiệu

### 4. Nộp hồ sơ

Sau khi nộp hồ sơ thành công:
- Popup đóng lại
- Hiển thị thông báo thành công
- Dữ liệu được lưu vào database

## 🔒 Bảo mật

### Kiểm tra file upload
- Chỉ chấp nhận: PDF, DOC, DOCX
- Kích thước tối đa: 5MB
- File được lưu với tên unique: `CV-{timestamp}-{random}.{ext}`

### Kiểm tra trùng lặp
- Hệ thống kiểm tra xem ứng viên đã ứng tuyển vị trí này chưa
- Không cho phép ứng tuyển lại cùng 1 vị trí

### Tự động tạo Candidate
- Nếu email chưa tồn tại trong hệ thống → Tạo Candidate mới
- Nếu email đã có → Sử dụng Candidate có sẵn

## 📊 Flow hoạt động

```
1. User click "ỨNG TUYỂN NGAY"
   ↓
2. Kiểm tra đăng nhập
   ↓ (Đã login)
3. Hiển thị ApplicationModal
   ↓
4. User điền form + upload CV
   ↓
5. Submit form
   ↓
6. Frontend: Validate data
   ↓
7. Backend: Nhận request
   ↓
8. Kiểm tra Candidate theo email
   ├─ Chưa có → Tạo Candidate mới
   └─ Đã có → Sử dụng Candidate hiện tại
   ↓
9. Kiểm tra đã ứng tuyển chưa
   ├─ Đã ứng tuyển → Trả lỗi
   └─ Chưa ứng tuyển → Tiếp tục
   ↓
10. Lưu CV vào CV_Storage/
   ↓
11. Tạo Application record
   ↓
12. Trả về success
   ↓
13. Frontend: Hiển thị thông báo thành công
```

## 🧪 Testing

### Test Cases

**TC1: Ứng tuyển thành công**
- Input: Thông tin hợp lệ + CV file
- Expected: Application được tạo, CV được lưu, hiển thị success message

**TC2: Thiếu thông tin bắt buộc**
- Input: Bỏ trống họ tên
- Expected: Hiển thị lỗi "Vui lòng nhập họ tên"

**TC3: File không hợp lệ**
- Input: Upload file .txt
- Expected: Hiển thị lỗi "Chỉ chấp nhận file PDF, DOC hoặc DOCX"

**TC4: File quá lớn**
- Input: Upload file > 5MB
- Expected: Hiển thị lỗi "File không được vượt quá 5MB"

**TC5: Ứng tuyển trùng**
- Input: Ứng tuyển lại vị trí đã ứng tuyển
- Expected: Hiển thị lỗi "Bạn đã ứng tuyển vị trí này rồi!"

## 🎨 UI/UX Features

### Modal Design
- Responsive (desktop & mobile)
- Smooth animations (fadeIn, slideUp)
- Click outside để đóng
- ESC key để đóng (tùy chọn)
- Loading state khi submit

### Form Validation
- Real-time validation
- Clear error messages
- Disabled state khi đang submit
- File upload với preview tên file

### User Feedback
- Success message màu xanh
- Error message màu đỏ
- Auto-hide message sau 5s
- Loading text "Đang gửi..."

## 🔧 API Endpoints

### POST /applications/submit

**Request:**
```javascript
FormData {
  jobId: string,
  fullName: string,
  email: string,
  phone: string,
  coverLetter: string (optional),
  cv: File
}
```

**Response Success:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "job_id": 5,
    "candidate_id": 10,
    "cv_url": "/uploads/CV-1234567890-123456789.pdf",
    "status": "submitted",
    "submitted_at": "2025-10-28T10:30:00.000Z"
  },
  "message": "Nộp hồ sơ thành công! Chúng tôi sẽ liên hệ với bạn sớm."
}
```

**Response Error:**
```json
{
  "success": false,
  "message": "Bạn đã ứng tuyển vị trí này rồi!"
}
```

## 📝 Notes

- CV files được lưu trong `backend/CV_Storage/`
- CV được serve qua static path `/uploads/`
- Status mặc định khi tạo: `submitted`
- Candidate được tạo tự động nếu chưa có
- Không yêu cầu đăng nhập để ứng tuyển (có thể thay đổi nếu cần)

## 🐛 Troubleshooting

**Lỗi: "Cannot read property 'filename' of undefined"**
- Check: Multer middleware có được apply đúng không
- Check: Field name trong FormData phải là 'cv'

**Lỗi: "ENOENT: no such file or directory"**
- Check: Thư mục CV_Storage có tồn tại không
- Solution: Tạo thư mục manually hoặc restart server

**Lỗi: "Column 'cover_letter' is invalid"**
- Check: Đã chạy script update_application_table.sql chưa
- Solution: Chạy script SQL để thêm cột

## 📞 Support

Nếu có vấn đề, kiểm tra:
1. Console log (F12)
2. Network tab để xem request/response
3. Backend console để xem error
4. SQL Server để kiểm tra data
