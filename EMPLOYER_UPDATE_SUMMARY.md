# ✅ HOÀN THÀNH: Cập nhật Hệ thống theo bảng Employer

## 🎯 Yêu cầu

> Cấu trúc bảng Employer có các trường: `id`, `company_id`, `full_name`, `username`, `phone`, `role`, `password`, `created_at`, `updated_at`
> 
> Role chỉ nhận **2 giá trị**: `'TPNS'` (Trưởng phòng nhân sự) và `'HR'` (Nhân viên HR)

---

## ✨ Những gì đã thực hiện

### 1️⃣ Backend Updates

#### ✅ authController.js
**File**: `backend/controller/authController.js`

**Function `employeeLogin()` - Updated:**
```javascript
// Query từ bảng Employer (không còn Employee)
SELECT TOP 1 * FROM Employer WHERE username = @username

// Validate role
if (!['TPNS', 'HR'].includes(employer.role)) {
  return res.status(403).json({ message: "Tài khoản không có quyền truy cập" });
}

// JWT payload
{ id, username, role, company_id }  // Không có email
```

**Function `getCurrentUser()` - Updated:**
```javascript
// Nếu có role → Query từ Employer
SELECT [id], [company_id], [full_name], [username], [phone], [role], [created_at], [updated_at]
FROM Employer 
WHERE [id] = @id

// Nếu không có role → Query từ Candidate
SELECT [id], [full_name], [email], [phone], [cv_url], [created_at]
FROM Candidate 
WHERE [id] = @id
```

#### ✅ roleCheck.js (NEW)
**File**: `backend/middleware/roleCheck.js`

**4 middleware functions:**
1. `requireTPNS` - Chỉ TPNS
2. `requireHR` - Chỉ HR
3. `requireEmployer` - TPNS hoặc HR
4. `requireRole(...roles)` - Custom roles

**Usage:**
```javascript
router.post('/', verifyToken, requireEmployer, createJob);
router.delete('/:id', verifyToken, requireTPNS, deleteJob);
```

#### ✅ jobRoutes.js - Updated
**File**: `backend/routes/jobRoutes.js`

**Phân quyền endpoints:**
- Public: GET list, GET detail
- Employer (TPNS + HR): POST create, PUT update
- TPNS only: DELETE, POST close

---

### 2️⃣ Frontend Updates

#### ✅ AuthRoute.jsx - Updated
**File**: `src/components/ProtectedRoute/AuthRoute.jsx`

**Changes:**
```javascript
// Old
if (user.role === 'HR' || user.role === 'hr')

// New  
if (user.role === 'TPNS' || user.role === 'HR')
```

#### ✅ HRRoute.jsx - Updated
**File**: `src/components/ProtectedRoute/HRRoute.jsx`

**Changes:**
```javascript
// Old
const isHR = user?.role === 'HR' || user?.role === 'hr';

// New
const isEmployer = user?.role === 'TPNS' || user?.role === 'HR';
```

#### ✅ TPNSRoute.jsx (NEW)
**File**: `src/components/ProtectedRoute/TPNSRoute.jsx`

**Purpose**: Bảo vệ routes chỉ dành cho TPNS

**Logic:**
- Chưa login → Redirect `/employee-login`
- Role !== 'TPNS' → Redirect `/HR/jobs`
- Role === 'TPNS' → Cho phép

**Usage:**
```jsx
<Route path="/HR/settings" element={<TPNSRoute><Settings /></TPNSRoute>} />
```

#### ✅ PrivateRoute.jsx - Updated
**File**: `src/components/ProtectedRoute/PrivateRoute.jsx`

**Changes:**
```javascript
// Old
const isHR = user?.role === 'HR' || user?.role === 'hr';

// New
const isEmployer = user?.role === 'TPNS' || user?.role === 'HR';
```

#### ✅ Header.jsx - Updated
**File**: `src/components/Header.jsx`

**Changes:**
```jsx
// Old
{user.full_name || user.email}

// New
{user.full_name || user.username || user.email}
{user.role && (
  <span className="ml-2 text-xs px-2 py-1 rounded-full bg-red-100 text-red-600">
    {user.role === 'TPNS' ? 'Trưởng phòng NS' : user.role}
  </span>
)}
```

**Display:**
- Candidate: "Xin chào, Nguyễn Văn A"
- HR: "Xin chào, Trần Thị B [HR]"
- TPNS: "Xin chào, Lê Văn C [Trưởng phòng NS]"

---

### 3️⃣ Database & Scripts

#### ✅ create_employer_table.sql (NEW)
**File**: `backend/database/create_employer_table.sql`

**Features:**
- Tạo bảng Employer với CHECK constraint cho role
- Indexes cho username, role, company_id
- Comments cho bảng và columns
- Hướng dẫn insert data

#### ✅ generate_password.js - Updated
**File**: `backend/database/generate_password.js`

**Changes:**
```javascript
// Old passwords
['HR@123456', 'Admin@123', 'Test@123']

// New passwords
['TPNS@123', 'HR@123', 'Admin@123', 'Test@123']
```

**Usage:**
```bash
node backend/database/generate_password.js
# → Copy hash vào SQL INSERT statement
```

---

### 4️⃣ Documentation

#### ✅ ROLE_SYSTEM.md (NEW)
**File**: `ROLE_SYSTEM.md`

**Content:**
- Cấu trúc role (TPNS, HR, Candidate)
- Database schema
- Authentication flow
- Route protection
- Access control matrix
- Setup instructions
- Testing examples
- Code examples
- Security notes

---

## 📊 Access Control Matrix

### Frontend Routes

| Route | Guest | Candidate | HR | TPNS |
|-------|-------|-----------|-----|------|
| `/` | ✅ | ✅ | ✅ | ✅ |
| `/login` | ✅ | ❌ | ❌ | ❌ |
| `/employee-login` | ✅ | ❌ | ❌ | ❌ |
| `/HR/jobs` | ❌ | ❌ | ✅ | ✅ |
| `/HR/createjob` | ❌ | ❌ | ✅ | ✅ |
| `/HR/settings` | ❌ | ❌ | ❌ | ✅ |

### Backend API

| Endpoint | Method | Guest | Candidate | HR | TPNS |
|----------|--------|-------|-----------|-----|------|
| `/api/jobs` | GET | ✅ | ✅ | ✅ | ✅ |
| `/api/jobs` | POST | ❌ | ❌ | ✅ | ✅ |
| `/api/jobs/:id` | DELETE | ❌ | ❌ | ❌ | ✅ |

---

## 🔧 Setup Steps

### 1. Generate Password Hash
```bash
cd backend/database
node generate_password.js
```

**Output:**
```
Password: TPNS@123
Hash: $2a$10$abc...xyz
---
Password: HR@123
Hash: $2a$10$def...uvw
```

### 2. Run SQL Script
```sql
-- File: backend/database/create_employer_table.sql
-- Tạo bảng Employer với CHECK constraint
```

### 3. Insert Sample Data
```sql
-- TPNS
INSERT INTO Employer (company_id, full_name, username, phone, role, password)
VALUES (1, N'Nguyễn Văn A', 'tpns_admin', '0123456789', 'TPNS', '<hash>');

-- HR
INSERT INTO Employer (company_id, full_name, username, phone, role, password)
VALUES (1, N'Trần Thị B', 'hr_user1', '0111222333', 'HR', '<hash>');
```

### 4. Test Login

**TPNS Login:**
```bash
curl -X POST http://localhost:5000/api/auth/employee-login \
  -H "Content-Type: application/json" \
  -d '{"username":"tpns_admin","password":"TPNS@123"}'
```

**HR Login:**
```bash
curl -X POST http://localhost:5000/api/auth/employee-login \
  -H "Content-Type: application/json" \
  -d '{"username":"hr_user1","password":"HR@123"}'
```

---

## 📁 Files Changed Summary

### Backend (5 files)
1. ✅ `backend/controller/authController.js` - Updated login & getCurrentUser
2. ✅ `backend/middleware/roleCheck.js` - NEW - Role checking middleware
3. ✅ `backend/routes/jobRoutes.js` - Added role protection
4. ✅ `backend/database/create_employer_table.sql` - NEW - SQL script
5. ✅ `backend/database/generate_password.js` - Updated passwords

### Frontend (5 files)
1. ✅ `src/components/ProtectedRoute/AuthRoute.jsx` - Updated role check
2. ✅ `src/components/ProtectedRoute/HRRoute.jsx` - Updated to support TPNS
3. ✅ `src/components/ProtectedRoute/TPNSRoute.jsx` - NEW - TPNS only route
4. ✅ `src/components/ProtectedRoute/PrivateRoute.jsx` - Updated employer check
5. ✅ `src/components/Header.jsx` - Show role badge

### Documentation (1 file)
1. ✅ `ROLE_SYSTEM.md` - NEW - Complete role system documentation

---

## 🧪 Testing Checklist

### Backend Tests
- [ ] TPNS login với username thành công
- [ ] HR login với username thành công
- [ ] Login sai password → 401
- [ ] Login với role không hợp lệ → 403
- [ ] GET /api/auth/me trả về đúng user info
- [ ] HR không thể DELETE job → 403
- [ ] TPNS có thể DELETE job → 200

### Frontend Tests
- [ ] TPNS login → Redirect `/HR/jobs`
- [ ] HR login → Redirect `/HR/jobs`
- [ ] TPNS/HR đã login vào `/employee-login` → Redirect `/HR/jobs`
- [ ] Candidate vào `/HR/jobs` → Redirect `/`
- [ ] Header hiển thị role badge đúng
- [ ] TPNS vào `/HR/settings` → OK
- [ ] HR vào `/HR/settings` → Redirect `/HR/jobs`

---

## ⚠️ Breaking Changes

### Database
- **Table name**: `Employee` → **`Employer`**
- **Role values**: `'HR'/'hr'` → **`'TPNS'`/`'HR'`** (case-sensitive)
- **Removed field**: `is_active`
- **Optional field**: `email` (không bắt buộc)

### JWT Payload
```javascript
// Old (Employee)
{ id, username, email, role }

// New (Employer)
{ id, username, role, company_id }  // Không có email
```

### Role Checking
```javascript
// Old
user.role === 'HR' || user.role === 'hr'

// New
user.role === 'TPNS' || user.role === 'HR'
```

---

## 🎓 Key Concepts

### Role Hierarchy
```
TPNS (Trưởng phòng NS)
  ↓ Có tất cả quyền của HR + thêm
  └─ Xóa job, đóng job, settings
  
HR (Nhân viên HR)
  ↓ Quyền cơ bản
  └─ Tạo job, sửa job, xem job
  
Candidate (Ứng viên)
  ↓ Quyền hạn chế
  └─ Xem job, nộp CV
```

### Middleware Chain
```javascript
// Example: Delete job (TPNS only)
router.delete('/:id', 
  verifyToken,      // 1. Check JWT
  requireTPNS,      // 2. Check role === 'TPNS'
  deleteJobPost     // 3. Execute
);
```

### Route Protection
```jsx
// Frontend
<HRRoute>          // Cho phép TPNS + HR
  <TPNSRoute>      // Lọc thêm → Chỉ TPNS
    <Settings />
  </TPNSRoute>
</HRRoute>
```

---

## 📞 Next Steps

### Optional Enhancements
1. **Email field**: Thêm email cho Employer (optional)
2. **Multi-company**: Sử dụng `company_id` để phân quyền theo công ty
3. **Audit log**: Log tất cả actions của TPNS/HR
4. **Permission system**: Phân quyền chi tiết hơn (CRUD permissions)
5. **Role management UI**: Giao diện quản lý role cho TPNS

---

## ✅ Checklist

- [x] Backend authController updated
- [x] Backend roleCheck middleware created
- [x] Backend jobRoutes protected
- [x] Frontend AuthRoute updated
- [x] Frontend HRRoute updated
- [x] Frontend TPNSRoute created
- [x] Frontend PrivateRoute updated
- [x] Frontend Header shows role badge
- [x] SQL script created
- [x] Password generator updated
- [x] Documentation created
- [ ] **TODO: Run SQL script**
- [ ] **TODO: Insert test data**
- [ ] **TODO: Test all endpoints**
- [ ] **TODO: Test all routes**

---

🎉 **Hoàn thành!** Hệ thống đã được cập nhật theo bảng Employer với 2 role TPNS và HR.

Xem chi tiết trong file `ROLE_SYSTEM.md`.
