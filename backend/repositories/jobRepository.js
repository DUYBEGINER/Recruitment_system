import sql from 'mssql';
import {connect} from '../config/db.js';

/**
 * Tạo tin tuyển dụng mới
 */
export const createJob = async (jobData) => {
  try {
    const pool = await connect();
    const result = await pool.request()
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
      .input('status', sql.NVarChar, jobData.status || 'PENDING')
      .input('createdBy', sql.Int, jobData.createdBy)
      .query(`
        INSERT INTO JobPosts (
          title, description, requirements, benefits,
          location, employmentType, experienceLevel,
          salaryMin, salaryMax, numberOfPositions,
          deadline, contactEmail, contactPhone,
          status, createdBy, createdAt
        )
        OUTPUT INSERTED.*
        VALUES (
          @title, @description, @requirements, @benefits,
          @location, @employmentType, @experienceLevel,
          @salaryMin, @salaryMax, @numberOfPositions,
          @deadline, @contactEmail, @contactPhone,
          @status, @createdBy, GETDATE()
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
export const getAllJobs = async (filters = {}) => {
  try {
    const pool = await connect();
    let query = `
      SELECT 
        id, title, description, requirements, benefits,
        location, employmentType, experienceLevel,
        salaryMin, salaryMax, numberOfPositions,
        deadline, contactEmail, contactPhone,
        status, createdBy, createdAt, updatedAt,
        (SELECT COUNT(*) FROM Applications WHERE jobId = JobPosts.id) as applications
      FROM JobPosts
      WHERE 1=1
    `;

    const request = pool.request();

    // Filter by status
    if (filters.status && filters.status !== 'ALL') {
      query += ' AND status = @status';
      request.input('status', sql.NVarChar, filters.status);
    }

    // Search by title or location
    if (filters.search) {
      query += ' AND (title LIKE @search OR location LIKE @search)';
      request.input('search', sql.NVarChar, `%${filters.search}%`);
    }

    // Filter by createdBy (for HR user)
    if (filters.createdBy) {
      query += ' AND createdBy = @createdBy';
      request.input('createdBy', sql.Int, filters.createdBy);
    }

    query += ' ORDER BY createdAt DESC';

    const result = await request.query(query);
    return result.recordset;
  } catch (error) {
    console.error('Error getting jobs:', error);
    throw error;
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
          id, title, description, requirements, benefits,
          location, employmentType, experienceLevel,
          salaryMin, salaryMax, numberOfPositions,
          deadline, contactEmail, contactPhone,
          status, createdBy, createdAt, updatedAt,
          (SELECT COUNT(*) FROM Applications WHERE jobId = JobPosts.id) as applications
        FROM JobPosts
        WHERE id = @id
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
        DELETE FROM JobPosts
        OUTPUT DELETED.*
        WHERE id = @id
      `);
    
    return result.recordset[0];
  } catch (error) {
    console.error('Error deleting job:', error);
    throw error;
  }
};
