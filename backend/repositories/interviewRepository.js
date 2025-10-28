import { sql, connect } from '../config/db.js';

/**
 * Repository để quản lý InterviewSchedule (lịch phỏng vấn)
 */

// Tạo lịch phỏng vấn mới
export async function createInterview(interviewData) {
  try {
    const pool = await connect();
    const result = await pool
      .request()
      .input('application_id', sql.Int, interviewData.application_id)
      .input('interviewer_id', sql.Int, interviewData.interviewer_id)
      .input('schedule_time', sql.DateTime, interviewData.schedule_time)
      .input('method', sql.NVarChar, interviewData.method)
      .input('location', sql.NVarChar, interviewData.location || null)
      .input('notes', sql.NVarChar, interviewData.notes || null)
      .input('status', sql.NVarChar, interviewData.status || 'pending')
      .query(`
        INSERT INTO InterviewSchedule 
          (application_id, interviewer_id, schedule_time, method, location, notes, status, created_at, updated_at)
        VALUES 
          (@application_id, @interviewer_id, @schedule_time, @method, @location, @notes, @status, GETDATE(), GETDATE());
        
        SELECT * FROM InterviewSchedule WHERE id = SCOPE_IDENTITY();
      `);
    return result.recordset[0];
  } catch (error) {
    console.error('Error in createInterview:', error);
    throw error;
  }
}

// Lấy tất cả lịch phỏng vấn (có filter)
export async function getAllInterviews(filters = {}) {
  try {
    const pool = await connect();
    let query = `
      SELECT 
        i.id,
        i.application_id,
        i.interviewer_id,
        i.schedule_time,
        i.method,
        i.location,
        i.notes,
        i.status,
        i.created_at,
        i.updated_at,
        a.candidate_id,
        a.job_id,
        a.status as application_status,
        c.full_name as candidate_name,
        c.email as candidate_email,
        c.phone as candidate_phone,
        j.title as job_title,
        j.location as job_location,
        e.full_name as interviewer_name,
        e.phone as interviewer_phone
      FROM InterviewSchedule i
      LEFT JOIN Application a ON i.application_id = a.id
      LEFT JOIN Candidate c ON a.candidate_id = c.id
      LEFT JOIN JobPosting j ON a.job_id = j.id
      LEFT JOIN Employer e ON i.interviewer_id = e.id
      WHERE 1=1
    `;

    const request = pool.request();

    // Filter theo interviewer_id (HR chỉ thấy lịch do mình tạo)
    if (filters.interviewer_id) {
      query += ' AND i.interviewer_id = @interviewer_id';
      request.input('interviewer_id', sql.Int, filters.interviewer_id);
    }

    // Filter theo status
    if (filters.status) {
      query += ' AND i.status = @status';
      request.input('status', sql.NVarChar, filters.status);
    }

    // Filter theo application_id
    if (filters.application_id) {
      query += ' AND i.application_id = @application_id';
      request.input('application_id', sql.Int, filters.application_id);
    }

    // Filter theo method
    if (filters.method) {
      query += ' AND i.method = @method';
      request.input('method', sql.NVarChar, filters.method);
    }

    // Filter theo date range
    if (filters.from_date) {
      query += ' AND i.schedule_time >= @from_date';
      request.input('from_date', sql.DateTime, filters.from_date);
    }

    if (filters.to_date) {
      query += ' AND i.schedule_time <= @to_date';
      request.input('to_date', sql.DateTime, filters.to_date);
    }

    query += ' ORDER BY i.schedule_time ASC';

    const result = await request.query(query);
    return result.recordset;
  } catch (error) {
    console.error('Error in getAllInterviews:', error);
    throw error;
  }
}

// Lấy chi tiết 1 lịch phỏng vấn
export async function getInterviewById(id) {
  try {
    const pool = await connect();
    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .query(`
        SELECT 
          i.id,
          i.application_id,
          i.interviewer_id,
          i.schedule_time,
          i.method,
          i.location,
          i.notes,
          i.status,
          i.created_at,
          i.updated_at,
          a.candidate_id,
          a.job_id,
          a.cv_url,
          a.status as application_status,
          c.full_name as candidate_name,
          c.email as candidate_email,
          c.phone as candidate_phone,
          j.title as job_title,
          j.location as job_location,
          j.employer_id,
          e.full_name as interviewer_name,
          e.phone as interviewer_phone,
          e.role as interviewer_role
        FROM InterviewSchedule i
        LEFT JOIN Application a ON i.application_id = a.id
        LEFT JOIN Candidate c ON a.candidate_id = c.id
        LEFT JOIN JobPosting j ON a.job_id = j.id
        LEFT JOIN Employer e ON i.interviewer_id = e.id
        WHERE i.id = @id
      `);
    return result.recordset[0];
  } catch (error) {
    console.error('Error in getInterviewById:', error);
    throw error;
  }
}

// Cập nhật lịch phỏng vấn
export async function updateInterview(id, interviewData) {
  try {
    const pool = await connect();
    
    let updateFields = [];
    const request = pool.request().input('id', sql.Int, id);

    if (interviewData.schedule_time !== undefined) {
      updateFields.push('schedule_time = @schedule_time');
      request.input('schedule_time', sql.DateTime, interviewData.schedule_time);
    }

    if (interviewData.method !== undefined) {
      updateFields.push('method = @method');
      request.input('method', sql.NVarChar, interviewData.method);
    }

    if (interviewData.location !== undefined) {
      updateFields.push('location = @location');
      request.input('location', sql.NVarChar, interviewData.location);
    }

    if (interviewData.notes !== undefined) {
      updateFields.push('notes = @notes');
      request.input('notes', sql.NVarChar, interviewData.notes);
    }

    if (interviewData.status !== undefined) {
      updateFields.push('status = @status');
      request.input('status', sql.NVarChar, interviewData.status);
    }

    updateFields.push('updated_at = GETDATE()');

    if (updateFields.length === 0) {
      throw new Error('No fields to update');
    }

    const result = await request.query(`
      UPDATE InterviewSchedule
      SET ${updateFields.join(', ')}
      WHERE id = @id;
      
      SELECT * FROM InterviewSchedule WHERE id = @id;
    `);

    return result.recordset[0];
  } catch (error) {
    console.error('Error in updateInterview:', error);
    throw error;
  }
}

// Xóa lịch phỏng vấn
export async function deleteInterview(id) {
  try {
    const pool = await connect();
    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .query(`
        DELETE FROM InterviewSchedule
        WHERE id = @id
      `);
    return result.rowsAffected[0] > 0;
  } catch (error) {
    console.error('Error in deleteInterview:', error);
    throw error;
  }
}

// Lấy lịch phỏng vấn theo application_id
export async function getInterviewsByApplicationId(applicationId) {
  try {
    const pool = await connect();
    const result = await pool
      .request()
      .input('application_id', sql.Int, applicationId)
      .query(`
        SELECT 
          i.*,
          e.full_name as interviewer_name,
          e.phone as interviewer_phone
        FROM InterviewSchedule i
        LEFT JOIN Employer e ON i.interviewer_id = e.id
        WHERE i.application_id = @application_id
        ORDER BY i.schedule_time DESC
      `);
    return result.recordset;
  } catch (error) {
    console.error('Error in getInterviewsByApplicationId:', error);
    throw error;
  }
}

// Đếm số lịch phỏng vấn theo status
export async function countInterviewsByStatus(status) {
  try {
    const pool = await connect();
    const result = await pool
      .request()
      .input('status', sql.NVarChar, status)
      .query(`
        SELECT COUNT(*) as total
        FROM InterviewSchedule
        WHERE status = @status
      `);
    return result.recordset[0].total;
  } catch (error) {
    console.error('Error in countInterviewsByStatus:', error);
    throw error;
  }
}

// Lấy thống kê lịch phỏng vấn
export async function getInterviewStats(filters = {}) {
  try {
    const pool = await connect();
    const request = pool.request();

    let whereClause = 'WHERE 1=1';

    if (filters.interviewer_id) {
      whereClause += ' AND interviewer_id = @interviewer_id';
      request.input('interviewer_id', sql.Int, filters.interviewer_id);
    }

    const result = await request.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count,
        SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed_count,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_count,
        SUM(CASE WHEN status = 'canceled' THEN 1 ELSE 0 END) as canceled_count
      FROM InterviewSchedule
      ${whereClause}
    `);
    return result.recordset[0];
  } catch (error) {
    console.error('Error in getInterviewStats:', error);
    throw error;
  }
}
