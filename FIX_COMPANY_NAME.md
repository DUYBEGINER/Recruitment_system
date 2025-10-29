# Fix Company Name Display

## Vấn đề
Trong danh sách tin tuyển dụng, trường `job.companyName` hiển thị **tên HR** (Nguyễn Văn B) thay vì **tên công ty** từ bảng `Company`.

## Nguyên nhân
SQL queries đang JOIN với bảng `Employer` và lấy `Employer.full_name as companyName` thay vì JOIN với bảng `Company` để lấy `Company.name`.

### Cấu trúc database:
```
JobPosting
├── employer_id → Employer.id
                  └── company_id → Company.id
                                   └── name (Tên công ty đúng)
```

## Giải pháp
Thêm JOIN với bảng `Company` thông qua `Employer.company_id` trong tất cả các queries liên quan.

### SQL cũ (SAI):
```sql
SELECT jp.*, e.full_name as companyName
FROM JobPosting jp
LEFT JOIN Employer e ON jp.employer_id = e.id
```

### SQL mới (ĐÚNG):
```sql
SELECT jp.*, c.name as companyName
FROM JobPosting jp
LEFT JOIN Employer e ON jp.employer_id = e.id
LEFT JOIN Company c ON e.company_id = c.id
```

## Files đã sửa

### 1. `backend/repositories/jobRepository.js`
Cập nhật 4 functions:

#### ✅ `getAllJobs()` - Danh sách job có phân trang
```javascript
SELECT 
  jp.*,
  c.name as companyName
FROM JobPosting jp
LEFT JOIN Employer e ON jp.employer_id = e.id
LEFT JOIN Company c ON e.company_id = c.id
```

#### ✅ `getAllJobsFiltered()` - Danh sách job có filter (admin)
```javascript
SELECT 
  jp.*,
  e.full_name as employer_name,
  e.role as employer_role,
  c.name as companyName
FROM JobPosting jp
LEFT JOIN Employer e ON jp.employer_id = e.id
LEFT JOIN Company c ON e.company_id = c.id
```

#### ✅ `getJobById()` - Chi tiết 1 job
```javascript
SELECT 
  jp.id,
  jp.title,
  ...
  c.name AS companyName,
  ...
FROM JobPosting jp
LEFT JOIN Employer e ON jp.employer_id = e.id
LEFT JOIN Company c ON e.company_id = c.id
WHERE jp.id = @id
```

#### ✅ `getJobByEmployerId()` - Chi tiết job theo employer
```javascript
SELECT 
  jp.*,
  e.full_name as employer_name,
  e.role as employer_role,
  e.phone as employer_phone,
  c.name as companyName
FROM JobPosting jp
LEFT JOIN Employer e ON jp.employer_id = e.id
LEFT JOIN Company c ON e.company_id = c.id
WHERE jp.id = @id
```

### 2. `backend/repositories/applicationRepository.js`

#### ✅ `getApplicationsByCandidateId()` - Danh sách đơn ứng tuyển của candidate
```javascript
SELECT 
  a.*,
  j.title as job_title,
  ...
  c.name as company_name
FROM Application a
LEFT JOIN JobPosting j ON a.job_id = j.id
LEFT JOIN Employer e ON j.employer_id = e.id
LEFT JOIN Company c ON e.company_id = c.id
WHERE a.candidate_id = @candidate_id
```

## Kết quả

### ✅ Hiển thị đúng tên công ty
- **Trước**: "Nguyễn Văn B" (tên HR)
- **Sau**: "Công ty ABC" (tên công ty từ bảng Company)

### ✅ Các nơi được fix:
1. Danh sách tin tuyển dụng công khai (`/jobs`)
2. Chi tiết tin tuyển dụng (`/jobs/:id`)
3. Danh sách tin tuyển dụng admin
4. Danh sách đơn ứng tuyển của candidate

## Testing

### Test case 1: Danh sách job công khai
- Truy cập `/jobs`
- Kiểm tra mỗi job card hiển thị tên công ty từ bảng Company
- ✅ Hiển thị "Công ty TNHH ABC" thay vì "Nguyễn Văn A"

### Test case 2: Chi tiết job
- Truy cập `/jobs/:id`
- Kiểm tra `job.companyName`
- ✅ Hiển thị tên công ty đúng

### Test case 3: Hồ sơ ứng tuyển của candidate
- Đăng nhập với tài khoản candidate
- Xem danh sách đơn đã nộp
- ✅ Hiển thị tên công ty đúng cho mỗi đơn

## Notes
- **LEFT JOIN** được sử dụng để tránh mất data nếu:
  - Employer chưa được gán company_id
  - Company bị xóa khỏi database
- Nếu `company_id` là NULL, `companyName` sẽ là NULL
- Frontend nên có fallback: `job.companyName || 'Chưa cập nhật'`

## Data Validation
Đảm bảo:
1. Tất cả Employer đã có `company_id` hợp lệ
2. Bảng Company có đầy đủ dữ liệu
3. Chạy query kiểm tra:
```sql
-- Kiểm tra employer chưa có company
SELECT id, full_name, company_id 
FROM Employer 
WHERE company_id IS NULL;

-- Kiểm tra company
SELECT * FROM Company;
```
