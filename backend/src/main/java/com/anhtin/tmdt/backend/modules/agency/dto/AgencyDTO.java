package com.anhtin.tmdt.backend.modules.agency.dto;

import com.anhtin.tmdt.backend.modules.agency.entity.Agency;

public class AgencyDTO {
    private Long id;
    private String name;
    private String phone;
    private String address;
    private String username;
    private Long userId;
    private boolean active;
    private String status;
    private String organizationName;
    private String taxCode;
    private String billingAddress;
    private String email;
    private Double defaultCommissionRate;
    private Double latitude;
    private Double longitude;

    public AgencyDTO() {}

    public AgencyDTO(Agency agency) {
        this.id = agency.getId();
        this.name = agency.getName();
        this.phone = agency.getPhone();
        this.address = agency.getAddress();
        this.latitude = agency.getLatitude();
        this.longitude = agency.getLongitude();
        this.defaultCommissionRate = agency.getDefaultCommissionRate();
        if (agency.getUser() != null) {
            this.username = agency.getUser().getUsername();
            this.userId = agency.getUser().getId();
            this.email = agency.getUser().getEmail();
            this.organizationName = agency.getUser().getOrganizationName();
            this.taxCode = agency.getUser().getTaxCode();
            this.billingAddress = agency.getUser().getBillingAddress();
        }
        this.active = agency.isActive();
        this.status = agency.getStatus() != null ? agency.getStatus().name() : null;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getOrganizationName() { return organizationName; }
    public void setOrganizationName(String organizationName) { this.organizationName = organizationName; }

    public String getTaxCode() { return taxCode; }
    public void setTaxCode(String taxCode) { this.taxCode = taxCode; }

    public String getBillingAddress() { return billingAddress; }
    public void setBillingAddress(String billingAddress) { this.billingAddress = billingAddress; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public Double getDefaultCommissionRate() { return defaultCommissionRate; }
    public void setDefaultCommissionRate(Double defaultCommissionRate) { this.defaultCommissionRate = defaultCommissionRate; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
}
