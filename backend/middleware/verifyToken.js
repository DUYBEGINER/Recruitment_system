import jwt from "jsonwebtoken";

// Secret key cho JWT (phải giống với authController)
const JWT_SECRET = process.env.JWT_SECRET || "change-me";

/**
 * Middleware để xác thực JWT token từ cookie
 */
export const verifyToken = (req, res, next) => {
  try {
    // Lấy token từ cookie
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Không tìm thấy token xác thực",
      });
    }

    // Xác thực token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Lưu thông tin user vào request để sử dụng ở các middleware/controller tiếp theo
    req.user = decoded;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token đã hết hạn",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Token không hợp lệ",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Lỗi xác thực token",
      error: error.message,
    });
  }
};
