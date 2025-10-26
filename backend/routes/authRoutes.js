import express from "express";
import {
  register,
  login,
  getCurrentUser,
  logout,
  changePassword,
} from "../controller/authController.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// Public routes (không cần authentication)
router.post("/register", register);
router.post("/login", login);

// Protected routes (cần authentication)
router.get("/me", verifyToken, getCurrentUser);
router.post("/logout", verifyToken, logout);
router.post("/change-password", verifyToken, changePassword);

export default router;
