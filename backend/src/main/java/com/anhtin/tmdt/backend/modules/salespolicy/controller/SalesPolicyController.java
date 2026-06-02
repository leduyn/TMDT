package com.anhtin.tmdt.backend.modules.salespolicy.controller;

import com.anhtin.tmdt.backend.modules.salespolicy.dto.ProductPolicyPreviewDTO;
import com.anhtin.tmdt.backend.modules.salespolicy.dto.SalesPolicyDTO;
import com.anhtin.tmdt.backend.modules.salespolicy.dto.SalesPolicyRequest;
import com.anhtin.tmdt.backend.modules.salespolicy.service.SalesPolicyService;
import com.anhtin.tmdt.backend.modules.agency.entity.Agency;
import com.anhtin.tmdt.backend.modules.agency.repository.AgencyRepository;
import com.anhtin.tmdt.backend.modules.product.entity.Product;
import com.anhtin.tmdt.backend.modules.product.repository.ProductRepository;
import com.anhtin.tmdt.backend.modules.price.service.PriceListService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/sales-policies")
public class SalesPolicyController {

    @Autowired
    private SalesPolicyService salesPolicyService;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private AgencyRepository agencyRepository;

    @Autowired
    private PriceListService priceListService;

    @GetMapping
    public ResponseEntity<List<SalesPolicyDTO>> getAllPolicies() {
        return ResponseEntity.ok(salesPolicyService.getAllPolicies());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SalesPolicyDTO> getPolicyById(@PathVariable Long id) {
        return ResponseEntity.ok(salesPolicyService.getPolicyById(id));
    }

    @PreAuthorize("hasRole('COMPANY')")
    @PostMapping
    public ResponseEntity<SalesPolicyDTO> createPolicy(@RequestBody SalesPolicyRequest request) {
        return ResponseEntity.ok(salesPolicyService.createPolicy(request));
    }

    @PreAuthorize("hasRole('COMPANY')")
    @PutMapping("/{id}")
    public ResponseEntity<SalesPolicyDTO> updatePolicy(@PathVariable Long id, @RequestBody SalesPolicyRequest request) {
        return ResponseEntity.ok(salesPolicyService.updatePolicy(id, request));
    }

    @PreAuthorize("hasRole('COMPANY')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePolicy(@PathVariable Long id) {
        salesPolicyService.deletePolicy(id);
        return ResponseEntity.ok("Xóa chính sách bán hàng thành công");
    }

    @GetMapping("/resolve-price")
    public ResponseEntity<Double> resolvePrice(
            @RequestParam Long productId,
            @RequestParam Long agencyId,
            @RequestParam Integer quantity) {
        
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại"));
        Agency agency = agencyRepository.findById(agencyId)
                .orElseThrow(() -> new RuntimeException("Đại lý không tồn tại"));

        Double price = priceListService.getResolvedPrice(productId, agencyId, null);
        if (price == null || price < 0) {
            price = product.getBasePrice();
        }

        Double finalPrice = salesPolicyService.applySalesPolicy(product, agency, quantity, price);
        return ResponseEntity.ok(finalPrice);
    }

    @GetMapping("/product-preview")
    public ResponseEntity<ProductPolicyPreviewDTO> productPreview(
            @RequestParam Long productId,
            @RequestParam(defaultValue = "1") Integer quantity,
            @RequestParam(required = false) Long agencyId) {
        
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại"));

        Double basePrice = product.getBasePrice();
        if (agencyId != null) {
            Double resolved = priceListService.getResolvedPrice(productId, agencyId, null);
            if (resolved != null && resolved >= 0) {
                basePrice = resolved;
            }
        }

        Agency agency = agencyId != null
                ? agencyRepository.findById(agencyId).orElse(null)
                : null;

        ProductPolicyPreviewDTO result = salesPolicyService.previewProductPolicies(product, quantity, agency, basePrice);
        return ResponseEntity.ok(result);
    }
}
