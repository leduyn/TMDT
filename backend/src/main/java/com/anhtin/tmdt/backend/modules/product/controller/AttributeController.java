package com.anhtin.tmdt.backend.modules.product.controller;

import com.anhtin.tmdt.backend.modules.product.dto.FacetedSearchRequest;
// response DTOs now imported individually from modules.common.dto below
import com.anhtin.tmdt.backend.modules.product.service.AttributeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import com.anhtin.tmdt.backend.modules.common.dto.FacetedSearchResponse;
import com.anhtin.tmdt.backend.modules.product.entity.Product;
import com.anhtin.tmdt.backend.modules.product.entity.Attribute;
import com.anhtin.tmdt.backend.modules.agency.entity.Agency;
import com.anhtin.tmdt.backend.modules.common.dto.AttributeValueDTO;
import com.anhtin.tmdt.backend.modules.common.dto.AttributeDTO;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api")
public class AttributeController {

    @Autowired
    private AttributeService attributeService;

    // ─── Attributes CRUD ────────────────────────────────────────────────────────

    /** Lấy tất cả attributes, hoặc filter theo categoryId */
    @GetMapping("/attributes")
    public ResponseEntity<List<AttributeDTO>> getAttributes(
            @RequestParam(required = false) Long categoryId) {
        if (categoryId != null) {
            return ResponseEntity.ok(attributeService.getAttributesByCategoryId(categoryId));
        }
        return ResponseEntity.ok(attributeService.getAllAttributes());
    }

    /** Lấy chi tiết 1 attribute */
    @GetMapping("/attributes/{id}")
    public ResponseEntity<AttributeDTO> getAttributeById(@PathVariable Long id) {
        return ResponseEntity.ok(attributeService.getAttributeById(id));
    }

    /** Tạo attribute mới (COMPANY only) */
    @PreAuthorize("hasRole('COMPANY')")
    @PostMapping("/attributes")
    public ResponseEntity<AttributeDTO> createAttribute(@RequestBody Map<String, Object> body) {
        String name = (String) body.get("name");
        String displayName = (String) body.get("displayName");
        Boolean isVariant = body.get("isVariant") != null ? (Boolean) body.get("isVariant") : false;
        Long categoryId = body.get("categoryId") != null
                ? Long.valueOf(body.get("categoryId").toString()) : null;
        return ResponseEntity.ok(attributeService.createAttribute(name, displayName, categoryId, isVariant));
    }

    /** Cập nhật attribute */
    @PreAuthorize("hasRole('COMPANY')")
    @PutMapping("/attributes/{id}")
    public ResponseEntity<AttributeDTO> updateAttribute(
            @PathVariable Long id, @RequestBody Map<String, Object> body) {
        String name = (String) body.get("name");
        String displayName = (String) body.get("displayName");
        Boolean isVariant = body.get("isVariant") != null ? (Boolean) body.get("isVariant") : null;
        Long categoryId = body.get("categoryId") != null
                ? Long.valueOf(body.get("categoryId").toString()) : null;
        return ResponseEntity.ok(attributeService.updateAttribute(id, name, displayName, categoryId, isVariant));
    }

    /** Xóa attribute */
    @PreAuthorize("hasRole('COMPANY')")
    @DeleteMapping("/attributes/{id}")
    public ResponseEntity<?> deleteAttribute(@PathVariable Long id) {
        attributeService.deleteAttribute(id);
        return ResponseEntity.ok("Attribute deleted successfully");
    }

    // ─── Attribute Values ───────────────────────────────────────────────────────

    /** Lấy values của attribute */
    @GetMapping("/attributes/{id}/values")
    public ResponseEntity<List<AttributeValueDTO>> getAttributeValues(@PathVariable Long id) {
        return ResponseEntity.ok(attributeService.getValuesByAttributeId(id));
    }

    /** Thêm value cho attribute */
    @PreAuthorize("hasRole('COMPANY')")
    @PostMapping("/attributes/{id}/values")
    public ResponseEntity<AttributeValueDTO> addAttributeValue(
            @PathVariable Long id, @RequestBody Map<String, String> body) {
        String value = body.get("value");
        return ResponseEntity.ok(attributeService.addValue(id, value));
    }

    /** Xóa value */
    @PreAuthorize("hasRole('COMPANY')")
    @DeleteMapping("/attributes/values/{valueId}")
    public ResponseEntity<?> deleteAttributeValue(@PathVariable Long valueId) {
        attributeService.deleteValue(valueId);
        return ResponseEntity.ok("Value deleted successfully");
    }

    // ─── Product ↔ Attributes ───────────────────────────────────────────────────

    /** Gán attribute values cho product */
    @PreAuthorize("hasRole('COMPANY') or hasRole('AGENCY')")
    @PostMapping("/products/{id}/attributes")
    public ResponseEntity<List<AttributeValueDTO>> assignAttributeValues(
            @PathVariable Long id, @RequestBody Map<String, List<Long>> body) {
        List<Long> valueIds = body.get("attributeValueIds");
        return ResponseEntity.ok(attributeService.assignAttributeValues(id, valueIds));
    }

    /** Lấy attributes của product */
    @GetMapping("/products/{id}/attributes")
    public ResponseEntity<List<AttributeValueDTO>> getProductAttributes(@PathVariable Long id) {
        return ResponseEntity.ok(attributeService.getProductAttributeValues(id));
    }

    // ─── Faceted Search ─────────────────────────────────────────────────────────

    /** Core faceted search endpoint */
    @PostMapping("/products/search/faceted")
    public ResponseEntity<FacetedSearchResponse> facetedSearch(
            @RequestBody FacetedSearchRequest request) {
        return ResponseEntity.ok(attributeService.facetedSearch(request));
    }
}
