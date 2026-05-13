package com.anhtin.tmdt.backend.modules.common.dto;

import com.anhtin.tmdt.backend.modules.product.entity.Attribute;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import java.util.stream.Collectors;
import com.anhtin.tmdt.backend.modules.product.entity.Product;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AttributeDTO {
    private Long id;
    private String name;
    private String displayName;
    private Long categoryId;
    private String categoryName;
    @JsonProperty("isVariant")
    private Boolean isVariant;
    private List<AttributeValueDTO> values;

    public AttributeDTO(Attribute attribute) {
        this.id = attribute.getId();
        this.name = attribute.getName();
        this.displayName = attribute.getDisplayName();
        this.isVariant = attribute.getIsVariant() != null ? attribute.getIsVariant() : false;
        if (attribute.getCategory() != null) {
            this.categoryId = attribute.getCategory().getId();
            this.categoryName = attribute.getCategory().getName();
        }
        if (attribute.getValues() != null) {
            this.values = attribute.getValues().stream()
                    .map(AttributeValueDTO::new)
                    .collect(Collectors.toList());
        }
    }
}
