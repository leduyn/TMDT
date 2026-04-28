package com.anhtin.tmdt.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

/**
 * Sản phẩm riêng của Đại lý bán trên Marketplace.
 * Đại lý có thể sync sản phẩm từ Công ty (liên kết product_id) hoặc tự đăng sản phẩm mới.
 */
@Entity
@Table(name = "agency_products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AgencyProduct {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agency_id", nullable = false)
    private Agency agency;

    // Liên kết sản phẩm gốc từ Công ty (nullable nếu Đại lý tự đăng hàng riêng)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    // Thông tin sản phẩm (dùng khi Đại lý tự đăng)
    private String name;
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(name = "stock_quantity")
    private Integer stockQuantity = 0;

    // Giá bán do Đại lý đặt
    @Column(name = "custom_price", nullable = false)
    private Double customPrice;

    // Trạng thái: PENDING_APPROVAL, APPROVED, REJECTED
    private String status = "PENDING_APPROVAL";

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
