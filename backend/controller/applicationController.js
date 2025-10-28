import {
  getAllApplications,
  getApplicationsByJobId,
  getApplicationById,
  updateApplicationStatus as updateStatus,
  countApplicationsByJobId,
  countApplicationsByStatus as countByStatus,
  createApplication,
  checkExistingApplication,
} from '../repositories/applicationRepository.js';
import { getCandidateByEmail, createCandidate } from '../repositories/candidateRepository.js';

/**
 * Controller để quản lý Applications (hồ sơ ứng tuyển)
 */

// Lấy danh sách applications
export async function getApplications(req, res) {
  try {
    const { job_id, status, employer_id } = req.query;
    const userRole = req.user?.role;
    const userId = req.user?.id;

    const filters = {};

    // Nếu có job_id thì filter theo job_id
    if (job_id) {
      filters.job_id = parseInt(job_id);
    }

    // Nếu có status thì filter theo status
    if (status) {
      filters.status = status;
    }

    // HR chỉ xem applications của jobs mình tạo
    if (userRole === 'HR') {
      filters.employer_id = userId;
    } else if (employer_id) {
      // TPNS có thể filter theo employer_id
      filters.employer_id = parseInt(employer_id);
    }

    const applications = await getAllApplications(filters);

    res.status(200).json({
      success: true,
      data: applications,
      message: 'Lấy danh sách hồ sơ thành công!',
    });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách hồ sơ!',
      error: error.message,
    });
  }
}

// Lấy danh sách applications theo job_id
export async function getApplicationsByJob(req, res) {
  try {
    const { jobId } = req.params;
    const userRole = req.user?.role;

    // Kiểm tra quyền: HR chỉ xem applications của job mình tạo
    if (userRole === 'HR') {
      // TODO: Kiểm tra job có thuộc về HR này không
      // Tạm thời bỏ qua, sẽ check ở frontend
    }

    const applications = await getApplicationsByJobId(parseInt(jobId));

    res.status(200).json({
      success: true,
      data: applications,
      message: 'Lấy danh sách hồ sơ thành công!',
    });
  } catch (error) {
    console.error('Get applications by job error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách hồ sơ!',
      error: error.message,
    });
  }
}

// Lấy chi tiết 1 application
export async function getApplicationDetail(req, res) {
  try {
    const { id } = req.params;
    const application = await getApplicationById(parseInt(id));

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hồ sơ!',
      });
    }

    res.status(200).json({
      success: true,
      data: application,
      message: 'Lấy chi tiết hồ sơ thành công!',
    });
  } catch (error) {
    console.error('Get application detail error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy chi tiết hồ sơ!',
      error: error.message,
    });
  }
}

// Cập nhật trạng thái application
export async function updateApplicationStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['pending', 'reviewing', 'shortlisted', 'interviewed', 'accepted', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Trạng thái không hợp lệ! Chỉ chấp nhận: ${validStatuses.join(', ')}`,
      });
    }

    const updated = await updateStatus(parseInt(id), status);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hồ sơ!',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Cập nhật trạng thái hồ sơ thành công!',
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật trạng thái hồ sơ!',
      error: error.message,
    });
  }
}

// Đếm số lượng applications theo job
export async function countApplications(req, res) {
  try {
    const { jobId } = req.params;
    const { status } = req.query;

    let count;
    if (status) {
      count = await countByStatus(parseInt(jobId), status);
    } else {
      count = await countApplicationsByJobId(parseInt(jobId));
    }

    res.status(200).json({
      success: true,
      data: { count },
      message: 'Đếm số lượng hồ sơ thành công!',
    });
  } catch (error) {
    console.error('Count applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi đếm số lượng hồ sơ!',
      error: error.message,
    });
  }
}

// Nộp hồ sơ ứng tuyển (cho candidate)
export async function submitApplication(req, res) {
  try {
    const { jobId, fullName, email, phone, coverLetter } = req.body;
    const cvFile = req.file;

    // Validate
    if (!jobId || !fullName || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin!',
      });
    }

    if (!cvFile) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng tải lên CV!',
      });
    }

    // Kiểm tra xem candidate đã tồn tại chưa (theo email)
    let candidate = await getCandidateByEmail(email);
    
    // Nếu chưa tồn tại, tạo mới candidate
    if (!candidate) {
      const candidateData = {
        full_name: fullName,
        email: email,
        phone: phone,
      };
      candidate = await createCandidate(candidateData);
    }

    // Kiểm tra xem đã ứng tuyển vị trí này chưa
    const existingApplication = await checkExistingApplication(candidate.id, parseInt(jobId));
    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'Bạn đã ứng tuyển vị trí này rồi!',
      });
    }

    // Tạo application mới
    const cvUrl = `/uploads/${cvFile.filename}`;
    const applicationData = {
      job_id: parseInt(jobId),
      candidate_id: candidate.id,
      cv_url: cvUrl,
      status: 'submitted',
      cover_letter: coverLetter || null,
    };

    const application = await createApplication(applicationData);

    res.status(201).json({
      success: true,
      data: application,
      message: 'Nộp hồ sơ thành công! Chúng tôi sẽ liên hệ với bạn sớm.',
    });
  } catch (error) {
    console.error('Submit application error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi nộp hồ sơ!',
      error: error.message,
    });
  }
}
