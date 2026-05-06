package com.anhtin.tmdt.backend.dto.response;

import com.anhtin.tmdt.backend.entity.PriceList;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public class PriceListDTO {
    private Long id;
    private String name;
    private String description;
    private Boolean isDefault;
    private Boolean active;
    private LocalDateTime createdAt;
    private Long itemCount;

    public PriceListDTO(PriceList priceList, Long itemCount) {
        this.id = priceList.getId();
        this.name = priceList.getName();
        this.description = priceList.getDescription();
        this.isDefault = priceList.getIsDefault();
        this.active = priceList.getActive();
        this.createdAt = priceList.getCreatedAt();
        this.itemCount = itemCount;
    }
}
