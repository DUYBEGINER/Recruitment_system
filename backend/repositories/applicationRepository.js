import { sql, connect } from '../config/db.js';

/**
 * Repository để quản lý Application (hồ sơ ứng tuyển)
 */

// Lấy tất cả applications theo job_id
export async function getApplicationsByJobId(jobId) {
  try {
    const pool = await connect();
    const result = await pool
      .request()
      .input('job_id', sql.Int, jobId)
      .query(`
        SELECT 
          a.id,
          a.job_id,
          a.candidate_id,
          a.cv_url,
          a.status,
          a.submitted_at,
          c.full_name as candidate_name,
          c.email as candidate_email,
          c.phone as candidate_phone
        FROM Application a
        LEFT JOIN Candidate c ON a.candidate_id = c.id
        WHERE a.job_id = @job_id
        ORDER BY a.submitted_at DESC
      `);
    return result.recordset;
  } catch (error) {
    console.error('Error in getApplicationsByJobId:', error);
    throw error;
  }
}

// Lấy tất cả applications (với filter)
export async function getAllApplications(filters = {}) {
  try {
    const pool = await connect();
    let query = `
      SELECT 
        a.id,
        a.job_id,
        a.candidate_id,
        a.cv_url,
        a.status,
        a.submitted_at,
        c.full_name as candidate_name,
        c.email as candidate_email,
        c.phone as candidate_phone,
        j.title as job_title,
        j.location as job_location,
        j.employer_id
      FROM Application a
      LEFT JOIN Candidate c ON a.candidate_id = c.id
      LEFT JOIN JobPosting j ON a.job_id = j.id
      WHERE 1=1
    `;

    const request = pool.request();

    // Filter theo employer_id (HR chỉ thấy applications của jobs mình tạo)
    if (filters.employer_id) {
      query += ' AND j.employer_id = @employer_id';
      request.input('employer_id', sql.Int, filters.employer_id);
    }

    // Filter theo job_id
    if (filters.job_id) {
      query += ' AND a.job_id = @job_id';
      request.input('job_id', sql.Int, filters.job_id);
    }

    // Filter theo status
    if (filters.status) {
      query += ' AND a.status = @status';
      request.input('status', sql.NVarChar, filters.status);
    }

    query += ' ORDER BY a.submitted_at DESC';

    const result = await request.query(query);
    return result.recordset;
  } catch (error) {
    console.error('Error in getAllApplications:', error);
    throw error;
  }
}

// Lấy chi tiết 1 application
export async function getApplicationById(id) {
  try {
    const pool = await connect();
    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .query(`
        SELECT 
          a.id,
          a.job_id,
          a.candidate_id,
          a.cv_url,
          a.status,
          a.submitted_at,
          c.full_name as candidate_name,
          c.email as candidate_email,
          c.phone as candidate_phone,
          j.title as job_title,
          j.location as job_location,
          j.salary_min,
          j.salary_max,
          j.employer_id
        FROM Application a
        LEFT JOIN Candidate c ON a.candidate_id = c.id
        LEFT JOIN JobPosting j ON a.job_id = j.id
        WHERE a.id = @id
      `);
    return result.recordset[0];
  } catch (error) {
    console.error('Error in getApplicationById:', error);
    throw error;
  }
}

// Cập nhật trạng thái application
export async function updateApplicationStatus(id, status) {
  try {
    const pool = await connect();
    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .input('status', sql.NVarChar, status)
      .query(`
        UPDATE Application
        SET status = @status
        WHERE id = @id
      `);
    return result.rowsAffected[0] > 0;
  } catch (error) {
    console.error('Error in updateApplicationStatus:', error);
    throw error;
  }
}

// Đếm số lượng applications theo job_id
export async function countApplicationsByJobId(jobId) {
  try {
    const pool = await connect();
    const result = await pool
      .request()
      .input('job_id', sql.Int, jobId)
      .query(`
        SELECT COUNT(*) as total
        FROM Application
        WHERE job_id = @job_id
      `);
    return result.recordset[0].total;
  } catch (error) {
    console.error('Error in countApplicationsByJobId:', error);
    throw error;
  }
}

// Đếm số lượng applications theo job_id và status
export async function countApplicationsByStatus(jobId, status) {
  try {
    const pool = await connect();
    const result = await pool
      .request()
      .input('job_id', sql.Int, jobId)
      .input('status', sql.NVarChar, status)
      .query(`
        SELECT COUNT(*) as total
        FROM Application
        WHERE job_id = @job_id AND status = @status
      `);
    return result.recordset[0].total;
  } catch (error) {
    console.error('Error in countApplicationsByStatus:', error);
    throw error;
  }
}

// Tạo application mới
export async function createApplication(applicationData) {
  try {
    const pool = await connect();
    const result = await pool
      .request()
      .input('job_id', sql.Int, applicationData.job_id)
      .input('candidate_id', sql.Int, applicationData.candidate_id)
      .input('cv_url', sql.NVarChar, applicationData.cv_url)
      .input('status', sql.NVarChar, applicationData.status)
      .input('cover_letter', sql.NVarChar, applicationData.cover_letter)
      .query(`
        INSERT INTO Application (job_id, candidate_id, cv_url, status, submitted_at)
        OUTPUT INSERTED.*
        VALUES (@job_id, @candidate_id, @cv_url, @status, GETDATE())
      `);
    return result.recordset[0];
  } catch (error) {
    console.error('Error in createApplication:', error);
    throw error;
  }
}

// Kiểm tra xem candidate đã ứng tuyển job này chưa
export async function checkExistingApplication(candidateId, jobId) {
  try {
    const pool = await connect();
    const result = await pool
      .request()
      .input('candidate_id', sql.Int, candidateId)
      .input('job_id', sql.Int, jobId)
      .query(`
        SELECT TOP 1 id
        FROM Application
        WHERE candidate_id = @candidate_id AND job_id = @job_id
      `);
    return result.recordset[0];
  } catch (error) {
    console.error('Error in checkExistingApplication:', error);
    throw error;
  }
}
