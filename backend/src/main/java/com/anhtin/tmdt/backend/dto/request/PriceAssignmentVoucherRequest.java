package com.anhtin.tmdt.backend.dto.request;

import com.anhtin.tmdt.backend.entity.PriceListConditionType;
import java.time.LocalDateTime;

public class PriceAssignmentVoucherRequest {
    private String name;
    private Long priceListId;
    private PriceListConditionType assignmentType;
    private String rankLevel;
    private Long agencyId;
    private Long customerGroupId;
    private Long customerId;
    private LocalDateTime scheduledAt;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Long getPriceListId() { return priceListId; }
    public void setPriceListId(Long priceListId) { this.priceListId = priceListId; }
    public PriceListConditionType getAssignmentType() { return assignmentType; }
    public void setAssignmentType(PriceListConditionType assignmentType) { this.assignmentType = assignmentType; }
    public String getRankLevel() { return rankLevel; }
    public void setRankLevel(String rankLevel) { this.rankLevel = rankLevel; }
    public Long getAgencyId() { return agencyId; }
    public void setAgencyId(Long agencyId) { this.agencyId = agencyId; }
    public Long getCustomerGroupId() { return customerGroupId; }
    public void setCustomerGroupId(Long customerGroupId) { this.customerGroupId = customerGroupId; }
    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }
    public LocalDateTime getScheduledAt() { return scheduledAt; }
    public void setScheduledAt(LocalDateTime scheduledAt) { this.scheduledAt = scheduledAt; }
}
