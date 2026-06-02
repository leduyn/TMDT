INSERT INTO system_config (config_key, config_value) VALUES ('retail.trend.increase.label', 'Tăng thêm')
    ON CONFLICT (config_key) DO UPDATE SET config_value = EXCLUDED.config_value;

INSERT INTO system_config (config_key, config_value) VALUES ('retail.trend.increase.color', '#ef4444')
    ON CONFLICT (config_key) DO UPDATE SET config_value = EXCLUDED.config_value;

INSERT INTO system_config (config_key, config_value) VALUES ('retail.trend.decrease.label', 'Giảm đi')
    ON CONFLICT (config_key) DO UPDATE SET config_value = EXCLUDED.config_value;

INSERT INTO system_config (config_key, config_value) VALUES ('retail.trend.decrease.color', '#10b981')
    ON CONFLICT (config_key) DO UPDATE SET config_value = EXCLUDED.config_value;

INSERT INTO system_config (config_key, config_value) VALUES ('retail.trend.neutral.label', 'Giữ nguyên')
    ON CONFLICT (config_key) DO UPDATE SET config_value = EXCLUDED.config_value;

INSERT INTO system_config (config_key, config_value) VALUES ('retail.trend.neutral.color', '#94a3b8')
    ON CONFLICT (config_key) DO UPDATE SET config_value = EXCLUDED.config_value;
