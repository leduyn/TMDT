package com.anhtin.tmdt.backend.dto.response;

import com.anhtin.tmdt.backend.entity.Agency;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AgencyDTO {
    private Long id;
    private String name;
    private String phone;
    private String address;
    private String username;
    private Long userId;
    private boolean active;

    public AgencyDTO(Agency agency) {
        this.id = agency.getId();
        this.name = agency.getName();
        this.phone = agency.getPhone();
        this.address = agency.getAddress();
        if (agency.getUser() != null) {
            this.username = agency.getUser().getUsername();
            this.userId = agency.getUser().getId();
        }
        this.active = agency.isActive();
    }
}
