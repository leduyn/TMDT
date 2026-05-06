package com.anhtin.tmdt.backend.dto.request;

import com.anhtin.tmdt.backend.entity.PriceListConditionType;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
public class PriceAssignmentVoucherRequest {
    private String name;
    private Long priceListId;
    private PriceListConditionType assignmentType;
    private String rankLevel;
    private Long agencyId;
    private Long customerGroupId;
    private Long customerId;
    private LocalDateTime scheduledAt;
}
