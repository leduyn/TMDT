package com.anhtin.tmdt.backend.service;

import com.anhtin.tmdt.backend.dto.request.ProductRequest;
import com.anhtin.tmdt.backend.dto.response.ProductDTO;
import com.anhtin.tmdt.backend.entity.Category;
import com.anhtin.tmdt.backend.entity.Product;
import com.anhtin.tmdt.backend.entity.ProductImage;
import com.anhtin.tmdt.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.lang.NonNull;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

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
    private AttributeValueRepository attributeValueRepository;

    @Autowired
    private ProductAttributeValueRepository productAttributeValueRepository;

    @Autowired
    private PriceListService priceListService;

    public List<ProductDTO> getAllProducts() {
        return getAllProducts(null, null);
    }

    public List<ProductDTO> getAllProducts(Long agencyId, Long customerId) {
        return productRepository.findAll().stream()
                .map(p -> {
                    List<ProductImage> images = productImageRepository.findByProductIdOrderBySortOrderAsc(p.getId());
                    ProductDTO dto = new ProductDTO(p, images);
                    PriceListService.ResolvedPriceInfo priceInfo = priceListService.getResolvedPriceInfo(p.getId(), agencyId, customerId);
                    dto.setAppliedPrice(priceInfo.getPrice());
                    dto.setAppliedPriceListName(priceInfo.getPriceListName());
                    dto.setAppliedPriceListId(priceInfo.getPriceListId());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public ProductDTO getProductById(@NonNull Long id) {
        return getProductById(id, null, null);
    }

    public ProductDTO getProductById(@NonNull Long id, Long agencyId, Long customerId) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        List<ProductImage> images = productImageRepository.findByProductIdOrderBySortOrderAsc(id);
        ProductDTO dto = new ProductDTO(product, images);
        PriceListService.ResolvedPriceInfo priceInfo = priceListService.getResolvedPriceInfo(id, agencyId, customerId);
        dto.setAppliedPrice(priceInfo.getPrice());
        dto.setAppliedPriceListName(priceInfo.getPriceListName());
        dto.setAppliedPriceListId(priceInfo.getPriceListId());
        return dto;
    }

    @Transactional
    public ProductDTO addProduct(ProductRequest request) {
        Long categoryId = request.getCategoryId();
        if (categoryId == null) throw new RuntimeException("Category ID is required");
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        Product product = new Product();
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setCategory(category);
        product.setBasePrice(request.getBasePrice());
        product.setDropshipPrice(request.getDropshipPrice());
        product.setStockQuantity(request.getStockQuantity());
        product.setDropship(request.isDropship());
        product.setIsAppVisible(request.getIsAppVisible() != null ? request.getIsAppVisible() : true);
        product.setIsWebVisible(request.getIsWebVisible() != null ? request.getIsWebVisible() : true);
        product.setTags(request.getTags());
        product.setBravoOrder(request.getBravoOrder());
        product.setUnit(request.getUnit());
        product.setInnerPackaging(request.getInnerPackaging());
        product.setOuterPackaging(request.getOuterPackaging());
        product.setMinPurchaseQuantity(request.getMinPurchaseQuantity() != null ? request.getMinPurchaseQuantity() : 1);
        product.setQuantityStep(request.getQuantityStep() != null ? request.getQuantityStep() : 1);
        product.setUserManual(request.getUserManual());

        Long brandId = request.getBrandId();
        if (brandId != null) {
            product.setBrand(brandRepository.findById(brandId)
                .orElseThrow(() -> new RuntimeException("Brand not found")));
        }

        // Ảnh chính = ảnh đầu tiên trong gallery hoặc imageUrl đơn lẻ
        String mainImage = resolveMainImage(request);
        product.setImageUrl(mainImage);

        Product savedProduct = productRepository.save(product);

        // Lưu gallery
        saveGallery(savedProduct, request.getImageUrls());

        // Lưu attributes
        saveAttributes(savedProduct, request.getAttributeValueIds());

        // Hook: Thêm sản phẩm mới vào tất cả bảng giá hiện có
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

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setCategory(category);
        product.setBasePrice(request.getBasePrice());
        product.setDropshipPrice(request.getDropshipPrice());
        product.setStockQuantity(request.getStockQuantity());
        product.setDropship(request.isDropship());
        product.setIsAppVisible(request.getIsAppVisible() != null ? request.getIsAppVisible() : true);
        product.setIsWebVisible(request.getIsWebVisible() != null ? request.getIsWebVisible() : true);
        product.setTags(request.getTags());
        product.setBravoOrder(request.getBravoOrder());
        product.setUnit(request.getUnit());
        product.setInnerPackaging(request.getInnerPackaging());
        product.setOuterPackaging(request.getOuterPackaging());
        product.setMinPurchaseQuantity(request.getMinPurchaseQuantity() != null ? request.getMinPurchaseQuantity() : 1);
        product.setQuantityStep(request.getQuantityStep() != null ? request.getQuantityStep() : 1);
        product.setUserManual(request.getUserManual());

        Long brandIdUpdate = request.getBrandId();
        if (brandIdUpdate != null) {
            product.setBrand(brandRepository.findById(brandIdUpdate)
                .orElseThrow(() -> new RuntimeException("Brand not found")));
        } else {
            product.setBrand(null);
        }

        String mainImage = resolveMainImage(request);
        product.setImageUrl(mainImage);

        Product updatedProduct = productRepository.save(product);

        // Xóa gallery cũ và lưu gallery mới
        productImageRepository.deleteByProductId(id);
        saveGallery(updatedProduct, request.getImageUrls());

        // Cập nhật attributes
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

    // ─── Helpers ────────────────────────────────────────────────────────────────

    private String resolveMainImage(ProductRequest request) {
        if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            return request.getImageUrls().get(0);
        }
        return request.getImageUrl();
    }

    private void saveGallery(Product product, List<String> imageUrls) {
        if (imageUrls == null || imageUrls.isEmpty()) return;
        List<com.anhtin.tmdt.backend.entity.ProductImage> gallery = new ArrayList<>();
        for (int i = 0; i < imageUrls.size(); i++) {
            com.anhtin.tmdt.backend.entity.ProductImage img = new com.anhtin.tmdt.backend.entity.ProductImage();
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
        List<com.anhtin.tmdt.backend.entity.ProductAttributeValue> pavs = new ArrayList<>();
        for (Long avId : uniqueIds) {
            if (avId == null) continue;
            com.anhtin.tmdt.backend.entity.AttributeValue av = attributeValueRepository.findById(avId)
                    .orElseThrow(() -> new RuntimeException("AttributeValue not found: " + avId));
            com.anhtin.tmdt.backend.entity.ProductAttributeValue pav = new com.anhtin.tmdt.backend.entity.ProductAttributeValue();
            pav.setProduct(product);
            pav.setAttributeValue(av);
            pavs.add(pav);
        }
        productAttributeValueRepository.saveAll(pavs);
    }

    // NOTE: Thêm location-based query (PostGIS) ở phase tối ưu
}

