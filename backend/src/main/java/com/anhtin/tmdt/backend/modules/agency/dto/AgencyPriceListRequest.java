package com.anhtin.tmdt.backend.modules.agency.dto;

import lombok.NoArgsConstructor;

@NoArgsConstructor
public class AgencyPriceListRequest {
    private Long agencyId;
    private Long priceListId;

    public Long getAgencyId() { return agencyId; }
    public void setAgencyId(Long agencyId) { this.agencyId = agencyId; }
    public Long getPriceListId() { return priceListId; }
    public void setPriceListId(Long priceListId) { this.priceListId = priceListId; }
}
