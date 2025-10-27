import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sql, connect } from "../config/db.js";

const JWT_SECRET = process.env.JWT_SECRET || "change-me";
const JWT_EXPIRES_IN = "7d";

/** REGISTER */
export const register = async (req, res) => {
    try {
        const { full_name, email, password, phone } = req.body;
        console.log("req body:", req.body);
        
        // Validate input
        if (!full_name || !email || !password || !phone) {
            return res.status(400).json({ 
                success: false, 
                message: "Vui lòng điền đủ họ tên, email, mật khẩu và số điện thoại" 
            });
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ success: false, message: "Email không hợp lệ" });
        }
        
        if (password.length < 6) {
            return res.status(400).json({ success: false, message: "Mật khẩu tối thiểu 6 ký tự" });
        }

        const pool = await connect();

        // Check trùng Email/Phone
        const existed = await pool.request()
            .input("email", sql.NVarChar, email)
            .input("phone", sql.VarChar, phone)
            .query(`SELECT 1 FROM Candidate WHERE email = @email OR phone = @phone`);
            
        if (existed.recordset.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: "Email hoặc số điện thoại đã tồn tại" 
            });
        }

        // Hash password
        const hashed = await bcrypt.hash(password, 10);

        // Insert vào bảng Candidate
        const insert = await pool.request()
            .input("full_name", sql.NVarChar, full_name)
            .input("email", sql.NVarChar, email)
            .input("password", sql.NVarChar, hashed)
            .input("phone", sql.VarChar, phone)
            .query(`
                INSERT INTO Candidate ([full_name], [email], [password], [phone], [created_at])
                OUTPUT INSERTED.[id], INSERTED.[full_name], INSERTED.[email], INSERTED.[phone], INSERTED.[created_at]
                VALUES (@full_name, @email, @password, @phone, GETDATE())
            `);

        const newUser = insert.recordset[0];
        console.log("New candidate registered:", newUser);

        res.status(201).json({
            success: true,
            message: "Đăng ký thành công",
        });
    } catch (err) {
        console.error("Register error:", err);
        res.status(500).json({ 
            success: false, 
            message: "Lỗi server khi đăng ký", 
            error: err.message 
        });
    }
};

/** LOGIN (bằng email) */
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("Login request body:", req.body);
        
        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: "Vui lòng nhập email và mật khẩu" 
            });
        }

        const pool = await connect();
        const rs = await pool.request()
            .input("email", sql.NVarChar, email)
            .query(`
                SELECT TOP 1 * FROM Candidate
                WHERE email = @email
            `);

        if (rs.recordset.length === 0) {
            return res.status(401).json({ 
                success: false, 
                message: "Email hoặc mật khẩu không đúng" 
            });
        }

        const candidate = rs.recordset[0];

        // So sánh password
        const ok = await bcrypt.compare(password, candidate.password);
        if (!ok) {
            return res.status(401).json({ 
                success: false, 
                message: "Email hoặc mật khẩu không đúng" 
            });
        }

        const token = jwt.sign(
            { id: candidate.id, email: candidate.email },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        // Ẩn password khi trả về
        const { password: _, ...candidateSafe } = candidate;

        // Gửi token qua cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 ngày
        });

        res.status(200).json({
            success: true,
            message: "Đăng nhập thành công!",
            data: { user: candidateSafe }
        });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ 
            success: false, 
            message: "Lỗi server khi đăng nhập", 
            error: err.message 
        });
    }
};

/** GET CURRENT USER - Hỗ trợ cả Candidate và Employer */
export const getCurrentUser = async (req, res) => {
    const userId = req.user.id;
    const userRole = req.user.role; // Có thể undefined nếu là candidate
    
    try {
        const pool = await connect();
        
        // Nếu có role -> là Employer (TPNS hoặc HR)
        if (userRole) {
            const rs = await pool.request()
                .input("id", sql.Int, userId)
                .query(`
                    SELECT [id], [company_id], [full_name], [username], [phone], [role], [created_at], [updated_at]
                    FROM Employer 
                    WHERE [id] = @id
                `);

            if (rs.recordset.length === 0) {
                return res.status(404).json({ 
                    success: false, 
                    message: "Nhân viên không tồn tại" 
                });
            }

            return res.status(200).json({ 
                success: true, 
                data: { user: rs.recordset[0] } 
            });
        } 
        
        // Không có role -> là Candidate
        const rs = await pool.request()
            .input("id", sql.Int, userId)
            .query(`
                SELECT [id], [full_name], [email], [phone], [cv_url], [created_at]
                FROM Candidate 
                WHERE [id] = @id
            `);

        if (rs.recordset.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "Ứng viên không tồn tại" 
            });
        }

        res.status(200).json({ 
            success: true, 
            data: { user: rs.recordset[0] } 
        });
    } catch (err) {
        console.error("Get current user error:", err);
        res.status(500).json({ 
            success: false, 
            message: "Lỗi server", 
            error: err.message 
        });
    }
};

/** CHANGE PASSWORD */
export const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        
        if (!oldPassword || !newPassword) {
            return res.status(400).json({ 
                success: false, 
                message: "Vui lòng nhập mật khẩu cũ và mới" 
            });
        }
        
        if (newPassword.length < 6) {
            return res.status(400).json({ 
                success: false, 
                message: "Mật khẩu mới tối thiểu 6 ký tự" 
            });
        }

        const pool = await connect();
        const rs = await pool.request()
            .input("id", sql.Int, req.user.id)
            .query(`SELECT [password] FROM Candidate WHERE [id] = @id`);

        if (rs.recordset.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "Ứng viên không tồn tại" 
            });
        }

        const candidate = rs.recordset[0];
        const ok = await bcrypt.compare(oldPassword, candidate.password);
        
        if (!ok) {
            return res.status(401).json({ 
                success: false, 
                message: "Mật khẩu cũ không đúng" 
            });
        }

        const hashed = await bcrypt.hash(newPassword, 10);
        await pool.request()
            .input("id", sql.Int, req.user.id)
            .input("password", sql.NVarChar, hashed)
            .query(`
                UPDATE Candidate 
                SET [password] = @password, [updated_at] = GETDATE() 
                WHERE [id] = @id
            `);

        res.status(200).json({ 
            success: true, 
            message: "Đổi mật khẩu thành công" 
        });
    } catch (err) {
        console.error("Change password error:", err);
        res.status(500).json({ 
            success: false, 
            message: "Lỗi server khi đổi mật khẩu", 
            error: err.message 
        });
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

/** EMPLOYEE LOGIN (TPNS/HR) - Dùng username thay vì email */
export const employeeLogin = async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log("Employee login request:", { username });
        
        if (!username || !password) {
            return res.status(400).json({ 
                success: false, 
                message: "Vui lòng nhập tên đăng nhập và mật khẩu" 
            });
        }

        const pool = await connect();
        const rs = await pool.request()
            .input("username", sql.VarChar, username)
            .query(`
                SELECT TOP 1 * FROM Employer
                WHERE username = @username
            `);

        if (rs.recordset.length === 0) {
            return res.status(401).json({ 
                success: false, 
                message: "Tên đăng nhập hoặc mật khẩu không đúng" 
            });
        }

        const employer = rs.recordset[0];

        // So sánh password
        const ok = await bcrypt.compare(password, employer.password);
        if (!ok) {
            return res.status(401).json({ 
                success: false, 
                message: "Tên đăng nhập hoặc mật khẩu không đúng" 
            });
        }

        // Validate role (chỉ chấp nhận TPNS hoặc HR)
        if (!['TPNS', 'HR'].includes(employer.role)) {
            return res.status(403).json({ 
                success: false, 
                message: "Tài khoản không có quyền truy cập" 
            });
        }

        // Tạo JWT token với role
        const token = jwt.sign(
            { 
                id: employer.id, 
                username: employer.username,
                role: employer.role,
                company_id: employer.company_id
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        // Ẩn password khi trả về
        const { password: _, ...employerSafe } = employer;

        // Gửi token qua cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 ngày
        });

        res.status(200).json({
            success: true,
            message: "Đăng nhập thành công!",
            data: { user: employerSafe }
        });
    } catch (err) {
        console.error("Employee login error:", err);
        res.status(500).json({ 
            success: false, 
            message: "Lỗi server khi đăng nhập", 
            error: err.message 
        });
    }
};
