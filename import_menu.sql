-- SQL Script to import KALA KOPI & CATSU MATCHA menu items
-- Clean up old data first
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM products;
DELETE FROM categories;

-- 1. Ensure new categories exist
INSERT INTO categories (name) VALUES 
('Menu Utama'),
('Lainnya'),
('Matcha Series'),
('Drink Series');

-- 2. Insert Products
INSERT INTO products (name, description, price, category_id, image_url, is_available, customization_groups) VALUES

-- Menu Utama
('Matcha Latte', 'Minuman matcha autentik dengan susu segar pilihan.', 13000, (SELECT id FROM categories WHERE name = 'Menu Utama'), 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=500&q=80', true, '[]'),
('Es Kopi Butterscotch', 'Kopi susu dengan sirup butterscotch yang manis dan gurih.', 15000, (SELECT id FROM categories WHERE name = 'Menu Utama'), 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=500&q=80', true, '[]'),

-- Lainnya
('Matcha Macchiato', 'Matcha latte dengan foam susu yang tebal di atasnya.', 16000, (SELECT id FROM categories WHERE name = 'Lainnya'), 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=500&q=80', true, '[]'),
('Pure Matcha', 'Bubuk matcha berkualitas tanpa tambahan gula atau susu.', 10000, (SELECT id FROM categories WHERE name = 'Lainnya'), 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=500&q=80', true, '[]'),
('Wonka Chocolate', 'Minuman coklat premium yang kaya rasa.', 15000, (SELECT id FROM categories WHERE name = 'Lainnya'), 'https://images.unsplash.com/photo-1541658016709-8273558a9bc9?w=500&q=80', true, '[]'),

-- Matcha Series (Catsu Matcha)
('Pure Matcha (Pure)', 'Matcha murni asli Jepang.', 10000, (SELECT id FROM categories WHERE name = 'Matcha Series'), 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=500&q=80', true, '[]'),
('Matcha Latte (Signature)', 'Best Seller! Campuran matcha dan susu yang sempurna.', 13000, (SELECT id FROM categories WHERE name = 'Matcha Series'), 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=500&q=80', true, '[]'),
('Matcha Macchiato (Signature)', 'Best Seller! Kenikmatan matcha dengan macchiato foam.', 16000, (SELECT id FROM categories WHERE name = 'Matcha Series'), 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=500&q=80', true, '[]'),

-- Drink Series
('Strawberry Matcha', 'Perpaduan unik buah strawberry segar dan matcha.', 18000, (SELECT id FROM categories WHERE name = 'Drink Series'), 'https://images.unsplash.com/photo-1553909489-eb2175ad3941?w=500&q=80', true, '[]'),
('Kopi Kala', 'Kopi khas KALA KOPI yang menyegarkan.', 16000, (SELECT id FROM categories WHERE name = 'Drink Series'), 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&q=80', true, '[]'),
('Wonka Chocolate (Original)', 'Coklat Wonka asli yang creamy.', 15000, (SELECT id FROM categories WHERE name = 'Drink Series'), 'https://images.unsplash.com/photo-1541658016709-8273558a9bc9?w=500&q=80', true, '[]');
