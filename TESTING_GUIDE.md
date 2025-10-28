# Test Authentication Flow

## 🧪 Test Cases cho Route Protection

### Setup Database
```sql
-- 1. Chạy script tạo bảng Candidate
-- File: backend/database/create_candidate_table.sql (nếu chưa có)

-- 2. Chạy script tạo bảng Employee
-- File: backend/database/create_employee_table.sql
```

### Generate Password Hash
```bash
# Tạo password hash cho employee
node backend/database/generate_password.js
```

---

## 📝 Test Scenarios

### Test 1: Candidate Registration & Login Flow

#### 1.1 Đăng ký Candidate
1. Mở browser, vào `http://localhost:5173/register`
2. Điền form:
   - Họ tên: `Nguyễn Văn Test`
   - Email: `test@candidate.com`
   - SĐT: `0123456789`
   - Password: `Test@123`
3. Click "Đăng ký"
4. ✅ **Expected**: Redirect về `/login` với message success

#### 1.2 Login Candidate
1. Vào `http://localhost:5173/login`
2. Nhập:
   - Email: `test@candidate.com`
   - Password: `Test@123`
3. Click "Đăng nhập"
4. ✅ **Expected**: 
   - Redirect về `/`
   - Header hiện tên "Nguyễn Văn Test"
   - Cookie `token` được set

#### 1.3 Route Protection - Candidate đã login
1. Thử vào `/login` → ✅ Redirect về `/`
2. Thử vào `/register` → ✅ Redirect về `/`
3. Thử vào `/HR/jobs` → ✅ Redirect về `/`
4. Thử vào `/recruitment` → ✅ Cho phép truy cập

---

### Test 2: Employee/HR Login Flow

#### 2.1 Insert Employee vào DB
```sql
-- Sử dụng hash từ generate_password.js
INSERT INTO Employee (username, full_name, email, password, role)
VALUES 
('hr_test', N'HR Test User', 'hr@test.com', '$2a$10$...hash...', 'HR');
```

#### 2.2 Login Employee
1. Vào `http://localhost:5173/employee-login`
2. Nhập:
   - Username: `hr_test`
   - Password: `HR@123456`
3. Click "Đăng nhập"
4. ✅ **Expected**: 
   - Redirect về `/HR/jobs`
   - Header hiện tên "HR Test User"
   - Cookie `token` với payload chứa `role: 'HR'`

#### 2.3 Route Protection - HR đã login
1. Thử vào `/employee-login` → ✅ Redirect về `/HR/jobs`
2. Thử vào `/login` → ✅ Redirect về `/HR/jobs`
3. Thử vào `/HR/createjob` → ✅ Cho phép truy cập
4. Thử vào `/` → ✅ Cho phép truy cập (public)

---

### Test 3: Unauthenticated User

#### 3.1 Clear cookies và test
1. Mở DevTools → Application → Cookies → Xóa `token`
2. Thử vào `/HR/jobs` → ✅ Redirect về `/employee-login`
3. Thử vào `/login` → ✅ Cho phép truy cập
4. Thử vào `/` → ✅ Cho phép truy cập

---

### Test 4: Session Persistence

#### 4.1 Refresh page
1. Login với Candidate
2. Refresh page (F5)
3. ✅ **Expected**: Vẫn đăng nhập, header hiện tên user

#### 4.2 Close & reopen browser (trong 7 ngày)
1. Login với HR
2. Đóng browser
3. Mở lại, vào `/HR/jobs`
4. ✅ **Expected**: Vẫn đăng nhập (cookie expires 7 ngày)

---

### Test 5: Logout

#### 5.1 Candidate logout
1. Login với Candidate
2. Click nút Logout trên Header
3. ✅ **Expected**: 
   - Cookie `token` bị xóa
   - Redirect về `/`
   - Header hiện nút "Đăng nhập"

#### 5.2 HR logout
1. Login với HR
2. Logout
3. Thử vào `/HR/jobs` → ✅ Redirect về `/employee-login`

---

## 🔍 Debug Checklist

### Backend Debug
```bash
# Kiểm tra console khi login
# Phải thấy:
# - "Login request body: { email, password }"
# - "JWT payload: { id, email }" (candidate)
# - "JWT payload: { id, username, email, role }" (employee)
```

### Frontend Debug
```javascript
// Console log trong AuthProvider
console.log("User session valid:", response.data);

// Console log trong route components
console.log("AuthRoute - Already authenticated, redirecting");
console.log("PrivateRoute - Allowing access for authenticated candidate");
console.log("HRRoute - HR access granted");
```

### Cookie Debug
1. Mở DevTools → Application → Cookies
2. Check cookie `token`:
   - ✅ HttpOnly: true
   - ✅ SameSite: Lax
   - ✅ Expires: 7 days from now
   - ✅ Value: JWT token string

---

## 🐛 Common Issues

### Issue 1: Redirect loop
**Symptom**: Page keeps redirecting infinitely  
**Cause**: `loading` state không được handle  
**Fix**: Check `if (loading) return <LoadingScreen />`

### Issue 2: Role không được nhận
**Symptom**: HR bị redirect về home  
**Cause**: JWT payload không chứa role  
**Fix**: Check `employeeLogin` controller - phải include `role` trong JWT

### Issue 3: Cookie không được set
**Symptom**: Sau login vẫn không authenticate  
**Cause**: 
- CORS settings
- Cookie domain mismatch
**Fix**: 
- Backend: `credentials: true` in CORS
- Frontend: `withCredentials: true` in axios

### Issue 4: Session không persist sau refresh
**Symptom**: F5 là mất đăng nhập  
**Cause**: AuthProvider không call `checkUserSession()` on mount  
**Fix**: Check `useEffect(() => { checkUserSession() }, [])` in AuthProvider

---

## ✅ Success Criteria

Tất cả các test case phải pass:
- [ ] Candidate có thể đăng ký và đăng nhập
- [ ] HR có thể đăng nhập bằng username
- [ ] Người đã login không vào được `/login`, `/register`
- [ ] Candidate không vào được `/HR/*` routes
- [ ] Người chưa login không vào được `/HR/*` routes
- [ ] Session persist sau khi refresh page
- [ ] Logout xóa cookie và redirect đúng
- [ ] Loading screen hiện khi đang check session
