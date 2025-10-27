import {axiosClient} from '../utils/axiosClient';

const jobAPI = {
  /**
   * Tạo tin tuyển dụng mới (draft)
   */
  createJob: async (jobData) => {
    const res = await axiosClient.post('/jobs', jobData);
    return res.data;
  },

  /**
   * Lấy danh sách tất cả jobs
   */
  getJobs: async (params = {}) => {
    const res = await axiosClient.get('/jobs', { params });
    return res.data;
  },

  /**
   * Lấy thông tin job theo ID
   */
  getJobById: async (id) => {
    const res = await axiosClient.get(`/jobs/${id}`);
    return res.data;
  },

  /**
   * Cập nhật job
   */
  updateJob: async (id, jobData) => {
    const res = await axiosClient.put(`/jobs/${id}`, jobData);
    return res.data;
  },

  /**
   * Xóa job (TPNS only)
   */
  deleteJob: async (id) => {
    const res = await axiosClient.delete(`/jobs/${id}`);
    return res.data;
  },

  /**
   * Gửi tin tuyển dụng để duyệt (draft/reject → pending)
   */
  submitForApproval: async (id) => {
    const res = await axiosClient.post(`/jobs/${id}/submit`);
    return res.data;
  },

  /**
   * Phê duyệt tin (TPNS only) (pending → approve)
   */
  approveJob: async (id) => {
    const res = await axiosClient.post(`/jobs/${id}/approve`);
    return res.data;
  },

  /**
   * Từ chối tin (TPNS only) (pending → reject)
   */
  rejectJob: async (id, reason = '') => {
    const res = await axiosClient.post(`/jobs/${id}/reject`, { reason });
    return res.data;
  },

  /**
   * Đóng tin tuyển dụng (approve → close)
   */
  closeJob: async (id) => {
    const res = await axiosClient.post(`/jobs/${id}/close`);
    return res.data;
  },
};

export default jobAPI;
