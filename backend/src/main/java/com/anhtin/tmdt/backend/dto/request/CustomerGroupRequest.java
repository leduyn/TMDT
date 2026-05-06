package com.anhtin.tmdt.backend.dto.request;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
public class CustomerGroupRequest {
    private String name;
    private String description;
}
