package com.anhtin.tmdt.backend.modules.agency.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AgencyProductPriceDTO {
    private Long id;
    private Long agencyId;
    private Long productId;
    private String productName;
    private String productImageUrl;
    private Double price;
    private Double oldPrice;
    private Long sourcePriceListId;
    private String sourcePriceListName;
    private Boolean isOverride;
    private LocalDateTime updatedAt;
}
