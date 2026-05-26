package com.anhtin.tmdt.backend.modules.product.service;

import com.anhtin.tmdt.backend.modules.product.dto.FacetedSearchRequest;
// response DTOs now imported individually from modules below
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;
import com.anhtin.tmdt.backend.modules.product.repository.AttributeRepository;
import com.anhtin.tmdt.backend.modules.product.repository.CategoryRepository;
import com.anhtin.tmdt.backend.modules.common.dto.ProductDTO;
import com.anhtin.tmdt.backend.modules.product.entity.ProductImage;
import com.anhtin.tmdt.backend.modules.product.entity.ProductAttributeValue;
import com.anhtin.tmdt.backend.modules.product.entity.AttributeValue;
import com.anhtin.tmdt.backend.modules.price.service.PriceListService;
import com.anhtin.tmdt.backend.modules.product.repository.ProductAttributeValueRepository;
import com.anhtin.tmdt.backend.modules.product.entity.Category;
import com.anhtin.tmdt.backend.modules.common.dto.FacetedSearchResponse;
import com.anhtin.tmdt.backend.modules.product.repository.ProductImageRepository;
import com.anhtin.tmdt.backend.modules.product.repository.AttributeValueRepository;
import com.anhtin.tmdt.backend.modules.product.repository.ProductRepository;
import com.anhtin.tmdt.backend.modules.product.entity.Product;
import com.anhtin.tmdt.backend.modules.common.dto.FacetGroupDTO;
import com.anhtin.tmdt.backend.modules.product.entity.Attribute;
import com.anhtin.tmdt.backend.modules.agency.entity.Agency;
import com.anhtin.tmdt.backend.modules.common.dto.FacetValueDTO;
import com.anhtin.tmdt.backend.modules.common.dto.AttributeValueDTO;
import com.anhtin.tmdt.backend.modules.common.dto.AttributeDTO;
import com.anhtin.tmdt.backend.modules.order.entity.Transaction;

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

    @Autowired
    private PriceListService priceListService;

    // â”€â”€â”€ CRUD Attributes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
    public AttributeDTO createAttribute(String name, String displayName, Long categoryId, Boolean isVariant) {
        attributeRepository.findByName(name).ifPresent(a -> {
            throw new IllegalArgumentException("Thuá»™c tÃ­nh vá»›i mÃ£ '" + name + "' Ä‘Ã£ tá»“n táº¡i.");
        });
        
        Attribute attr = new Attribute();
        attr.setName(name);
        attr.setDisplayName(displayName);
        attr.setIsVariant(isVariant != null ? isVariant : false);
        if (categoryId != null) {
            Category cat = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new RuntimeException("Category not found: " + categoryId));
            attr.setCategory(cat);
        }
        attr.setValues(new ArrayList<>());
        return new AttributeDTO(attributeRepository.save(attr));
    }

    @Transactional
    public AttributeDTO updateAttribute(Long id, String name, String displayName, Long categoryId, Boolean isVariant) {
        if (id == null) throw new RuntimeException("Attribute ID must not be null");
        Attribute attr = attributeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Attribute not found: " + id));
                
        attributeRepository.findByName(name).ifPresent(existing -> {
            if (!existing.getId().equals(id)) {
                throw new IllegalArgumentException("Thuá»™c tÃ­nh vá»›i mÃ£ '" + name + "' Ä‘Ã£ tá»“n táº¡i.");
            }
        });
        
        attr.setName(name);
        attr.setDisplayName(displayName);
        if (isVariant != null) attr.setIsVariant(isVariant);
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

    // â”€â”€â”€ CRUD Attribute Values â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

    // â”€â”€â”€ Product â†” Attribute Values â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    /**
     * GÃ¡n danh sÃ¡ch attribute value IDs cho product.
     * XÃ³a háº¿t báº£n ghi cÅ© rá»“i thÃªm má»›i.
     */
    @Transactional
    public List<AttributeValueDTO> assignAttributeValues(Long productId, List<Long> attributeValueIds) {
        if (productId == null) throw new RuntimeException("Product ID must not be null");
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found: " + productId));

        // XÃ³a táº¥t cáº£ attribute values cÅ©
        productAttributeValueRepository.deleteByProductId(productId);

        // ThÃªm má»›i
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
     * Láº¥y táº¥t cáº£ attribute values hiá»‡n táº¡i cá»§a product.
     */
    public List<AttributeValueDTO> getProductAttributeValues(Long productId) {
        return productAttributeValueRepository.findByProductId(productId).stream()
                .map(pav -> new AttributeValueDTO(pav.getAttributeValue()))
                .collect(Collectors.toList());
    }

    // â”€â”€â”€ CORE: Faceted Search â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    /**
     * Core faceted search logic:
     * 1. Náº¿u cÃ³ selectedValueIds â†’ lá»c product theo AND logic
     * 2. Náº¿u khÃ´ng â†’ láº¥y táº¥t cáº£ product (cÃ³ thá»ƒ filter theo category)
     * 3. Tá»« danh sÃ¡ch product Ä‘Ã£ lá»c â†’ tÃ­nh facets (count per value)
     * 4. Tráº£ vá» products + facets + totalCount
     */
    @Transactional(readOnly = true)
    public FacetedSearchResponse facetedSearch(FacetedSearchRequest request) {
        List<Long> filteredProductIds;

        // Step 1: Lá»c sáº£n pháº©m
        boolean hasFilters = request.getSelectedValueIds() != null
                && !request.getSelectedValueIds().isEmpty();

        if (hasFilters) {
            // AND logic: sáº£n pháº©m pháº£i chá»©a Táº¤T Cáº¢ cÃ¡c value Ä‘Ã£ chá»n
            filteredProductIds = productAttributeValueRepository.findProductIdsMatchingAllValues(
                    request.getSelectedValueIds(),
                    request.getSelectedValueIds().size()
            );
        } else {
            // KhÃ´ng cÃ³ filter â†’ láº¥y táº¥t cáº£ product IDs
            filteredProductIds = productRepository.findAll().stream()
                    .map(Product::getId)
                    .collect(Collectors.toList());
        }

        // Filter by category náº¿u cÃ³
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

        // Step 2: PhÃ¢n trang
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
                        ProductDTO dto = new ProductDTO(p, images);
                        if (request.getAgencyId() != null) {
                            dto.setAppliedPrice(priceListService.getResolvedPrice(p.getId(), request.getAgencyId(), request.getCustomerId()));
                        }
                        return dto;
                    })
                    // Náº¿u lÃ  Agency/Customer vÃ  khÃ´ng láº¥y Ä‘Æ°á»£c giÃ¡ (bá»‹ áº©n hoáº·c khÃ´ng cÃ³ trong báº£ng giÃ¡), loáº¡i bá» khá»i káº¿t quáº£
                    .filter(dto -> request.getAgencyId() == null || dto.getAppliedPrice() != null)
                    .collect(Collectors.toList());
        }

        // Step 4: TÃ­nh facets tá»« Táº¤T Cáº¢ product Ä‘Ã£ lá»c (khÃ´ng phÃ¢n trang)
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
     * Build facet groups tá»« danh sÃ¡ch product IDs.
     * Tráº£ vá»: List<FacetGroupDTO>, má»—i group lÃ  1 attribute + danh sÃ¡ch values kÃ¨m count.
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
