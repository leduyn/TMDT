package com.anhtin.tmdt.backend.modules.common.dto;

import java.util.List;
import com.anhtin.tmdt.backend.modules.product.entity.Attribute;

/**
 * Một nhóm facet, đại diện cho một attribute và danh sách giá trị kèm count.
 * Ví dụ: { attributeId: 1, attributeName: "ram", displayName: "Dung lượng RAM",
 *           values: [{valueId: 3, value: "8GB", count: 12}, ...] }
 */
public class FacetGroupDTO {
    private Long attributeId;
    private String attributeName;
    private String displayName;
    private List<FacetValueDTO> values;

    public FacetGroupDTO() {}

    public FacetGroupDTO(Long attributeId, String attributeName, String displayName, List<FacetValueDTO> values) {
        this.attributeId = attributeId;
        this.attributeName = attributeName;
        this.displayName = displayName;
        this.values = values;
    }

    public Long getAttributeId() { return attributeId; }
    public void setAttributeId(Long attributeId) { this.attributeId = attributeId; }

    public String getAttributeName() { return attributeName; }
    public void setAttributeName(String attributeName) { this.attributeName = attributeName; }

    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }

    public List<FacetValueDTO> getValues() { return values; }
    public void setValues(List<FacetValueDTO> values) { this.values = values; }
}
