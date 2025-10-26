import axios from "axios";
import { API_URL } from '../data/API_URL';

const axiosClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // QUAN TRỌNG: để cookie httpOnly gửi kèm
  headers: {
    "Content-Type": "application/json",
  },
});

export { axiosClient };
