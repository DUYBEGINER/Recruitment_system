import express from 'express';
import {
  createJobPost,
  getJobPosts,
  getJobPostById,
  updateJobPost,
  submitForApproval,
  closeJobPost,
  deleteJobPost
} from '../controller/jobController.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { requireEmployer, requireTPNS } from '../middleware/roleCheck.js';

const router = express.Router();

// Public routes - Ai cũng xem được
router.get('/', getJobPosts); // Lấy danh sách tin tuyển dụng
router.get('/:id', getJobPostById); // Lấy chi tiết tin tuyển dụng

// Protected routes - Yêu cầu đăng nhập và là Employer (TPNS hoặc HR)
router.post('/', verifyToken, requireEmployer, createJobPost); // Tạo tin mới
router.put('/:id', verifyToken, requireEmployer, updateJobPost); // Cập nhật tin
router.post('/:id/submit-approval', verifyToken, requireEmployer, submitForApproval); // Gửi phê duyệt

// TPNS only routes - Chỉ TPNS mới có quyền
router.post('/:id/close', verifyToken, requireTPNS, closeJobPost); // Đóng tin
router.delete('/:id', verifyToken, requireTPNS, deleteJobPost); // Xóa tin

export default router;
