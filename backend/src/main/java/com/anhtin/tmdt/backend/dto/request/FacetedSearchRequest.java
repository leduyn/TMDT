package com.anhtin.tmdt.backend.dto.request;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

/**
 * Request body cho faceted search.
 * - categoryId: lọc theo danh mục (optional)
 * - selectedValueIds: danh sách attribute_value_id đã chọn (AND logic)
 * - page / size: phân trang
 */
@Getter
@Setter
public class FacetedSearchRequest {
    private Long categoryId;
    private List<Long> selectedValueIds;
    private int page = 0;
    private int size = 20;
    private Long agencyId;
    private Long customerId;
}
