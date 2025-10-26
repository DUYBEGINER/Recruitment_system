import axios from 'axios';
import {axiosClient} from "../utils/axiosClient";


const checkSession = async () => {
  try {
    // console.log("component call api:", component);
    const datenow = new Date().toLocaleString();
    const res = await axiosClient.get("/auth/me");
    if (res && res.data) {
      console.log(`Response from checkSession: [${datenow}]`, res.data);
      return res.data; // Trả về dữ liệu user
    }
    return null;
  } catch (err) {
    console.error("Error response", err.response);
    throw new Error(err.response?.data?.message || 'Error checking session');
  }
}

// const authRequest = async (idToken) => {
//    const res = await axiosClient.post(`/auth/login`, {}, {
//     headers: { Authorization: `Bearer ${idToken}` },
//   });
//   console.log("res login:" , res.data)
//   return res.data;
// };


// const logOutRequest = async (idToken) => {
//   const res = await axiosClient.post(`/auth/logout`, {}, {
//     headers: { Authorization: `Bearer ${idToken}` },
//   });
//   console.log("res logout:", res)
//   return res.data;
// }

export { checkSession };