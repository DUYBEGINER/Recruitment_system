import * as interviewRepo from '../repositories/interviewRepository.js';
import * as applicationRepo from '../repositories/applicationRepository.js';

/**
 * Controller để quản lý InterviewSchedule
 */

// Tạo lịch phỏng vấn mới
export const createInterview = async (req, res) => {
  try {
    const { application_id, schedule_time, method, location, notes } = req.body;
    
    // Validate required fields
    if (!application_id || !schedule_time || !method) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ thông tin: application_id, schedule_time, method'
      });
    }

    // Kiểm tra application có tồn tại không
    const application = await applicationRepo.getApplicationById(application_id);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hồ sơ ứng tuyển'
      });
    }

    // Nếu là HR, kiểm tra quyền (chỉ lập lịch cho job do mình quản lý)
    if (req.user.role === 'HR' && application.employer_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền tạo lịch phỏng vấn cho hồ sơ này'
      });
    }

    // Tạo lịch phỏng vấn
    const interviewData = {
      application_id,
      interviewer_id: req.user.id, // Người tạo lịch
      schedule_time,
      method,
      location,
      notes,
      status: 'scheduled'
    };

    const interview = await interviewRepo.createInterview(interviewData);

    res.status(201).json({
      success: true,
      message: 'Tạo lịch phỏng vấn thành công',
      data: interview
    });
  } catch (error) {
    console.error('Error in createInterview:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo lịch phỏng vấn',
      error: error.message
    });
  }
};

// Lấy danh sách lịch phỏng vấn
export const getInterviews = async (req, res) => {
  try {
    const { status, method, from_date, to_date, application_id } = req.query;
    
    const filters = {
      status,
      method,
      from_date,
      to_date,
      application_id: application_id ? parseInt(application_id) : undefined
    };

    // Nếu là HR, chỉ xem lịch do mình tạo
    if (req.user.role === 'HR') {
      filters.interviewer_id = req.user.id;
    }

    const interviews = await interviewRepo.getAllInterviews(filters);

    res.json({
      success: true,
      message: 'Lấy danh sách lịch phỏng vấn thành công',
      data: interviews
    });
  } catch (error) {
    console.error('Error in getInterviews:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách lịch phỏng vấn',
      error: error.message
    });
  }
};

// Lấy chi tiết lịch phỏng vấn
export const getInterviewDetail = async (req, res) => {
  try {
    const { id } = req.params;
    
    const interview = await interviewRepo.getInterviewById(parseInt(id));
    
    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy lịch phỏng vấn'
      });
    }

    // Kiểm tra quyền (HR chỉ xem lịch do mình tạo hoặc của job mình quản lý)
    if (req.user.role === 'HR' && 
        interview.interviewer_id !== req.user.id && 
        interview.employer_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xem lịch phỏng vấn này'
      });
    }

    res.json({
      success: true,
      message: 'Lấy chi tiết lịch phỏng vấn thành công',
      data: interview
    });
  } catch (error) {
    console.error('Error in getInterviewDetail:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy chi tiết lịch phỏng vấn',
      error: error.message
    });
  }
};

// Cập nhật lịch phỏng vấn
export const updateInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const { schedule_time, method, location, notes, status } = req.body;
    
    const existingInterview = await interviewRepo.getInterviewById(parseInt(id));
    
    if (!existingInterview) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy lịch phỏng vấn'
      });
    }

    // Kiểm tra quyền (HR chỉ sửa lịch do mình tạo)
    if (req.user.role === 'HR' && existingInterview.interviewer_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền cập nhật lịch phỏng vấn này'
      });
    }

    const updateData = {
      schedule_time,
      method,
      location,
      notes,
      status
    };

    const updatedInterview = await interviewRepo.updateInterview(parseInt(id), updateData);

    res.json({
      success: true,
      message: 'Cập nhật lịch phỏng vấn thành công',
      data: updatedInterview
    });
  } catch (error) {
    console.error('Error in updateInterview:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật lịch phỏng vấn',
      error: error.message
    });
  }
};

// Xóa lịch phỏng vấn
export const deleteInterview = async (req, res) => {
  try {
    const { id } = req.params;
    
    const existingInterview = await interviewRepo.getInterviewById(parseInt(id));
    
    if (!existingInterview) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy lịch phỏng vấn'
      });
    }

    // Kiểm tra quyền (HR chỉ xóa lịch do mình tạo)
    if (req.user.role === 'HR' && existingInterview.interviewer_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xóa lịch phỏng vấn này'
      });
    }

    await interviewRepo.deleteInterview(parseInt(id));

    res.json({
      success: true,
      message: 'Xóa lịch phỏng vấn thành công'
    });
  } catch (error) {
    console.error('Error in deleteInterview:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa lịch phỏng vấn',
      error: error.message
    });
  }
};

// Lấy thống kê lịch phỏng vấn
export const getInterviewStats = async (req, res) => {
  try {
    const filters = {};

    // Nếu là HR, chỉ xem stats của mình
    if (req.user.role === 'HR') {
      filters.interviewer_id = req.user.id;
    }

    const stats = await interviewRepo.getInterviewStats(filters);

    res.json({
      success: true,
      message: 'Lấy thống kê thành công',
      data: stats
    });
  } catch (error) {
    console.error('Error in getInterviewStats:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê',
      error: error.message
    });
  }
};

// Lấy lịch phỏng vấn theo application_id
export const getInterviewsByApplication = async (req, res) => {
  try {
    const { application_id } = req.params;
    
    const interviews = await interviewRepo.getInterviewsByApplicationId(parseInt(application_id));

    res.json({
      success: true,
      message: 'Lấy lịch phỏng vấn thành công',
      data: interviews
    });
  } catch (error) {
    console.error('Error in getInterviewsByApplication:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy lịch phỏng vấn',
      error: error.message
    });
  }
};
