import {axiosClient} from '../utils/axiosClient';

const uploadAPI = {
  /**
   * Upload file
   */
  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    return axiosClient.post('/api/upload/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Lấy danh sách tất cả files
   */
  getFiles: async () => {
    return axiosClient.get('/api/upload/files');
  },

  /**
   * Lấy thông tin file theo ID
   */
  getFileById: async (id) => {
    return axiosClient.get(`/api/upload/files/${id}`);
  },

  /**
   * Xóa file
   */
  deleteFile: async (id) => {
    return axiosClient.delete(`/api/upload/files/${id}`);
  },
};

export default uploadAPI;
