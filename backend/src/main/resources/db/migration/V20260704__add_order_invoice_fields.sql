ALTER TABLE orders
ADD COLUMN invoice_name VARCHAR(255),
ADD COLUMN invoice_tax_code VARCHAR(50),
ADD COLUMN invoice_address TEXT;
