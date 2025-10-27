/**
 * Middleware kiểm tra quyền truy cập dựa trên role
 * Sử dụng sau verifyToken middleware
 */

/**
 * Chỉ cho phép TPNS truy cập
 */
export const requireTPNS = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ 
            success: false, 
            message: "Chưa đăng nhập" 
        });
    }

    if (req.user.role !== 'TPNS') {
        return res.status(403).json({ 
            success: false, 
            message: "Chỉ Trưởng phòng nhân sự mới có quyền truy cập" 
        });
    }

    next();
};

/**
 * Cho phép cả TPNS và HR truy cập
 */
export const requireEmployer = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ 
            success: false, 
            message: "Chưa đăng nhập" 
        });
    }

    const validRoles = ['TPNS', 'HR'];
    if (!validRoles.includes(req.user.role)) {
        return res.status(403).json({ 
            success: false, 
            message: "Chỉ nhân viên HR mới có quyền truy cập" 
        });
    }

    next();
};

/**
 * Chỉ cho phép HR (không bao gồm TPNS)
 */
export const requireHR = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ 
            success: false, 
            message: "Chưa đăng nhập" 
        });
    }

    if (req.user.role !== 'HR') {
        return res.status(403).json({ 
            success: false, 
            message: "Chỉ HR mới có quyền truy cập" 
        });
    }

    next();
};

/**
 * Kiểm tra role tùy chỉnh
 */
export const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                success: false, 
                message: "Chưa đăng nhập" 
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                message: `Yêu cầu quyền: ${roles.join(' hoặc ')}` 
            });
        }

        next();
    };
};
