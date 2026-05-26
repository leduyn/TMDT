package com.anhtin.tmdt.backend.modules.price.dto;

import com.anhtin.tmdt.backend.modules.price.entity.PriceListConditionType;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
public class PriceListConditionRequest {
    private PriceListConditionType conditionType;
    private String rankLevel;
    private Long customerGroupId;
    private Integer priority;
}
