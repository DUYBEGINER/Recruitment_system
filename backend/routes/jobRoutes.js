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

const router = express.Router();

// Tạo tin tuyển dụng mới
router.post('/', createJobPost);

// Lấy danh sách tin tuyển dụng
router.get('/', getJobPosts);

// Lấy thông tin tin tuyển dụng theo ID
router.get('/:id', getJobPostById);

// Cập nhật tin tuyển dụng
router.put('/:id', updateJobPost);

// Gửi tin tuyển dụng để phê duyệt
router.post('/:id/submit-approval', submitForApproval);

// Đóng tin tuyển dụng
router.post('/:id/close', closeJobPost);

// Xóa tin tuyển dụng
router.delete('/:id', deleteJobPost);

export default router;
