-- Add type column to agencies table (WHOLESALE/RETAIL)
ALTER TABLE agencies ADD COLUMN IF NOT EXISTS type VARCHAR(20) NOT NULL DEFAULT 'RETAIL';

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
    id BIGSERIAL PRIMARY KEY,
    organization_name VARCHAR(255),
    tax_code VARCHAR(50),
    phone VARCHAR(50),
    email VARCHAR(255),
    shipping_address TEXT,
    billing_address TEXT,
    type VARCHAR(20) NOT NULL DEFAULT 'RETAIL',
    note TEXT,
    customer_group_id BIGINT REFERENCES customer_groups(id),
    user_id BIGINT REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Add customer_id column to agency_customer_assignments if it doesn't exist
-- (it was changed from user_id reference to customer_id reference)
ALTER TABLE agency_customer_assignments ADD COLUMN IF NOT EXISTS customer_id BIGINT REFERENCES customers(id);

-- Update agency_customer_assignments: copy data from user_id to customer_id via customers table
-- (this assumes customers have been created for existing users)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agency_customer_assignments' AND column_name = 'user_id') THEN
        INSERT INTO customers (organization_name, tax_code, phone, email, shipping_address, billing_address, type, user_id)
        SELECT DISTINCT u.organization_name, u.tax_code, u.phone, u.email, u.shipping_address, u.billing_address, 'RETAIL', u.id
        FROM agency_customer_assignments aca
        JOIN users u ON u.id = aca.user_id
        WHERE NOT EXISTS (SELECT 1 FROM customers c WHERE c.user_id = u.id);

        UPDATE agency_customer_assignments aca
        SET customer_id = (SELECT c.id FROM customers c WHERE c.user_id = aca.user_id)
        WHERE aca.customer_id IS NULL;
    END IF;
END $$;

-- Update orders: add customer_id column if not exists (referencing customers instead of users)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_id BIGINT REFERENCES customers(id);

-- Copy existing customer data from user references in orders
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'user_id') THEN
        INSERT INTO customers (organization_name, tax_code, phone, email, shipping_address, billing_address, type, user_id)
        SELECT DISTINCT u.organization_name, u.tax_code, u.phone, u.email, u.shipping_address, u.billing_address, 'RETAIL', u.id
        FROM orders o
        JOIN users u ON u.id = o.user_id
        WHERE NOT EXISTS (SELECT 1 FROM customers c WHERE c.user_id = u.id);

        UPDATE orders o
        SET customer_id = (SELECT c.id FROM customers c WHERE c.user_id = o.user_id)
        WHERE o.customer_id IS NULL;
    END IF;
END $$;
