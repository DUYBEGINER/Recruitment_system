
import './App.css'
import {Routes, Route, Link } from "react-router-dom";
import Home from "./page/Home";
import LoginPage from "./page/LoginPage";
import EmployeeLoginPage from "./page/EmployeeLoginPage";
import RegisterPage from "./page/RegisterPage";
import CreateJob from "./page/admin/CreateJob";
import EditJob from "./page/admin/EditJob";
import JobsPost from "./page/admin/JobsPost";
import JobDetail from "./page/admin/JobDetail";
import Applications from "./page/admin/Applications";
import ApplicationDetail from "./page/admin/ApplicationDetail";
import Candidates from "./page/admin/Candidates";
import CandidateDetail from "./page/admin/CandidateDetail";
import Interviews from "./page/admin/Interviews";
import InterviewDetail from "./page/admin/InterviewDetail";
import CreateInterview from "./page/admin/CreateInterview";
import UploadFile from "./page/admin/UploadFile";
import JobPage from "./page/JobPage";
import JobDetailPage from './page/JobDetailPage';
import Recruitment from "./page/Recruitment";

// Import các route bảo vệ
import AuthRoute from "./components/ProtectedRoute/AuthRoute";
import PrivateRoute from "./components/ProtectedRoute/PrivateRoute";
import HRRoute from "./components/ProtectedRoute/HRRoute";
import TPNSRoute from "./components/ProtectedRoute/TPNSRoute";
import PublicRoute from "./components/ProtectedRoute/PublicRoute";

import '@ant-design/v5-patch-for-react-19';

function App() {

  return (
    <Routes>
      <Route path="/job-page" element={<JobPage/>}/>
      <Route path="/jobs/:id" element={<JobDetailPage />} />
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
        path="/HR/jobs/:id" 
        element={
          <HRRoute>
            <JobDetail />
          </HRRoute>
        } 
      />
      <Route 
        path="/HR/jobs/:id/edit" 
        element={
          <HRRoute>
            <EditJob />
          </HRRoute>
        } 
      />
      <Route 
        path="/HR/jobs/:jobId/applications" 
        element={
          <HRRoute>
            <Applications />
          </HRRoute>
        } 
      />
      <Route 
        path="/HR/applications/:applicationId" 
        element={
          <HRRoute>
            <ApplicationDetail />
          </HRRoute>
        } 
      />
      <Route 
        path="/HR/candidates" 
        element={
          <HRRoute>
            <Candidates />
          </HRRoute>
        } 
      />
      <Route 
        path="/HR/candidates/:candidateId" 
        element={
          <HRRoute>
            <CandidateDetail />
          </HRRoute>
        } 
      />
      <Route 
        path="/HR/interviews" 
        element={
          <HRRoute>
            <Interviews />
          </HRRoute>
        } 
      />
      <Route 
        path="/HR/interviews/create" 
        element={
          <HRRoute>
            <CreateInterview />
          </HRRoute>
        } 
      />
      <Route 
        path="/HR/interviews/:interviewId" 
        element={
          <HRRoute>
            <InterviewDetail />
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

      {/* TPNS routes - Chỉ TPNS (Trưởng phòng NS) mới truy cập được */}
      <Route 
        path="/TPNS/jobs" 
        element={
          <TPNSRoute>
            <JobsPost />
          </TPNSRoute>
        } 
      />
      <Route 
        path="/TPNS/jobs/:id" 
        element={
          <TPNSRoute>
            <JobDetail />
          </TPNSRoute>
        } 
      />
      <Route 
        path="/TPNS/jobs/:id/edit" 
        element={
          <TPNSRoute>
            <EditJob />
          </TPNSRoute>
        } 
      />
      <Route 
        path="/TPNS/jobs/:jobId/applications" 
        element={
          <TPNSRoute>
            <Applications />
          </TPNSRoute>
        } 
      />
      <Route 
        path="/TPNS/applications/:applicationId" 
        element={
          <TPNSRoute>
            <ApplicationDetail />
          </TPNSRoute>
        } 
      />
      <Route 
        path="/TPNS/candidates" 
        element={
          <TPNSRoute>
            <Candidates />
          </TPNSRoute>
        } 
      />
      <Route 
        path="/TPNS/candidates/:candidateId" 
        element={
          <TPNSRoute>
            <CandidateDetail />
          </TPNSRoute>
        } 
      />
      <Route 
        path="/TPNS/interviews" 
        element={
          <TPNSRoute>
            <Interviews />
          </TPNSRoute>
        } 
      />
      <Route 
        path="/TPNS/interviews/create" 
        element={
          <TPNSRoute>
            <CreateInterview />
          </TPNSRoute>
        } 
      />
      <Route 
        path="/TPNS/interviews/:interviewId" 
        element={
          <TPNSRoute>
            <InterviewDetail />
          </TPNSRoute>
        } 
      />
    </Routes>
  );
}

export default App;
