-- Create sales_policy_product_groups table
CREATE TABLE IF NOT EXISTS sales_policy_product_groups (
    id BIGSERIAL PRIMARY KEY,
    sales_policy_id BIGINT NOT NULL,
    group_name VARCHAR(255) NOT NULL,
    group_index INT,
    CONSTRAINT fk_sales_policy_product_groups_policy FOREIGN KEY (sales_policy_id) REFERENCES sales_policies(id) ON DELETE CASCADE
);

-- Create sales_policy_product_group_items table
CREATE TABLE IF NOT EXISTS sales_policy_product_group_items (
    id BIGSERIAL PRIMARY KEY,
    group_id BIGINT NOT NULL,
    item_type VARCHAR(50) NOT NULL, -- PRODUCT or CATEGORY
    item_id BIGINT NOT NULL,
    description TEXT,
    CONSTRAINT fk_sales_policy_product_group_items_group FOREIGN KEY (group_id) REFERENCES sales_policy_product_groups(id) ON DELETE CASCADE
);
