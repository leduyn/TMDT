package com.anhtin.tmdt.backend.service;

import com.anhtin.tmdt.backend.dto.request.ProductRequest;
import com.anhtin.tmdt.backend.dto.response.ProductDTO;
import com.anhtin.tmdt.backend.entity.Category;
import com.anhtin.tmdt.backend.entity.Product;
import com.anhtin.tmdt.backend.entity.ProductImage;
import com.anhtin.tmdt.backend.repository.BrandRepository;
import com.anhtin.tmdt.backend.repository.CategoryRepository;
import com.anhtin.tmdt.backend.repository.ProductImageRepository;
import com.anhtin.tmdt.backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.lang.NonNull;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
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

    public List<ProductDTO> getAllProducts() {
        return productRepository.findAll().stream()
                .map(p -> {
                    List<ProductImage> images = productImageRepository.findByProductIdOrderBySortOrderAsc(p.getId());
                    return new ProductDTO(p, images);
                })
                .collect(Collectors.toList());
    }

    public ProductDTO getProductById(@NonNull Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        List<ProductImage> images = productImageRepository.findByProductIdOrderBySortOrderAsc(id);
        return new ProductDTO(product, images);
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
        List<ProductImage> gallery = new ArrayList<>();
        for (int i = 0; i < imageUrls.size(); i++) {
            ProductImage img = new ProductImage();
            img.setProduct(product);
            img.setImageUrl(imageUrls.get(i));
            img.setSortOrder(i);
            img.setMain(i == 0);
            gallery.add(img);
        }
        productImageRepository.saveAll(gallery);
    }

    // NOTE: Thêm location-based query (PostGIS) ở phase tối ưu
}

