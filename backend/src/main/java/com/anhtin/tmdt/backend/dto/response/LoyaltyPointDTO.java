package com.anhtin.tmdt.backend.dto.response;

import lombok.Getter;
import lombok.Setter;
import lombok.AllArgsConstructor;

@Getter
@Setter
@AllArgsConstructor
public class LoyaltyPointDTO {
    private Long customerId;
    private Integer pointsBalance;
    private Integer totalEarned;
}
