CREATE TABLE promotion_usages (
    id BIGSERIAL PRIMARY KEY,
    sales_policy_id BIGINT NOT NULL REFERENCES sales_policies(id),
    customer_id BIGINT NOT NULL REFERENCES users(id),
    order_id BIGINT NOT NULL REFERENCES orders(id),
    used_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_promotion_usage_policy_customer ON promotion_usages(sales_policy_id, customer_id);
