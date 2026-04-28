package com.anhtin.tmdt.backend.controller;

import com.anhtin.tmdt.backend.dto.request.CommissionConfigRequest;
import com.anhtin.tmdt.backend.dto.response.MessageResponse;
import com.anhtin.tmdt.backend.entity.Agency;
import com.anhtin.tmdt.backend.entity.Category;
import com.anhtin.tmdt.backend.entity.CommissionConfig;
import com.anhtin.tmdt.backend.repository.AgencyRepository;
import com.anhtin.tmdt.backend.repository.CategoryRepository;
import com.anhtin.tmdt.backend.repository.CommissionConfigRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/commissions")
public class CommissionController {

    @Autowired
    private CommissionConfigRepository commissionConfigRepository;

    @Autowired
    private AgencyRepository agencyRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    /**
     * Tạo cấu hình chiết khấu cho Đại lý (chỉ COMPANY).
     */
    @PreAuthorize("hasRole('COMPANY')")
    @PostMapping
    public ResponseEntity<?> createConfig(@Valid @RequestBody CommissionConfigRequest request) {
        try {
            Long agencyId = request.getAgencyId();
            if (agencyId == null) throw new RuntimeException("Agency ID is required");
            Agency agency = agencyRepository.findById(agencyId)
                    .orElseThrow(() -> new RuntimeException("Đại lý không tồn tại"));

            CommissionConfig config = new CommissionConfig();
            config.setAgency(agency);
            config.setPlatformFeeRate(request.getPlatformFeeRate());
            config.setDropshipCommissionRate(request.getDropshipCommissionRate());

            Long categoryId = request.getCategoryId();
            if (categoryId != null) {
                Category category = categoryRepository.findById(categoryId)
                        .orElseThrow(() -> new RuntimeException("Danh mục không tồn tại"));
                config.setCategory(category);
            }

            commissionConfigRepository.save(config);
            return ResponseEntity.ok(new MessageResponse("Đã tạo cấu hình chiết khấu thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Lấy tất cả cấu hình của một Đại lý.
     */
    @PreAuthorize("hasRole('COMPANY')")
    @GetMapping("/agency/{agencyId}")
    public ResponseEntity<List<CommissionConfig>> getAgencyConfigs(@PathVariable @NonNull Long agencyId) {
        return ResponseEntity.ok(commissionConfigRepository.findByAgencyIdAndActiveTrue(agencyId));
    }

    /**
     * Vô hiệu hoá cấu hình.
     */
    @PreAuthorize("hasRole('COMPANY')")
    @PutMapping("/{id}/disable")
    public ResponseEntity<?> disableConfig(@PathVariable @NonNull Long id) {
        try {
            CommissionConfig config = commissionConfigRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Cấu hình không tồn tại"));
            config.setActive(false);
            commissionConfigRepository.save(config);
            return ResponseEntity.ok(new MessageResponse("Đã vô hiệu hoá cấu hình"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }
}
