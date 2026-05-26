package com.anhtin.tmdt.backend.modules.common.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.*;
import java.util.Set;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/jpeg", "image/png", "image/gif", "image/webp"
    );

    @Value("${file.upload-dir}")
    private String uploadDir;

    private Path rootLocation;

    @PostConstruct
    public void init() {
        rootLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(rootLocation);
        } catch (IOException e) {
            throw new RuntimeException("Không thể tạo thư mục upload: " + rootLocation, e);
        }
    }

    public String storeFile(MultipartFile file) {
        return storeFile(file, null);
    }

    public String storeFile(MultipartFile file, String subfolder) {
        if (file.isEmpty()) {
            throw new RuntimeException("File trống, vui lòng chọn file hình ảnh.");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            throw new RuntimeException("Định dạng không được hỗ trợ. Chỉ chấp nhận: JPG, PNG, GIF, WEBP.");
        }

        String filename = file.getOriginalFilename();
        if (filename == null) filename = "image";
        String originalFilename = StringUtils.cleanPath(filename);
        String extension = "";
        int dotIndex = originalFilename.lastIndexOf('.');
        if (dotIndex >= 0) {
            extension = originalFilename.substring(dotIndex);
        }

        // Tạo tên file duy nhất
        String storedFilename = UUID.randomUUID().toString() + extension;
        
        Path targetDir = rootLocation;
        String prefix = "/uploads/";
        
        if (subfolder != null && !subfolder.isEmpty()) {
            targetDir = rootLocation.resolve(subfolder);
            prefix = "/uploads/" + subfolder + "/";
            try {
                Files.createDirectories(targetDir);
            } catch (IOException e) {
                throw new RuntimeException("Không thể tạo thư mục con: " + subfolder, e);
            }
        }

        Path targetLocation = targetDir.resolve(storedFilename);

        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, targetLocation, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("Không thể lưu file: " + storedFilename, e);
        }

        return prefix + storedFilename;
    }

    public void deleteFile(String fileUrl) {
        if (fileUrl == null || !fileUrl.startsWith("/uploads/")) return;
        String filename = fileUrl.substring("/uploads/".length());
        Path filePath = rootLocation.resolve(filename).normalize();
        try {
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            // Log only — không ném lỗi khi xóa
        }
    }
}
