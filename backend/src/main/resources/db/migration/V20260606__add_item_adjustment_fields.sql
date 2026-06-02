ALTER TABLE sales_policy_product_group_items
    ADD COLUMN operator VARCHAR(10) DEFAULT NULL,
    ADD COLUMN adjustment_type VARCHAR(50) DEFAULT NULL,
    ADD COLUMN adjustment_value DOUBLE PRECISION DEFAULT NULL,
    ADD COLUMN gift_product_id BIGINT DEFAULT NULL,
    ADD COLUMN gift_quantity INT DEFAULT NULL,
    ADD COLUMN gift_note VARCHAR(500) DEFAULT NULL;
