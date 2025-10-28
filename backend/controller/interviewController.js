import * as interviewRepo from '../repositories/interviewRepository.js';
import * as applicationRepo from '../repositories/applicationRepository.js';
import nodemailer from 'nodemailer';

/**
 * Controller để quản lý InterviewSchedule
 */

// Helper function: Tạo email transporter
const createTransporter = () => {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
  return null;
};

// Helper function: Gửi email mời phỏng vấn
const sendInterviewEmail = async (interviewData, application, senderName) => {
  try {
    let transporter = createTransporter();

    // Nếu chưa cấu hình email, tạo test account
    if (!transporter) {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransporter({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    const methodText = {
      online: 'Trực tuyến (Video call)',
      offline: 'Tại văn phòng'
    };

    // HTML template cho email mời phỏng vấn
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .info-row { display: flex; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
          .info-row:last-child { border-bottom: none; }
          .info-label { font-weight: bold; width: 150px; color: #667eea; }
          .info-value { flex: 1; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .highlight { background: #fef3c7; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #f59e0b; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">🎉 Thư mời phỏng vấn</h1>
            <p style="margin: 10px 0 0 0;">PDD Tuyển Dụng</p>
          </div>
          <div class="content">
            <p>Kính gửi <strong>${application.candidate_name}</strong>,</p>
            <p>Chúng tôi rất vui mừng thông báo rằng hồ sơ của bạn đã được chọn vào vòng phỏng vấn cho vị trí:</p>
            <div class="highlight">
              <h3 style="margin: 0; color: #f59e0b;">📋 ${application.job_title}</h3>
            </div>
            
            <div class="info-box">
              <h3 style="margin-top: 0; color: #667eea;">📅 Thông tin buổi phỏng vấn</h3>
              <div class="info-row">
                <div class="info-label">Thời gian:</div>
                <div class="info-value">${new Date(interviewData.schedule_time).toLocaleString('vi-VN', { 
                  dateStyle: 'full', 
                  timeStyle: 'short' 
                })}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Hình thức:</div>
                <div class="info-value">${methodText[interviewData.method] || interviewData.method}</div>
              </div>
              ${interviewData.location ? `
              <div class="info-row">
                <div class="info-label">${interviewData.method === 'online' ? 'Link meeting:' : 'Địa điểm:'}</div>
                <div class="info-value">${interviewData.location}</div>
              </div>
              ` : ''}
              ${interviewData.notes ? `
              <div class="info-row">
                <div class="info-label">Ghi chú:</div>
                <div class="info-value">${interviewData.notes}</div>
              </div>
              ` : ''}
            </div>

            <p><strong>Vui lòng xác nhận tham dự qua email hoặc điện thoại trong vòng 24 giờ.</strong></p>
            <p>Nếu bạn có bất kỳ thắc mắc nào, đừng ngần ngại liên hệ với chúng tôi.</p>
            
            <p>Chúc bạn may mắn!<br><strong>${senderName}</strong></p>
            
            <div class="footer">
              <p>Email này được gửi từ hệ thống PDD Tuyển Dụng</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const info = await transporter.sendMail({
      from: `"${senderName}" <${process.env.EMAIL_USER || 'noreply@pdd-recruitment.com'}>`,
      to: application.candidate_email,
      subject: `[PDD Tuyển Dụng] Thư mời phỏng vấn - ${application.job_title}`,
      html: htmlContent,
    });

    console.log('Interview invitation sent:', info.messageId);
    
    // Trả về preview URL nếu dùng test email
    const previewURL = nodemailer.getTestMessageUrl(info);
    return {
      success: true,
      messageId: info.messageId,
      previewURL: previewURL || null
    };
  } catch (error) {
    console.error('Error sending interview email:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

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
      status: 'pending' // Trạng thái mặc định
    };

    const interview = await interviewRepo.createInterview(interviewData);

    // Gửi email thông báo cho ứng viên
    const senderName = req.user.full_name || 'PDD Tuyển Dụng';
    const emailResult = await sendInterviewEmail(interviewData, application, senderName);

    res.status(201).json({
      success: true,
      message: emailResult.success 
        ? 'Tạo lịch phỏng vấn và gửi email thành công' 
        : 'Tạo lịch phỏng vấn thành công nhưng gửi email thất bại',
      data: interview,
      emailSent: emailResult.success,
      emailPreview: emailResult.previewURL || null
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
