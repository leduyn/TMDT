-- Update customers table to match new entity model
-- Drop old table and recreate (safely IF EXISTS)
DROP TABLE IF EXISTS agency_customer_assignments;
DROP TABLE IF EXISTS customers CASCADE;

CREATE TABLE IF NOT EXISTS customers (
    id BIGSERIAL PRIMARY KEY,
    agency_id BIGINT REFERENCES agencies(id),
    organization_name VARCHAR(255),
    tax_code VARCHAR(50) UNIQUE,
    shipping_address TEXT,
    billing_address TEXT,
    receiver_name VARCHAR(255),
    receiver_phone VARCHAR(50),
    note TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Update orders: drop old user_id reference, ensure customer_id is correct type
ALTER TABLE orders DROP COLUMN IF EXISTS user_id;
ALTER TABLE orders ALTER COLUMN customer_id TYPE BIGINT USING customer_id::bigint;
