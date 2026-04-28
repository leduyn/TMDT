package com.anhtin.tmdt.backend.dto.response;

import lombok.Getter;
import lombok.Setter;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
public class ReviewDTO {
    private Long id;
    private Long targetId; // productId hoặc agencyId
    private Long customerId;
    private String customerName;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
}
