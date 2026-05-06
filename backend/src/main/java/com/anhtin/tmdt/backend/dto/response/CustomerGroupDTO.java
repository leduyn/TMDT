package com.anhtin.tmdt.backend.dto.response;

import com.anhtin.tmdt.backend.entity.CustomerGroup;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public class CustomerGroupDTO {
    private Long id;
    private String name;
    private String description;
    private LocalDateTime createdAt;

    public CustomerGroupDTO(CustomerGroup group) {
        this.id = group.getId();
        this.name = group.getName();
        this.description = group.getDescription();
        this.createdAt = group.getCreatedAt();
    }
}
