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
app.use("/api/jobs", jobAPI);

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ message: "Recruitment System API is running!" });
});

// Error handling middleware
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
