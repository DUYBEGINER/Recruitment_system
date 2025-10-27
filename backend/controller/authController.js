import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sql, connect } from "../config/db.js";

const JWT_SECRET = process.env.JWT_SECRET || "change-me";
const JWT_EXPIRES_IN = "7d";

/** REGISTER */
export const register = async (req, res) => {
    try {
        const { fullname, email, password, phone, role = "candidate", companyId = null } = req.body;
        console.log("req body:", req.body);
        // Validate input
        if (!fullname || !email || !password || !phone) {
            return res.status(400).json({ success: false, message: "Vui lòng điền đủ fullname, email, password, phone" });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        if (!emailRegex.test(email)) return res.status(400).json({ success: false, message: "Email không hợp lệ" });
        if (password.length < 6) return res.status(400).json({ success: false, message: "Mật khẩu tối thiểu 6 ký tự" });

        const pool = await connect();

        // Check trùng Email/Phone
        const existed = await pool.request()
            .input("Email", sql.NVarChar, email)
            .input("Phone", sql.VarChar, phone)
            .query(`SELECT 1 FROM Candidate WHERE Email = @Email OR Phone = @Phone`);
        if (existed.recordset.length > 0) {
            return res.status(400).json({ success: false, message: "Email hoặc số điện thoại đã tồn tại" });
        }

        // Hash password
        const hashed = await bcrypt.hash(password, 10);

        // Insert đúng cột DB
        const insert = await pool.request()
            .input("Fullname", sql.NVarChar, fullname)
            .input("Email", sql.NVarChar, email)
            .input("Password", sql.NVarChar, hashed)
            .input("Phone", sql.VarChar, phone)
            .input("Role", sql.NVarChar, role)
            .input("Company_id", sql.Int, companyId)
            .query(`
        INSERT INTO Candidate ([Fullname],[Email],[Password],[Phone],[Role],[Company_id])
        OUTPUT INSERTED.[User_id], INSERTED.[Fullname], INSERTED.[Email], INSERTED.[Phone], INSERTED.[Role], INSERTED.[Company_id]
        VALUES (@Fullname, @Email, @Password, @Phone, @Role, @Company_id)
      `);

        const newUser = insert.recordset[0];
        console.log("New user:", newUser);

        // Tạo JWT token
        // const token = jwt.sign(
        //     { id: newUser.User_id, email: newUser.Email, role: newUser.Role },
        //     JWT_SECRET,
        //     { expiresIn: JWT_EXPIRES_IN }
        // );

        // Gửi token qua cookie
        // res.cookie('token', token, {
        //     httpOnly: true, // Bảo mật: không cho JS truy cập
        //     secure: process.env.NODE_ENV === 'production', // Chỉ gửi qua HTTPS ở production
        //     sameSite: 'lax', // Bảo vệ CSRF
        //     maxAge: 7 * 24 * 60 * 60 * 1000 // 7 ngày
        // });

        res.status(201).json({
            success: true,
            message: "Đăng ký thành công",
        });
    } catch (err) {
        console.error("Register error:", err);
        res.status(500).json({ success: false, message: "Lỗi server khi đăng ký", error: err.message });
    }
};

/** LOGIN (bằng email hoặc phone) */
export const login = async (req, res) => {
    try {
        const { email, password } = req.body; // Email: email hoặc phone
        console.log("Login request body:", req.body);
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Vui lòng nhập Email (email/phone) và password" });
        }

        const pool = await connect();
        const rs = await pool.request()
            .input("Email", sql.NVarChar, email)
            .query(`
        SELECT TOP 1 * FROM Candidate
        WHERE Email = @Email
      `);

        if (rs.recordset.length === 0) {
            return res.status(401).json({ success: false, message: "Tài khoản hoặc mật khẩu không đúng" });
        }

        const user = rs.recordset[0];

        // So sánh password: cột trong DB là [Password]
        const ok = await bcrypt.compare(password, user.Password);
        if (!ok) return res.status(401).json({ success: false, message: "Tài khoản hoặc mật khẩu không đúng" });

        const token = jwt.sign(
            { id: user.User_id, email: user.Email, role: user.Role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        // Ẩn Password khi trả về
        const { Password, ...userSafe } = user;

        // Gửi token qua cookie
        res.cookie('token', token, {
            httpOnly: true, // Bảo mật: không cho JS truy cập
            secure: process.env.NODE_ENV === 'production', // Chỉ gửi qua HTTPS ở production
            sameSite: 'lax', // Bảo vệ CSRF
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 ngày
        });

        res.status(200).json({
            success: true,
            message: "Đăng nhập thành công!",
            data: { user: userSafe }
        });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ success: false, message: "Lỗi server khi đăng nhập", error: err.message });
    }
};

/** GET CURRENT USER */
export const getCurrentUser = async (req, res) => {
    const userId = req.user.id;
    try {
        const pool = await connect();
        const rs = await pool.request()
            .input("Id", sql.Int, userId)  // req.user.id lấy từ JWT (User_id)
            .query(`
        SELECT [User_id],[Fullname],[Email],[Phone],[Role],[Company_id]
        FROM Candidate WHERE [User_id] = @Id
      `);

        if (rs.recordset.length === 0) {
            return res.status(404).json({ success: false, message: "User không tồn tại" });
        }

        res.status(200).json({ success: true, data: { user: rs.recordset[0] } });
    } catch (err) {
        console.error("Get current user error:", err);
        res.status(500).json({ success: false, message: "Lỗi server", error: err.message });
    }
};

/** CHANGE PASSWORD */
export const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) {
            return res.status(400).json({ success: false, message: "Vui lòng nhập mật khẩu cũ và mới" });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, message: "Mật khẩu mới tối thiểu 6 ký tự" });
        }

        const pool = await connect();
        const rs = await pool.request()
            .input("Id", sql.Int, req.user.id)
            .query(`SELECT [Password] FROM Candidate WHERE [User_id] = @Id`);

        if (rs.recordset.length === 0) {
            return res.status(404).json({ success: false, message: "User không tồn tại" });
        }

        const user = rs.recordset[0];
        const ok = await bcrypt.compare(oldPassword, user.Password);
        if (!ok) return res.status(401).json({ success: false, message: "Mật khẩu cũ không đúng" });

        const hashed = await bcrypt.hash(newPassword, 10);
        await pool.request()
            .input("Id", sql.Int, req.user.id)
            .input("Password", sql.NVarChar, hashed)
            .query(`UPDATE Candidate SET [Password] = @Password WHERE [User_id] = @Id`);

        res.status(200).json({ success: true, message: "Đổi mật khẩu thành công" });
    } catch (err) {
        console.error("Change password error:", err);
        res.status(500).json({ success: false, message: "Lỗi server khi đổi mật khẩu", error: err.message });
    }
};

/** LOGOUT - Xóa cookie */
export const logout = async (_req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    });
    res.status(200).json({ success: true, message: "Đăng xuất thành công" });
};
