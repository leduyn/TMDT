package com.anhtin.tmdt.backend.modules.common.dto;

/**
 * Một giá trị trong facet group, kèm số lượng sản phẩm khả dụng.
 * Ví dụ: { valueId: 3, value: "8GB", count: 12 }
 */
public class FacetValueDTO {
    private Long valueId;
    private String value;
    private long count;

    public FacetValueDTO() {}

    public FacetValueDTO(Long valueId, String value, long count) {
        this.valueId = valueId;
        this.value = value;
        this.count = count;
    }

    public Long getValueId() { return valueId; }
    public void setValueId(Long valueId) { this.valueId = valueId; }

    public String getValue() { return value; }
    public void setValue(String value) { this.value = value; }

    public long getCount() { return count; }
    public void setCount(long count) { this.count = count; }
}
