package com.anhtin.tmdt.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BrandDTO {
    private Long id;
    private String code;
    private String name;
    private String logoUrl;
}
