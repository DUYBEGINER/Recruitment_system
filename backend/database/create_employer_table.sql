-- Script để tạo bảng Employer và insert dữ liệu mẫu
-- Database: RMS

USE [RMS];
GO

-- Kiểm tra và tạo bảng Employer nếu chưa có
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Employer')
BEGIN
    CREATE TABLE [dbo].[Employer] (
        [id] INT PRIMARY KEY IDENTITY(1,1),
        [company_id] INT NULL,
        [full_name] NVARCHAR(100) NOT NULL,
        [username] VARCHAR(50) NOT NULL UNIQUE,
        [phone] VARCHAR(20) NULL,
        [role] VARCHAR(20) NOT NULL CHECK ([role] IN ('TPNS', 'HR')),
        [password] NVARCHAR(255) NOT NULL,
        [created_at] DATETIME NOT NULL DEFAULT GETDATE(),
        [updated_at] DATETIME NULL,
        
        -- Indexes
        INDEX IX_Employer_Username (username),
        INDEX IX_Employer_Role (role),
        INDEX IX_Employer_CompanyId (company_id)
    );
    
    PRINT 'Bảng Employer đã được tạo thành công!';
END
ELSE
BEGIN
    PRINT 'Bảng Employer đã tồn tại.';
END
GO

-- Thêm comments cho bảng
EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Bảng lưu trữ thông tin nhân viên HR và TPNS',
    @level0type = N'SCHEMA', @level0name = N'dbo',
    @level1type = N'TABLE',  @level1name = N'Employer';
GO

EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Vai trò: TPNS (Trưởng phòng nhân sự) hoặc HR (Nhân viên HR)',
    @level0type = N'SCHEMA', @level0name = N'dbo',
    @level1type = N'TABLE',  @level1name = N'Employer',
    @level2type = N'COLUMN', @level2name = N'role';
GO

-- =====================================================
-- INSERT DỮ LIỆU MẪU
-- =====================================================

-- Password mẫu: "TPNS@123" và "HR@123"
-- Sử dụng script generate_password.js để tạo hash

-- Ví dụ insert (thay <hash> bằng password hash thực tế)
/*
-- TPNS Account
INSERT INTO Employer (company_id, full_name, username, phone, role, password)
VALUES 
(1, N'Nguyễn Văn A', 'tpns_admin', '0123456789', 'TPNS', '<hash-of-TPNS@123>'),
(1, N'Trần Thị B', 'tpns_nguyen', '0987654321', 'TPNS', '<hash-of-TPNS@123>');

-- HR Account
INSERT INTO Employer (company_id, full_name, username, phone, role, password)
VALUES 
(1, N'Lê Văn C', 'hr_user1', '0111222333', 'HR', '<hash-of-HR@123>'),
(1, N'Phạm Thị D', 'hr_user2', '0444555666', 'HR', '<hash-of-HR@123>');
*/

PRINT '';
PRINT '==============================================';
PRINT 'Hướng dẫn tiếp theo:';
PRINT '1. Chạy: node backend/database/generate_password.js';
PRINT '2. Copy password hash từ kết quả';
PRINT '3. Uncomment và chạy các câu INSERT ở trên';
PRINT '4. Thay <hash-of-TPNS@123> và <hash-of-HR@123> bằng hash thực tế';
PRINT '==============================================';
GO
