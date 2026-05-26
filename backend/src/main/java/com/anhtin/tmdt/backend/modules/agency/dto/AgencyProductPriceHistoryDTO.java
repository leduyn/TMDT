package com.anhtin.tmdt.backend.modules.agency.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AgencyProductPriceHistoryDTO {
    private Long id;
    private Long agencyId;
    private Long productId;
    private Double oldPrice;
    private Double newPrice;
    private Long changedById;
    private String changedByUsername;
    private LocalDateTime changedAt;
    private String changeSource;
    private Long sourcePriceListId;
    private String sourcePriceListName;
}
