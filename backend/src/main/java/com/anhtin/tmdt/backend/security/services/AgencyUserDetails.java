package com.anhtin.tmdt.backend.security.services;

import com.anhtin.tmdt.backend.modules.agency.entity.Agency;
import com.fasterxml.jackson.annotation.JsonIgnore;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;
import java.util.Objects;

public class AgencyUserDetails implements UserDetails {
    private static final long serialVersionUID = 1L;

    private Long id;
    private String phone;
    private String name;
    private String code;
    private String status;
    @JsonIgnore
    private String password;
    private boolean enabled;
    private Collection<? extends GrantedAuthority> authorities;

    public AgencyUserDetails(Long id, String phone, String name, String code, String status, String password,
                              boolean enabled, Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.phone = phone;
        this.name = name;
        this.code = code;
        this.status = status;
        this.password = password;
        this.enabled = enabled;
        this.authorities = authorities;
    }

    public static AgencyUserDetails build(Agency agency) {
        GrantedAuthority authority = new SimpleGrantedAuthority("ROLE_AGENCY");
        return new AgencyUserDetails(
                agency.getId(),
                agency.getPhone(),
                agency.getName(),
                agency.getCode(),
                agency.getStatus().name(),
                agency.getPassword(),
                agency.isActive(),
                Collections.singletonList(authority));
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() { return authorities; }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return enabled; }

    public Long getId() { return id; }
    public String getPhone() { return phone; }
    public String getName() { return name; }
    public String getCode() { return code; }
    public String getStatus() { return status; }
    @Override public String getUsername() { return phone; }
    @Override public String getPassword() { return password; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        AgencyUserDetails user = (AgencyUserDetails) o;
        return Objects.equals(id, user.id);
    }
}
