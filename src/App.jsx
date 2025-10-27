
import './App.css'
import {Routes, Route, Link } from "react-router-dom";
import Home from "./page/Home";
import LoginPage from "./page/LoginPage";
import EmployeeLoginPage from "./page/EmployeeLoginPage";
import RegisterPage from "./page/RegisterPage";
import CreateJob from "./page/admin/CreateJob";
import JobsPost from "./page/admin/JobsPost";
import UploadFile from "./page/admin/UploadFile";
import JobPage from "./page/JobPage";
import JobDetail from './page/JobDetailPage';
import '@ant-design/v5-patch-for-react-19';

function App() {

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/employee-login" element={<EmployeeLoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/HR/createjob" element={<CreateJob />} />
      <Route path="/HR/jobs" element={<JobsPost />} />
      <Route path="/HR/upload" element={<UploadFile />} />
      <Route path="/job-page" element={<JobPage/>}/>
      <Route path="/jobs/:id" element={<JobDetail />} />
    </Routes>
  );
}

export default App;
