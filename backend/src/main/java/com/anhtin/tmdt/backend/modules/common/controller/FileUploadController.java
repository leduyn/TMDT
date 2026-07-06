package com.anhtin.tmdt.backend.modules.common.controller;

import com.anhtin.tmdt.backend.modules.common.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import com.anhtin.tmdt.backend.modules.product.entity.Brand;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/upload")
public class FileUploadController {

    private static final Logger log = LoggerFactory.getLogger(FileUploadController.class);

    @Autowired
    private FileStorageService fileStorageService;

    @PreAuthorize("isAuthenticated()")
    @PostMapping("/image")
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            String url = fileStorageService.storeFile(file);
            return ResponseEntity.ok(Map.of("url", url));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('COMPANY')")
    @PostMapping("/brand-logo")
    public ResponseEntity<?> uploadBrandLogo(@RequestParam("file") MultipartFile file) {
        try {
            String url = fileStorageService.storeFile(file, "brands");
            return ResponseEntity.ok(Map.of("url", url));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PreAuthorize("isAuthenticated()")
    @PostMapping("/avatar")
    public ResponseEntity<?> uploadAvatar(@RequestParam("file") MultipartFile file) {
        try {
            String url = fileStorageService.storeFile(file, "avatars");
            return ResponseEntity.ok(Map.of("url", url));
        } catch (RuntimeException e) {
            log.error("Upload avatar failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            log.error("Upload avatar unexpected error", e);
            return ResponseEntity.internalServerError().body(Map.of("message", e.getMessage()));
        }
    }
}
