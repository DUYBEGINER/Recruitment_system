import express from 'express';
import {
  createInterview,
  getInterviews,
  getInterviewDetail,
  updateInterview,
  deleteInterview,
  getInterviewStats,
  getInterviewsByApplication
} from '../controller/interviewController.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { requireEmployer } from '../middleware/roleCheck.js';

const router = express.Router();

/**
 * Interview Routes
 * Tất cả routes yêu cầu đăng nhập và là Employer (TPNS/HR)
 */

// Lấy thống kê lịch phỏng vấn
router.get('/stats', verifyToken, requireEmployer, getInterviewStats);

// Lấy danh sách lịch phỏng vấn (có filter)
router.get('/', verifyToken, requireEmployer, getInterviews);

// Lấy chi tiết 1 lịch phỏng vấn
router.get('/:id', verifyToken, requireEmployer, getInterviewDetail);

// Tạo lịch phỏng vấn mới
router.post('/', verifyToken, requireEmployer, createInterview);

// Cập nhật lịch phỏng vấn
router.put('/:id', verifyToken, requireEmployer, updateInterview);

// Xóa lịch phỏng vấn
router.delete('/:id', verifyToken, requireEmployer, deleteInterview);

// Lấy lịch phỏng vấn theo application_id
router.get('/application/:application_id', verifyToken, requireEmployer, getInterviewsByApplication);

export default router;
