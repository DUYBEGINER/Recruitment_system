import express from "express";
import {
  register,
  login,
  employeeLogin,
  getCurrentUser,
  logout,
  changePassword,
} from "../controller/authController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { noCache } from "../middleware/noCache.js";

const router = express.Router();

// Public routes (không cần authentication)
router.post("/register", noCache, register); // Đăng ký candidate
router.post("/login", noCache, login); // Đăng nhập candidate (bằng email)
router.post("/employee-login", noCache, employeeLogin); // Đăng nhập employee/HR (bằng username)

// Protected routes (cần authentication)
router.get("/me", noCache, verifyToken, getCurrentUser);
router.post("/logout", verifyToken, logout);
router.post("/change-password", verifyToken, changePassword);

export default router;
