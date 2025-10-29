# Fix Duplicate Application Issues

## Vấn đề
1. **File CV vẫn được upload lên backend** ngay cả khi ứng viên đã nộp đơn vào công việc đó rồi
2. **Nút "Đang gửi..." bị kẹt** khi thông báo lỗi trùng, làm giảm trải nghiệm người dùng

## Nguyên nhân
- **Backend**: Kiểm tra duplicate AFTER file đã được upload bởi Multer middleware
- **Frontend**: Không reset trạng thái `submitting` khi có lỗi

## Giải pháp

### 1. Backend - Check duplicate TRONG Multer callback và xóa file nếu trùng

**Vấn đề với cách tiếp cận ban đầu:**
- Với `multipart/form-data`, `req.body` chỉ có sẵn SAU KHI Multer parse
- Không thể check duplicate TRƯỚC khi upload vì chưa có `jobId` và `candidateId`

**Giải pháp:**
- Upload file trước (để có `req.body`)
- Check duplicate ngay sau đó trong Multer callback
- Nếu duplicate: **XÓA file vừa upload** và trả về lỗi 409

#### Cập nhật route: `applicationRoutes.js`
```javascript
router.post('/apply', verifyToken, (req, res, next) => {
  // 1. Upload file trước
  uploadCV.single('file')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Lỗi khi upload file!',
      });
    }
    
    // 2. Sau khi upload, req.body đã có → check duplicate
    try {
      const { jobId, candidateId } = req.body;
      
      const isDuplicate = await checkDuplicateApplication(
        parseInt(jobId),
        parseInt(candidateId)
      );

      if (isDuplicate) {
        // 3. Nếu duplicate → XÓA file vừa upload
        if (req.file) {
          fs.unlinkSync(req.file.path);
          console.log('🗑️ Deleted uploaded file due to duplicate');
        }
        
        return res.status(409).json({
          success: false,
          message: 'Bạn đã ứng tuyển vị trí này rồi!',
        });
      }

      // 4. Không duplicate → tiếp tục submitApplication
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi kiểm tra hồ sơ!',
      });
    }
  });
}, submitApplication);
```
- **Xóa** logic check duplicate trong `createApplication()`
- Lý do: Đã được xử lý ở middleware rồi

#### d) Cập nhật controller: `applicationController.js`
- **Xóa** logic check duplicate trong `submitApplication()`
- **Xóa** phần xử lý lỗi duplicate trong catch block
- Controller chỉ xử lý logic tạo application

### 2. Frontend - Reset state khi có lỗi

#### Cập nhật: `src/components/JobDetail/JobDetail.jsx`
```javascript
const handleSubmitApplication = async (e) => {
  // ... existing code ...
  
  try {
    const res = await applicationAPI.submitApplication(form);
    
    if (res?.success) {
      setMessage({ type: 'success', text: res.message });
      setTimeout(() => handleCloseModal(), 2000);
    } else {
      setMessage({ type: 'error', text: res?.message });
      setSubmitting(false); // ⚠️ Reset submitting khi có lỗi
    }
  } catch (error) {
    setMessage({ type: 'error', text: error.message });
    setSubmitting(false); // ⚠️ Reset submitting khi có lỗi
  }
};
```

## Luồng xử lý mới

### Khi ứng viên nộp đơn:
1. **Frontend** gửi FormData lên backend
2. **Backend route handler**:
   - `verifyToken`: Xác thực người dùng
   - `uploadCV.single('file')`: Upload file CV lên server
     - File được lưu tạm vào `CV_Storage`
     - Multer parse FormData → `req.body` có sẵn
   - **Check duplicate** trong Multer callback:
     - Nếu **đã ứng tuyển**: 
       - **XÓA file vừa upload** bằng `fs.unlinkSync(req.file.path)`
       - Trả về lỗi 409
     - Nếu **chưa ứng tuyển**: next() → submitApplication
   - `submitApplication`: Tạo record trong database
3. **Frontend** nhận response:
   - **Success**: Hiển thị thông báo, đóng modal sau 2s
   - **Error**: Hiển thị lỗi, reset nút về trạng thái ban đầu

## Files đã thay đổi

### Backend (3 files)
1. ✅ `backend/routes/applicationRoutes.js` - UPDATED (tích hợp check duplicate)
2. ✅ `backend/repositories/applicationRepository.js` - UPDATED (xóa logic duplicate)
3. ✅ `backend/controller/applicationController.js` - UPDATED (xóa xử lý duplicate)

### Frontend (1 file)
1. ✅ `src/components/JobDetail/JobDetail.jsx` - UPDATED

## Kết quả

### ✅ File CV được xóa ngay khi phát hiện duplicate
- Upload file trước để có `req.body` (do FormData đặc thù)
- Check duplicate ngay sau upload
- **Xóa file tự động** nếu phát hiện trùng
- Thư mục `CV_Storage` sạch, không có file rác

### ✅ UX tốt hơn khi có lỗi
- Nút "Nộp hồ sơ" không bị kẹt ở trạng thái "Đang gửi..."
- Người dùng có thể đóng modal hoặc thử lại ngay lập tức

### ✅ Xử lý lỗi rõ ràng
- Duplicate: HTTP 409 + Message "Bạn đã ứng tuyển vị trí này rồi!"
- Upload error: HTTP 400 + Message lỗi từ Multer
- Server error: HTTP 500 + Message lỗi chung

## Technical Notes

### Tại sao không check TRƯỚC khi upload?
- **FormData đặc thù**: Với `multipart/form-data`, các field (`jobId`, `candidateId`) KHÔNG có trong `req.body` cho đến khi Multer parse
- Multer phải chạy trước để parse FormData → `req.body` mới có giá trị
- Do đó: Upload → Check → Delete if duplicate (thay vì Check → Upload)

### Cách xóa file đã upload
```javascript
if (req.file) {
  const fs = await import('fs');
  fs.unlinkSync(req.file.path); // Xóa đồng bộ
}
```

### Alternative approaches (không áp dụng)
1. ❌ Parse FormData thủ công trước Multer → phức tạp, không tận dụng được Multer
2. ❌ Lưu file vào temp folder trước → cần cleanup logic phức tạp
3. ✅ **Upload → Check → Delete**: Đơn giản, rõ ràng, dễ maintain

## Testing

### Test case 1: Nộp đơn lần đầu
- ✅ File CV được upload vào `CV_Storage`
- ✅ Record được tạo trong database
- ✅ Hiển thị "Nộp hồ sơ thành công!"
- ✅ File CV tồn tại trong thư mục

### Test case 2: Nộp đơn trùng (QUAN TRỌNG)
- ✅ File CV được upload TẠM vào `CV_Storage`
- ✅ Phát hiện duplicate → **File bị XÓA ngay lập tức**
- ✅ Hiển thị "Bạn đã ứng tuyển vị trí này rồi!"
- ✅ Nút "Nộp hồ sơ" hoạt động bình thường (không bị kẹt)
- ✅ Không có file rác trong `CV_Storage`

### Test case 3: Lỗi upload file
- ✅ Hiển thị lỗi từ Multer (file quá lớn, sai định dạng, etc.)
- ✅ Nút "Nộp hồ sơ" reset về trạng thái ban đầu
- ✅ Không có file nào được lưu

## Notes
- ~~Middleware `checkDuplicate` độc lập~~ → KHÔNG dùng nữa
- Check duplicate tích hợp trong route handler, TRONG Multer callback
- Thứ tự: Upload → Parse → Check → Delete if duplicate → Create record
- Frontend PHẢI reset `submitting` state trong cả `catch` lẫn `else` của response
- **File được xóa bằng `fs.unlinkSync()`** nếu phát hiện duplicate sau khi upload
