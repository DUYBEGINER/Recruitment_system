// validators.js

// Regex patterns
export const patterns = {
    // Email cơ bản (đủ dùng cho UI)
    email: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,

    // Mật khẩu mạnh: >=8, có thường, HOA, số, ký tự đặc biệt
    passwordStrong: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/,

    // Display Name: 3-20 ký tự, chữ/số/_ , có thể có khoảng trắng
    displayName: /^(?=.{3,20}$)[\p{L}\p{N}_\s]+$/u,

    // Họ tên (có dấu, cho phép khoảng trắng, dấu . ' - ), độ dài 2-50
    fullName: /^[\p{L}][\p{L}\s'.-]{0,48}[\p{L}]$/u,

    // SĐT Việt Nam: +84 hoặc 0, bắt đầu 3/5/7/8/9, đủ 10 số
    phoneVN: /^(?:\+?84|0)(?:3|5|7|8|9)\d{8}$/
};

// Hàm validate đăng ký
export function validateSignup(form) {
    // form: { email, password, confirmPassword, displayName }
    const errors = {};

    const email = (form.email || "").trim();
    const password = form.password || "";
    const confirmPassword = form.confirmPassword || "";
    const displayName = (form.fullname || "").trim();
    const phone = (form.phone || "").trim();

    if (!email || !patterns.email.test(email)) {
        errors.email = "Email không hợp lệ.";
    }

    if (!password || !patterns.passwordStrong.test(password)) {
        errors.password =
            "Mật khẩu phải ≥ 8 ký tự, có chữ thường, HOA, số và ký tự đặc biệt.";
    }

    if (confirmPassword !== password) {
        errors.confirmPassword = "Xác nhận mật khẩu không khớp.";
    }

    if (!phone || !patterns.phoneVN.test(phone)) {
        errors.phone = "Số điện thoại không hợp lệ.";
    }

    if (displayName && !patterns.displayName.test(displayName)) {
        errors.displayName =
            "Tên 3-20 ký tự, chỉ gồm chữ/số/underscore, có thể có khoảng trắng.";
    }

    return {
        valid: Object.keys(errors).length === 0,
        errors
    };
}
