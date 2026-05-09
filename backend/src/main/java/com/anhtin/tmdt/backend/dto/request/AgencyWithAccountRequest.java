package com.anhtin.tmdt.backend.dto.request;

public class AgencyWithAccountRequest {
    // Account info
    private String username;
    private String email;
    private String password;
    
    // Agency info
    private String name;
    private String phone;
    private String address;
    private String organizationName;
    private String taxCode;
    private String billingAddress;
    private Double latitude;
    private Double longitude;
    private Double defaultCommissionRate;

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getOrganizationName() { return organizationName; }
    public void setOrganizationName(String organizationName) { this.organizationName = organizationName; }
    public String getTaxCode() { return taxCode; }
    public void setTaxCode(String taxCode) { this.taxCode = taxCode; }
    public String getBillingAddress() { return billingAddress; }
    public void setBillingAddress(String billingAddress) { this.billingAddress = billingAddress; }
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public Double getDefaultCommissionRate() { return defaultCommissionRate; }
    public void setDefaultCommissionRate(Double defaultCommissionRate) { this.defaultCommissionRate = defaultCommissionRate; }
}
