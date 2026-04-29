package com.anhtin.tmdt.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

/**
 * Response cho faceted search, chứa cả danh sách sản phẩm lẫn facets.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FacetedSearchResponse {
    private List<ProductDTO> products;
    private List<FacetGroupDTO> facets;
    private long totalCount;
    private int page;
    private int size;
}
