package com.anhtin.tmdt.backend.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AgencyRequest {
    private String name;
    private String phone;
    private String address;
    private Long userId;
    private Double latitude;
    private Double longitude;
    private Boolean active;
}
