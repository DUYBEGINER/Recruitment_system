import {axiosClient} from "../utils/axiosClient";

/**
 * Email API
 */

const emailAPI = {
  // Gửi email thông thường cho ứng viên
  sendEmail: async (emailData) => {
    try {
      console.log('[emailAPI] Sending email:', emailData);
      const response = await axiosClient.post('/emails/send', emailData);
      console.log('[emailAPI] Send email response:', response.data);
      return response.data;
    } catch (error) {
      console.error('[emailAPI] Error sending email:', error);
      throw error;
    }
  },

  // Gửi email mời phỏng vấn
  sendInterviewInvitation: async (invitationData) => {
    try {
      console.log('[emailAPI] Sending interview invitation:', invitationData);
      const response = await axiosClient.post('/emails/send-interview-invitation', invitationData);
      console.log('[emailAPI] Send invitation response:', response.data);
      return response.data;
    } catch (error) {
      console.error('[emailAPI] Error sending invitation:', error);
      throw error;
    }
  }
};

export default emailAPI;
