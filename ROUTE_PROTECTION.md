# Hệ thống Route Bảo vệ (Protected Routes)

## 📋 Tổng quan

Hệ thống bao gồm 3 loại route bảo vệ:

### 1. **AuthRoute** - Ngăn người đã đăng nhập vào login/register
- **File**: `src/components/ProtectedRoute/AuthRoute.jsx`
- **Mục đích**: Bảo vệ trang login, register, employee-login
- **Logic**:
  - ✅ Chưa đăng nhập → Cho phép truy cập
  - ❌ Đã đăng nhập (Candidate) → Redirect về `/`
  - ❌ Đã đăng nhập (HR) → Redirect về `/HR/jobs`

### 2. **PrivateRoute** - Chỉ cho Candidate đã đăng nhập
- **File**: `src/components/ProtectedRoute/PrivateRoute.jsx`
- **Mục đích**: Bảo vệ trang dành riêng cho Candidate
- **Logic**:
  - ❌ Chưa đăng nhập → Redirect về `/login`
  - ❌ Là HR → Redirect về `/HR/jobs`
  - ✅ Là Candidate đã đăng nhập → Cho phép truy cập

### 3. **HRRoute** - Chỉ cho HR đã đăng nhập
- **File**: `src/components/ProtectedRoute/HRRoute.jsx`
- **Mục đích**: Bảo vệ trang dành riêng cho HR (quản lý tuyển dụng)
- **Logic**:
  - ❌ Chưa đăng nhập → Redirect về `/employee-login`
  - ❌ Không phải HR → Redirect về `/`
  - ✅ Là HR đã đăng nhập → Cho phép truy cập

---

## 🗺️ Cấu trúc Route trong App.jsx

```jsx
<Routes>
  {/* Public routes - Không cần đăng nhập */}
  <Route path="/" element={<Home />} />
  <Route path="/recruitment" element={<Recruitment />} />
  
  {/* Auth routes - CHỈ khi CHƯA đăng nhập */}
  <Route path="/login" element={<AuthRoute><LoginPage /></AuthRoute>} />
  <Route path="/employee-login" element={<AuthRoute><EmployeeLoginPage /></AuthRoute>} />
  <Route path="/register" element={<AuthRoute><RegisterPage /></AuthRoute>} />
  
  {/* HR routes - CHỈ HR mới truy cập được */}
  <Route path="/HR/createjob" element={<HRRoute><CreateJob /></HRRoute>} />
  <Route path="/HR/jobs" element={<HRRoute><JobsPost /></HRRoute>} />
  <Route path="/HR/upload" element={<HRRoute><UploadFile /></HRRoute>} />
</Routes>
```

---

## 🔐 Cách hoạt động

### Kiểm tra Authentication
Tất cả các route đều sử dụng `useAuth()` hook để lấy:
```jsx
const { user, authenticate, loading } = useAuth();
```

- `user`: Object chứa thông tin user (id, email, role, full_name...)
- `authenticate`: Boolean - true nếu đã đăng nhập
- `loading`: Boolean - true khi đang check session

### Flow kiểm tra
```
1. Loading screen (đợi check session)
   ↓
2. Kiểm tra authenticate
   ↓
3. Kiểm tra user.role (nếu cần)
   ↓
4. Redirect hoặc Render children
```

---

## 📊 Ma trận quyền truy cập

| Route | Chưa đăng nhập | Candidate | HR |
|-------|----------------|-----------|-----|
| `/` | ✅ | ✅ | ✅ |
| `/recruitment` | ✅ | ✅ | ✅ |
| `/login` | ✅ | ❌ → `/` | ❌ → `/HR/jobs` |
| `/register` | ✅ | ❌ → `/` | ❌ → `/HR/jobs` |
| `/employee-login` | ✅ | ❌ → `/` | ❌ → `/HR/jobs` |
| `/HR/createjob` | ❌ → `/employee-login` | ❌ → `/` | ✅ |
| `/HR/jobs` | ❌ → `/employee-login` | ❌ → `/` | ✅ |
| `/HR/upload` | ❌ → `/employee-login` | ❌ → `/` | ✅ |

---

## 🧪 Test Cases

### Test 1: Chưa đăng nhập
1. Truy cập `/HR/jobs` → Redirect về `/employee-login` ✅
2. Truy cập `/login` → Hiện trang login ✅
3. Truy cập `/` → Hiện trang home ✅

### Test 2: Đăng nhập với Candidate
1. Login thành công → Ở lại trang home
2. Truy cập `/login` → Redirect về `/` ✅
3. Truy cập `/HR/jobs` → Redirect về `/` ✅
4. Truy cập `/recruitment` → Hiện trang recruitment ✅

### Test 3: Đăng nhập với HR
1. Login thành công → Redirect về `/HR/jobs`
2. Truy cập `/employee-login` → Redirect về `/HR/jobs` ✅
3. Truy cập `/HR/createjob` → Hiện trang tạo job ✅
4. Truy cập `/` → Hiện trang home (cho phép) ✅

---

## 🛠️ Cấu trúc User Object

### Candidate
```javascript
{
  id: 1,
  email: "candidate@example.com",
  full_name: "Nguyễn Văn A",
  phone: "0123456789",
  cv_url: null,
  // KHÔNG có role (hoặc role undefined)
}
```

### HR
```javascript
{
  id: 1,
  email: "hr@example.com",
  username: "hr_user",
  role: "HR", // hoặc "hr"
  company_id: 1
}
```

---

## 📝 Lưu ý quan trọng

1. **Loading State**: Tất cả route đều có loading screen để tránh flash content
2. **Role Check**: Kiểm tra cả `'HR'` và `'hr'` (case-insensitive)
3. **Replace**: Dùng `replace={true}` để không lưu history khi redirect
4. **Console Logs**: Giữ lại để dễ debug trong development

---

## 🔧 Cách thêm route mới

### Thêm route public:
```jsx
<Route path="/about" element={<About />} />
```

### Thêm route cho Candidate:
```jsx
<Route 
  path="/profile" 
  element={
    <PrivateRoute>
      <ProfilePage />
    </PrivateRoute>
  } 
/>
```

### Thêm route cho HR:
```jsx
<Route 
  path="/HR/candidates" 
  element={
    <HRRoute>
      <CandidatesList />
    </HRRoute>
  } 
/>
```

---

## 🐛 Troubleshooting

### Vấn đề: Infinite redirect loop
- **Nguyên nhân**: Loading state không được xử lý đúng
- **Giải pháp**: Kiểm tra `if (loading) return <LoadingScreen />`

### Vấn đề: User role không được nhận diện
- **Nguyên nhân**: Backend không trả về role trong JWT payload
- **Giải pháp**: Kiểm tra `authController.js` - hàm `login()` và `getCurrentUser()`

### Vấn đề: Redirect về login sau khi refresh
- **Nguyên nhân**: Session check failed hoặc token expired
- **Giải pháp**: Kiểm tra cookie httpOnly và thời gian expire (7 ngày)
