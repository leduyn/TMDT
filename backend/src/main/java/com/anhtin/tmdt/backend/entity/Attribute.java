package com.anhtin.tmdt.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "attributes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Attribute {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Tên kỹ thuật, ví dụ: "ram", "cpu" */
    @Column(nullable = false, unique = true)
    private String name;

    /** Tên hiển thị, ví dụ: "Dung lượng RAM", "Bộ vi xử lý" */
    @Column(name = "display_name", nullable = false)
    private String displayName;

    /**
     * Gắn attribute vào một danh mục cụ thể (tuỳ chọn).
     * Nếu null → attribute áp dụng cho mọi sản phẩm.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @OneToMany(mappedBy = "attribute", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AttributeValue> values;
}
