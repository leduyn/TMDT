package com.anhtin.tmdt.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

/**
 * Một nhóm facet, đại diện cho một attribute và danh sách giá trị kèm count.
 * Ví dụ: { attributeId: 1, attributeName: "ram", displayName: "Dung lượng RAM",
 *           values: [{valueId: 3, value: "8GB", count: 12}, ...] }
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FacetGroupDTO {
    private Long attributeId;
    private String attributeName;
    private String displayName;
    private List<FacetValueDTO> values;
}
