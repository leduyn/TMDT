package com.anhtin.tmdt.backend.service;

import com.anhtin.tmdt.backend.dto.request.FacetedSearchRequest;
import com.anhtin.tmdt.backend.dto.response.*;
import com.anhtin.tmdt.backend.entity.*;
import com.anhtin.tmdt.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AttributeService {

    @Autowired
    private AttributeRepository attributeRepository;

    @Autowired
    private AttributeValueRepository attributeValueRepository;

    @Autowired
    private ProductAttributeValueRepository productAttributeValueRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductImageRepository productImageRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    // ─── CRUD Attributes ────────────────────────────────────────────────────────

    public List<AttributeDTO> getAllAttributes() {
        return attributeRepository.findAll().stream()
                .map(AttributeDTO::new)
                .collect(Collectors.toList());
    }

    public List<AttributeDTO> getAttributesByCategoryId(Long categoryId) {
        List<Attribute> byCat = attributeRepository.findByCategoryId(categoryId);
        List<Attribute> global = attributeRepository.findByCategoryIsNull();
        List<Attribute> merged = new ArrayList<>(byCat);
        merged.addAll(global);
        return merged.stream()
                .map(AttributeDTO::new)
                .collect(Collectors.toList());
    }

    public AttributeDTO getAttributeById(Long id) {
        if (id == null) throw new RuntimeException("Attribute ID must not be null");
        Attribute attr = attributeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Attribute not found: " + id));
        return new AttributeDTO(attr);
    }

    @Transactional
    public AttributeDTO createAttribute(String name, String displayName, Long categoryId) {
        Attribute attr = new Attribute();
        attr.setName(name);
        attr.setDisplayName(displayName);
        if (categoryId != null) {
            Category cat = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new RuntimeException("Category not found: " + categoryId));
            attr.setCategory(cat);
        }
        attr.setValues(new ArrayList<>());
        return new AttributeDTO(attributeRepository.save(attr));
    }

    @Transactional
    public AttributeDTO updateAttribute(Long id, String name, String displayName, Long categoryId) {
        if (id == null) throw new RuntimeException("Attribute ID must not be null");
        Attribute attr = attributeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Attribute not found: " + id));
        attr.setName(name);
        attr.setDisplayName(displayName);
        if (categoryId != null) {
            Category cat = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new RuntimeException("Category not found: " + categoryId));
            attr.setCategory(cat);
        } else {
            attr.setCategory(null);
        }
        return new AttributeDTO(attributeRepository.save(attr));
    }

    @Transactional
    public void deleteAttribute(Long id) {
        if (id == null) throw new RuntimeException("Attribute ID must not be null");
        attributeRepository.deleteById(id);
    }

    // ─── CRUD Attribute Values ──────────────────────────────────────────────────

    public List<AttributeValueDTO> getValuesByAttributeId(Long attributeId) {
        return attributeValueRepository.findByAttributeId(attributeId).stream()
                .map(AttributeValueDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public AttributeValueDTO addValue(Long attributeId, String value) {
        if (attributeId == null) throw new RuntimeException("Attribute ID must not be null");
        Attribute attr = attributeRepository.findById(attributeId)
                .orElseThrow(() -> new RuntimeException("Attribute not found: " + attributeId));
        AttributeValue av = new AttributeValue();
        av.setAttribute(attr);
        av.setValue(value);
        return new AttributeValueDTO(attributeValueRepository.save(av));
    }

    @Transactional
    public void deleteValue(Long valueId) {
        if (valueId == null) throw new RuntimeException("Value ID must not be null");
        attributeValueRepository.deleteById(valueId);
    }

    // ─── Product ↔ Attribute Values ─────────────────────────────────────────────

    /**
     * Gán danh sách attribute value IDs cho product.
     * Xóa hết bản ghi cũ rồi thêm mới.
     */
    @Transactional
    public List<AttributeValueDTO> assignAttributeValues(Long productId, List<Long> attributeValueIds) {
        if (productId == null) throw new RuntimeException("Product ID must not be null");
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found: " + productId));

        // Xóa tất cả attribute values cũ
        productAttributeValueRepository.deleteByProductId(productId);

        // Thêm mới
        List<AttributeValueDTO> result = new ArrayList<>();
        if (attributeValueIds != null) {
            for (Long avId : attributeValueIds) {
                if (avId == null) continue;
                AttributeValue av = attributeValueRepository.findById(avId)
                        .orElseThrow(() -> new RuntimeException("AttributeValue not found: " + avId));
                ProductAttributeValue pav = new ProductAttributeValue();
                pav.setProduct(product);
                pav.setAttributeValue(av);
                productAttributeValueRepository.save(pav);
                result.add(new AttributeValueDTO(av));
            }
        }
        return result;
    }

    /**
     * Lấy tất cả attribute values hiện tại của product.
     */
    public List<AttributeValueDTO> getProductAttributeValues(Long productId) {
        return productAttributeValueRepository.findByProductId(productId).stream()
                .map(pav -> new AttributeValueDTO(pav.getAttributeValue()))
                .collect(Collectors.toList());
    }

    // ─── CORE: Faceted Search ───────────────────────────────────────────────────

    /**
     * Core faceted search logic:
     * 1. Nếu có selectedValueIds → lọc product theo AND logic
     * 2. Nếu không → lấy tất cả product (có thể filter theo category)
     * 3. Từ danh sách product đã lọc → tính facets (count per value)
     * 4. Trả về products + facets + totalCount
     */
    @Transactional(readOnly = true)
    public FacetedSearchResponse facetedSearch(FacetedSearchRequest request) {
        List<Long> filteredProductIds;

        // Step 1: Lọc sản phẩm
        boolean hasFilters = request.getSelectedValueIds() != null
                && !request.getSelectedValueIds().isEmpty();

        if (hasFilters) {
            // AND logic: sản phẩm phải chứa TẤT CẢ các value đã chọn
            filteredProductIds = productAttributeValueRepository.findProductIdsMatchingAllValues(
                    request.getSelectedValueIds(),
                    request.getSelectedValueIds().size()
            );
        } else {
            // Không có filter → lấy tất cả product IDs
            filteredProductIds = productRepository.findAll().stream()
                    .map(Product::getId)
                    .collect(Collectors.toList());
        }

        // Filter by category nếu có
        if (request.getCategoryId() != null) {
            List<Long> categoryProductIds = productRepository.findAll().stream()
                    .filter(p -> p.getCategory() != null
                            && p.getCategory().getId().equals(request.getCategoryId()))
                    .map(Product::getId)
                    .collect(Collectors.toList());
            filteredProductIds = filteredProductIds.stream()
                    .filter(categoryProductIds::contains)
                    .collect(Collectors.toList());
        }

        long totalCount = filteredProductIds.size();

        // Step 2: Phân trang
        int page = request.getPage();
        int size = request.getSize();
        int fromIndex = Math.min(page * size, filteredProductIds.size());
        int toIndex = Math.min(fromIndex + size, filteredProductIds.size());
        List<Long> pagedIds = filteredProductIds.subList(fromIndex, toIndex);

        // Step 3: Load products
        List<ProductDTO> products;
        if (pagedIds.isEmpty()) {
            products = new ArrayList<>();
        } else {
            products = productRepository.findAllById(pagedIds).stream()
                    .map(p -> {
                        List<ProductImage> images = productImageRepository
                                .findByProductIdOrderBySortOrderAsc(p.getId());
                        return new ProductDTO(p, images);
                    })
                    .collect(Collectors.toList());
        }

        // Step 4: Tính facets từ TẤT CẢ product đã lọc (không phân trang)
        List<FacetGroupDTO> facets = buildFacets(filteredProductIds);

        FacetedSearchResponse response = new FacetedSearchResponse();
        response.setProducts(products);
        response.setFacets(facets);
        response.setTotalCount(totalCount);
        response.setPage(page);
        response.setSize(size);
        return response;
    }

    /**
     * Build facet groups từ danh sách product IDs.
     * Trả về: List<FacetGroupDTO>, mỗi group là 1 attribute + danh sách values kèm count.
     */
    private List<FacetGroupDTO> buildFacets(List<Long> productIds) {
        if (productIds.isEmpty()) {
            return new ArrayList<>();
        }

        List<Object[]> rawFacets = productAttributeValueRepository.findFacetsForProductIds(productIds);

        // Group by attributeId
        Map<Long, FacetGroupDTO> groupMap = new LinkedHashMap<>();
        for (Object[] row : rawFacets) {
            Long attributeId = ((Number) row[0]).longValue();
            String attributeName = (String) row[1];
            String displayName = (String) row[2];
            Long valueId = ((Number) row[3]).longValue();
            String valueName = (String) row[4];
            long count = ((Number) row[5]).longValue();

            FacetGroupDTO group = groupMap.computeIfAbsent(attributeId, id ->
                    new FacetGroupDTO(id, attributeName, displayName, new ArrayList<>()));
            group.getValues().add(new FacetValueDTO(valueId, valueName, count));
        }

        return new ArrayList<>(groupMap.values());
    }
}
