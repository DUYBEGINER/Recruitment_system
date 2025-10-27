import express from 'express';
import {
  createJobPost,
  getJobPosts,
  getJobPostById,
  updateJobPost,
  submitForApproval,
  approveJobPost,
  rejectJobPost,
  closeJobPost,
  deleteJobPost
} from '../controller/jobController.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { requireEmployer, requireTPNS } from '../middleware/roleCheck.js';

const router = express.Router();

// Public routes - Ai cũng xem được (chỉ tin approve)
router.get('/', getJobPosts); // Lấy danh sách tin tuyển dụng
router.get('/:id', getJobPostById); // Lấy chi tiết tin tuyển dụng

// Protected routes - Yêu cầu đăng nhập và là Employer (TPNS hoặc HR)
router.post('/', verifyToken, requireEmployer, createJobPost); // Tạo tin mới (draft)
router.put('/:id', verifyToken, requireEmployer, updateJobPost); // Cập nhật tin (không cho sửa pending)
router.post('/:id/submit', verifyToken, requireEmployer, submitForApproval); // Gửi phê duyệt (draft/reject → pending)
router.post('/:id/close', verifyToken, requireEmployer, closeJobPost); // Đóng tin (approve → close)

// TPNS only routes - Chỉ TPNS mới có quyền
router.post('/:id/approve', verifyToken, requireTPNS, approveJobPost); // Duyệt tin (pending → approve)
router.post('/:id/reject', verifyToken, requireTPNS, rejectJobPost); // Từ chối (pending → reject)
router.delete('/:id', verifyToken, requireTPNS, deleteJobPost); // Xóa tin

export default router;
