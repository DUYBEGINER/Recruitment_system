import sql from 'mssql';
import {connect} from "../config/db.js";

/**
 * Lưu thông tin file đã upload vào database
 */
export const saveUploadedFile = async (fileData) => {
  try {
    const pool = await connect();
    const result = await pool.request()
      .input('url', sql.NVarChar, fileData.url)
      .input('mime_type', sql.NVarChar, fileData.mime_type)
      .input('size_bytes', sql.BigInt, fileData.size_bytes)
      .query(`
        INSERT INTO UploadedFiles (url, mime_type, size_bytes, created_at)
        OUTPUT INSERTED.*
        VALUES (@url, @mime_type, @size_bytes, GETDATE())
      `);
    
    return result.recordset[0];
  } catch (error) {
    console.error('Error saving uploaded file:', error);
    throw error;
  }
};

/**
 * Lấy danh sách tất cả files đã upload
 */
export const getAllUploadedFiles = async () => {
  try {
    const pool = await connect();
    const result = await pool.request()
      .query(`
        SELECT id, url, mime_type, size_bytes, created_at
        FROM UploadedFiles
        ORDER BY created_at DESC
      `);
    
    return result.recordset;
  } catch (error) {
    console.error('Error getting uploaded files:', error);
    throw error;
  }
};

/**
 * Lấy thông tin file theo ID
 */
export const getUploadedFileById = async (id) => {
  try {
    const pool = await connect();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT id, url, mime_type, size_bytes, created_at
        FROM UploadedFiles
        WHERE id = @id
      `);
    
    return result.recordset[0];
  } catch (error) {
    console.error('Error getting uploaded file by id:', error);
    throw error;
  }
};

/**
 * Xóa file theo ID
 */
export const deleteUploadedFile = async (id) => {
  try {
    const pool = await connect();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        DELETE FROM UploadedFiles
        OUTPUT DELETED.*
        WHERE id = @id
      `);
    
    return result.recordset[0];
  } catch (error) {
    console.error('Error deleting uploaded file:', error);
    throw error;
  }
};
