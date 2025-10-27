import { axiosClient } from '../utils/axiosClient';

const applicationAPI = {
  submitApplication: async (formData) => {
    return axiosClient.post('/api/applications/apply', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default applicationAPI;
