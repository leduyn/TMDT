package com.anhtin.tmdt.backend.modules.product.service;

import com.anhtin.tmdt.backend.modules.product.dto.ProductRequest;
import com.anhtin.tmdt.backend.modules.common.dto.ProductDTO;
import com.anhtin.tmdt.backend.modules.product.entity.Category;
import com.anhtin.tmdt.backend.modules.product.entity.Product;
import com.anhtin.tmdt.backend.modules.product.entity.ProductImage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.lang.NonNull;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;
import com.anhtin.tmdt.backend.modules.product.repository.CategoryRepository;
import com.anhtin.tmdt.backend.modules.product.repository.BrandRepository;
import com.anhtin.tmdt.backend.modules.product.entity.ProductAttributeValue;
import com.anhtin.tmdt.backend.modules.product.entity.AttributeValue;
import com.anhtin.tmdt.backend.modules.price.service.PriceListService;
import com.anhtin.tmdt.backend.modules.common.service.SystemConfigService;
import com.anhtin.tmdt.backend.modules.agency.repository.AgencyProductPriceHistoryRepository;
import com.anhtin.tmdt.backend.modules.agency.entity.Agency;
import com.anhtin.tmdt.backend.modules.agency.entity.AgencyProductPriceHistory;
import com.anhtin.tmdt.backend.modules.agency.repository.AgencyRepository;
import com.anhtin.tmdt.backend.modules.salespolicy.dto.ProductPolicyPreviewDTO;
import com.anhtin.tmdt.backend.modules.salespolicy.service.SalesPolicyService;
import com.anhtin.tmdt.backend.modules.product.repository.ProductAttributeValueRepository;
import com.anhtin.tmdt.backend.modules.product.entity.Brand;
import com.anhtin.tmdt.backend.modules.product.repository.ProductImageRepository;
import com.anhtin.tmdt.backend.modules.product.repository.AttributeValueRepository;
import com.anhtin.tmdt.backend.modules.product.repository.ProductTypeRepository;
import com.anhtin.tmdt.backend.modules.product.repository.ProductRepository;
import com.anhtin.tmdt.backend.modules.order.entity.Transaction;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductImageRepository productImageRepository;

    @Autowired
    private BrandRepository brandRepository;

    @Autowired
    private ProductTypeRepository productTypeRepository;

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private AttributeValueRepository attributeValueRepository;

    @Autowired
    private ProductAttributeValueRepository productAttributeValueRepository;

    @Autowired
    private PriceListService priceListService;

    @Autowired
    private SystemConfigService systemConfigService;

    @Autowired
    private AgencyProductPriceHistoryRepository agencyProductPriceHistoryRepository;

    @Autowired
    private SalesPolicyService salesPolicyService;

    @Autowired
    private AgencyRepository agencyRepository;

    @Transactional(readOnly = true)
    public List<ProductDTO> getProductsByCategory(Long categoryId, Long agencyId, Long customerId) {
        List<Long> expandedIds = categoryService.getAllDescendantIds(categoryId);
        List<Product> products = productRepository.findProductsByCategoryIdIn(expandedIds);

        if (products.isEmpty()) return List.of();

        List<Long> productIds = products.stream().map(Product::getId).collect(Collectors.toList());
        return batchBuildProductDTOs(products, productIds, agencyId, customerId);
    }

    public List<ProductDTO> getAllProducts() {
        return getAllProducts(null, null);
    }

    @Transactional(readOnly = true)
    public List<ProductDTO> getAllProducts(Long agencyId, Long customerId) {
        List<Product> products = productRepository.findAllWithEagerRelations();
        if (products.isEmpty()) return List.of();
        List<Long> productIds = products.stream().map(Product::getId).collect(Collectors.toList());
        return batchBuildProductDTOs(products, productIds, agencyId, customerId);
    }

    @Transactional(readOnly = true)
    public Page<ProductDTO> getPagedProducts(Long agencyId, Long customerId, String search, Long categoryId, Long brandId, Pageable pageable) {
        Page<Product> productPage;

        List<Long> expandedCategoryIds = null;
        if (categoryId != null) {
            expandedCategoryIds = categoryService.getAllDescendantIds(categoryId);
        }

        if (expandedCategoryIds != null && brandId != null) {
            productPage = productRepository.findByCategoryIdInAndBrandId(expandedCategoryIds, brandId, pageable);
        } else if (expandedCategoryIds != null && search != null && !search.isBlank()) {
            productPage = productRepository.findByCategoryIdInAndSearch(expandedCategoryIds, search, pageable);
        } else if (expandedCategoryIds != null) {
            productPage = productRepository.findByCategoryIdIn(expandedCategoryIds, pageable);
        } else if (brandId != null && search != null && !search.isBlank()) {
            productPage = productRepository.findByBrandIdAndSearch(brandId, search, pageable);
        } else if (brandId != null) {
            productPage = productRepository.findByBrandId(brandId, pageable);
        } else if (search != null && !search.isBlank()) {
            productPage = productRepository.findByNameContainingIgnoreCaseOrProductCodeContainingIgnoreCase(search, search, pageable);
        } else {
            productPage = productRepository.findAll(pageable);
        }

        if (productPage.isEmpty()) return Page.empty();

        List<Long> productIds = productPage.getContent().stream().map(Product::getId).collect(Collectors.toList());

        Map<Long, List<ProductImage>> imagesByProduct = productImageRepository.findByProductIdIn(productIds)
                .stream()
                .collect(Collectors.groupingBy(pi -> pi.getProduct().getId()));

        Map<Long, PriceListService.ResolvedPriceInfo> pricesByProduct =
                priceListService.getResolvedPriceInfoForProducts(productIds, agencyId, customerId);

        Map<Long, java.time.LocalDateTime> latestChangeByProduct = new HashMap<>();
        if (agencyId != null) {
            List<AgencyProductPriceHistory> histories = agencyProductPriceHistoryRepository
                    .findLatestByAgencyIdAndProductIdIn(agencyId, productIds);
            for (var h : histories) {
                latestChangeByProduct.put(h.getProduct().getId(), h.getChangedAt());
            }
        }

        Integer discountDays = systemConfigService.getDiscountMaxDays();

        List<ProductDTO> dtos = productPage.getContent().stream()
                .map(p -> {
                    List<ProductImage> images = imagesByProduct.getOrDefault(p.getId(), List.of());
                    ProductDTO dto = new ProductDTO(p, images);
                    PriceListService.ResolvedPriceInfo priceInfo = pricesByProduct.getOrDefault(p.getId(), new PriceListService.ResolvedPriceInfo());
                    dto.setAppliedPrice(priceInfo.getPrice());
                    dto.setAppliedPriceListName(priceInfo.getPriceListName());
                    dto.setAppliedPriceListId(priceInfo.getPriceListId());
                    java.time.LocalDateTime changeAt = latestChangeByProduct.get(p.getId());
                    boolean showDiscount = true;
                    if (changeAt != null) {
                        long daysDiff = java.time.temporal.ChronoUnit.DAYS.between(changeAt, java.time.LocalDateTime.now());
                        if (daysDiff > discountDays) {
                            showDiscount = false;
                        }
                    }
                    if (showDiscount && priceInfo.getOldPrice() != null && priceInfo.getOldPrice() > 0) {
                        dto.setOldAppliedPrice(priceInfo.getOldPrice());
                        double diff = priceInfo.getPrice() - priceInfo.getOldPrice();
                        dto.setPriceChangeRatio((diff / priceInfo.getOldPrice()) * 100);
                    } else {
                        dto.setOldAppliedPrice(null);
                        dto.setPriceChangeRatio(null);
                    }
                    return dto;
                })
                .collect(Collectors.toList());

        return new PageImpl<>(dtos, pageable, productPage.getTotalElements());
    }

    private List<ProductDTO> batchBuildProductDTOs(List<Product> products, List<Long> productIds, Long agencyId, Long customerId) {
        Map<Long, List<ProductImage>> imagesByProduct = productImageRepository.findByProductIdIn(productIds)
                .stream()
                .collect(Collectors.groupingBy(pi -> pi.getProduct().getId()));

        Map<Long, PriceListService.ResolvedPriceInfo> pricesByProduct =
                priceListService.getResolvedPriceInfoForProducts(productIds, agencyId, customerId);

        Map<Long, java.time.LocalDateTime> latestChangeByProduct = new HashMap<>();
        if (agencyId != null) {
            List<AgencyProductPriceHistory> histories = agencyProductPriceHistoryRepository
                    .findLatestByAgencyIdAndProductIdIn(agencyId, productIds);
            for (var h : histories) {
                latestChangeByProduct.put(h.getProduct().getId(), h.getChangedAt());
            }
        }

        Integer discountDays = systemConfigService.getDiscountMaxDays();

        return products.stream()
                .map(p -> {
                    List<ProductImage> images = imagesByProduct.getOrDefault(p.getId(), List.of());
                    ProductDTO dto = new ProductDTO(p, images);
                    PriceListService.ResolvedPriceInfo priceInfo = pricesByProduct.getOrDefault(p.getId(), new PriceListService.ResolvedPriceInfo());
                    dto.setAppliedPrice(priceInfo.getPrice());
                    dto.setAppliedPriceListName(priceInfo.getPriceListName());
                    dto.setAppliedPriceListId(priceInfo.getPriceListId());
                    java.time.LocalDateTime changeAt = latestChangeByProduct.get(p.getId());
                    boolean showDiscount = true;
                    if (changeAt != null) {
                        long daysDiff = java.time.temporal.ChronoUnit.DAYS.between(changeAt, java.time.LocalDateTime.now());
                        if (daysDiff > discountDays) {
                            showDiscount = false;
                        }
                    }
                    if (showDiscount && priceInfo.getOldPrice() != null && priceInfo.getOldPrice() > 0) {
                        dto.setOldAppliedPrice(priceInfo.getOldPrice());
                        double diff = priceInfo.getPrice() - priceInfo.getOldPrice();
                        dto.setPriceChangeRatio((diff / priceInfo.getOldPrice()) * 100);
                    } else {
                        dto.setOldAppliedPrice(null);
                        dto.setPriceChangeRatio(null);
                    }
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public ProductDTO getProductById(@NonNull Long id) {
        return getProductById(id, null, null);
    }

    public ProductDTO getProductById(@NonNull Long id, Long agencyId, Long customerId) {
        return getProductById(id, agencyId, customerId, 1);
    }

    public ProductDTO getProductById(@NonNull Long id, Long agencyId, Long customerId, @NonNull Integer quantity) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        List<ProductImage> images = productImageRepository.findByProductIdOrderBySortOrderAsc(id);
        ProductDTO dto = new ProductDTO(product, images);
        PriceListService.ResolvedPriceInfo priceInfo = priceListService.getResolvedPriceInfo(id, agencyId, customerId);
        dto.setAppliedPrice(priceInfo.getPrice());
        dto.setAppliedPriceListName(priceInfo.getPriceListName());
        dto.setAppliedPriceListId(priceInfo.getPriceListId());
        // Determine whether to show old price based on discountMaxDays configuration
        Integer discountDays = systemConfigService.getDiscountMaxDays();
        // Fetch latest price change history for this product and agency (if agencyId provided)
        java.time.LocalDateTime changeAt = null;
        if (agencyId != null) {
            var latestHist = agencyProductPriceHistoryRepository
                    .findTopByAgencyIdAndProductIdOrderByChangedAtDesc(agencyId, id);
            if (latestHist != null) {
                changeAt = latestHist.getChangedAt();
            }
        }
        boolean showDiscount = true;
        if (changeAt != null) {
            long daysDiff = java.time.temporal.ChronoUnit.DAYS.between(changeAt, java.time.LocalDateTime.now());
            if (daysDiff > discountDays) {
                showDiscount = false;
            }
        }
        if (showDiscount && priceInfo.getOldPrice() != null && priceInfo.getOldPrice() > 0) {
            dto.setOldAppliedPrice(priceInfo.getOldPrice());
            double diff = priceInfo.getPrice() - priceInfo.getOldPrice();
            dto.setPriceChangeRatio((diff / priceInfo.getOldPrice()) * 100);
        } else {
            dto.setOldAppliedPrice(null);
            dto.setPriceChangeRatio(null);
        }

        // Policy preview & retail eligibility
        Double priceForPolicy = priceInfo.getPrice() != null && priceInfo.getPrice() >= 0
                ? priceInfo.getPrice() : product.getBasePrice();
        Agency agency = agencyId != null
                ? agencyRepository.findById(agencyId).orElse(null)
                : null;

        ProductPolicyPreviewDTO preview = salesPolicyService.previewProductPolicies(product, quantity, agency, priceForPolicy);
        dto.setPolicyPreview(preview);

        boolean eligible = salesPolicyService.isAgencyEligibleForRetailPrice(product, agency, priceForPolicy);
        dto.setRetailPriceEligible(eligible);

        return dto;
    }

    @Transactional
    public ProductDTO addProduct(ProductRequest request) {
        Long categoryId = request.getCategoryId();
        if (categoryId == null) throw new RuntimeException("Category ID is required");
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        if (category.getLevel() == null || category.getLevel() != 4) {
            throw new RuntimeException("Chỉ được chọn danh mục cấp 4 (Dòng sản phẩm) cho sản phẩm");
        }

        Product product = new Product();
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setCategory(category);
        product.setBasePrice(request.getBasePrice());
        product.setDropshipPrice(request.getDropshipPrice());
        product.setStockQuantity(request.getStockQuantity());
        product.setDropship(request.isDropship());
        if (request.getProductCode() != null && productRepository.existsByProductCode(request.getProductCode())) {
            throw new RuntimeException("Mã sản phẩm đã tồn tại: " + request.getProductCode());
        }
        product.setIsAppVisible(request.getIsAppVisible() != null ? request.getIsAppVisible() : true);
        product.setIsWebVisible(request.getIsWebVisible() != null ? request.getIsWebVisible() : true);
        product.setShowDiscount(request.getShowDiscount() != null ? request.getShowDiscount() : false);
        product.setTags(request.getTags());
        product.setBravoOrder(request.getBravoOrder());
        product.setUnit(request.getUnit());
        product.setInnerPackaging(request.getInnerPackaging());
        product.setOuterPackaging(request.getOuterPackaging());
        product.setMinPurchaseQuantity(request.getMinPurchaseQuantity() != null ? request.getMinPurchaseQuantity() : 1);
        product.setQuantityStep(request.getQuantityStep() != null ? request.getQuantityStep() : 1);
        product.setUserManual(request.getUserManual());
        product.setProductCode(request.getProductCode());
        product.setRetailWarrantyPeriod(request.getRetailWarrantyPeriod());
        product.setWholesaleWarrantyPeriod(request.getWholesaleWarrantyPeriod());
        product.setStatus(request.getStatus() != null ? request.getStatus() : "ACTIVE");
        product.setOtherName(request.getOtherName());
        product.setShortName(request.getShortName());
        product.setSpecification(request.getSpecification());
        product.setFeature1(request.getFeature1());
        product.setFeature2(request.getFeature2());

        Long brandId = request.getBrandId();
        if (brandId != null) {
            product.setBrand(brandRepository.findById(brandId)
                .orElseThrow(() -> new RuntimeException("Brand not found")));
        }

        Long productTypeId = request.getProductTypeId();
        if (productTypeId != null) {
            product.setProductType(productTypeRepository.findById(productTypeId)
                .orElseThrow(() -> new RuntimeException("ProductType not found")));
        }

        // áº¢nh chÃ­nh = áº£nh Ä‘áº§u tiÃªn trong gallery hoáº·c imageUrl Ä‘Æ¡n láº»
        String mainImage = resolveMainImage(request);
        product.setImageUrl(mainImage);

        Product savedProduct = productRepository.save(product);

        // LÆ°u gallery
        saveGallery(savedProduct, request.getImageUrls());

        // LÆ°u attributes
        saveAttributes(savedProduct, request.getAttributeValueIds());

        // Hook: ThÃªm sáº£n pháº©m má»›i vÃ o táº¥t cáº£ báº£ng giÃ¡ hiá»‡n cÃ³
        priceListService.onProductCreated(savedProduct);

        List<ProductImage> images = productImageRepository.findByProductIdOrderBySortOrderAsc(savedProduct.getId());
        return new ProductDTO(savedProduct, images);
    }

    @Transactional
    public ProductDTO updateProduct(@NonNull Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Long categoryId = request.getCategoryId();
        if (categoryId == null) throw new RuntimeException("Category ID is required");
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        if (category.getLevel() == null || category.getLevel() != 4) {
            throw new RuntimeException("Chỉ được chọn danh mục cấp 4 (Dòng sản phẩm) cho sản phẩm");
        }

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setCategory(category);
        product.setBasePrice(request.getBasePrice());
        product.setDropshipPrice(request.getDropshipPrice());
        product.setStockQuantity(request.getStockQuantity());
        product.setDropship(request.isDropship());
        if (request.getProductCode() != null && !request.getProductCode().equals(product.getProductCode())
                && productRepository.existsByProductCode(request.getProductCode())) {
            throw new RuntimeException("Mã sản phẩm đã tồn tại: " + request.getProductCode());
        }
        product.setProductCode(request.getProductCode());

        product.setIsAppVisible(request.getIsAppVisible() != null ? request.getIsAppVisible() : true);
        product.setIsWebVisible(request.getIsWebVisible() != null ? request.getIsWebVisible() : true);
        product.setShowDiscount(request.getShowDiscount() != null ? request.getShowDiscount() : false);
        product.setTags(request.getTags());
        product.setBravoOrder(request.getBravoOrder());
        product.setUnit(request.getUnit());
        product.setInnerPackaging(request.getInnerPackaging());
        product.setOuterPackaging(request.getOuterPackaging());
        product.setMinPurchaseQuantity(request.getMinPurchaseQuantity() != null ? request.getMinPurchaseQuantity() : 1);
        product.setQuantityStep(request.getQuantityStep() != null ? request.getQuantityStep() : 1);
        product.setUserManual(request.getUserManual());
        product.setRetailWarrantyPeriod(request.getRetailWarrantyPeriod());
        product.setWholesaleWarrantyPeriod(request.getWholesaleWarrantyPeriod());
        product.setStatus(request.getStatus() != null ? request.getStatus() : "ACTIVE");
        product.setOtherName(request.getOtherName());
        product.setShortName(request.getShortName());
        product.setSpecification(request.getSpecification());
        product.setFeature1(request.getFeature1());
        product.setFeature2(request.getFeature2());

        Long brandIdUpdate = request.getBrandId();
        if (brandIdUpdate != null) {
            product.setBrand(brandRepository.findById(brandIdUpdate)
                .orElseThrow(() -> new RuntimeException("Brand not found")));
        } else {
            product.setBrand(null);
        }

        Long productTypeIdUpdate = request.getProductTypeId();
        if (productTypeIdUpdate != null) {
            product.setProductType(productTypeRepository.findById(productTypeIdUpdate)
                .orElseThrow(() -> new RuntimeException("ProductType not found")));
        } else {
            product.setProductType(null);
        }

        String mainImage = resolveMainImage(request);
        product.setImageUrl(mainImage);

        Product updatedProduct = productRepository.save(product);

        // XÃ³a gallery cÅ© vÃ  lÆ°u gallery má»›i
        productImageRepository.deleteByProductId(id);
        saveGallery(updatedProduct, request.getImageUrls());

        // Cáº­p nháº­t attributes
        productAttributeValueRepository.deleteByProductId(id);
        saveAttributes(updatedProduct, request.getAttributeValueIds());

        List<ProductImage> images = productImageRepository.findByProductIdOrderBySortOrderAsc(updatedProduct.getId());
        return new ProductDTO(updatedProduct, images);
    }

    @Transactional
    public void deleteProduct(@NonNull Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        productImageRepository.deleteByProductId(id);
        if (product != null) {
            productRepository.delete(product);
        }
    }

    // â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    private String resolveMainImage(ProductRequest request) {
        if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            return request.getImageUrls().get(0);
        }
        return request.getImageUrl();
    }

    private void saveGallery(Product product, List<String> imageUrls) {
        if (imageUrls == null || imageUrls.isEmpty()) return;
        List<com.anhtin.tmdt.backend.modules.product.entity.ProductImage> gallery = new ArrayList<>();
        for (int i = 0; i < imageUrls.size(); i++) {
            com.anhtin.tmdt.backend.modules.product.entity.ProductImage img = new com.anhtin.tmdt.backend.modules.product.entity.ProductImage();
            img.setProduct(product);
            img.setImageUrl(imageUrls.get(i));
            img.setSortOrder(i);
            img.setMain(i == 0);
            gallery.add(img);
        }
        productImageRepository.saveAll(gallery);
    }

    private void saveAttributes(Product product, List<Long> attributeValueIds) {
        if (attributeValueIds == null || attributeValueIds.isEmpty()) return;
        
        Set<Long> uniqueIds = new HashSet<>(attributeValueIds);
        List<com.anhtin.tmdt.backend.modules.product.entity.ProductAttributeValue> pavs = new ArrayList<>();
        for (Long avId : uniqueIds) {
            if (avId == null) continue;
            com.anhtin.tmdt.backend.modules.product.entity.AttributeValue av = attributeValueRepository.findById(avId)
                    .orElseThrow(() -> new RuntimeException("AttributeValue not found: " + avId));
            com.anhtin.tmdt.backend.modules.product.entity.ProductAttributeValue pav = new com.anhtin.tmdt.backend.modules.product.entity.ProductAttributeValue();
            pav.setProduct(product);
            pav.setAttributeValue(av);
            pavs.add(pav);
        }
        productAttributeValueRepository.saveAll(pavs);
    }

    // NOTE: ThÃªm location-based query (PostGIS) á»Ÿ phase tá»‘i Æ°u
}

