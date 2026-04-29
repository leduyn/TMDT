package com.anhtin.tmdt.backend.dto.response;

import com.anhtin.tmdt.backend.entity.Attribute;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.stream.Collectors;

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
    private List<AttributeValueDTO> values;

    public AttributeDTO(Attribute attribute) {
        this.id = attribute.getId();
        this.name = attribute.getName();
        this.displayName = attribute.getDisplayName();
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
