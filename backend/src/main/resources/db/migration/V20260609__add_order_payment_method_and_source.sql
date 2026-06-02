ALTER TABLE orders 
  ADD COLUMN payment_method VARCHAR(100),
  ADD COLUMN order_source VARCHAR(100);
