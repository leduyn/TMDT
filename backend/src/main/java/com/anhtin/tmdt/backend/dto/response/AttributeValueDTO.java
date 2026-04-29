package com.anhtin.tmdt.backend.dto.response;

import com.anhtin.tmdt.backend.entity.AttributeValue;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AttributeValueDTO {
    private Long id;
    private String value;
    private Long attributeId;

    public AttributeValueDTO(AttributeValue av) {
        this.id = av.getId();
        this.value = av.getValue();
        if (av.getAttribute() != null) {
            this.attributeId = av.getAttribute().getId();
        }
    }
}
