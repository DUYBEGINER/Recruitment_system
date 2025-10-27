import express from 'express';
import {
  getCandidates,
  getCandidateDetail,
  getCandidateApplications,
  countCandidatesController,
} from '../controller/candidateController.js';
import {verifyToken} from '../middleware/verifyToken.js';
import { requireEmployer } from '../middleware/roleCheck.js';

const router = express.Router();

/**
 * Routes cho Candidate (ứng viên)
 * Base path: /candidates
 */

// Lấy danh sách candidates (có search)
// GET /candidates?search=nguyen
router.get('/', verifyToken, requireEmployer, getCandidates);

// Đếm số lượng candidates
// GET /candidates/count
router.get('/count', verifyToken, requireEmployer, countCandidatesController);

// Lấy chi tiết 1 candidate
// GET /candidates/:id
router.get('/:id', verifyToken, requireEmployer, getCandidateDetail);

// Lấy danh sách applications của 1 candidate
// GET /candidates/:id/applications
router.get('/:id/applications', verifyToken, requireEmployer, getCandidateApplications);

export default router;
