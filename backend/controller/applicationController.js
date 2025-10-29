import {
  getAllApplications,
  getApplicationsByJobId,
  getApplicationsByCandidateId,
  getApplicationById,
  updateApplicationStatus as updateStatus,
  countApplicationsByJobId,
  countApplicationsByStatus as countByStatus,
  getCandidateById,
  createApplication,
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

// Lấy danh sách applications của candidate đang đăng nhập
export async function getMyCandidateApplications(req, res) {
  try {
    const candidateId = req.user?.id;

    if (!candidateId) {
      return res.status(401).json({
        success: false,
        message: 'Vui lòng đăng nhập!',
      });
    }

    const applications = await getApplicationsByCandidateId(candidateId);

    res.status(200).json({
      success: true,
      data: applications,
      message: 'Lấy danh sách hồ sơ đã ứng tuyển thành công!',
    });
  } catch (error) {
    console.error('Get my applications error:', error);
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

    // Validate status - theo ERD: submitted, reviewing, accepted, rejected
    const validStatuses = ['submitted', 'reviewing', 'accepted', 'rejected'];
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

// Nộp hồ sơ ứng tuyển
export async function submitApplication(req, res) {
  try {
    console.log('📝 Submit application request received');
    console.log('Body:', req.body);
    console.log('File:', req.file);
    
    const { jobId, candidateId, fullName, email, phone, coverLetter } = req.body;

    // Validate required fields
    if (!jobId || !candidateId) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin jobId hoặc candidateId!',
      });
    }

    // Lấy thông tin candidate từ database để verify
    const candidate = await getCandidateById(parseInt(candidateId));
    
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin ứng viên!',
      });
    }

    // Lấy CV URL từ file upload hoặc CV có sẵn của candidate
    let cvUrl = candidate.cv_url; // CV mặc định từ profile
    
    // Nếu có upload file mới
    if (req.file) {
      cvUrl = `/uploads/${req.file.filename}`;
      console.log('✅ File uploaded:', cvUrl);
    }

    if (!cvUrl) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng upload CV!',
      });
    }

    // Tạo application với chỉ các field có trong DB
    const applicationData = {
      job_id: parseInt(jobId),
      candidate_id: parseInt(candidateId),
      cv_url: cvUrl,
      status: 'submitted',
    };

    const application = await createApplication(applicationData);

    // Trả về response với đầy đủ thông tin (bao gồm cả info từ form)
    res.status(201).json({
      success: true,
      data: {
        applicationId: application.id,
        jobId: application.job_id,
        candidateId: application.candidate_id,
        candidateName: fullName || candidate.full_name,
        candidateEmail: email || candidate.email,
        candidatePhone: phone || candidate.phone,
        cvUrl: application.cv_url,
        status: application.status,
        submittedAt: application.submitted_at,
        coverLetter: coverLetter || null,
      },
      message: 'Nộp hồ sơ thành công!',
    });
  } catch (error) {
    console.error('Submit application error:', error);
    
    // Xử lý lỗi duplicate
    if (error.message.includes('đã ứng tuyển')) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Lỗi khi nộp hồ sơ!',
      error: error.message,
    });
  }
}
