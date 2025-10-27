import express from 'express';
import upload from '../middleware/uploadcv.js';
import {
  uploadFile,
  getFiles,
  getFileById,
  removeFile
} from '../controller/uploadController.js';

const router = express.Router();

// Upload file
router.post('/upload', upload.single('file'), uploadFile);

// Lấy danh sách tất cả files
router.get('/files', getFiles);

// Lấy thông tin file theo ID
router.get('/files/:id', getFileById);

// Xóa file
router.delete('/files/:id', removeFile);

export default router;
