import {axiosClient} from '../utils/axiosClient';

/**
 * API cho Application (quản lý hồ sơ ứng tuyển)
 */

const applicationAPI = {
  // Lấy danh sách applications (với filter)
  getApplications: async (params = {}) => {
    try {
      const response = await axiosClient.get('/applications', { params });
      return response.data;
    } catch (error) {
      console.error('Get applications error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi khi lấy danh sách hồ sơ!',
      };
    }
  },

  // Lấy danh sách applications theo job_id
  getApplicationsByJob: async (jobId) => {
    try {
      const response = await axiosClient.get(`/applications/job/${jobId}`);
      return response.data;
    } catch (error) {
      console.error('Get applications by job error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi khi lấy danh sách hồ sơ!',
      };
    }
  },

  // Lấy chi tiết 1 application
  getApplicationById: async (id) => {
    try {
      const response = await axiosClient.get(`/applications/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get application detail error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi khi lấy chi tiết hồ sơ!',
      };
    }
  },

  // Cập nhật trạng thái application
  updateStatus: async (id, status) => {
    try {
      const response = await axiosClient.put(`/applications/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Update application status error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi khi cập nhật trạng thái!',
      };
    }
  },

  // Đếm số lượng applications
  countApplications: async (jobId, status = null) => {
    try {
      const params = status ? { status } : {};
      const response = await axiosClient.get(`/applications/job/${jobId}/count`, { params });
      return response.data;
    } catch (error) {
      console.error('Count applications error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi khi đếm số lượng hồ sơ!',
      };
    }
  },
};

export default applicationAPI;
