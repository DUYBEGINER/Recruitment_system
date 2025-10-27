// Script để tạo password hash cho Employer (TPNS/HR)
// Chạy: node backend/database/generate_password.js

import bcrypt from 'bcryptjs';

const passwords = [
    { label: 'TPNS@123', password: 'Duy2592004!?' },
    { label: 'HR@123', password: 'Duy2592004!?' },
    { label: 'Test@123', password: 'Duy2592004!?' }
];

console.log('🔐 Generating password hashes for Employer...\n');

for (const item of passwords) {
    const hash = await bcrypt.hash(item.password, 10);
    console.log(`Password: ${item.label}`);
    console.log(`Hash: ${hash}`);
    console.log('---');
}

console.log('\n✅ Done! Copy hash vào SQL script để insert Employer.');
console.log('\nVí dụ INSERT:');
console.log(`INSERT INTO Employer (company_id, full_name, username, phone, role, password)`);
console.log(`VALUES (1, N'Nguyễn Văn A', 'tpns_admin', '0123456789', 'TPNS', '<hash>');`);

