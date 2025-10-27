import {axiosClient} from '../utils/axiosClient';

const jobAPI = {
  /**
   * Tạo tin tuyển dụng mới
   */
  createJob: async (jobData) => {
    return axiosClient.post('/api/jobs', jobData);
  },

  /**
   * Lấy danh sách tất cả jobs
   */
  getJobs: async (params = {}) => {
    return axiosClient.get('/api/jobs', { params });
  },

  /**
   * Lấy thông tin job theo ID
   */
  getJobById: async (id) => {
    return axiosClient.get(`/api/jobs/${id}`);
  },

  /**
   * Cập nhật job
   */
  updateJob: async (id, jobData) => {
    return axiosClient.put(`/api/jobs/${id}`, jobData);
  },

  /**
   * Xóa job
   */
  deleteJob: async (id) => {
    return axiosClient.delete(`/api/jobs/${id}`);
  },

  /**
   * Gửi tin tuyển dụng để duyệt
   */
  submitForApproval: async (id, data) => {
    return axiosClient.post(`/api/jobs/${id}/submit-approval`, data);
  },

  /**
   * Đóng tin tuyển dụng
   */
  closeJob: async (id) => {
    return axiosClient.post(`/api/jobs/${id}/close`);
  },
};

export default jobAPI;
