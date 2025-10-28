# Hướng dẫn cấu hình gửi Email

## 🚀 Tính năng gửi email đã được tích hợp!

Hệ thống hỗ trợ 2 loại email:
1. **Email thông thường** - Gửi email tùy chỉnh cho ứng viên
2. **Email mời phỏng vấn** - Gửi thư mời phỏng vấn tự động

---

## ⚙️ Cấu hình Email (Tùy chọn)

### Chế độ Test (Mặc định)
Nếu không cấu hình, hệ thống sẽ dùng **Ethereal Email** (test mode):
- Email **không được gửi thật**
- Bạn nhận được link để xem email test
- Phù hợp cho development/testing

### Gửi Email Thật (Production)

#### 1. Cấu hình Gmail

**Bước 1:** Tạo App Password
1. Truy cập: https://myaccount.google.com/security
2. Bật **2-Step Verification**
3. Vào **App passwords**
4. Tạo mật khẩu ứng dụng cho "Mail"

**Bước 2:** Thêm vào file `.env`
```env
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password-here  # App password (16 ký tự, không dấu cách)
```

#### 2. Cấu hình Outlook/Hotmail
```env
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
```

Sau đó sửa `emailController.js`:
```javascript
return nodemailer.createTransport({
  service: 'outlook', // Thay 'gmail' thành 'outlook'
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});
```

#### 3. Cấu hình SMTP Server khác
```env
EMAIL_HOST=smtp.your-server.com
EMAIL_PORT=587
EMAIL_USER=your-email@domain.com
EMAIL_PASSWORD=your-password
EMAIL_SECURE=false  # true nếu dùng SSL/TLS
```

Sửa `emailController.js`:
```javascript
return nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});
```

---

## 📧 Cách sử dụng

### Từ giao diện:

1. **Vào trang thông tin ứng viên** (`/HR/candidates/:id`)
2. Click nút **"Gửi email"** ở sidebar phải
3. Modal hiện ra:
   - Tiêu đề email
   - Nội dung email
4. Click **"Gửi email"**

### Kết quả:
- ✅ Thành công: "Gửi email thành công!"
- 🧪 Test mode: Hiện link xem email test
- ❌ Lỗi: Hiển thị thông báo lỗi

---

## 🎨 Template Email

Email được gửi với template HTML đẹp mắt bao gồm:
- 🎨 Gradient header (Purple/Blue)
- 📝 Nội dung có format
- 👤 Tên người gửi
- 🏢 Thông tin công ty
- 📧 Footer chuyên nghiệp

---

## 🔒 Bảo mật

- ✅ Chỉ Employer (HR/TPNS) mới gửi được email
- ✅ Validate email address
- ✅ Sanitize input để tránh injection
- ✅ App password thay vì password thật
- ✅ HTTPS/TLS encryption

---

## 🐛 Troubleshooting

### Lỗi: "Error: Invalid login"
- Kiểm tra `EMAIL_USER` và `EMAIL_PASSWORD`
- Gmail: Đảm bảo dùng App Password (không phải password thường)
- Outlook: Bật "Less secure app access"

### Lỗi: "ETIMEDOUT" hoặc "ECONNREFUSED"
- Kiểm tra firewall/antivirus
- Kiểm tra `EMAIL_HOST` và `EMAIL_PORT`
- Thử đổi port (587, 465, hoặc 25)

### Email vào Spam
- Thêm SPF/DKIM records vào DNS
- Dùng email domain chính thức
- Tránh từ ngữ spam trong nội dung

### Test mode không hoạt động
- Kiểm tra kết nối internet
- Ethereal có thể bị chặn bởi firewall

---

## 📦 Dependencies

```json
{
  "nodemailer": "^6.9.8",
  "dayjs": "^1.11.10"
}
```

Cài đặt:
```bash
npm install nodemailer dayjs
```

---

## 🔥 API Endpoints

### 1. Gửi email thông thường
```http
POST /emails/send
Authorization: Bearer <token>

{
  "to": "candidate@email.com",
  "subject": "Thông báo kết quả",
  "message": "Nội dung email...",
  "candidateName": "Nguyễn Văn A"
}
```

### 2. Gửi email mời phỏng vấn
```http
POST /emails/send-interview-invitation
Authorization: Bearer <token>

{
  "to": "candidate@email.com",
  "candidateName": "Nguyễn Văn A",
  "jobTitle": "Backend Developer",
  "interviewTime": "2025-11-01T14:00:00",
  "interviewMethod": "online",
  "interviewLocation": "https://meet.google.com/xyz",
  "notes": "Chuẩn bị laptop"
}
```

---

## 💡 Tips

1. **Development:** Dùng test mode (không cần config)
2. **Production:** Config Gmail với App Password
3. **Email nhiều:** Cân nhắc dùng SendGrid/AWS SES
4. **Template:** Customize template trong `emailController.js`

---

## ✨ Tính năng tiếp theo (TODO)

- [ ] Email template builder
- [ ] Scheduled emails
- [ ] Email tracking (đã đọc/chưa đọc)
- [ ] Email attachments
- [ ] Bulk email sending
- [ ] Email history log

---

**Tác giả:** PDD Recruitment System  
**Phiên bản:** 1.0.0  
**Ngày cập nhật:** 27/10/2025
