package com.anhtin.tmdt.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Một giá trị trong facet group, kèm số lượng sản phẩm khả dụng.
 * Ví dụ: { valueId: 3, value: "8GB", count: 12 }
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FacetValueDTO {
    private Long valueId;
    private String value;
    private long count;
}
