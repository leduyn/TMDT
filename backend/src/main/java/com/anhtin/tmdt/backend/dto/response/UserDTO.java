package com.anhtin.tmdt.backend.dto.response;

import com.anhtin.tmdt.backend.entity.Role;
import com.anhtin.tmdt.backend.entity.User;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserDTO {
    private Long id;
    private String username;
    private String email;
    private Role role;
    private String customerGroupName;

    public UserDTO(User user) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.email = user.getEmail();
        this.role = user.getRole();
        if (user.getCustomerGroup() != null) {
            this.customerGroupName = user.getCustomerGroup().getName();
        }
    }
}
