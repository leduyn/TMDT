CREATE TABLE product_types (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT
);

ALTER TABLE products ADD COLUMN product_type_id BIGINT REFERENCES product_types(id);

-- Seed sample product types
INSERT INTO product_types (code, name, description) VALUES
('MACHINERY', 'Máy móc', 'Các loại máy móc, thiết bị công nghiệp'),
('SPARE_PART', 'Phụ tùng', 'Phụ tùng thay thế, linh kiện'),
('TOOL', 'Dụng cụ', 'Dụng cụ cầm tay, dụng cụ đo lường'),
('CHEMICAL', 'Hóa chất', 'Hóa chất công nghiệp, dung môi'),
('RAW_MATERIAL', 'Nguyên liệu', 'Nguyên liệu đầu vào sản xuất');
