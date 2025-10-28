import {axiosClient} from '../utils/axiosClient';

/**
 * API cho Candidate (quản lý ứng viên)
 */

const candidateAPI = {
  // Lấy danh sách candidates (với search)
  getCandidates: async (params = {}) => {
    try {
      console.log('[candidateAPI] Calling GET /candidates with params:', params);
      const response = await axiosClient.get('/candidates', { params });
      console.log('[candidateAPI] Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('[candidateAPI] Get candidates error:', error);
      console.error('[candidateAPI] Error response:', error.response?.data);
      console.error('[candidateAPI] Error status:', error.response?.status);
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi khi lấy danh sách ứng viên!',
      };
    }
  },

  // Lấy chi tiết 1 candidate
  getCandidateById: async (id) => {
    try {
      const response = await axiosClient.get(`/candidates/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get candidate detail error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi khi lấy thông tin ứng viên!',
      };
    }
  },

  // Lấy danh sách applications của candidate
  getCandidateApplications: async (id) => {
    try {
      const response = await axiosClient.get(`/candidates/${id}/applications`);
      return response.data;
    } catch (error) {
      console.error('Get candidate applications error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi khi lấy danh sách hồ sơ!',
      };
    }
  },

  // Đếm số lượng candidates
  countCandidates: async () => {
    try {
      const response = await axiosClient.get('/candidates/count');
      return response.data;
    } catch (error) {
      console.error('Count candidates error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi khi đếm số lượng ứng viên!',
      };
    }
  },
};

export default candidateAPI;
