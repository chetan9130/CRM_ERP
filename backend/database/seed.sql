-- Seed Users
INSERT INTO users (id, name, email, password_hash, role) VALUES
('b19280d0-7a0e-436f-8700-d6cdbbca453f', 'Admin User', 'admin@example.com', '$2a$10$x4jbwtxA5aVASbYASFpKKOkqhyte0FSOHJVDioj0bgGRrO.ANqnFK', 'admin'),
('c5be9e2b-f63b-4171-8bc6-9467d0251786', 'Sales Agent', 'sales@example.com', '$2a$10$xbu8fIL1rec3VmbxewD2UesLE/bRLsA2sLSEXsBVyV4tdCyA7P03C', 'sales'),
('da7cfde6-3507-4e00-880f-7fa40d9990e1', 'Warehouse Mgr', 'warehouse@example.com', '$2a$10$3BKr/z0bLoTzBghLbOoOceF164QnjaOZ4BOBYfSXNftR/8SxQMjQO', 'warehouse'),
('e3b2b80a-9d90-482a-bc91-37f22709e863', 'Accounts Officer', 'accounts@example.com', '$2a$10$dUFbD4wAFpY0wrtFZd9EXe2dvZ5EubAkgarJmLekBFTcDHG0aycJG', 'accounts');

-- Seed Customers
INSERT INTO customers (id, name, mobile, email, business_name, gst_number, customer_type, address, status, follow_up_date) VALUES
('d1a2b3c4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'John Doe', '+1234567890', 'john.doe@retailshop.com', 'Doe Retail Solutions', '27AAAAA1111A1Z1', 'retail', '123 Retail Lane, Shopping District, Mumbai', 'active', CURRENT_DATE + INTERVAL '7 days'),
('e2a3b4c5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', 'Jane Smith', '+1987654321', 'jane@wholesalehub.com', 'Smith Wholesalers Ltd', '27BBBBB2222B2Z2', 'wholesale', '456 Warehouse Blvd, Industrial Zone, Pune', 'active', CURRENT_DATE + INTERVAL '14 days'),
('f3a4b5c6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', 'Robert Johnson', '+1122334455', 'robert@distrocorp.com', 'DistroCorp Enterprises', '27CCCCC3333C3Z3', 'distributor', '789 Logistics Park, Gateway City, Bangalore', 'lead', CURRENT_DATE + INTERVAL '2 days');

-- Seed Products
INSERT INTO products (id, name, sku, category, unit_price, current_stock, min_stock_alert, location) VALUES
('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Premium Wireless Headphones', 'PROD-WHP-001', 'Electronics', 99.99, 50, 10, 'Aisle 3, Shelf B'),
('b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', 'Ergonomic Office Chair', 'PROD-OCH-002', 'Furniture', 149.50, 15, 5, 'Aisle 7, Shelf A'),
('c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', 'Mechanical Keyboard (Red Switches)', 'PROD-MKB-003', 'Electronics', 79.00, 8, 15, 'Aisle 3, Shelf D'),
('d4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a', 'USB-C Multi-Port Adapter', 'PROD-USB-004', 'Accessories', 35.00, 120, 20, 'Aisle 1, Shelf C'),
('e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b', 'Anti-Glare Desk Mat', 'PROD-MAT-005', 'Accessories', 18.75, 4, 10, 'Aisle 1, Shelf E');
