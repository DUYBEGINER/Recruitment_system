import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import "dotenv/config.js";

import usersAPI from "./routes/userRoutes.js";
import authAPI from "./routes/authRoutes.js";
import uploadAPI from "./routes/uploadRoutes.js";
import jobAPI from "./routes/jobRoutes.js";
import applicationAPI from "./routes/applicationRoutes.js";
import candidateAPI from "./routes/candidateRoutes.js";
import interviewAPI from "./routes/interviewRoutes.js";
import emailAPI from "./routes/emailRoutes.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Frontend URL
  credentials: true, // Cho phép gửi cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json()); // Parse JSON body
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded body
app.use(cookieParser()); // Parse cookies

// Static files - Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'CV_Storage')));

// Routes
app.use("/auth", authAPI);
app.use("/api/users", usersAPI);
app.use("/api/upload", uploadAPI);
app.use("/jobs", jobAPI); // Đổi từ /api/jobs → /jobs
app.use("/applications", applicationAPI); // Routes cho quản lý hồ sơ ứng tuyển
app.use("/candidates", candidateAPI); // Routes cho quản lý ứng viên
app.use("/interviews", interviewAPI); // Routes cho quản lý lịch phỏng vấn
app.use("/emails", emailAPI); // Routes cho gửi email


// Health check endpoint
app.get("/", (req, res) => {
  res.json({ message: "Recruitment System API is running!" });
});

// Error handling middleware (must have 4 args: err, req, res, next)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Có lỗi xảy ra!",
    error: err.message,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
