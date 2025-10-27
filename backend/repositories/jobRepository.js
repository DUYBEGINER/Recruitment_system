import sql from 'mssql';
import {connect} from '../config/db.js';

/**
 * Tạo tin tuyển dụng mới
 */
export const createJob = async (jobData) => {
  try {
    const pool = await connect();
    const result = await pool.request()
      .input('employer_id', sql.Int, jobData.employerId || null)
      .input('title', sql.NVarChar, jobData.title)
      .input('location', sql.NVarChar, jobData.location)
      .input('job_type', sql.NVarChar, jobData.jobType)
      .input('level', sql.NVarChar, jobData.level)
      .input('description', sql.NVarChar, jobData.description)
      .input('requirements', sql.NVarChar, jobData.requirements)
      .input('benefits', sql.NVarChar, jobData.benefits)
      .input('salary_min', sql.Decimal(18, 2), jobData.salaryMin || 0)
      .input('salary_max', sql.Decimal(18, 2), jobData.salaryMax || 0)
      .input('quantity', sql.Int, jobData.quantity || 1)
      .input('deadline', sql.Date, jobData.deadline)
      .input('contact_email', sql.NVarChar, jobData.contactEmail)
      .input('contact_phone', sql.NVarChar, jobData.contactPhone)
      .input('status', sql.NVarChar, jobData.status || 'PENDING')
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

/**
 * Cập nhật tin tuyển dụng
 */
export const updateJob = async (id, jobData) => {
  try {
    const pool = await connect();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('title', sql.NVarChar, jobData.title)
      .input('description', sql.NVarChar, jobData.description)
      .input('requirements', sql.NVarChar, jobData.requirements)
      .input('benefits', sql.NVarChar, jobData.benefits)
      .input('location', sql.NVarChar, jobData.location)
      .input('employmentType', sql.NVarChar, jobData.employmentType)
      .input('experienceLevel', sql.NVarChar, jobData.experienceLevel)
      .input('salaryMin', sql.Decimal(18, 2), jobData.salaryMin)
      .input('salaryMax', sql.Decimal(18, 2), jobData.salaryMax)
      .input('numberOfPositions', sql.Int, jobData.numberOfPositions)
      .input('deadline', sql.Date, jobData.deadline)
      .input('contactEmail', sql.NVarChar, jobData.contactEmail)
      .input('contactPhone', sql.NVarChar, jobData.contactPhone)
      .query(`
        UPDATE JobPosts
        SET 
          title = @title,
          description = @description,
          requirements = @requirements,
          benefits = @benefits,
          location = @location,
          employmentType = @employmentType,
          experienceLevel = @experienceLevel,
          salaryMin = @salaryMin,
          salaryMax = @salaryMax,
          numberOfPositions = @numberOfPositions,
          deadline = @deadline,
          contactEmail = @contactEmail,
          contactPhone = @contactPhone,
          updatedAt = GETDATE()
        OUTPUT INSERTED.*
        WHERE id = @id
      `);
    
    return result.recordset[0];
  } catch (error) {
    console.error('Error updating job:', error);
    throw error;
  }
};

/**
 * Cập nhật trạng thái tin tuyển dụng
 */
export const updateJobStatus = async (id, status) => {
  try {
    const pool = await connect();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('status', sql.NVarChar, status)
      .query(`
        UPDATE JobPosts
        SET status = @status, updatedAt = GETDATE()
        OUTPUT INSERTED.*
        WHERE id = @id
      `);
    
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

