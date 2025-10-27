import express from 'express';
import {
  getApplications,
  getApplicationsByJob,
  getApplicationDetail,
  updateApplicationStatus,
  countApplications,
} from '../controller/applicationController.js';
import { verifyToken } from "../middleware/verifyToken.js";
import { requireEmployer } from '../middleware/roleCheck.js';

const router = express.Router();

/**
 * Routes cho Application (hồ sơ ứng tuyển)
 * Base path: /applications
 */

// Lấy danh sách applications (có filter: job_id, status, employer_id)
// GET /applications?job_id=1&status=pending
router.get('/', verifyToken, requireEmployer, getApplications);

// Lấy danh sách applications theo job_id
// GET /applications/job/:jobId
router.get('/job/:jobId', verifyToken, requireEmployer, getApplicationsByJob);

// Đếm số lượng applications theo job
// GET /applications/job/:jobId/count?status=pending
router.get('/job/:jobId/count', verifyToken, requireEmployer, countApplications);

// Lấy chi tiết 1 application
// GET /applications/:id
router.get('/:id', verifyToken, requireEmployer, getApplicationDetail);

// Cập nhật trạng thái application
// PUT /applications/:id/status
router.put('/:id/status', verifyToken, requireEmployer, updateApplicationStatus);

export default router;
