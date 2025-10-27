# 🔒 Tách Biệt Giao Diện Employer & Candidate

## 🎯 Mục đích

Đảm bảo **nhân viên (TPNS/HR)** sau khi đăng nhập:
- ✅ CHỈ thấy giao diện Admin (AdminLayout)
- ✅ KHÔNG thấy Header/Footer của trang chủ
- ✅ KHÔNG truy cập được các trang public như `/`, `/recruitment`
- ✅ Tự động redirect về `/HR/jobs` nếu cố truy cập trang candidate

---

## 📝 Những gì đã thay đổi

### 1. EmployeeLoginPage - Xóa MainLayout

**Trước:**
```jsx
import MainLayout from "../layout/MainLayout";

return (
  <MainLayout>
    <div>Login form...</div>
  </MainLayout>
);
```

**Sau:**
```jsx
// Không import MainLayout

return (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
    <div>Login form...</div>
  </div>
);
```

**Lý do:** Trang login không cần Header/Footer

---

### 2. PublicRoute Component (MỚI)

**File:** `src/components/ProtectedRoute/PublicRoute.jsx`

**Chức năng:** Chặn Employer không cho vào trang public

```jsx
const PublicRoute = ({ children }) => {
  const { user, authenticate } = useAuth();
  
  // Nếu là TPNS/HR → Redirect /HR/jobs
  if (authenticate && user && (user.role === 'TPNS' || user.role === 'HR')) {
    return <Navigate to="/HR/jobs" replace />;
  }
  
  // Guest hoặc Candidate → Cho phép
  return children;
};
```

---

### 3. App.jsx - Áp dụng PublicRoute

**Trước:**
```jsx
<Route path="/" element={<Home />} />
<Route path="/recruitment" element={<Recruitment />} />
```

**Sau:**
```jsx
import PublicRoute from "./components/ProtectedRoute/PublicRoute";

<Route path="/" element={<PublicRoute><Home /></PublicRoute>} />
<Route path="/recruitment" element={<PublicRoute><Recruitment /></PublicRoute>} />
```

**Kết quả:**
- Guest/Candidate: Vào `/` → OK
- TPNS/HR: Vào `/` → Redirect `/HR/jobs`

---

### 4. AdminHeader - Hiển thị User Info

**Trước:**
```jsx
<button onClick={handleLogout}>Log out</button>
```

**Sau:**
```jsx
{/* User Info */}
{user && (
  <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
    <User className="w-4 h-4" />
    <span>{user.full_name || user.username}</span>
    {user.role && (
      <span className="badge">
        {user.role === 'TPNS' ? 'Trưởng phòng NS' : 'HR'}
      </span>
    )}
  </div>
)}

<button onClick={handleLogout}>Đăng xuất</button>
```

**Hiển thị:**
- Tên user: `Nguyễn Văn A`
- Role badge: `[Trưởng phòng NS]` hoặc `[HR]`

---

### 5. AdminSidebar - Phân quyền Menu

**Features:**
- Hiển thị role badge ở sidebar
- Menu khác nhau cho TPNS vs HR
- TPNS thấy thêm menu "Cài đặt hệ thống"

```jsx
const { user } = useAuth();

// Menu chung
const commonNavItems = [
  { path: "/HR/jobs", label: "Quản lí tin tuyển dụng" },
  { path: "/HR/createjob", label: "Tạo tin tuyển dụng" },
];

// Menu chỉ TPNS
const tpnsOnlyItems = [
  { path: "/HR/settings", label: "Cài đặt hệ thống" },
];

// Kết hợp dựa vào role
const navItems = user?.role === 'TPNS' 
  ? [...commonNavItems, ...tpnsOnlyItems]
  : commonNavItems;
```

---

## 🔄 User Flow

### Flow 1: Employer Login
```
1. Vào /employee-login
2. Nhập username + password
3. Submit → Call API employeeLogin
4. Success → navigate("/HR/jobs", { replace: true })
5. Thấy AdminLayout với:
   - AdminSidebar (menu bên trái)
   - AdminHeader (user info + logout)
   - JobsPost content
```

### Flow 2: Employer thử vào trang chủ
```
1. Employer đã login
2. Type URL: http://localhost:5173/
3. PublicRoute detect: user.role === 'TPNS' hoặc 'HR'
4. Redirect → /HR/jobs
5. KHÔNG BAO GIỜ thấy MainLayout (Header/Footer trang chủ)
```

### Flow 3: Candidate vào trang chủ
```
1. Candidate (hoặc guest)
2. Vào /
3. PublicRoute detect: Không phải employer
4. Render <Home /> với MainLayout bình thường
5. Thấy Header/Footer của trang chủ
```

---

## 📊 Layout Mapping

| User Type | Trang | Layout Sử dụng |
|-----------|-------|----------------|
| Guest | `/` | MainLayout (Header + Footer) |
| Guest | `/recruitment` | MainLayout |
| Guest | `/login` | Không có layout (background + form) |
| Guest | `/employee-login` | Không có layout (background + form) |
| Candidate | `/` | MainLayout |
| Candidate | `/recruitment` | MainLayout |
| Candidate | `/profile` | MainLayout |
| **TPNS/HR** | `/` | ❌ Redirect → `/HR/jobs` |
| **TPNS/HR** | `/recruitment` | ❌ Redirect → `/HR/jobs` |
| **TPNS/HR** | `/HR/jobs` | **AdminLayout** (Sidebar + Header) |
| **TPNS/HR** | `/HR/createjob` | **AdminLayout** |
| **TPNS** | `/HR/settings` | **AdminLayout** |

---

## 🎨 UI Components

### AdminLayout Structure
```
┌─────────────────────────────────────────┐
│  AdminSidebar  │  AdminHeader          │
│                │  (User Info + Logout)  │
│  - Menu items  ├────────────────────────┤
│  - Role badge  │                        │
│  - Footer      │  Main Content          │
│                │  (Page component)      │
│                │                        │
└─────────────────────────────────────────┘
```

### AdminHeader Features
- 👤 User avatar placeholder
- 📝 Full name or username
- 🏷️ Role badge (TPNS/HR)
- 🚪 Logout button

### AdminSidebar Features
- 🏢 Logo
- 🏷️ Role badge section
- 📋 Menu items (phân quyền theo role)
- ©️ Footer

---

## 🧪 Test Cases

### Test 1: TPNS Login
```
1. Vào /employee-login
2. Login với username TPNS
3. ✅ Redirect /HR/jobs
4. ✅ Thấy AdminLayout
5. ✅ Sidebar có menu "Cài đặt hệ thống"
6. ✅ Header hiển thị "Trưởng phòng NS"
```

### Test 2: HR Login
```
1. Vào /employee-login
2. Login với username HR
3. ✅ Redirect /HR/jobs
4. ✅ Thấy AdminLayout
5. ✅ Sidebar KHÔNG có menu "Cài đặt hệ thống"
6. ✅ Header hiển thị "HR"
```

### Test 3: Employer vào trang chủ
```
1. Employer đã login
2. Vào / (trang chủ)
3. ✅ Tự động redirect /HR/jobs
4. ✅ KHÔNG thấy MainLayout
5. ✅ Chỉ thấy AdminLayout
```

### Test 4: Candidate vào trang chủ
```
1. Candidate login
2. Vào /
3. ✅ Thấy trang chủ bình thường
4. ✅ Có Header/Footer
5. ✅ Thấy MainLayout
```

### Test 5: Employer logout
```
1. Employer đã login
2. Click "Đăng xuất" ở AdminHeader
3. ✅ Redirect /employee-login
4. ✅ Không còn thông tin user
```

---

## 📁 Files Modified

### Frontend (5 files)

1. ✅ `src/page/EmployeeLoginPage.jsx`
   - Xóa MainLayout
   - Thêm background gradient
   - Update login logic với setAuthenticate

2. ✅ `src/components/ProtectedRoute/PublicRoute.jsx` (NEW)
   - Chặn employer vào trang public
   - Redirect về /HR/jobs

3. ✅ `src/App.jsx`
   - Import PublicRoute
   - Wrap `/` và `/recruitment` với PublicRoute

4. ✅ `src/components/admin/AdminHeader.jsx`
   - Hiển thị user info
   - Role badge
   - Logout redirect về /employee-login

5. ✅ `src/components/admin/AdminSidebar.jsx`
   - Role badge section
   - Menu phân quyền (TPNS vs HR)
   - Footer

---

## ⚠️ Important Notes

### 1. Employer KHÔNG BAO GIỜ thấy MainLayout
- MainLayout chỉ cho Guest và Candidate
- Employer chỉ thấy AdminLayout

### 2. Route Protection Chain
```
PublicRoute → Chặn employer vào public pages
AuthRoute → Chặn đã login vào login/register
HRRoute → Chỉ cho employer vào admin pages
```

### 3. Login Flow
- Candidate: `/login` → `/` (MainLayout)
- Employer: `/employee-login` → `/HR/jobs` (AdminLayout)

### 4. Logout Redirect
- Candidate: Về `/`
- Employer: Về `/employee-login`

---

## 🚀 Next Steps (Optional)

1. **Dashboard cho TPNS/HR**
   - Trang `/HR/dashboard` với thống kê
   - Charts, metrics, overview

2. **Settings Page (TPNS only)**
   - Quản lý user
   - Cấu hình hệ thống

3. **Notifications**
   - Bell icon trong AdminHeader
   - Real-time updates

4. **Dark Mode**
   - Toggle trong AdminHeader
   - Persist preference

---

✅ **Hoàn thành!** Employer và Candidate giờ có giao diện hoàn toàn tách biệt.
