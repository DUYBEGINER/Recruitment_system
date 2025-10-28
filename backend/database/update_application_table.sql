-- Script để cập nhật bảng Application
USE [RMS];
GO

-- Kiểm tra và thêm cột cover_letter nếu chưa có
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Application]') AND name = 'cover_letter')
BEGIN
    ALTER TABLE [dbo].[Application]
    ADD cover_letter NVARCHAR(MAX) NULL;
    PRINT 'Đã thêm cột cover_letter vào bảng Application';
END
ELSE
BEGIN
    PRINT 'Cột cover_letter đã tồn tại trong bảng Application';
END
GO

-- Cập nhật constraint cho status để bao gồm 'submitted'
-- Drop constraint cũ nếu có
IF EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_Application_Status')
BEGIN
    ALTER TABLE [dbo].[Application]
    DROP CONSTRAINT CK_Application_Status;
    PRINT 'Đã xóa constraint cũ CK_Application_Status';
END
GO

-- Thêm constraint mới với giá trị 'submitted'
ALTER TABLE [dbo].[Application]
ADD CONSTRAINT CK_Application_Status 
CHECK (status IN ('submitted', 'reviewing', 'accepted', 'rejected'));
GO

PRINT 'Đã cập nhật constraint cho cột status';
GO

-- Hiển thị cấu trúc bảng để kiểm tra
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    CHARACTER_MAXIMUM_LENGTH
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Application'
ORDER BY ORDINAL_POSITION;
GO
