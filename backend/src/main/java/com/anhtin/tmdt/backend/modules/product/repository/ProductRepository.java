package com.anhtin.tmdt.backend.modules.product.repository;

import com.anhtin.tmdt.backend.modules.product.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    boolean existsByProductCode(String productCode);
    Product findByProductCode(String productCode);

    @Query("SELECT p FROM Product p LEFT JOIN FETCH p.category LEFT JOIN FETCH p.brand LEFT JOIN FETCH p.productType")
    List<Product> findAllWithEagerRelations();

    Page<Product> findByNameContainingIgnoreCase(String name, Pageable pageable);
    Page<Product> findByNameContainingIgnoreCaseOrProductCodeContainingIgnoreCase(String name, String productCode, Pageable pageable);

    Page<Product> findByCategoryId(Long categoryId, Pageable pageable);
    Page<Product> findByCategoryIdIn(List<Long> categoryIds, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.category.id IN :categoryIds")
    List<Product> findProductsByCategoryIdIn(@Param("categoryIds") List<Long> categoryIds);

    @Query("SELECT p FROM Product p WHERE p.category.id = :categoryId AND (LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.productCode) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Product> findByCategoryIdAndSearch(@Param("categoryId") Long categoryId, @Param("search") String search, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.category.id IN :categoryIds AND (LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.productCode) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Product> findByCategoryIdInAndSearch(@Param("categoryIds") List<Long> categoryIds, @Param("search") String search, Pageable pageable);

    Page<Product> findByBrandId(Long brandId, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.brand.id = :brandId AND (LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.productCode) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Product> findByBrandIdAndSearch(@Param("brandId") Long brandId, @Param("search") String search, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.category.id = :categoryId AND p.brand.id = :brandId")
    Page<Product> findByCategoryIdAndBrandId(@Param("categoryId") Long categoryId, @Param("brandId") Long brandId, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.category.id IN :categoryIds AND p.brand.id = :brandId")
    Page<Product> findByCategoryIdInAndBrandId(@Param("categoryIds") List<Long> categoryIds, @Param("brandId") Long brandId, Pageable pageable);
}
