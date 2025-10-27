import {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  updateJobStatus,
  deleteJob
} from '../repositories/jobRepository.js';

/**
 * Tạo tin tuyển dụng mới
 */
export const createJobPost = async (req, res) => {
  try {
    const jobData = {
      ...req.body,
      createdBy: req.user?.id || 1, // TODO: Lấy từ token
      status: 'PENDING' // Mặc định là chờ duyệt
    };

    const job = await createJob(jobData);

    return res.status(201).json({
      success: true,
      message: 'Tạo tin tuyển dụng thành công! Đang chờ phê duyệt.',
      data: job
    });

  } catch (error) {
    console.error('Create job error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo tin tuyển dụng!',
      error: error.message
    });
  }
};

/**
 * Lấy danh sách tin tuyển dụng
 */
export const getJobPosts = async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      search: req.query.q,
      createdBy: req.query.createdBy
    };

    const jobs = await getAllJobs(filters);

    return res.status(200).json({
      success: true,
      data: jobs
    });

  } catch (error) {
    console.error('Get jobs error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách tin tuyển dụng!',
      error: error.message
    });
  }
};

/**
 * Lấy thông tin tin tuyển dụng theo ID
 */
export const getJobPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await getJobById(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tin tuyển dụng!'
      });
    }

    return res.status(200).json({
      success: true,
      data: job
    });

  } catch (error) {
    console.error('Get job by id error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin tin tuyển dụng!',
      error: error.message
    });
  }
};

/**
 * Cập nhật tin tuyển dụng
 */
export const updateJobPost = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Kiểm tra tin tuyển dụng có tồn tại không
    const existingJob = await getJobById(id);
    if (!existingJob) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tin tuyển dụng!'
      });
    }

    // Chỉ cho phép cập nhật nếu status là DRAFT hoặc REJECTED
    if (!['DRAFT', 'REJECTED', 'PUBLISHED'].includes(existingJob.status)) {
      return res.status(400).json({
        success: false,
        message: 'Không thể cập nhật tin tuyển dụng ở trạng thái hiện tại!'
      });
    }

    const updatedJob = await updateJob(id, req.body);

    return res.status(200).json({
      success: true,
      message: 'Cập nhật tin tuyển dụng thành công!',
      data: updatedJob
    });

  } catch (error) {
    console.error('Update job error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật tin tuyển dụng!',
      error: error.message
    });
  }
};

/**
 * Gửi tin tuyển dụng để phê duyệt
 */
export const submitForApproval = async (req, res) => {
  try {
    const { id } = req.params;
    
    const job = await getJobById(id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tin tuyển dụng!'
      });
    }

    // Chỉ cho phép gửi duyệt nếu status là DRAFT hoặc REJECTED
    if (!['DRAFT', 'REJECTED'].includes(job.status)) {
      return res.status(400).json({
        success: false,
        message: 'Chỉ có thể gửi duyệt tin tuyển dụng ở trạng thái Nháp hoặc Bị từ chối!'
      });
    }

    const updatedJob = await updateJobStatus(id, 'PENDING');

    return res.status(200).json({
      success: true,
      message: 'Gửi tin tuyển dụng để phê duyệt thành công!',
      data: updatedJob
    });

  } catch (error) {
    console.error('Submit for approval error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi gửi tin tuyển dụng!',
      error: error.message
    });
  }
};

/**
 * Đóng tin tuyển dụng
 */
export const closeJobPost = async (req, res) => {
  try {
    const { id } = req.params;
    
    const job = await getJobById(id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tin tuyển dụng!'
      });
    }

    // Chỉ cho phép đóng nếu status là PUBLISHED
    if (job.status !== 'PUBLISHED') {
      return res.status(400).json({
        success: false,
        message: 'Chỉ có thể đóng tin tuyển dụng đang public!'
      });
    }

    const updatedJob = await updateJobStatus(id, 'CLOSED');

    return res.status(200).json({
      success: true,
      message: 'Đóng tin tuyển dụng thành công!',
      data: updatedJob
    });

  } catch (error) {
    console.error('Close job error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi đóng tin tuyển dụng!',
      error: error.message
    });
  }
};

/**
 * Xóa tin tuyển dụng
 */
export const deleteJobPost = async (req, res) => {
  try {
    const { id } = req.params;
    
    const job = await getJobById(id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tin tuyển dụng!'
      });
    }

    await deleteJob(id);

    return res.status(200).json({
      success: true,
      message: 'Xóa tin tuyển dụng thành công!'
    });

  } catch (error) {
    console.error('Delete job error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa tin tuyển dụng!',
      error: error.message
    });
  }
};
