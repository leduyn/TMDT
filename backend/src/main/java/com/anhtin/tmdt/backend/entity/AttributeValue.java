package com.anhtin.tmdt.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "attribute_values")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AttributeValue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attribute_id", nullable = false)
    private Attribute attribute;

    /** Giá trị cụ thể, ví dụ: "8GB", "16GB", "Intel Core i5" */
    @Column(nullable = false)
    private String value;
}
