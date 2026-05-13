package com.anhtin.tmdt.backend.modules.product.dto;

import java.util.List;
import com.anhtin.tmdt.backend.modules.product.entity.Product;

/**
 * Request body cho faceted search.
 * - categoryId: lọc theo danh mục (optional)
 * - selectedValueIds: danh sách attribute_value_id đã chọn (AND logic)
 * - page / size: phân trang
 */
public class FacetedSearchRequest {
    private Long categoryId;
    private List<Long> selectedValueIds;
    private int page = 0;
    private int size = 20;
    private Long agencyId;
    private Long customerId;

    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    public List<Long> getSelectedValueIds() { return selectedValueIds; }
    public void setSelectedValueIds(List<Long> selectedValueIds) { this.selectedValueIds = selectedValueIds; }
    public int getPage() { return page; }
    public void setPage(int page) { this.page = page; }
    public int getSize() { return size; }
    public void setSize(int size) { this.size = size; }
    public Long getAgencyId() { return agencyId; }
    public void setAgencyId(Long agencyId) { this.agencyId = agencyId; }
    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }
}
