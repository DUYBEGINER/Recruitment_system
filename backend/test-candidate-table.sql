-- Script kiểm tra table Candidate

-- 1. Kiểm tra table có tồn tại không
SELECT * FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_NAME = 'Candidate';

-- 2. Kiểm tra columns
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Candidate'
ORDER BY ORDINAL_POSITION;

-- 3. Thử query đơn giản
SELECT TOP 10 * FROM Candidate;

-- 4. Test query với JOIN
SELECT 
  c.id,
  c.full_name,
  c.email,
  COUNT(a.id) as total_applications
FROM Candidate c
LEFT JOIN Application a ON c.id = a.candidate_id
GROUP BY c.id, c.full_name, c.email;

-- 5. Nếu table chưa có, tạo table (ví dụ)
/*
CREATE TABLE Candidate (
  id INT PRIMARY KEY IDENTITY(1,1),
  full_name NVARCHAR(255) NOT NULL,
  email NVARCHAR(255) NOT NULL UNIQUE,
  phone NVARCHAR(20),
  address NVARCHAR(500),
  date_of_birth DATE,
  created_at DATETIME DEFAULT GETDATE(),
  updated_at DATETIME DEFAULT GETDATE()
);
*/

-- 6. Insert test data nếu table rỗng
/*
INSERT INTO Candidate (full_name, email, phone, address, date_of_birth)
VALUES 
  (N'Nguyễn Văn A', 'nguyenvana@gmail.com', '0901234567', N'Hà Nội', '1995-01-15'),
  (N'Trần Thị B', 'tranthib@gmail.com', '0912345678', N'Hồ Chí Minh', '1998-05-20'),
  (N'Lê Văn C', 'levanc@gmail.com', '0923456789', N'Đà Nẵng', '1997-03-10');
*/
