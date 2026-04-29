package com.anhtin.tmdt.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
    name = "product_attribute_values",
    uniqueConstraints = @UniqueConstraint(columnNames = {"product_id", "attribute_value_id"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductAttributeValue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attribute_value_id", nullable = false)
    private AttributeValue attributeValue;
}
