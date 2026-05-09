package com.anhtin.tmdt.backend.dto.request;

public class AgencyRequest {
    private String name;
    private String phone;
    private String address;
    private Long userId;
    private Double latitude;
    private Double longitude;
    private Double defaultCommissionRate;
    private Boolean active;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public Double getDefaultCommissionRate() { return defaultCommissionRate; }
    public void setDefaultCommissionRate(Double defaultCommissionRate) { this.defaultCommissionRate = defaultCommissionRate; }
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}
