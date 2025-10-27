import { useEffect } from "react";
import './App.css'
import {Routes, Route, Link } from "react-router-dom";
import Home from "./page/Home";
import LoginPage from "./page/LoginPage";
import EmployeeLoginPage from "./page/EmployeeLoginPage";
import RegisterPage from "./page/RegisterPage";
import CreateJob from "./page/admin/CreateJob";
import JobsPost from "./page/admin/JobsPost";
import UploadFile from "./page/admin/UploadFile";
import Recruitment from "./page/Recruitment";

// Import các route bảo vệ
import AuthRoute from "./components/ProtectedRoute/AuthRoute";
import PrivateRoute from "./components/ProtectedRoute/PrivateRoute";
import HRRoute from "./components/ProtectedRoute/HRRoute";
import PublicRoute from "./components/ProtectedRoute/PublicRoute";

import '@ant-design/v5-patch-for-react-19';

function App() {

  return (
    <Routes>
      {/* Public routes - Nhưng CHẶN nhân viên (TPNS/HR) không cho vào */}
      <Route 
        path="/" 
        element={
          <PublicRoute>
            <Home />
          </PublicRoute>
        } 
      />
      <Route 
        path="/recruitment" 
        element={
          <PublicRoute>
            <Recruitment />
          </PublicRoute>
        } 
      />
      
      {/* Auth routes - Chỉ khi CHƯA đăng nhập mới truy cập được */}
      <Route 
        path="/login" 
        element={
          <AuthRoute>
            <LoginPage />
          </AuthRoute>
        } 
      />
      <Route 
        path="/employee-login" 
        element={
          <AuthRoute>
            <EmployeeLoginPage />
          </AuthRoute>
        } 
      />
      <Route 
        path="/register" 
        element={
          <AuthRoute>
            <RegisterPage />
          </AuthRoute>
        } 
      />
      
      {/* HR routes - Chỉ HR mới truy cập được */}
      <Route 
        path="/HR/createjob" 
        element={
          <HRRoute>
            <CreateJob />
          </HRRoute>
        } 
      />
      <Route 
        path="/HR/jobs" 
        element={
          <HRRoute>
            <JobsPost />
          </HRRoute>
        } 
      />
      <Route 
        path="/HR/upload" 
        element={
          <HRRoute>
            <UploadFile />
          </HRRoute>
        } 
      />
    </Routes>
  );
}

export default App;
