-- Idempotent drops
DROP TABLE IF EXISTS challan_items CASCADE;
DROP TABLE IF EXISTS sales_challans CASCADE;
DROP TABLE IF EXISTS stock_movements CASCADE;
DROP TABLE IF EXISTS customer_notes CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS users CASCADE;

DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS customer_type_enum CASCADE;
DROP TYPE IF EXISTS customer_status CASCADE;
DROP TYPE IF EXISTS stock_movement_type CASCADE;
DROP TYPE IF EXISTS challan_status CASCADE;

DROP SEQUENCE IF EXISTS sales_challan_number_seq CASCADE;

-- Create Sequence for sales challan numbers
CREATE SEQUENCE sales_challan_number_seq START WITH 1;

-- Create Types (Enums)
CREATE TYPE user_role AS ENUM ('admin', 'sales', 'warehouse', 'accounts');
CREATE TYPE customer_type_enum AS ENUM ('retail', 'wholesale', 'distributor');
CREATE TYPE customer_status AS ENUM ('lead', 'active', 'inactive');
CREATE TYPE stock_movement_type AS ENUM ('IN', 'OUT');
CREATE TYPE challan_status AS ENUM ('draft', 'confirmed', 'cancelled');

-- Create Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role user_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create Customers Table
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL,
  mobile VARCHAR(20) NOT NULL,
  email VARCHAR(160),
  business_name VARCHAR(150),
  gst_number VARCHAR(20),
  customer_type customer_type_enum NOT NULL,
  address TEXT,
  status customer_status NOT NULL DEFAULT 'lead',
  follow_up_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create Customer Notes Table
CREATE TABLE customer_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL,
  note TEXT NOT NULL,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Create Products Table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL,
  sku VARCHAR(50) UNIQUE NOT NULL,
  category VARCHAR(80),
  unit_price NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0),
  current_stock INT NOT NULL DEFAULT 0 CHECK (current_stock >= 0),
  min_stock_alert INT NOT NULL DEFAULT 0,
  location VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create Stock Movements Table
CREATE TABLE stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL,
  quantity_changed INT NOT NULL CHECK (quantity_changed > 0),
  movement_type stock_movement_type NOT NULL,
  reason VARCHAR(200) NOT NULL,
  reference_type VARCHAR(50),
  reference_id UUID,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Create Sales Challans Table
CREATE TABLE sales_challans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challan_number VARCHAR(30) UNIQUE NOT NULL,
  customer_id UUID NOT NULL,
  status challan_status NOT NULL DEFAULT 'draft',
  total_quantity INT NOT NULL DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  confirmed_at TIMESTAMPTZ DEFAULT NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Create Challan Items Table
CREATE TABLE challan_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challan_id UUID NOT NULL,
  product_id UUID NOT NULL,
  product_name_snapshot VARCHAR(150) NOT NULL,
  product_sku_snapshot VARCHAR(50) NOT NULL,
  unit_price_snapshot NUMERIC(12,2) NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  FOREIGN KEY (challan_id) REFERENCES sales_challans(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Trigger function to auto-update updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create Triggers
DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
