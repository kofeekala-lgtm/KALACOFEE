-- Mock Data for Cafe Profile KALA KOPI
-- Delete existing profile first
DELETE FROM cafe_profile;

-- Insert Mock Profile
INSERT INTO cafe_profile (
    name, 
    address, 
    phone, 
    email, 
    instagram, 
    bank_accounts, 
    opening_hours
) VALUES (
    'KALA KOPI',
    'Jl. Cigadung Raya No. 123, Cigadung, Kec. Cibeunying Kaler, Kota Bandung, Jawa Barat 40191',
    '0819 9721 7298',
    'hello@tokokopikala.com',
    'tokokopikala',
    '[
        {
            "bank_name": "QRIS",
            "account_number": "KALA KOPI",
            "account_holder": "KALA KOPI"
        },
        {
            "bank_name": "Bank Mandiri",
            "account_number": "1234567890",
            "account_holder": "PT KALA KOPI INDONESIA"
        }
    ]'::jsonb,
    '[
        {
            "day": "Senin - Jumat",
            "hours": "08:00 - 22:00"
        },
        {
            "day": "Sabtu - Minggu",
            "hours": "09:00 - 23:00"
        }
    ]'::jsonb
);
