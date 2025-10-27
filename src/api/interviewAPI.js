import {axiosClient} from "../utils/axiosClient";

/**
 * Interview API
 */

const interviewAPI = {
  // Lấy danh sách lịch phỏng vấn
  getInterviews: async (filters = {}) => {
    try {
      console.log('[interviewAPI] Fetching interviews with filters:', filters);
      
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.method) params.append('method', filters.method);
      if (filters.from_date) params.append('from_date', filters.from_date);
      if (filters.to_date) params.append('to_date', filters.to_date);
      if (filters.application_id) params.append('application_id', filters.application_id);

      const queryString = params.toString();
      const url = queryString ? `/interviews?${queryString}` : '/interviews';
      
      const response = await axiosClient.get(url);
      console.log('[interviewAPI] Interviews response:', response.data);
      return response.data;
    } catch (error) {
      console.error('[interviewAPI] Error fetching interviews:', error);
      throw error;
    }
  },

  // Lấy chi tiết lịch phỏng vấn
  getInterviewById: async (id) => {
    try {
      console.log('[interviewAPI] Fetching interview by id:', id);
      const response = await axiosClient.get(`/interviews/${id}`);
      console.log('[interviewAPI] Interview detail response:', response.data);
      return response.data;
    } catch (error) {
      console.error('[interviewAPI] Error fetching interview:', error);
      throw error;
    }
  },

  // Tạo lịch phỏng vấn mới
  createInterview: async (interviewData) => {
    try {
      console.log('[interviewAPI] Creating interview:', interviewData);
      const response = await axiosClient.post('/interviews', interviewData);
      console.log('[interviewAPI] Create response:', response.data);
      return response.data;
    } catch (error) {
      console.error('[interviewAPI] Error creating interview:', error);
      throw error;
    }
  },

  // Cập nhật lịch phỏng vấn
  updateInterview: async (id, interviewData) => {
    try {
      console.log('[interviewAPI] Updating interview:', id, interviewData);
      const response = await axiosClient.put(`/interviews/${id}`, interviewData);
      console.log('[interviewAPI] Update response:', response.data);
      return response.data;
    } catch (error) {
      console.error('[interviewAPI] Error updating interview:', error);
      throw error;
    }
  },

  // Xóa lịch phỏng vấn
  deleteInterview: async (id) => {
    try {
      console.log('[interviewAPI] Deleting interview:', id);
      const response = await axiosClient.delete(`/interviews/${id}`);
      console.log('[interviewAPI] Delete response:', response.data);
      return response.data;
    } catch (error) {
      console.error('[interviewAPI] Error deleting interview:', error);
      throw error;
    }
  },

  // Lấy thống kê lịch phỏng vấn
  getInterviewStats: async () => {
    try {
      console.log('[interviewAPI] Fetching interview stats');
      const response = await axiosClient.get('/interviews/stats');
      console.log('[interviewAPI] Stats response:', response.data);
      return response.data;
    } catch (error) {
      console.error('[interviewAPI] Error fetching stats:', error);
      throw error;
    }
  },

  // Lấy lịch phỏng vấn theo application_id
  getInterviewsByApplication: async (applicationId) => {
    try {
      console.log('[interviewAPI] Fetching interviews by application:', applicationId);
      const response = await axiosClient.get(`/interviews/application/${applicationId}`);
      console.log('[interviewAPI] Application interviews response:', response.data);
      return response.data;
    } catch (error) {
      console.error('[interviewAPI] Error fetching application interviews:', error);
      throw error;
    }
  }
};

export default interviewAPI;
