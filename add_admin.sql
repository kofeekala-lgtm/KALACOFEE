-- Tambahkan User kofeekala@gmail.com sebagai Admin Utama
-- Pastikan tabel employee_roles sudah ada (dijalankan dari supabase_employees_schema.sql)

INSERT INTO employees (name, role_id, phone, email, password, status, joined_date)
VALUES (
    'Admin Kala Kopi', 
    (SELECT id FROM employee_roles WHERE name = 'Admin' LIMIT 1),
    '081997217298',
    'kofeekala@gmail.com',
    'kala123', -- Kata sandi untuk login di aplikasi
    'Aktif',
    CURRENT_DATE
)
ON CONFLICT (email) DO UPDATE SET
role_id = EXCLUDED.role_id,
status = 'Aktif';
