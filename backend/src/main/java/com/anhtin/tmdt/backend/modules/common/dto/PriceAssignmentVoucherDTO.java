package com.anhtin.tmdt.backend.modules.common.dto;

import com.anhtin.tmdt.backend.modules.price.entity.PriceAssignmentVoucher;
import com.anhtin.tmdt.backend.modules.price.entity.PriceListConditionType;
import com.anhtin.tmdt.backend.modules.common.entity.VoucherStatus;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
public class PriceAssignmentVoucherDTO {
    private Long id;
    private String name;
    private Long priceListId;
    private String priceListName;
    private PriceListConditionType assignmentType;
    private String rankLevel;
    private Long agencyId;
    private String agencyName;
    private Long customerGroupId;
    private String customerGroupName;
    private Long customerId;
    private String customerName;
    private LocalDateTime scheduledAt;
    private VoucherStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime appliedAt;

    public PriceAssignmentVoucherDTO(PriceAssignmentVoucher voucher) {
        this.id = voucher.getId();
        this.name = voucher.getName();
        if (voucher.getPriceList() != null) {
            this.priceListId = voucher.getPriceList().getId();
            this.priceListName = voucher.getPriceList().getName();
        }
        this.assignmentType = voucher.getAssignmentType();
        this.rankLevel = voucher.getRankLevel();
        if (voucher.getAgency() != null) {
            this.agencyId = voucher.getAgency().getId();
            this.agencyName = voucher.getAgency().getName();
        }
        if (voucher.getCustomerGroup() != null) {
            this.customerGroupId = voucher.getCustomerGroup().getId();
            this.customerGroupName = voucher.getCustomerGroup().getName();
        }
        if (voucher.getCustomer() != null) {
            this.customerId = voucher.getCustomer().getId();
            this.customerName = voucher.getCustomer().getUsername();
        }
        this.scheduledAt = voucher.getScheduledAt();
        this.status = voucher.getStatus();
        this.createdAt = voucher.getCreatedAt();
        this.appliedAt = voucher.getAppliedAt();
    }
}
