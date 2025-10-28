import nodemailer from 'nodemailer';

/**
 * Email Controller - Gửi email cho ứng viên
 */

// Cấu hình transporter (sử dụng Gmail hoặc SMTP server khác)
const createTransporter = () => {
  // Nếu có cấu hình email trong .env, dùng nó
  if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    return nodemailer.createTransport({
      service: 'gmail', // Hoặc 'outlook', 'yahoo', etc.
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD, // App password nếu dùng Gmail
      },
    });
  }
  
  // Fallback: Dùng Ethereal Email (test email - không gửi thật)
  // Để test, truy cập https://ethereal.email để xem email
  return null;
};

/**
 * Gửi email cho ứng viên
 */
export const sendEmailToCandidate = async (req, res) => {
  try {
    const { to, subject, message, candidateName } = req.body;
    const senderName = req.user?.full_name || 'PDD Tuyển Dụng';

    // Validate
    if (!to || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ thông tin: email người nhận, tiêu đề, nội dung'
      });
    }

    // Kiểm tra email hợp lệ
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return res.status(400).json({
        success: false,
        message: 'Email không hợp lệ'
      });
    }

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

    // HTML email template
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
          .message { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">PDD Tuyển Dụng</h1>
            <p style="margin: 10px 0 0 0;">Hệ thống quản lý tuyển dụng</p>
          </div>
          <div class="content">
            <p>Xin chào ${candidateName || 'bạn'},</p>
            <div class="message">
              ${message.replace(/\n/g, '<br>')}
            </div>
            <p>Trân trọng,<br><strong>${senderName}</strong></p>
            <div class="footer">
              <p>Email này được gửi từ hệ thống PDD Tuyển Dụng</p>
              <p>Vui lòng không trả lời email này</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Gửi email
    const info = await transporter.sendMail({
      from: `"${senderName}" <${process.env.EMAIL_USER || 'noreply@pdd-recruitment.com'}>`,
      to: to,
      subject: subject,
      text: message, // Plain text
      html: htmlContent, // HTML version
    });

    console.log('Email sent:', info.messageId);

    // Nếu dùng Ethereal, trả về preview URL
    const previewURL = nodemailer.getTestMessageUrl(info);
    
    return res.status(200).json({
      success: true,
      message: 'Gửi email thành công!',
      data: {
        messageId: info.messageId,
        previewURL: previewURL || null, // URL để xem email test
      }
    });

  } catch (error) {
    console.error('Send email error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi gửi email',
      error: error.message
    });
  }
};

/**
 * Gửi email mời phỏng vấn
 */
export const sendInterviewInvitation = async (req, res) => {
  try {
    const { 
      to, 
      candidateName, 
      jobTitle, 
      interviewTime, 
      interviewMethod, 
      interviewLocation,
      notes 
    } = req.body;
    
    const senderName = req.user?.full_name || 'PDD Tuyển Dụng';

    // Validate
    if (!to || !candidateName || !jobTitle || !interviewTime) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ thông tin'
      });
    }

    let transporter = createTransporter();

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
      offline: 'Tại văn phòng',
      phone: 'Điện thoại'
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
            <p>Kính gửi <strong>${candidateName}</strong>,</p>
            <p>Chúng tôi rất vui mừng thông báo rằng hồ sơ của bạn đã được chọn vào vòng phỏng vấn cho vị trí:</p>
            <div class="highlight">
              <h3 style="margin: 0; color: #f59e0b;">📋 ${jobTitle}</h3>
            </div>
            
            <div class="info-box">
              <h3 style="margin-top: 0; color: #667eea;">📅 Thông tin buổi phỏng vấn</h3>
              <div class="info-row">
                <div class="info-label">Thời gian:</div>
                <div class="info-value">${new Date(interviewTime).toLocaleString('vi-VN', { 
                  dateStyle: 'full', 
                  timeStyle: 'short' 
                })}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Hình thức:</div>
                <div class="info-value">${methodText[interviewMethod] || interviewMethod}</div>
              </div>
              ${interviewLocation ? `
              <div class="info-row">
                <div class="info-label">Địa điểm:</div>
                <div class="info-value">${interviewLocation}</div>
              </div>
              ` : ''}
              ${notes ? `
              <div class="info-row">
                <div class="info-label">Ghi chú:</div>
                <div class="info-value">${notes}</div>
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
      to: to,
      subject: `[PDD Tuyển Dụng] Thư mời phỏng vấn - ${jobTitle}`,
      html: htmlContent,
    });

    console.log('Interview invitation sent:', info.messageId);

    const previewURL = nodemailer.getTestMessageUrl(info);
    
    return res.status(200).json({
      success: true,
      message: 'Gửi thư mời phỏng vấn thành công!',
      data: {
        messageId: info.messageId,
        previewURL: previewURL || null,
      }
    });

  } catch (error) {
    console.error('Send interview invitation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi gửi thư mời phỏng vấn',
      error: error.message
    });
  }
};
