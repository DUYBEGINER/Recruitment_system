import sql from 'mssql';
import {connect} from '../config/db.js';

/**
 * Tạo tin tuyển dụng mới
 */
export const createJob = async (jobData) => {
  try {
    const pool = await connect();
    const result = await pool.request()
      .input('employer_id', sql.Int, jobData.employer_id)
      .input('title', sql.NVarChar, jobData.title)
      .input('location', sql.NVarChar, jobData.location)
      .input('job_type', sql.NVarChar, jobData.job_type)
      .input('level', sql.NVarChar, jobData.level)
      .input('description', sql.NVarChar, jobData.description)
      .input('requirements', sql.NVarChar, jobData.requirements)
      .input('benefits', sql.NVarChar, jobData.benefits)
      .input('salary_min', sql.Decimal(18, 2), jobData.salary_min)
      .input('salary_max', sql.Decimal(18, 2), jobData.salary_max)
      .input('quantity', sql.Int, jobData.quantity)
      .input('deadline', sql.Date, jobData.deadline)
      .input('contact_email', sql.NVarChar, jobData.contact_email)
      .input('contact_phone', sql.NVarChar, jobData.contact_phone)
      .input('status', sql.NVarChar, jobData.status || 'draft')
      .query(`
        INSERT INTO JobPosting (
          employer_id, title, location, job_type, level,
          description, requirements, benefits,
          salary_min, salary_max, quantity,
          deadline, contact_email, contact_phone,
          status, created_at
        )
        OUTPUT INSERTED.*
        VALUES (
          @employer_id, @title, @location, @job_type, @level,
          @description, @requirements, @benefits,
          @salary_min, @salary_max, @quantity,
          @deadline, @contact_email, @contact_phone,
          @status, GETDATE()
        )
      `);

    return result.recordset[0];
  } catch (error) {
    console.error('Error creating job:', error);
    throw error;
  }
};

export const getAllJobsFiltered = async (filters = {}) => {
  try {
    const pool = await connect();
    let query = `
      SELECT 
        jp.*,
        e.full_name as employer_name,
        e.role as employer_role
      FROM JobPosting jp
      LEFT JOIN Employer e ON jp.employer_id = e.id
      WHERE 1=1
    `;

    const request = pool.request();

    // Filter by status
    if (filters.status && filters.status !== 'ALL') {
      query += ' AND jp.status = @status';
      request.input('status', sql.NVarChar, filters.status);
    }

    // Search by title or location
    if (filters.search) {
      query += ' AND (jp.title LIKE @search OR jp.location LIKE @search)';
      request.input('search', sql.NVarChar, `%${filters.search}%`);
    }

    // Filter by employer_id (for HR user)
    if (filters.employer_id) {
      query += ' AND jp.employer_id = @employer_id';
      request.input('employer_id', sql.Int, filters.employer_id);
    }

    query += ' ORDER BY jp.created_at DESC';

    const result = await request.query(query);
    return result.recordset;
  } catch (error) {
    console.error('Error getting jobs:', error);
    throw error;
  }
};

/**
 * Lấy danh sách tin tuyển dụng
 */
// DDUy start

export const getAllJobs = async () => {
  try {
    const pool = await connect();
    const result = await pool.request().query(`
      SELECT * FROM JobPosting
      WHERE status= 'approve'
      ORDER BY created_at DESC
    `);
    return result.recordset;
  } catch (error) {
    console.error('❌ Error in getAllJobs:', error);
    throw error; // Đẩy lỗi lên controller xử lý
  }
};


/**
 * Lấy tin tuyển dụng theo ID
 */
export const getJobById = async (id) => {
  try {
    const pool = await connect();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT 
          jp.id,
          jp.title,
          jp.description,
          jp.requirements,
          jp.benefits,
          jp.location,
          jp.job_type AS employmentType,
          jp.level AS experienceLevel,
          jp.salary_min AS salaryMin,
          jp.salary_max AS salaryMax,
          jp.quantity AS numberOfPositions,
          jp.deadline,
          jp.contact_email AS contactEmail,
          jp.contact_phone AS contactPhone,
          jp.status,
          jp.created_at AS createdAt,
          jp.updated_at AS updatedAt,
          NULL AS companyName, 
          NULL AS companyLogo,
          (SELECT COUNT(*) FROM Application a WHERE a.job_id = jp.id) AS applications
        FROM JobPosting jp
        WHERE jp.id = @id
      `);

    return result.recordset[0];
  } catch (error) {
    console.error('Error getting job by id:', error);
    throw error;
  }
};
// DDuy end

export const getJobByEmployerId = async (id) => {
  try {
    const pool = await connect();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT 
          jp.*,
          e.full_name as employer_name,
          e.role as employer_role,
          e.phone as employer_phone
        FROM JobPosting jp
        LEFT JOIN Employer e ON jp.employer_id = e.id
        WHERE jp.id = @id
      `);
    
    return result.recordset[0];
  } catch (error) {
    console.error('Error getting job by id:', error);
    throw error;
  }
};

/**
 * Cập nhật tin tuyển dụng
 */
export const updateJob = async (id, jobData) => {
  try {
    const pool = await connect();
    const request = pool.request()
      .input('id', sql.Int, id)
      .input('title', sql.NVarChar, jobData.title)
      .input('location', sql.NVarChar, jobData.location)
      .input('job_type', sql.NVarChar, jobData.job_type)
      .input('level', sql.NVarChar, jobData.level)
      .input('description', sql.NVarChar, jobData.description)
      .input('requirements', sql.NVarChar, jobData.requirements)
      .input('benefits', sql.NVarChar, jobData.benefits)
      .input('salary_min', sql.Decimal(18, 2), jobData.salary_min)
      .input('salary_max', sql.Decimal(18, 2), jobData.salary_max)
      .input('quantity', sql.Int, jobData.quantity)
      .input('deadline', sql.Date, jobData.deadline)
      .input('contact_email', sql.NVarChar, jobData.contact_email)
      .input('contact_phone', sql.NVarChar, jobData.contact_phone);

    let query = `
      UPDATE JobPosting
      SET 
        title = @title,
        location = @location,
        job_type = @job_type,
        level = @level,
        description = @description,
        requirements = @requirements,
        benefits = @benefits,
        salary_min = @salary_min,
        salary_max = @salary_max,
        quantity = @quantity,
        deadline = @deadline,
        contact_email = @contact_email,
        contact_phone = @contact_phone,
        updated_at = GETDATE()
    `;

    // Nếu có status trong jobData thì cập nhật luôn (cho phép close → draft)
    if (jobData.status) {
      request.input('status', sql.NVarChar, jobData.status);
      query += `, status = @status`;
    }

    query += `
      OUTPUT INSERTED.*
      WHERE id = @id
    `;

    const result = await request.query(query);
    
    return result.recordset[0];
  } catch (error) {
    console.error('Error updating job:', error);
    throw error;
  }
};

/**
 * Cập nhật trạng thái tin tuyển dụng
 */
export const updateJobStatus = async (id, status, reason = null) => {
  try {
    const pool = await connect();
    
    let query = `
      UPDATE JobPosting
      SET status = @status, updated_at = GETDATE()
    `;
    
    // Nếu là từ chối thì có thể lưu lý do (cần thêm cột reject_reason)
    if (status === 'reject' && reason) {
      query += `, reject_reason = @reason`;
    }
    
    query += `
      OUTPUT INSERTED.*
      WHERE id = @id
    `;
    
    const request = pool.request()
      .input('id', sql.Int, id)
      .input('status', sql.NVarChar, status);
    
    if (status === 'reject' && reason) {
      request.input('reason', sql.NVarChar, reason);
    }
    
    const result = await request.query(query);
    return result.recordset[0];
  } catch (error) {
    console.error('Error updating job status:', error);
    throw error;
  }
};

/**
 * Xóa tin tuyển dụng
 */
export const deleteJob = async (id) => {
  try {
    const pool = await connect();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        DELETE FROM JobPosting
        OUTPUT DELETED.*
        WHERE id = @id
      `);
    
    return result.recordset[0];
  } catch (error) {
    console.error('Error deleting job:', error);
    throw error;
  }
};
