ALTER TABLE sales_policy_product_groups ALTER COLUMN sales_policy_id DROP NOT NULL;
ALTER TABLE sales_policy_product_group_items ALTER COLUMN group_id DROP NOT NULL;
