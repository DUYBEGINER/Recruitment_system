import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import {
  saveUploadedFile,
  getAllUploadedFiles,
  getUploadedFileById,
  deleteUploadedFile
} from '../repositories/uploadFileRepository.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Upload file và lưu thông tin vào database
 */
export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn file để upload!'
      });
    }

    const file = req.file;
    
    // Tạo URL tương đối để lưu vào database
    const fileUrl = `/uploads/${file.filename}`;
    
    // Dữ liệu để lưu vào database
    const fileData = {
      url: fileUrl,
      mime_type: file.mimetype,
      size_bytes: file.size
    };

    // Lưu vào database
    const savedFile = await saveUploadedFile(fileData);

    return res.status(201).json({
      success: true,
      message: 'Upload file thành công!',
      data: {
        id: savedFile.id,
        filename: file.filename,
        originalname: file.originalname,
        url: fileUrl,
        mime_type: savedFile.mime_type,
        size_bytes: savedFile.size_bytes,
        created_at: savedFile.created_at
      }
    });

  } catch (error) {
    console.error('Upload file error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi upload file!',
      error: error.message
    });
  }
};

/**
 * Lấy danh sách tất cả files
 */
export const getFiles = async (req, res) => {
  try {
    const files = await getAllUploadedFiles();
    
    return res.status(200).json({
      success: true,
      data: files
    });

  } catch (error) {
    console.error('Get files error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách files!',
      error: error.message
    });
  }
};

/**
 * Lấy thông tin file theo ID
 */
export const getFileById = async (req, res) => {
  try {
    const { id } = req.params;
    const file = await getUploadedFileById(id);
    
    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy file!'
      });
    }

    return res.status(200).json({
      success: true,
      data: file
    });

  } catch (error) {
    console.error('Get file by id error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin file!',
      error: error.message
    });
  }
};

/**
 * Xóa file
 */
export const removeFile = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Lấy thông tin file trước khi xóa
    const file = await getUploadedFileById(id);
    
    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy file!'
      });
    }

    // Xóa file vật lý
    const filePath = path.join(__dirname, '../CV_Storage', path.basename(file.url));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Xóa trong database
    await deleteUploadedFile(id);

    return res.status(200).json({
      success: true,
      message: 'Xóa file thành công!'
    });

  } catch (error) {
    console.error('Delete file error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa file!',
      error: error.message
    });
  }
};
