ALTER TABLE products ADD COLUMN IF NOT EXISTS product_code VARCHAR(100);
ALTER TABLE products ADD COLUMN IF NOT EXISTS retail_warranty_period VARCHAR(100);
ALTER TABLE products ADD COLUMN IF NOT EXISTS wholesale_warranty_period VARCHAR(100);
ALTER TABLE products ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'ACTIVE';
ALTER TABLE products ADD COLUMN IF NOT EXISTS other_name VARCHAR(500);
ALTER TABLE products ADD COLUMN IF NOT EXISTS short_name VARCHAR(300);

-- Populate product_code for existing products
UPDATE products SET product_code = 'PROD_' || LPAD(id::text, 6, '0') WHERE product_code IS NULL;
UPDATE products SET status = 'ACTIVE' WHERE status IS NULL;

-- Set constraints
ALTER TABLE products ALTER COLUMN product_code SET NOT NULL;
ALTER TABLE products DROP CONSTRAINT IF EXISTS uk_products_product_code;
ALTER TABLE products ADD CONSTRAINT uk_products_product_code UNIQUE (product_code);

