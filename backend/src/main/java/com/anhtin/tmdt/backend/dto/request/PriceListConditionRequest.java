package com.anhtin.tmdt.backend.dto.request;

import com.anhtin.tmdt.backend.entity.PriceListConditionType;
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
