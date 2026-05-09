package com.anhtin.tmdt.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "attribute_values")
@NoArgsConstructor
@AllArgsConstructor
public class AttributeValue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attribute_id", nullable = false)
    private Attribute attribute;

    @Column(nullable = false)
    private String value;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Attribute getAttribute() { return attribute; }
    public void setAttribute(Attribute attribute) { this.attribute = attribute; }
    public String getValue() { return value; }
    public void setValue(String value) { this.value = value; }
}
