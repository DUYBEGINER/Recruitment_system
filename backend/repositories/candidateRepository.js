import { sql, connect } from '../config/db.js';

/**
 * Repository để quản lý Candidate (ứng viên)
 */

// Lấy tất cả candidates
export async function getAllCandidates(filters = {}) {
  try {
    const pool = await connect();
    let query = `
      SELECT 
        c.id,
        c.full_name,
        c.email,
        c.phone,
        c.created_at,
        COUNT(DISTINCT a.id) as total_applications,
        COUNT(DISTINCT CASE WHEN a.status = 'accepted' THEN a.id END) as accepted_count,
        COUNT(DISTINCT CASE WHEN a.status = 'rejected' THEN a.id END) as rejected_count,
        COUNT(DISTINCT CASE WHEN a.status = 'pending' THEN a.id END) as pending_count
      FROM Candidate c
      LEFT JOIN Application a ON c.id = a.candidate_id
      WHERE 1=1
    `;

    const request = pool.request();

    // Filter theo email hoặc tên
    if (filters.search) {
      query += ` AND (c.full_name LIKE @search OR c.email LIKE @search OR c.phone LIKE @search)`;
      request.input('search', sql.NVarChar, `%${filters.search}%`);
    }

    query += `
      GROUP BY c.id, c.full_name, c.email, c.phone, c.created_at
      ORDER BY c.created_at DESC
    `;

    console.log('[candidateRepository] Executing query:', query);
    const result = await request.query(query);
    console.log('[candidateRepository] Query result:', result.recordset.length, 'rows');
    return result.recordset;
  } catch (error) {
    console.error('Error in getAllCandidates:', error);
    console.error('Error stack:', error.stack);
    throw error;
  }
}

// Lấy chi tiết 1 candidate
export async function getCandidateById(id) {
  try {
    const pool = await connect();
    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .query(`
        SELECT 
          c.*,
          COUNT(DISTINCT a.id) as total_applications,
          COUNT(DISTINCT CASE WHEN a.status = 'accepted' THEN a.id END) as accepted_count,
          COUNT(DISTINCT CASE WHEN a.status = 'rejected' THEN a.id END) as rejected_count,
          COUNT(DISTINCT CASE WHEN a.status = 'pending' THEN a.id END) as pending_count
        FROM Candidate c
        LEFT JOIN Application a ON c.id = a.candidate_id
        WHERE c.id = @id
        GROUP BY c.id, c.full_name, c.email, c.phone, c.password, c.cv_url, c.created_at, c.updated_at
      `);
    
    if (result.recordset.length === 0) return null;
    return result.recordset[0];
  } catch (error) {
    console.error('Error in getCandidateById:', error);
    throw error;
  }
}

// Lấy danh sách applications của 1 candidate
export async function getApplicationsByCandidateId(candidateId) {
  try {
    const pool = await connect();
    const result = await pool
      .request()
      .input('candidate_id', sql.Int, candidateId)
      .query(`
        SELECT 
          a.id,
          a.job_id,
          a.cv_url,
          a.status,
          a.submitted_at,
          j.title as job_title,
          j.location as job_location,
          j.job_type,
          j.salary_min,
          j.salary_max,
          j.status as job_status
        FROM Application a
        LEFT JOIN JobPosting j ON a.job_id = j.id
        WHERE a.candidate_id = @candidate_id
        ORDER BY a.submitted_at DESC
      `);
    return result.recordset;
  } catch (error) {
    console.error('Error in getApplicationsByCandidateId:', error);
    throw error;
  }
}

// Đếm số lượng candidates
export async function countCandidates() {
  try {
    const pool = await connect();
    const result = await pool
      .request()
      .query('SELECT COUNT(*) as total FROM Candidate');
    return result.recordset[0].total;
  } catch (error) {
    console.error('Error in countCandidates:', error);
    throw error;
  }
}

// Lấy candidate theo email
export async function getCandidateByEmail(email) {
  try {
    const pool = await connect();
    const result = await pool
      .request()
      .input('email', sql.NVarChar, email)
      .query(`
        SELECT TOP 1 *
        FROM Candidate
        WHERE email = @email
      `);
    return result.recordset[0];
  } catch (error) {
    console.error('Error in getCandidateByEmail:', error);
    throw error;
  }
}

// Tạo candidate mới
export async function createCandidate(candidateData) {
  try {
    const pool = await connect();
    const result = await pool
      .request()
      .input('full_name', sql.NVarChar, candidateData.full_name)
      .input('email', sql.NVarChar, candidateData.email)
      .input('phone', sql.NVarChar, candidateData.phone)
      .query(`
        INSERT INTO Candidate (full_name, email, phone, created_at)
        OUTPUT INSERTED.*
        VALUES (@full_name, @email, @phone, GETDATE())
      `);
    return result.recordset[0];
  } catch (error) {
    console.error('Error in createCandidate:', error);
    throw error;
  }
}
