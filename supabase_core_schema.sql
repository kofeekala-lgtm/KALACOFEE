-- Core Database Schema for KALA KOPI
-- This script creates the essential tables required for products, categories, tables, and orders.

-- 1. Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Products Table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(15, 2) NOT NULL,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    image_url TEXT,
    is_available BOOLEAN DEFAULT true,
    customization_groups JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tables Management
CREATE TABLE IF NOT EXISTS tables (
    id TEXT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    is_available BOOLEAN DEFAULT true,
    reservation JSONB DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Ingredients Table
CREATE TABLE IF NOT EXISTS ingredients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    unit VARCHAR(50) NOT NULL,
    stock DECIMAL(15, 2) DEFAULT 0,
    min_stock DECIMAL(15, 2) DEFAULT 0,
    supplier VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Product Ingredients (Recipe Mapping)
CREATE TABLE IF NOT EXISTS product_ingredients (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    ingredient_id INTEGER REFERENCES ingredients(id) ON DELETE CASCADE,
    qty DECIMAL(15, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    total_amount DECIMAL(15, 2) NOT NULL,
    items_summary TEXT,
    payment_method VARCHAR(50) DEFAULT 'Transfer Bank',
    table_number VARCHAR(50),
    customer_name VARCHAR(255),
    status VARCHAR(20) DEFAULT 'Menunggu' CHECK (status IN ('Menunggu', 'Selesai', 'Batal')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER,
    name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    price DECIMAL(15, 2) NOT NULL,
    customizations JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Stock Movements Table
CREATE TABLE IF NOT EXISTS stock_movements (
    id SERIAL PRIMARY KEY,
    ingredient_id INTEGER REFERENCES ingredients(id) ON DELETE CASCADE,
    ingredient_name VARCHAR(255),
    type VARCHAR(10) CHECK (type IN ('IN', 'OUT')),
    quantity DECIMAL(15, 2) NOT NULL,
    reason TEXT,
    reference VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Financial Transactions Table
CREATE TABLE IF NOT EXISTS financial_transactions (
    id SERIAL PRIMARY KEY,
    type VARCHAR(10) CHECK (type IN ('INCOME', 'EXPENSE')),
    category VARCHAR(100),
    amount DECIMAL(15, 2) NOT NULL,
    payment_method VARCHAR(50) CHECK (payment_method IN ('Tunai', 'Transfer Bank')),
    description TEXT,
    reference_id VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Ingredient Purchases Table
CREATE TABLE IF NOT EXISTS ingredient_purchases (
    id SERIAL PRIMARY KEY,
    ingredient_id INTEGER REFERENCES ingredients(id) ON DELETE SET NULL,
    ingredient_name VARCHAR(255),
    qty DECIMAL(15, 2) NOT NULL,
    unit VARCHAR(50),
    price_per_unit DECIMAL(15, 2),
    total_price DECIMAL(15, 2),
    supplier VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Cafe Profile Table
CREATE TABLE IF NOT EXISTS cafe_profile (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) DEFAULT 'KALA KOPI',
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    instagram VARCHAR(255),
    bank_accounts JSONB DEFAULT '[]'::jsonb,
    opening_hours JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for all newly created tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredient_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE cafe_profile ENABLE ROW LEVEL SECURITY;

-- Create Public Access Policies (Development Friendly)
DO $$ 
BEGIN
    -- Categories
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Access' AND tablename = 'categories') THEN
        CREATE POLICY "Public Access" ON categories FOR ALL USING (true);
    END IF;
    -- Products
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Access' AND tablename = 'products') THEN
        CREATE POLICY "Public Access" ON products FOR ALL USING (true);
    END IF;
    -- Tables
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Access' AND tablename = 'tables') THEN
        CREATE POLICY "Public Access" ON tables FOR ALL USING (true);
    END IF;
    -- Ingredients
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Access' AND tablename = 'ingredients') THEN
        CREATE POLICY "Public Access" ON ingredients FOR ALL USING (true);
    END IF;
    -- Product Ingredients
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Access' AND tablename = 'product_ingredients') THEN
        CREATE POLICY "Public Access" ON product_ingredients FOR ALL USING (true);
    END IF;
    -- Orders
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Access' AND tablename = 'orders') THEN
        CREATE POLICY "Public Access" ON orders FOR ALL USING (true);
    END IF;
    -- Order Items
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Access' AND tablename = 'order_items') THEN
        CREATE POLICY "Public Access" ON order_items FOR ALL USING (true);
    END IF;
    -- Stock Movements
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Access' AND tablename = 'stock_movements') THEN
        CREATE POLICY "Public Access" ON stock_movements FOR ALL USING (true);
    END IF;
    -- Financial Transactions
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Access' AND tablename = 'financial_transactions') THEN
        CREATE POLICY "Public Access" ON financial_transactions FOR ALL USING (true);
    END IF;
    -- Ingredient Purchases
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Access' AND tablename = 'ingredient_purchases') THEN
        CREATE POLICY "Public Access" ON ingredient_purchases FOR ALL USING (true);
    END IF;
    -- Cafe Profile
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Access' AND tablename = 'cafe_profile') THEN
        CREATE POLICY "Public Access" ON cafe_profile FOR ALL USING (true);
    END IF;
END $$;

-- 12. RPC Function for Processing Orders
CREATE OR REPLACE FUNCTION process_order(
  p_items JSONB,
  p_total NUMERIC,
  p_payment_method TEXT,
  p_table_number TEXT,
  p_customer_name TEXT
) RETURNS JSONB AS $$
DECLARE
  v_order_id INT;
  v_items_summary TEXT;
  v_result JSONB;
BEGIN
  -- 1. Buat ringkasan item
  SELECT string_agg(name || ' (x' || quantity || ')', ', ') INTO v_items_summary
  FROM jsonb_to_recordset(p_items) AS x(name TEXT, quantity INT);

  -- 2. Masukkan ke tabel orders
  INSERT INTO orders (total_amount, items_summary, payment_method, table_number, customer_name, status)
  VALUES (p_total, v_items_summary, p_payment_method, p_table_number, p_customer_name, 'Menunggu')
  RETURNING id INTO v_order_id;

  -- 3. Masukkan ke tabel order_items
  INSERT INTO order_items (order_id, product_id, name, quantity, price, customizations, notes)
  SELECT 
    v_order_id, 
    (item->>'id')::INT, 
    item->>'name', 
    (item->>'quantity')::INT, 
    (item->>'price')::NUMERIC, 
    COALESCE(item->'customizations', '[]'::JSONB), 
    item->>'notes'
  FROM jsonb_array_elements(p_items) AS item;

  -- 4. Catat Transaksi Keuangan
  INSERT INTO financial_transactions (type, category, amount, payment_method, description, reference_id)
  VALUES ('INCOME', 'Penjualan', p_total, p_payment_method, 'Order #' || v_order_id, v_order_id::TEXT);

  -- 5. Update Stok Bahan Baku Secara Massal (Banyak bahan sekaligus)
  UPDATE ingredients i
  SET stock = i.stock - sub.total_used
  FROM (
    SELECT r.ingredient_id, SUM(r.qty * (item->>'quantity')::INT) as total_used
    FROM jsonb_array_elements(p_items) AS item
    JOIN product_ingredients r ON r.product_id = (item->>'id')::INT
    GROUP BY r.ingredient_id
  ) AS sub
  WHERE i.id = sub.ingredient_id;

  -- 6. Masukkan ke Stock Movements Secara Massal
  INSERT INTO stock_movements (ingredient_id, ingredient_name, type, quantity, reason, reference)
  SELECT 
    r.ingredient_id, 
    ing.name, 
    'OUT', 
    r.qty * (item->>'quantity')::INT, 
    'Penjualan: ' || (item->>'name'), 
    'Order #' || v_order_id
  FROM jsonb_array_elements(p_items) AS item
  JOIN product_ingredients r ON r.product_id = (item->>'id')::INT
  JOIN ingredients ing ON ing.id = r.ingredient_id;

  -- Susun hasil untuk dikembalikan
  SELECT jsonb_build_object(
    'id', v_order_id,
    'total_amount', p_total,
    'items_summary', v_items_summary,
    'payment_method', p_payment_method,
    'table_number', p_table_number,
    'customer_name', p_customer_name,
    'status', 'Menunggu',
    'created_at', now()
  ) INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

