# Hướng dẫn tự động gửi email khi tạo lịch phỏng vấn

## Tổng quan
Hệ thống đã được cập nhật để **tự động gửi email thông báo lịch phỏng vấn** cho ứng viên ngay khi HR/TPNS tạo lịch phỏng vấn.

## Tính năng đã triển khai

### 1. Backend - Auto Send Email
**File:** `backend/controller/interviewController.js`

#### Thay đổi:
- ✅ Import `nodemailer` để gửi email
- ✅ Thêm function `createTransporter()` - tạo email transporter
- ✅ Thêm function `sendInterviewEmail()` - gửi email mời phỏng vấn
- ✅ Cập nhật `createInterview()` - tự động gửi email sau khi tạo lịch

#### Luồng hoạt động:
```
1. HR/TPNS tạo lịch phỏng vấn
   ↓
2. Lưu lịch vào database
   ↓
3. Tự động gửi email cho ứng viên
   ↓
4. Trả response về frontend (kèm status email)
```

#### Response format:
```json
{
  "success": true,
  "message": "Tạo lịch phỏng vấn và gửi email thành công",
  "data": { /* interview data */ },
  "emailSent": true,
  "emailPreview": "https://ethereal.email/message/..." // Nếu dùng test email
}
```

### 2. Frontend - Hiển thị thông báo

#### CreateInterviewModal.jsx
- ✅ Hiển thị message khác nhau dựa vào `emailSent`
- ✅ Success: "Tạo lịch phỏng vấn và gửi email thông báo thành công!"
- ✅ Warning: "Tạo lịch phỏng vấn thành công nhưng không thể gửi email thông báo"

#### CreateInterview.jsx
- ✅ Tương tự CreateInterviewModal
- ✅ Hiển thị email preview URL nếu dùng test email

### 3. Email Template

Email được gửi với định dạng HTML đẹp mắt, bao gồm:

#### Thông tin hiển thị:
- 🎉 Tiêu đề: "Thư mời phỏng vấn"
- 📋 Tên vị trí ứng tuyển
- 📅 Thời gian phỏng vấn (format: Thứ Hai, 30 tháng 10, 2025 lúc 14:00)
- 🎥 Hình thức: Trực tuyến / Tại văn phòng
- 📍 Địa điểm hoặc Link meeting
- 📝 Ghi chú (nếu có)

#### Thiết kế email:
- Header gradient màu tím-xanh đẹp mắt
- Layout responsive
- Highlight vị trí ứng tuyển
- Footer chuyên nghiệp

## Cấu hình Email

### Option 1: Sử dụng Gmail (Production)

#### Bước 1: Tạo App Password cho Gmail
1. Truy cập: https://myaccount.google.com/security
2. Bật xác thực 2 bước (2-Step Verification)
3. Vào "App passwords" và tạo password mới
4. Chọn "Mail" và "Other device"
5. Copy mật khẩu 16 ký tự được tạo

#### Bước 2: Cập nhật file `.env` trong thư mục `backend/`
```env
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password-16-characters
```

**Ví dụ:**
```env
EMAIL_USER=recruitment@company.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
```

### Option 2: Test Email (Development)

Nếu **KHÔNG** cấu hình `EMAIL_USER` và `EMAIL_PASSWORD`, hệ thống sẽ tự động sử dụng **Ethereal Email** (test email service).

#### Ưu điểm:
- ✅ Không cần cấu hình gì
- ✅ Không gửi email thật
- ✅ Xem preview email qua URL

#### Cách kiểm tra email test:
1. Tạo lịch phỏng vấn
2. Mở Console trong trình duyệt (F12)
3. Tìm dòng: `Email preview: https://ethereal.email/message/...`
4. Click vào link để xem email

### Option 3: SMTP khác (Outlook, Yahoo, etc.)

#### Outlook:
```env
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
```

Cập nhật `createTransporter()` trong `interviewController.js`:
```javascript
return nodemailer.createTransporter({
  host: 'smtp-mail.outlook.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});
```

## Kiểm tra hoạt động

### Test Case 1: Tạo lịch từ ApplicationDetail
1. Vào `/HR/applications/{id}`
2. Click "Tạo lịch phỏng vấn"
3. Điền form và submit
4. ✅ Kiểm tra: Message hiển thị "...và gửi email thành công"
5. ✅ Kiểm tra: Email đến hộp thư ứng viên

### Test Case 2: Tạo lịch từ trang tạo mới
1. Vào `/HR/interviews/create?application_id={id}`
2. Điền form và submit
3. ✅ Kiểm tra: Message hiển thị email status
4. ✅ Kiểm tra: Email đến hộp thư

### Test Case 3: Không có cấu hình email
1. Không set `EMAIL_USER` và `EMAIL_PASSWORD`
2. Tạo lịch phỏng vấn
3. ✅ Kiểm tra: Console hiển thị email preview URL
4. ✅ Kiểm tra: Message vẫn báo thành công

## Nội dung Email mẫu

```
🎉 Thư mời phỏng vấn
PDD Tuyển Dụng

Kính gửi Nguyễn Văn A,

Chúng tôi rất vui mừng thông báo rằng hồ sơ của bạn đã được chọn vào vòng phỏng vấn cho vị trí:

📋 Senior Frontend Developer

📅 Thông tin buổi phỏng vấn
━━━━━━━━━━━━━━━━━━━━━━━━━
Thời gian: Thứ Hai, 30 tháng 10, 2025 lúc 14:00
Hình thức: Trực tuyến (Video call)
Link meeting: https://meet.google.com/abc-defg-hij
Ghi chú: Vui lòng chuẩn bị laptop và test microphone trước 10 phút

Vui lòng xác nhận tham dự qua email hoặc điện thoại trong vòng 24 giờ.
Nếu bạn có bất kỳ thắc mắc nào, đừng ngần ngại liên hệ với chúng tôi.

Chúc bạn may mắn!
Trần Thị B - HR Manager

━━━━━━━━━━━━━━━━━━━━━━━━━
Email này được gửi từ hệ thống PDD Tuyển Dụng
```

## Troubleshooting

### Lỗi: "Error sending interview email"
**Nguyên nhân:** Email config sai hoặc Gmail chặn

**Giải pháp:**
1. Kiểm tra `EMAIL_USER` và `EMAIL_PASSWORD` trong `.env`
2. Đảm bảo dùng App Password (không phải password thường)
3. Kiểm tra Gmail có bật "Less secure app access" (nếu không dùng App Password)
4. Restart backend server sau khi sửa `.env`

### Email gửi nhưng vào Spam
**Nguyên nhân:** Gmail/Outlook đánh dấu email từ domain lạ là spam

**Giải pháp:**
1. Thêm địa chỉ gửi vào Contacts
2. Đánh dấu "Not Spam" cho email đầu tiên
3. Cân nhắc dùng SendGrid/AWS SES cho production

### Không nhận được email test
**Nguyên nhân:** Đang dùng Ethereal (test email)

**Giải pháp:**
1. Mở Console browser (F12)
2. Tìm `Email preview: https://ethereal.email/...`
3. Click link để xem email
4. Hoặc cấu hình email thật trong `.env`

## Best Practices

### 1. Production Setup
```env
# Dùng email domain công ty
EMAIL_USER=noreply@company.com
EMAIL_PASSWORD=app-password-here
```

### 2. Development Setup
```env
# Không cấu hình gì → dùng test email
# Hoặc dùng email test riêng
EMAIL_USER=test@company.com
EMAIL_PASSWORD=test-password
```

### 3. Email Template Customization
Nếu muốn tùy chỉnh email template, chỉnh sửa `htmlContent` trong function `sendInterviewEmail()` tại file:
```
backend/controller/interviewController.js
```

### 4. Error Handling
Hệ thống đã handle lỗi email:
- ✅ Lịch vẫn được tạo nếu email fail
- ✅ User được thông báo rõ ràng về status
- ✅ Log error để debug

## Changelog

### Version 1.0 - 29/10/2025
- ✅ Tự động gửi email khi tạo lịch phỏng vấn
- ✅ Email template đẹp với HTML
- ✅ Hỗ trợ cả online và offline
- ✅ Test email với Ethereal
- ✅ Production ready với Gmail/SMTP

## Tài liệu tham khảo
- Nodemailer: https://nodemailer.com/
- Gmail App Password: https://support.google.com/accounts/answer/185833
- Ethereal Email: https://ethereal.email/

---
**Người thực hiện:** GitHub Copilot  
**Ngày:** 29/10/2025
