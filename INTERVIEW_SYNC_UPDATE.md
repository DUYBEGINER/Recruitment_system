# Cập nhật đồng bộ hệ thống Interview với Database

## Ngày cập nhật: 29/10/2025

### Tổng quan
Đồng bộ hóa code với cấu trúc database `InterviewSchedule` để đảm bảo tính nhất quán.

## Cấu trúc Database

### Bảng: InterviewSchedule
```sql
CREATE TABLE InterviewSchedule (
    id INT PRIMARY KEY,
    application_id INT,
    interviewer_id INT,
    schedule_time DATETIME,
    method NVARCHAR(50),  -- 'online' hoặc 'offline'
    location NVARCHAR(255),
    notes NVARCHAR(MAX),
    status NVARCHAR(50),  -- 'pending', 'confirmed', 'completed', 'canceled'
    created_at DATETIME,
    updated_at DATETIME
);
```

### Ràng buộc (Constraints):
- **method**: Chỉ cho phép `'online'` hoặc `'offline'`
- **status**: Chỉ cho phép `'pending'`, `'confirmed'`, `'completed'`, `'canceled'`

## Các thay đổi đã thực hiện

### 1. Frontend Components

#### ✅ CreateInterview.jsx
**Thay đổi:**
- ❌ Xóa option `phone` khỏi phương thức phỏng vấn
- ✅ Chỉ giữ lại `online` và `offline`
- ✅ Cập nhật placeholder và label cho phù hợp

**Before:**
```jsx
<Select.Option value="phone">Điện thoại</Select.Option>
```

**After:**
```jsx
// Chỉ còn online và offline
```

#### ✅ Interviews.jsx (Danh sách)
**Thay đổi:**

1. **StatusBadge Component:**
```jsx
// OLD
scheduled: "Đã lên lịch"
cancelled: "Đã hủy"
rescheduled: "Đã dời lịch"

// NEW
pending: "Chờ xác nhận"
confirmed: "Đã xác nhận"
completed: "Đã hoàn thành"
canceled: "Đã hủy"
```

2. **MethodBadge Component:**
```jsx
// OLD
phone: "Điện thoại"

// NEW
// Xóa option phone
```

3. **Stats Cards:**
```jsx
// OLD
scheduled_count
cancelled_count

// NEW
pending_count
confirmed_count
canceled_count
```

4. **Filter Options:**
- Cập nhật options trong Select cho trạng thái
- Xóa option `phone` khỏi filter phương thức

#### ✅ InterviewDetail.jsx
**Thay đổi:**
1. StatusBadge: Cập nhật mapping trạng thái
2. Method display: Xóa hiển thị cho `phone`
3. Edit form: Cập nhật options cho method và status

#### ✅ CreateInterviewModal.jsx
**Thay đổi:**
- Xóa Select.Option cho `phone`
- Chỉ giữ lại `online` và `offline`

### 2. Backend

#### ✅ interviewController.js
**Thay đổi:**
```javascript
// OLD
status: 'scheduled'

// NEW
status: 'pending' // Trạng thái mặc định khi tạo mới
```

#### ✅ interviewRepository.js
**Thay đổi:**

1. **createInterview:**
```javascript
// OLD
.input('status', sql.NVarChar, interviewData.status || 'scheduled')

// NEW
.input('status', sql.NVarChar, interviewData.status || 'pending')
```

2. **getInterviewStats:**
```javascript
// OLD
SUM(CASE WHEN status = 'scheduled' THEN 1 ELSE 0 END) as scheduled_count,
SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_count,
SUM(CASE WHEN status = 'rescheduled' THEN 1 ELSE 0 END) as rescheduled_count

// NEW
SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count,
SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed_count,
SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_count,
SUM(CASE WHEN status = 'canceled' THEN 1 ELSE 0 END) as canceled_count
```

## Tóm tắt thay đổi

### Method (Phương thức)
| Trước đây | Bây giờ | Ghi chú |
|-----------|---------|---------|
| online | ✅ online | Giữ nguyên |
| offline | ✅ offline | Giữ nguyên |
| phone | ❌ (đã xóa) | Không được database hỗ trợ |

### Status (Trạng thái)
| Trước đây | Bây giờ | Ghi chú |
|-----------|---------|---------|
| scheduled | ❌ | Đổi thành pending |
| - | ✅ pending | Chờ xác nhận (mặc định) |
| - | ✅ confirmed | Đã xác nhận |
| completed | ✅ completed | Giữ nguyên |
| cancelled | ❌ | Đổi thành canceled (bỏ "l") |
| rescheduled | ❌ | Không còn sử dụng |
| - | ✅ canceled | Đã hủy (database dùng "canceled") |

## Files đã sửa

### Frontend (6 files)
1. ✅ `src/page/admin/CreateInterview.jsx`
2. ✅ `src/page/admin/Interviews.jsx`
3. ✅ `src/page/admin/InterviewDetail.jsx`
4. ✅ `src/page/admin/CandidateDetail.jsx` (fix import MapPin)
5. ✅ `src/components/admin/CreateInterviewModal.jsx`

### Backend (2 files)
6. ✅ `backend/controller/interviewController.js`
7. ✅ `backend/repositories/interviewRepository.js`

## Kiểm tra sau khi cập nhật

### ✅ Checklist
- [ ] Test tạo lịch phỏng vấn mới (method: online/offline)
- [ ] Test filter theo status mới (pending, confirmed, completed, canceled)
- [ ] Test filter theo method (chỉ còn online/offline)
- [ ] Test cập nhật trạng thái lịch phỏng vấn
- [ ] Kiểm tra stats hiển thị đúng
- [ ] Kiểm tra badge hiển thị đúng màu sắc

### Testing Commands
```bash
# Start frontend
npm run dev

# Start backend
cd backend
node server.js
```

### Test URLs
- Danh sách: `http://localhost:5173/HR/interviews`
- Tạo mới: `http://localhost:5173/HR/interviews/create`
- Chi tiết: `http://localhost:5173/HR/interviews/{id}`

## Breaking Changes
⚠️ **Lưu ý:** Nếu database có dữ liệu cũ với:
- `status = 'scheduled'` → cần migrate sang `'pending'`
- `status = 'cancelled'` → cần migrate sang `'canceled'`
- `status = 'rescheduled'` → cần xử lý (có thể đổi sang `'pending'`)
- `method = 'phone'` → cần xử lý (có thể đổi sang `'offline'` hoặc xóa)

### Migration Script (nếu cần)
```sql
-- Migrate status
UPDATE InterviewSchedule 
SET status = 'pending' 
WHERE status = 'scheduled';

UPDATE InterviewSchedule 
SET status = 'canceled' 
WHERE status = 'cancelled';

UPDATE InterviewSchedule 
SET status = 'pending' 
WHERE status = 'rescheduled';

-- Migrate method
UPDATE InterviewSchedule 
SET method = 'offline' 
WHERE method = 'phone';
```

## Kết luận
Tất cả các thay đổi đã được đồng bộ hóa với cấu trúc database. Hệ thống giờ đây chỉ sử dụng:
- **Method**: `online`, `offline`
- **Status**: `pending`, `confirmed`, `completed`, `canceled`

---
**Người thực hiện:** GitHub Copilot  
**Ngày:** 29/10/2025  
**Version:** 1.0
