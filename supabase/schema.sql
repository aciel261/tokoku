-- =============================================
-- SCHEMA TOKO ONLINE - Jalankan di Supabase SQL Editor
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- CATEGORIES
-- =============================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PRODUCTS
-- =============================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(15,2) NOT NULL,
  discount_price DECIMAL(15,2),
  stock INTEGER NOT NULL DEFAULT 0,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  images JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  is_flash_sale BOOLEAN DEFAULT false,
  flash_sale_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- DISCOUNT CODES
-- =============================================
CREATE TABLE IF NOT EXISTS discount_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) NOT NULL UNIQUE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('percentage', 'fixed')),
  value DECIMAL(15,2) NOT NULL,
  min_purchase DECIMAL(15,2) DEFAULT 0,
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ORDERS
-- =============================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  guest_email VARCHAR(255),
  guest_name VARCHAR(255),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  total_amount DECIMAL(15,2) NOT NULL,
  discount_code VARCHAR(50),
  discount_amount DECIMAL(15,2) DEFAULT 0,
  shipping_cost DECIMAL(15,2) DEFAULT 0,
  shipping_address JSONB NOT NULL,
  payment_method VARCHAR(50),
  payment_status VARCHAR(20) DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
  tracking_number VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ORDER ITEMS
-- =============================================
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name VARCHAR(255) NOT NULL,
  product_image TEXT,
  quantity INTEGER NOT NULL,
  price_at_time DECIMAL(15,2) NOT NULL,
  subtotal DECIMAL(15,2) NOT NULL
);

-- =============================================
-- WISHLISTS (untuk logged-in users)
-- =============================================
CREATE TABLE IF NOT EXISTS wishlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- =============================================
-- SITE SETTINGS (untuk admin panel)
-- =============================================
CREATE TABLE IF NOT EXISTS site_settings (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default site settings
INSERT INTO site_settings (key, value) VALUES
  ('hero_banner', '{"title": "Belanja Mudah, Harga Terbaik", "subtitle": "Temukan ribuan produk pilihan dengan pengiriman cepat", "image_url": "", "cta_text": "Belanja Sekarang", "cta_link": "/shop"}'::jsonb),
  ('store_name', '"Toko Online"'::jsonb),
  ('store_logo', '""'::jsonb),
  ('whatsapp_number', '""'::jsonb),
  ('promo_banner', '{"text": "🎉 Gratis Ongkir untuk pembelian di atas Rp 100.000", "is_active": true}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- =============================================
-- ADMIN USERS TABLE (track admin role)
-- =============================================
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES untuk performa
-- =============================================
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- Full text search untuk produk
ALTER TABLE products ADD COLUMN IF NOT EXISTS search_vector TSVECTOR;
CREATE INDEX IF NOT EXISTS idx_products_search ON products USING GIN(search_vector);

-- Trigger untuk update search vector
CREATE OR REPLACE FUNCTION update_product_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('indonesian', COALESCE(NEW.name, '') || ' ' || COALESCE(NEW.description, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS products_search_vector_update ON products;
CREATE TRIGGER products_search_vector_update
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_product_search_vector();

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Products: semua bisa read, hanya admin yang bisa write
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products are viewable by everyone" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Admin can do anything with products" ON products
  USING (auth.uid() IN (SELECT id FROM admin_users))
  WITH CHECK (auth.uid() IN (SELECT id FROM admin_users));

-- Categories: publik read
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are viewable by everyone" ON categories FOR SELECT USING (true);
CREATE POLICY "Admin can manage categories" ON categories
  USING (auth.uid() IN (SELECT id FROM admin_users))
  WITH CHECK (auth.uid() IN (SELECT id FROM admin_users));

-- Orders: user bisa lihat ordernya sendiri
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own orders" ON orders FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() IN (SELECT id FROM admin_users));
CREATE POLICY "Anyone can insert orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin can update orders" ON orders FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM admin_users));

-- Order items: ikuti order policy
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Order items follow order access" ON order_items FOR SELECT
  USING (order_id IN (SELECT id FROM orders WHERE user_id = auth.uid() OR auth.uid() IN (SELECT id FROM admin_users)));
CREATE POLICY "Anyone can insert order items" ON order_items FOR INSERT WITH CHECK (true);

-- Discount codes: publik bisa baca (untuk validasi), admin bisa manage
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active codes are readable" ON discount_codes FOR SELECT USING (is_active = true);
CREATE POLICY "Admin can manage discount codes" ON discount_codes
  USING (auth.uid() IN (SELECT id FROM admin_users))
  WITH CHECK (auth.uid() IN (SELECT id FROM admin_users));

-- Wishlists: user bisa manage wishlistnya sendiri
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own wishlist" ON wishlists
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Site settings: publik read, admin write
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Settings are readable by everyone" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Admin can manage settings" ON site_settings
  USING (auth.uid() IN (SELECT id FROM admin_users))
  WITH CHECK (auth.uid() IN (SELECT id FROM admin_users));

-- Admin users
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can view admin list" ON admin_users FOR SELECT
  USING (auth.uid() IN (SELECT id FROM admin_users));

-- =============================================
-- SAMPLE DATA (opsional - untuk testing)
-- =============================================
INSERT INTO categories (name, slug) VALUES
  ('Elektronik', 'elektronik'),
  ('Fashion', 'fashion'),
  ('Makanan & Minuman', 'makanan-minuman'),
  ('Kecantikan', 'kecantikan'),
  ('Olahraga', 'olahraga')
ON CONFLICT (slug) DO NOTHING;
