import {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  updateJobStatus,
  deleteJob
} from '../repositories/jobRepository.js';

/**
 * Tạo tin tuyển dụng mới (Draft)
 */
export const createJobPost = async (req, res) => {
  try {
    const jobData = {
      ...req.body,
      employer_id: req.user?.id, // Lấy từ token đã verify
      status: 'draft' // Mặc định là draft
    };

    const job = await createJob(jobData);

    return res.status(201).json({
      success: true,
      message: 'Tạo tin tuyển dụng thành công! Tin đang ở trạng thái nháp.',
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

    // Kiểm tra quyền sở hữu (chỉ HR tạo tin mới được sửa)
    if (req.user.role === 'HR' && existingJob.employer_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền sửa tin này!'
      });
    }

    // Chỉ cho phép cập nhật nếu status KHÔNG phải pending
    if (existingJob.status === 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Không thể sửa tin đang chờ duyệt! Vui lòng chờ TPNS xử lý.'
      });
    }

    // Cho phép sửa tin đã đóng → sẽ chuyển về draft
    // Frontend sẽ gửi status: 'draft' trong req.body khi muốn mở lại tin

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
 * Gửi tin tuyển dụng để phê duyệt (HR)
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

    // Kiểm tra quyền sở hữu
    if (req.user.role === 'HR' && job.employer_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền gửi duyệt tin này!'
      });
    }

    // Chỉ cho phép gửi duyệt nếu status là draft hoặc reject
    if (!['draft', 'reject'].includes(job.status)) {
      return res.status(400).json({
        success: false,
        message: 'Chỉ có thể gửi duyệt tin ở trạng thái Nháp hoặc Bị từ chối!'
      });
    }

    const updatedJob = await updateJobStatus(id, 'pending');

    return res.status(200).json({
      success: true,
      message: 'Gửi tin tuyển dụng để phê duyệt thành công! Đang chờ TPNS xử lý.',
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
 * Phê duyệt tin tuyển dụng (TPNS only)
 */
export const approveJobPost = async (req, res) => {
  try {
    const { id } = req.params;
    
    const job = await getJobById(id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tin tuyển dụng!'
      });
    }

    // Chỉ cho phép duyệt nếu status là pending
    if (job.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Chỉ có thể duyệt tin đang ở trạng thái Chờ duyệt!'
      });
    }

    const updatedJob = await updateJobStatus(id, 'approve');

    return res.status(200).json({
      success: true,
      message: 'Phê duyệt tin tuyển dụng thành công! Tin đã được công khai.',
      data: updatedJob
    });

  } catch (error) {
    console.error('Approve job error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi phê duyệt tin tuyển dụng!',
      error: error.message
    });
  }
};

/**
 * Từ chối tin tuyển dụng (TPNS only)
 */
export const rejectJobPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body; // Lý do từ chối (optional)
    
    const job = await getJobById(id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tin tuyển dụng!'
      });
    }

    // Chỉ cho phép từ chối nếu status là pending
    if (job.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Chỉ có thể từ chối tin đang ở trạng thái Chờ duyệt!'
      });
    }

    const updatedJob = await updateJobStatus(id, 'reject', reason);

    return res.status(200).json({
      success: true,
      message: 'Từ chối tin tuyển dụng thành công!',
      data: updatedJob
    });

  } catch (error) {
    console.error('Reject job error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi từ chối tin tuyển dụng!',
      error: error.message
    });
  }
};

/**
 * Đóng tin tuyển dụng (HR - chủ sở hữu tin)
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

    // Kiểm tra quyền sở hữu (chỉ HR tạo tin mới được đóng)
    if (req.user.role === 'HR' && job.employer_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền đóng tin này!'
      });
    }

    // Chỉ cho phép đóng nếu status là approve
    if (job.status !== 'approve') {
      return res.status(400).json({
        success: false,
        message: 'Chỉ có thể đóng tin đã được phê duyệt!'
      });
    }

    const updatedJob = await updateJobStatus(id, 'close');

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
