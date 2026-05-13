package com.anhtin.tmdt.backend.modules.common.dto;

import com.anhtin.tmdt.backend.modules.product.entity.AttributeValue;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import com.anhtin.tmdt.backend.modules.product.entity.Product;

@NoArgsConstructor
@AllArgsConstructor
public class AttributeValueDTO {
    private Long id;
    private String value;
    private Long attributeId;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getValue() { return value; }
    public void setValue(String value) { this.value = value; }
    public Long getAttributeId() { return attributeId; }
    public void setAttributeId(Long attributeId) { this.attributeId = attributeId; }

    public AttributeValueDTO(AttributeValue av) {
        this.id = av.getId();
        this.value = av.getValue();
        if (av.getAttribute() != null) {
            this.attributeId = av.getAttribute().getId();
        }
    }
}
