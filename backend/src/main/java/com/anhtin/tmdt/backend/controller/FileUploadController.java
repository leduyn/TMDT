package com.anhtin.tmdt.backend.controller;

import com.anhtin.tmdt.backend.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/upload")
public class FileUploadController {

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
}
