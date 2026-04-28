package com.anhtin.tmdt.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BrandRequest {
    @NotBlank
    private String code;

    @NotBlank
    private String name;

    private String logoUrl;
}
