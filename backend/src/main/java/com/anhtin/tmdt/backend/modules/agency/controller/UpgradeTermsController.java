package com.anhtin.tmdt.backend.modules.agency.controller;

import com.anhtin.tmdt.backend.modules.common.entity.SystemConfig;
import com.anhtin.tmdt.backend.modules.common.repository.SystemConfigRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class UpgradeTermsController {

    private static final String TERMS_KEY = "customer_upgrade_terms";
    private static final String TERMS_VERSION_KEY = "customer_upgrade_terms_version";

    @Autowired
    private SystemConfigRepository systemConfigRepository;

    @GetMapping("/terms/customer-upgrade")
    public ResponseEntity<?> getTerms() {
        SystemConfig content = systemConfigRepository.findByKey(TERMS_KEY).orElse(null);
        SystemConfig version = systemConfigRepository.findByKey(TERMS_VERSION_KEY).orElse(null);
        return ResponseEntity.ok(Map.of(
            "content", content != null ? content.getValue() : "",
            "version", version != null ? version.getValue() : "1"
        ));
    }

    @PutMapping("/admin/terms/customer-upgrade")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<?> updateTerms(@RequestBody Map<String, String> body) {
        String content = body.get("content");
        if (content == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Content is required"));
        }

        SystemConfig config = systemConfigRepository.findByKey(TERMS_KEY)
                .orElseGet(() -> {
                    SystemConfig c = new SystemConfig();
                    c.setKey(TERMS_KEY);
                    return c;
                });
        config.setValue(content);
        systemConfigRepository.save(config);

        SystemConfig verConfig = systemConfigRepository.findByKey(TERMS_VERSION_KEY)
                .orElseGet(() -> {
                    SystemConfig c = new SystemConfig();
                    c.setKey(TERMS_VERSION_KEY);
                    c.setValue("1");
                    return c;
                });
        int currentVer = Integer.parseInt(verConfig.getValue());
        verConfig.setValue(String.valueOf(currentVer + 1));
        systemConfigRepository.save(verConfig);

        return ResponseEntity.ok(Map.of("message", "Đã lưu điều khoản", "version", currentVer + 1));
    }
}