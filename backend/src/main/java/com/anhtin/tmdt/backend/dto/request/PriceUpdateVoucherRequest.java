package com.anhtin.tmdt.backend.dto.request;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class PriceUpdateVoucherRequest {
    private String name;
    private String description;
    private LocalDateTime scheduledAt;
    private List<Long> priceListIds;
    private List<VoucherItemRequest> items;

    @Getter
    @Setter
    @NoArgsConstructor
    public static class VoucherItemRequest {
        private Long productId;
        private Double newPrice;
        private Boolean isVisible;
    }
}
