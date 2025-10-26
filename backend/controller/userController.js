import { getAllUser } from "../repositories/getAllUser.js";

//Tên sau này đổi lại cho đỡ trùng với getAllUser trong repository cho đỡ nhầm lẫn, ví dụ như getAllUsersController
const getAllUsers = async (req, res) => {
  try {
    const users = await getAllUser();
    //Nếu không có user nào
    if (!users) {
      return res.status(401).json({ 
        success: false,
        message: "No users found" 
      });
    }
    //Nếu thành công
    return res.status(200).json({ 
      success: true,
      data: users 
    });
  } catch (error) {
    //Nếu có lỗi kết nối hoặc truy vấn
    return res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

export { getAllUsers };