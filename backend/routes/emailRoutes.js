import express from 'express';
import {
  sendEmailToCandidate,
  sendInterviewInvitation
} from '../controller/emailController.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { requireEmployer } from '../middleware/roleCheck.js';

const router = express.Router();

/**
 * Email Routes
 * Tất cả routes yêu cầu đăng nhập và là Employer (TPNS/HR)
 */

// Gửi email thông thường cho ứng viên
router.post('/send', verifyToken, requireEmployer, sendEmailToCandidate);

// Gửi email mời phỏng vấn
router.post('/send-interview-invitation', verifyToken, requireEmployer, sendInterviewInvitation);

export default router;
