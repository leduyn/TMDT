package com.anhtin.tmdt.backend.modules.region.controller;

import com.anhtin.tmdt.backend.modules.region.service.LocationSyncService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.Collections;

@RestController
@RequestMapping("/api/admin/regions")
public class LocationSyncController {

    @Autowired
    private LocationSyncService syncService;

    @jakarta.annotation.PostConstruct
    public void init() {
        System.out.println("--- LocationSyncController LOADED ---");
    }

    @PostMapping("/sync-provinces")
    public Map<String, String> syncProvinces() {
        new Thread(() -> syncService.syncProvinces()).start();
        return Collections.singletonMap("message", "Quá trình đồng bộ tỉnh thành đã bắt đầu.");
    }

    @PostMapping("/sync-wards")
    public Map<String, String> syncWards() {
        new Thread(() -> syncService.syncWards()).start();
        return Collections.singletonMap("message", "Quá trình đồng bộ phường xã và legacy IDs đã bắt đầu.");
    }
}
