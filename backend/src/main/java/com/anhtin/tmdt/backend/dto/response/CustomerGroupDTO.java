package com.anhtin.tmdt.backend.dto.response;

import com.anhtin.tmdt.backend.entity.CustomerGroup;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

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

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
