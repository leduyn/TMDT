CREATE TABLE IF NOT EXISTS system_config (
    id BIGSERIAL PRIMARY KEY,
    config_key VARCHAR(255) NOT NULL UNIQUE,
    config_value VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS system_config_audit (
    id BIGSERIAL PRIMARY KEY,
    config_key VARCHAR(255) NOT NULL,
    old_value VARCHAR(255),
    new_value VARCHAR(255) NOT NULL,
    changed_by BIGINT,
    changed_at TIMESTAMP NOT NULL
);

-- Insert default discount max days value (7 days)
INSERT INTO system_config (config_key, config_value) VALUES ('discount.max.days', '7')
    ON CONFLICT (config_key) DO UPDATE SET config_value = EXCLUDED.config_value;

