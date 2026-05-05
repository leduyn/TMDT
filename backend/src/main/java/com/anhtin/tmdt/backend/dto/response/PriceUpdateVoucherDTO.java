package com.anhtin.tmdt.backend.dto.response;

import com.anhtin.tmdt.backend.entity.PriceUpdateVoucher;
import com.anhtin.tmdt.backend.entity.VoucherStatus;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class PriceUpdateVoucherDTO {
    private Long id;
    private String name;
    private String description;
    private LocalDateTime scheduledAt;
    private VoucherStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime appliedAt;
    private List<Long> priceListIds;
    private List<VoucherItemDTO> items;

    @Getter
    @Setter
    @NoArgsConstructor
    public static class VoucherItemDTO {
        private Long productId;
        private String productName;
        private Double newPrice;
        private Boolean isVisible;
    }

    public PriceUpdateVoucherDTO(PriceUpdateVoucher voucher, List<Long> priceListIds, List<VoucherItemDTO> items) {
        this.id = voucher.getId();
        this.name = voucher.getName();
        this.description = voucher.getDescription();
        this.scheduledAt = voucher.getScheduledAt();
        this.status = voucher.getStatus();
        this.createdAt = voucher.getCreatedAt();
        this.appliedAt = voucher.getAppliedAt();
        this.priceListIds = priceListIds;
        this.items = items;
    }
}
