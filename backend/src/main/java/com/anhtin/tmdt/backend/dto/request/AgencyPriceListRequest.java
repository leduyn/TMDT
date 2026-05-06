package com.anhtin.tmdt.backend.dto.request;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
public class AgencyPriceListRequest {
    private Long agencyId;
    private Long priceListId;
}
