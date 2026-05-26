package com.anhtin.tmdt.backend.modules.common.service;

import com.anhtin.tmdt.backend.modules.common.entity.SystemConfig;
import com.anhtin.tmdt.backend.modules.common.entity.SystemConfigAudit;
import com.anhtin.tmdt.backend.modules.common.repository.SystemConfigRepository;
import com.anhtin.tmdt.backend.modules.common.repository.SystemConfigAuditRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Service for accessing and updating system configuration values.
 * Includes audit logging and an in‑memory cache to avoid frequent DB hits.
 */
@Service
public class SystemConfigService {

    private static final String DISCOUNT_MAX_DAYS_KEY = "discount.max.days";

    // Simple thread‑safe cache: key -> value
    private final Map<String, String> cache = new ConcurrentHashMap<>();

    @Autowired
    private SystemConfigRepository configRepository;

    @Autowired
    private SystemConfigAuditRepository auditRepository;

    /**
     * Retrieve a configuration value by its key. Uses cache first; if absent, loads from DB.
     */
    public String getConfigValue(String key) {
        // Try cache
        if (cache.containsKey(key)) {
            return cache.get(key);
        }
        // Load from DB
        SystemConfig config = configRepository.findByKey(key).orElse(null);
        if (config != null) {
            cache.put(key, config.getValue());
            return config.getValue();
        }
        return null;
    }

    /**
     * Shortcut to obtain the "discountMaxDays" as an integer.
     * Returns default of 7 days if not configured or parsing fails.
     */
    public int getDiscountMaxDays() {
        String val = getConfigValue(DISCOUNT_MAX_DAYS_KEY);
        if (val != null) {
            try {
                return Integer.parseInt(val);
            } catch (NumberFormatException e) {
                // ignore, fall back to default
            }
        }
        return 7; // default value
    }

    /**
     * Set or update a configuration value. Logs an audit record capturing old/new values and the user who changed it.
     * Also updates the in‑memory cache.
     *
     * @param key   configuration key
     * @param newValue new value to store
     * @param changedByUserId ID of the admin/user performing the change (may be null)
     */
    @Transactional
    public void setConfigValue(String key, String newValue, Long changedByUserId) {
        SystemConfig existing = configRepository.findByKey(key).orElse(null);
        String oldValue = existing != null ? existing.getValue() : null;
        if (existing == null) {
            // Create new config entry
            SystemConfig config = new SystemConfig();
            config.setKey(key);
            config.setValue(newValue);
            configRepository.save(config);
        } else {
            existing.setValue(newValue);
            configRepository.save(existing);
        }
        // Update cache
        cache.put(key, newValue);
        // Audit log
        SystemConfigAudit audit = new SystemConfigAudit();
        audit.setKey(key);
        audit.setOldValue(oldValue);
        audit.setNewValue(newValue);
        audit.setChangedBy(changedByUserId);
        auditRepository.save(audit);
    }
}
