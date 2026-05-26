package com.anhtin.tmdt.backend.modules.product.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Table(name = "attributes")
@NoArgsConstructor
@AllArgsConstructor
public class Attribute {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(name = "display_name", nullable = false)
    private String displayName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @OneToMany(mappedBy = "attribute", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AttributeValue> values;

    @Column(name = "is_variant")
    private Boolean isVariant = false;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }
    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }
    public List<AttributeValue> getValues() { return values; }
    public void setValues(List<AttributeValue> values) { this.values = values; }
    public Boolean getIsVariant() { return isVariant; }
    public void setIsVariant(Boolean isVariant) { this.isVariant = isVariant; }
}
